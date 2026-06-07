<template>
	<div class="aio-login">
		<div class="aio-login__layout aio-login__layout--admin">
			<section class="aio-login__brand" aria-hidden="true">
				<div class="aio-login__brand-glow"></div>
				<div class="aio-login__brand-content">
					<img
						:src="appLogoWhite"
						alt="All in One"
						class="aio-login__brand-logo"
					>
					<h1 class="aio-login__brand-title">Panel de administración</h1>
					<p class="aio-login__brand-text">
						Acceso restringido a usuarios con rol administrador vinculados a una empresa.
					</p>
				</div>
			</section>

			<section class="aio-login__form-wrap">
				<div class="aio-login__card">
					<div class="aio-login__card-header">
						<img
							:src="appLogo"
							alt="All in One"
							class="aio-login__logo-mobile"
						>
						<h2>Ingreso administrador</h2>
						<p>Selecciona tu empresa e ingresa tus credenciales</p>
					</div>

					<form class="aio-login__form" @submit.prevent="saveDetails">
						<label class="aio-login__field">
							<span class="aio-login__label">Empresa</span>
							<div class="aio-login__input-wrap">
								<v-icon size="20" class="aio-login__field-icon">business</v-icon>
								<select
									v-model="form.company_id"
									class="aio-login__input aio-login__select"
									:disabled="loadingCompanies"
								>
									<option value="">Selecciona una empresa</option>
									<option
										v-for="company in companies"
										:key="company.id_company"
										:value="String(company.id_company)"
									>
										{{ company.name }}
									</option>
								</select>
							</div>
							<span v-if="companyError" class="aio-login__error">{{ companyError }}</span>
						</label>

						<label class="aio-login__field">
							<span class="aio-login__label">Correo electrónico</span>
							<div class="aio-login__input-wrap">
								<v-icon size="20" class="aio-login__field-icon">email</v-icon>
								<input
									v-model="form.email"
									type="email"
									class="aio-login__input"
									placeholder="tu@email.com"
									autocomplete="email"
								>
							</div>
							<span v-if="emailError" class="aio-login__error">{{ emailError }}</span>
						</label>

						<label class="aio-login__field">
							<span class="aio-login__label">Contraseña</span>
							<div class="aio-login__input-wrap">
								<v-icon size="20" class="aio-login__field-icon">lock_outline</v-icon>
								<input
									v-model="form.password"
									:type="showPassword ? 'text' : 'password'"
									class="aio-login__input"
									placeholder="Mínimo 8 caracteres"
									autocomplete="current-password"
								>
								<button
									type="button"
									class="aio-login__toggle-pass"
									:aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
									@click="showPassword = !showPassword"
								>
									<v-icon size="20">{{ showPassword ? 'visibility_off' : 'visibility' }}</v-icon>
								</button>
							</div>
							<span v-if="passwordError" class="aio-login__error">{{ passwordError }}</span>
						</label>

						<button type="submit" class="aio-login__submit" :disabled="loading || loadingCompanies">
							<span v-if="loading">Ingresando...</span>
							<span v-else>Ingresar al panel</span>
						</button>
					</form>

					<p class="aio-login__footer">
						¿Eres cliente?
						<router-link to="/client/login">Ir al login de tienda</router-link>
					</p>
				</div>
			</section>
		</div>
	</div>
</template>

<script>
import api from 'Api';
import AppConfig from 'Constants/AppConfig';

export default {
	data() {
		return {
			appLogo: AppConfig.appLogo,
			appLogoWhite: AppConfig.appLogoFooter,
			loading: false,
			loadingCompanies: true,
			showPassword: false,
			submitted: false,
			companies: [],
			form: {
				email: '',
				password: '',
				company_id: '',
			},
			emailRules: [
				(v) => !!v || 'El email es requerido',
				(v) => /.+@.+/.test(v) || 'El email ingresado es incorrecto',
			],
			passwordRules: [
				(v) => !!v || 'La contraseña es requerida',
				(v) => !(v && v.length < 8) || 'La contraseña debe tener más de 8 caracteres',
			],
		};
	},
	computed: {
		emailError() {
			if (!this.submitted && !this.form.email) return '';
			const failed = this.emailRules.find((rule) => rule(this.form.email) !== true);
			return failed ? failed(this.form.email) : '';
		},
		passwordError() {
			if (!this.submitted && !this.form.password) return '';
			const failed = this.passwordRules.find((rule) => rule(this.form.password) !== true);
			return failed ? failed(this.form.password) : '';
		},
		companyError() {
			if (!this.submitted && !this.form.company_id) return '';
			return this.form.company_id ? '' : 'Selecciona una empresa';
		},
	},
	async mounted() {
		await this.loadCompanies();
	},
	methods: {
		async loadCompanies() {
			this.loadingCompanies = true;
			try {
				const response = await api.get('/api/company/');
				this.companies = (response.data && response.data.data) || [];
				if (this.companies.length === 1) {
					this.form.company_id = String(this.companies[0].id_company);
				}
			} catch (e) {
				this.$snotify.error('No se pudieron cargar las empresas', { timeout: 3000 });
			} finally {
				this.loadingCompanies = false;
			}
		},
		validateForm() {
			this.submitted = true;
			return this.emailRules.every((rule) => rule(this.form.email) === true)
				&& this.passwordRules.every((rule) => rule(this.form.password) === true)
				&& !!this.form.company_id;
		},
		saveDetails() {
			if (!this.validateForm()) return;

			this.loading = true;
			api.post('/api/users/loginAdmin', {
				email: this.form.email,
				password: this.form.password,
				company_id: parseInt(this.form.company_id, 10),
			})
				.then((res) => {
					const user = res.data.data;
					this.$snotify.success('Bienvenido al panel admin', { timeout: 2000 });
					localStorage.email = user.email;
					localStorage.id_users = user.id_users;
					localStorage.identification_number = user.identification_number;
					localStorage.name_user = user.name_user;
					localStorage.last_name_user = user.last_name_user;
					localStorage.id_user_rol = user.id_user_rol;
					localStorage.id_rol = user.id_rol;
					localStorage.id_company_user = user.id_company_user;
					localStorage.access_token = user.access_token;
					const redirect = this.$route.query.redirect;
					const target = redirect && redirect.indexOf('/admin-panel') === 0
						? redirect
						: '/admin-panel/reports';
					this.$router.push(target);
				})
				.catch((err) => {
					const message = (err.response && err.response.data && err.response.data.error && err.response.data.error.message)
						|| 'No se pudo iniciar sesión como administrador';
					this.$snotify.error(message, { timeout: 3500 });
				})
				.finally(() => {
					this.loading = false;
				});
		},
	},
};
</script>

<style scoped>
.aio-login {
	min-height: calc(100vh - 180px);
	padding: 2rem 1.25rem 3rem;
	background: linear-gradient(180deg, #faf8ff 0%, #f3eefb 100%);
}

.aio-login__layout {
	max-width: 1080px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: 1fr 1fr;
	border-radius: 24px;
	overflow: hidden;
	box-shadow: 0 24px 64px rgba(169, 109, 250, 0.15);
	min-height: 580px;
}

.aio-login__brand {
	position: relative;
	background: linear-gradient(145deg, #08080c 0%, #150820 55%, #1a0a28 100%);
	padding: 3rem;
	display: flex;
	align-items: center;
	overflow: hidden;
}

.aio-login__brand-glow {
	position: absolute;
	width: 320px;
	height: 320px;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(202, 29, 255, 0.35) 0%, transparent 70%);
	top: -80px;
	right: -80px;
	pointer-events: none;
}

.aio-login__brand-content {
	position: relative;
	z-index: 1;
}

.aio-login__brand-logo {
	height: 48px;
	max-width: 220px;
	object-fit: contain;
	margin-bottom: 2rem;
}

.aio-login__brand-title {
	margin: 0 0 1rem;
	font-size: 1.75rem;
	font-weight: 700;
	color: #fff;
	line-height: 1.25;
}

.aio-login__brand-text {
	margin: 0;
	font-size: 1rem;
	line-height: 1.65;
	color: rgba(255, 255, 255, 0.65);
	max-width: 360px;
}

.aio-login__form-wrap {
	background: #fff;
	padding: 2.5rem 2.75rem;
	display: flex;
	align-items: center;
	justify-content: center;
}

.aio-login__card {
	width: 100%;
	max-width: 380px;
}

.aio-login__card-header {
	margin-bottom: 2rem;
}

.aio-login__logo-mobile {
	display: none;
	height: 40px;
	max-width: 180px;
	object-fit: contain;
	margin-bottom: 1.25rem;
}

.aio-login__card-header h2 {
	margin: 0 0 0.375rem;
	font-size: 1.625rem;
	font-weight: 700;
	color: #111827;
}

.aio-login__card-header p {
	margin: 0;
	font-size: 0.9375rem;
	color: #6b7280;
}

.aio-login__form {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.aio-login__field {
	display: block;
}

.aio-login__label {
	display: block;
	margin-bottom: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 600;
	color: #374151;
}

.aio-login__input-wrap {
	display: flex;
	align-items: center;
	gap: 0.625rem;
	padding: 0 1rem;
	height: 50px;
	border: 2px solid #e5e7eb;
	border-radius: 12px;
	background: #fafafa;
	transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.aio-login__input-wrap:focus-within {
	border-color: #A96DFA;
	background: #fff;
	box-shadow: 0 0 0 4px rgba(169, 109, 250, 0.12);
}

.aio-login__field-icon {
	color: #9ca3af !important;
	flex-shrink: 0;
}

.aio-login__input {
	flex: 1;
	border: none;
	background: transparent;
	outline: none;
	font-size: 0.9375rem;
	color: #111827;
	font-family: inherit;
	min-width: 0;
}

.aio-login__select {
	cursor: pointer;
}

.aio-login__input::placeholder {
	color: #9ca3af;
}

.aio-login__toggle-pass {
	border: none;
	background: none;
	padding: 0;
	cursor: pointer;
	display: flex;
	align-items: center;
	color: #9ca3af;
}

.aio-login__error {
	display: block;
	margin-top: 0.375rem;
	font-size: 0.75rem;
	color: #dc2626;
}

.aio-login__submit {
	width: 100%;
	height: 50px;
	border: none;
	border-radius: 12px;
	background: linear-gradient(135deg, #A96DFA 0%, #CA1DFF 100%);
	color: #fff;
	font-size: 0.9375rem;
	font-weight: 700;
	cursor: pointer;
	box-shadow: 0 8px 24px rgba(202, 29, 255, 0.35);
	font-family: inherit;
}

.aio-login__submit:disabled {
	opacity: 0.7;
	cursor: not-allowed;
}

.aio-login__footer {
	margin: 1.75rem 0 0;
	text-align: center;
	font-size: 0.875rem;
	color: #6b7280;
}

.aio-login__footer a {
	color: #CA1DFF;
	font-weight: 600;
	text-decoration: none;
}

@media (max-width: 959px) {
	.aio-login__layout {
		grid-template-columns: 1fr;
		min-height: auto;
	}

	.aio-login__brand {
		display: none;
	}

	.aio-login__form-wrap {
		padding: 2rem 1.5rem;
	}

	.aio-login__logo-mobile {
		display: block;
	}
}
</style>
