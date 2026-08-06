<template>
	<div class="aio-admin-collaboration">
		<AdminPageHeader />

		<p class="aio-admin-settings__lead">
			Usuarios vinculados a empresas del sistema. Puedes invitar por correo o quitar accesos.
		</p>

		<div class="aio-admin-card aio-admin-collaboration__toolbar pa-4 mb-4">
			<v-btn color="primary" depressed @click="openDialog = true">
				<v-icon left>person_add</v-icon>
				Invitar usuario
			</v-btn>
		</div>

		<div v-if="loadError" class="aio-admin-page__error mb-4">{{ loadError }}</div>

		<div class="aio-admin-card pa-2">
			<v-data-table
				:headers="headers"
				:items="collaborators"
				:loading="isLoading"
				hide-default-footer
				no-data-text="No hay colaboradores registrados"
				loading-text="Cargando colaboradores..."
				class="aio-admin-collaboration__table"
			>
				<template v-slot:item.name="{ item }">
					<span class="font-weight-medium">{{ item.name }}</span>
				</template>
				<template v-slot:item.roleLabel="{ item }">
					<v-chip small :color="item.isAdmin ? 'primary' : 'grey lighten-3'" :text-color="item.isAdmin ? 'white' : 'grey darken-2'">
						{{ item.roleLabel }}
					</v-chip>
				</template>
				<template v-slot:item.action="{ item }">
					<v-btn icon small color="error" :disabled="isDeleting" @click="confirmDelete(item)">
						<v-icon small>delete</v-icon>
					</v-btn>
				</template>
			</v-data-table>
		</div>

		<v-dialog v-model="openDialog" max-width="480">
			<v-card>
				<v-card-title class="headline">Invitar colaborador</v-card-title>
				<v-card-text>
					<v-form ref="inviteForm" v-model="formValid">
						<v-select
							v-model="inviteForm.id_company"
							:items="companies"
							item-text="name"
							item-value="id_company"
							label="Empresa *"
							outlined
							dense
							:rules="[v => !!v || 'Selecciona una empresa']"
						></v-select>
						<v-text-field
							v-model="inviteForm.email"
							label="Correo electrónico *"
							type="email"
							outlined
							dense
							:rules="emailRules"
						></v-text-field>
						<v-select
							v-model="inviteForm.id_rol"
							:items="roleOptions"
							item-text="label"
							item-value="value"
							label="Rol *"
							outlined
							dense
							:rules="[v => !!v || 'Selecciona un rol']"
						></v-select>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="openDialog = false">Cancelar</v-btn>
					<v-btn color="primary" depressed :loading="isInviting" @click="submitInvite">Invitar</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<emb-delete-confirmation-2
			ref="deleteConfirmationDialog"
			messageTitle="¿Eliminar colaborador?"
			messageDescription="Se revocará el acceso de este usuario a la empresa seleccionada."
			btn1="Cancelar"
			btn2="Eliminar"
			@onConfirm="deleteCollaborator"
		></emb-delete-confirmation-2>
	</div>
</template>

<script>
import api from 'Api';
import { ROLE_OPTIONS, roleLabel, isAdminRole } from 'Helpers/roles';

export default {
	data() {
		return {
			isLoading: true,
			isInviting: false,
			isDeleting: false,
			loadError: '',
			openDialog: false,
			formValid: false,
			collaborators: [],
			companies: [],
			selectedItem: null,
			inviteForm: {
				email: '',
				id_company: null,
				id_rol: 2,
			},
			roleOptions: ROLE_OPTIONS,
			emailRules: [
				(v) => !!v || 'El correo es obligatorio',
				(v) => /.+@.+/.test(v) || 'Correo inválido',
			],
			headers: [
				{ text: 'Nombre', value: 'name', sortable: false },
				{ text: 'Correo', value: 'email', sortable: false },
				{ text: 'Empresa', value: 'companyName', sortable: false },
				{ text: 'Rol', value: 'roleLabel', sortable: false },
				{ text: 'Acción', value: 'action', sortable: false, align: 'end' },
			],
		};
	},
	async mounted() {
		await Promise.all([this.loadCollaborators(), this.loadCompanies()]);
	},
	methods: {
		mapCollaborator(row) {
			const roleId = parseInt(row.id_rol, 10);
			return {
				id_user_rol: row.id_user_rol,
				id_company_user: row.id_company_user,
				id_users: row.id_users,
				id_rol: roleId,
				name: row.name_user || '—',
				email: row.email || '—',
				companyName: row.name || row.company_name || '—',
				roleLabel: roleLabel(roleId, 'Cliente'),
				isAdmin: isAdminRole(roleId),
			};
		},
		async loadCollaborators() {
			this.isLoading = true;
			this.loadError = '';
			try {
				const response = await api.get('/api/user_rol/');
				const rows = (response.data && response.data.data) || [];
				this.collaborators = rows.map(this.mapCollaborator);
			} catch (error) {
				this.loadError = 'No se pudo cargar la lista de colaboradores.';
				this.collaborators = [];
			} finally {
				this.isLoading = false;
			}
		},
		async loadCompanies() {
			try {
				const response = await api.get('/api/company/');
				this.companies = (response.data && response.data.data) || [];
				if (this.companies.length && !this.inviteForm.id_company) {
					this.inviteForm.id_company = this.companies[0].id_company;
				}
			} catch (error) {
				this.companies = [];
			}
		},
		async submitInvite() {
			if (!this.$refs.inviteForm.validate()) return;
			this.isInviting = true;
			try {
				await api.post('/api/admin/collaborators', {
					email: this.inviteForm.email.trim(),
					id_company: this.inviteForm.id_company,
					id_rol: this.inviteForm.id_rol,
				});
				this.$snotify.success('Colaborador invitado correctamente', { timeout: 2500 });
				this.openDialog = false;
				this.inviteForm.email = '';
				this.$refs.inviteForm.resetValidation();
				await this.loadCollaborators();
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| 'No se pudo invitar al usuario';
				this.$snotify.error(message, { timeout: 4000 });
			} finally {
				this.isInviting = false;
			}
		},
		confirmDelete(item) {
			this.selectedItem = item;
			this.$refs.deleteConfirmationDialog.openDialog();
		},
		async deleteCollaborator() {
			if (!this.selectedItem || !this.selectedItem.id_company_user) return;
			this.$refs.deleteConfirmationDialog.close();
			this.isDeleting = true;
			try {
				await api.delete('/api/company_users/delete_company_users', {
					data: { id_company_user: this.selectedItem.id_company_user },
				});
				this.$snotify.success('Colaborador eliminado', { timeout: 2500 });
				await this.loadCollaborators();
			} catch (error) {
				this.$snotify.error('No se pudo eliminar el colaborador', { timeout: 3000 });
			} finally {
				this.isDeleting = false;
				this.selectedItem = null;
			}
		},
	},
};
</script>

<style scoped>
.aio-admin-settings__lead {
	margin: 0 0 1rem;
	font-size: 0.9375rem;
	color: #6b7280;
	line-height: 1.55;
}

.aio-admin-collaboration__toolbar {
	display: flex;
	justify-content: flex-end;
}
</style>
