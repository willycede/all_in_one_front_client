<template>
	<div class="aio-account-panel aio-account-form editInfo-wrap">
		<div class="aio-account-panel__header">
			<div>
				<h2 class="aio-account-panel__title">Editar información</h2>
				<p class="aio-account-panel__subtitle">Actualiza tus datos de contacto y facturación</p>
			</div>
		</div>

		<div class="aio-account-panel__notice">
			<v-icon size="20">info</v-icon>
			<p>
				Nombre e identificación no se pueden modificar aquí. Si necesitas cambiarlos, contacta con soporte.
			</p>
		</div>

		<v-form ref="form" v-model="valid">
			<v-layout row wrap>
				<v-flex xs12 sm6 py-1>
					<v-text-field
						label="Identificación (Cédula / RUC)"
						v-model="identification_number"
						outlined
						dense
						readonly
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 sm6 py-1>
					<v-text-field
						label="Nombres / Razón social"
						v-model="name_user"
						outlined
						dense
						readonly
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 sm6 py-1>
					<v-text-field
						label="Apellidos / Nombre comercial"
						v-model="last_name_user"
						outlined
						dense
						readonly
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 sm6 py-1>
					<v-text-field
						label="Email"
						:rules="emailRules"
						v-model="email"
						outlined
						dense
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 py-1>
					<v-text-field
						label="Dirección (Provincia - Ciudad - Dirección)"
						:rules="addressRules"
						v-model="address"
						outlined
						dense
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 py-1>
					<v-text-field
						type="password"
						label="Contraseña (solo si deseas cambiarla)"
						:rules="passwordRules"
						v-model="password"
						outlined
						dense
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 class="aio-account-panel__actions">
					<button type="button" class="aio-account-panel__btn aio-account-panel__btn--ghost" @click="goBack">
						Cancelar
					</button>
					<button type="button" class="aio-account-panel__btn aio-account-panel__btn--primary" @click.stop.prevent="edit">
						Guardar cambios
					</button>
				</v-flex>
			</v-layout>
		</v-form>
	</div>
</template>

<script>
import api from 'Api';

export default {
	data() {
		return {
			valid: false,
			emailRules: [
				v => !!v || 'El email es requerido',
				v => /.+@.+/.test(v) || 'El email debe ser válido',
			],
			addressRules: [
				v => !!v || 'La dirección es requerida',
			],
			identification_number: '',
			name_user: '',
			last_name_user: '',
			email: '',
			address: '',
			password: '',
		};
	},
	computed: {
		passwordRules() {
			return [
				v => !v || v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
			];
		},
	},
	async mounted() {
		await this.populateUserInfo();
	},
	methods: {
		goBack() {
			this.$router.push({ path: '/account/profile' });
		},
		async populateUserInfo() {
			const response = await api.get(`/api/users/${localStorage.id_users}`);
			if (response?.data?.data) {
				const user = response.data.data;
				this.identification_number = user.identification_number || localStorage.getItem('identification_number') || '';
				this.name_user = user.name_user || localStorage.getItem('name_user') || '';
				this.last_name_user = user.last_name_user || localStorage.getItem('last_name_user') || '';
				this.email = user.email || '';
				this.address = user.address || '';
			}
		},
		async edit() {
			this.$refs.form.validate();
			if (!this.valid) return;

			try {
				const payload = {
					address: this.address,
					email: this.email,
					id_users: localStorage.id_users,
				};
				if (this.password) {
					payload.password = this.password;
				}

				const response = await api.post('/api/users/update', payload);
				const user = response?.data?.data;
				if (user?.email) {
					localStorage.setItem('email', user.email);
				}

				this.$snotify.success('Información actualizada con éxito', {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 2000,
					showProgressBar: false,
				});
				setTimeout(() => {
					this.$router.push({ path: '/account/profile' });
				}, 50);
			} catch (error) {
				this.$snotify.error('Ocurrió un error inesperado', {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 2000,
					showProgressBar: false,
				});
			}
		},
	},
};
</script>
