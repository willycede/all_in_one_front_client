<template>
	<div class="aio-admin-profile-edit">
		<div class="aio-admin-card aio-admin-product-form__section">
			<header class="aio-admin-product-form__section-head">
				<span class="aio-admin-product-form__section-icon">
					<v-icon size="20">edit</v-icon>
				</span>
				<div>
					<h3>Editar información del perfil</h3>
					<p>Actualiza tus datos de contacto y nombre visible en el panel.</p>
				</div>
			</header>

			<div v-if="loadError" class="aio-admin-page__error mb-4">{{ loadError }}</div>

			<v-form v-else ref="form" v-model="valid" @submit.prevent="saveDetails">
				<div class="aio-admin-profile-edit__grid">
					<v-text-field
						v-model="form.name_user"
						label="Nombre *"
						outlined
						dense
						:rules="requiredRules"
					></v-text-field>
					<v-text-field
						v-model="form.last_name_user"
						label="Apellido *"
						outlined
						dense
						:rules="requiredRules"
					></v-text-field>
					<v-text-field
						v-model="form.identification_number"
						label="Identificación"
						outlined
						dense
					></v-text-field>
					<v-text-field
						v-model="form.email"
						label="Correo electrónico *"
						type="email"
						outlined
						dense
						:rules="emailRules"
					></v-text-field>
					<v-text-field
						v-model="form.address"
						label="Dirección"
						outlined
						dense
						class="aio-admin-profile-edit__full"
					></v-text-field>
				</div>

				<div class="aio-admin-settings__section-actions">
					<v-btn text color="primary" :disabled="isSaving" @click="$router.push('/admin-panel/account/profile')">
						Cancelar
					</v-btn>
					<v-btn type="submit" color="primary" depressed :loading="isSaving" :disabled="!valid">
						Guardar cambios
					</v-btn>
				</div>
			</v-form>
		</div>
	</div>
</template>

<script>
import api from 'Api';

export default {
	data() {
		return {
			valid: false,
			isLoading: true,
			isSaving: false,
			loadError: '',
			form: {
				id_users: '',
				name_user: '',
				last_name_user: '',
				identification_number: '',
				email: '',
				address: '',
			},
			requiredRules: [(v) => !!String(v || '').trim() || 'Campo obligatorio'],
			emailRules: [
				(v) => !!v || 'El correo es obligatorio',
				(v) => /.+@.+/.test(v) || 'Correo inválido',
			],
		};
	},
	async mounted() {
		await this.loadProfile();
	},
	methods: {
		async loadProfile() {
			this.isLoading = true;
			this.loadError = '';
			const userId = localStorage.getItem('id_users');
			if (!userId) {
				this.loadError = 'No hay sesión activa.';
				this.isLoading = false;
				return;
			}
			try {
				const response = await api.get(`/api/users/${userId}`);
				const payload = response.data && response.data.data;
				const user = Array.isArray(payload) ? payload[0] : payload;
				if (!user) {
					this.loadError = 'No se encontró el perfil del usuario.';
					return;
				}
				this.form = {
					id_users: user.id_users,
					name_user: user.name_user || '',
					last_name_user: user.last_name_user || '',
					identification_number: user.identification_number || '',
					email: user.email || '',
					address: user.address || '',
				};
			} catch (error) {
				this.loadError = 'No se pudo cargar tu perfil.';
			} finally {
				this.isLoading = false;
			}
		},
		async saveDetails() {
			if (!this.$refs.form.validate()) return;
			this.isSaving = true;
			try {
				await api.post('/api/users/update', {
					id_users: this.form.id_users,
					name_user: String(this.form.name_user).trim(),
					last_name_user: String(this.form.last_name_user).trim(),
					identification_number: String(this.form.identification_number || '').trim(),
					email: String(this.form.email).trim(),
					address: String(this.form.address || '').trim(),
				});
				localStorage.setItem('name_user', this.form.name_user);
				localStorage.setItem('last_name_user', this.form.last_name_user);
				localStorage.setItem('email', this.form.email);
				localStorage.setItem('identification_number', this.form.identification_number || '');
				this.$snotify.success('Perfil actualizado correctamente', { timeout: 2500 });
				this.$router.push('/admin-panel/account/profile');
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| 'No se pudo actualizar el perfil';
				this.$snotify.error(message, { timeout: 4000 });
			} finally {
				this.isSaving = false;
			}
		},
	},
};
</script>

<style scoped>
.aio-admin-product-form__section {
	padding: 1.25rem 1.5rem;
}

.aio-admin-product-form__section-head {
	display: flex;
	gap: 1rem;
	margin-bottom: 1.25rem;
}

.aio-admin-product-form__section-head h3 {
	margin: 0 0 0.25rem;
	font-size: 1.0625rem;
	font-weight: 700;
	color: #111827;
}

.aio-admin-product-form__section-head p {
	margin: 0;
	font-size: 0.8125rem;
	color: #6b7280;
}

.aio-admin-product-form__section-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 10px;
	background: rgba(169, 109, 250, 0.12);
	flex-shrink: 0;
}

.aio-admin-product-form__section-icon .v-icon {
	color: #A96DFA !important;
}

.aio-admin-profile-edit__grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.75rem 1rem;
}

.aio-admin-profile-edit__full {
	grid-column: 1 / -1;
}

.aio-admin-settings__section-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
	margin-top: 1.25rem;
	padding-top: 1rem;
	border-top: 1px solid rgba(169, 109, 250, 0.08);
}

@media (max-width: 700px) {
	.aio-admin-profile-edit__grid {
		grid-template-columns: 1fr;
	}
}
</style>
