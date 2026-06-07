<template>
	<div class="aio-login">
		<div class="aio-login__layout">
			<section class="aio-login__brand" aria-hidden="true">
				<div class="aio-login__brand-glow"></div>
				<div class="aio-login__brand-content">
					<img
						:src="appLogoWhite"
						alt="All in One"
						class="aio-login__brand-logo"
					>
					<h1 class="aio-login__brand-title">Tu marketplace de confianza</h1>
					<p class="aio-login__brand-text">
						Accede a productos y servicios de las mejores empresas en un solo lugar.
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
						<h2>{{ $t('auth.welcomeBack') }}</h2>
						<p>{{ $t('auth.loginSubtitle') }}</p>
					</div>

					<form v-if="!requiresTwoFactor" class="aio-login__form" @submit.prevent="saveDetails">
						<label class="aio-login__field">
							<span class="aio-login__label">{{ $t('auth.email') }}</span>
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
							<span class="aio-login__label">{{ $t('auth.password') }}</span>
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

						<button type="submit" class="aio-login__submit" :disabled="loading">
							<span v-if="loading">{{ $t('common.signingIn') }}</span>
							<span v-else>{{ $t('auth.login') }}</span>
						</button>

						<button type="button" class="aio-login__secondary" @click="openModalrecoverPassword">
							{{ $t('auth.forgotPassword') }}
						</button>
					</form>

					<form v-else class="aio-login__form" @submit.prevent="verifyTwoFactor">
						<div class="aio-login__card-header">
							<h2>{{ $t('account.twoFactorLoginTitle') }}</h2>
							<p>{{ $t('account.twoFactorLoginHint') }}</p>
						</div>
						<label class="aio-login__field">
							<span class="aio-login__label">{{ $t('account.verificationCode') }}</span>
							<div class="aio-login__input-wrap">
								<v-icon size="20" class="aio-login__field-icon">pin</v-icon>
								<input
									v-model="twoFactorCode"
									type="text"
									inputmode="numeric"
									maxlength="8"
									class="aio-login__input"
									placeholder="000000"
									autocomplete="one-time-code"
								>
							</div>
						</label>
						<button type="submit" class="aio-login__submit" :disabled="loading">
							<span v-if="loading">Verificando...</span>
							<span v-else>Verificar</span>
						</button>
						<button type="button" class="aio-login__secondary" @click="resetTwoFactor">
							Volver al inicio de sesión
						</button>
					</form>

					<p class="aio-login__footer">
						{{ $t('auth.noAccount') }}
						<router-link to="/client/register">{{ $t('auth.createAccount') }}</router-link>
						<br>
						<span class="aio-login__footer-admin">
							{{ $t('auth.isAdmin') }}
							<router-link to="/client/admin-login">{{ $t('auth.adminAccess') }}</router-link>
						</span>
					</p>
				</div>
			</section>
		</div>

		<v-dialog v-model="open" max-width="480" content-class="aio-login-dialog">
			<div class="aio-login-dialog__card">
				<div class="aio-login-dialog__header">
					<span class="aio-login-dialog__icon">
						<v-icon size="22" color="white">lock_reset</v-icon>
					</span>
					<div>
						<h3>Recuperar contraseña</h3>
						<p>Te enviaremos instrucciones a tu correo</p>
					</div>
				</div>

				<form @submit.prevent="recoverPassword">
					<label class="aio-login__field">
						<span class="aio-login__label">Correo electrónico</span>
						<div class="aio-login__input-wrap">
							<v-icon size="20" class="aio-login__field-icon">email</v-icon>
							<input
								v-model="formRecovery.email"
								type="email"
								class="aio-login__input"
								placeholder="tu@email.com"
							>
						</div>
						<span v-if="recoveryEmailError" class="aio-login__error">{{ recoveryEmailError }}</span>
					</label>

					<div class="aio-login-dialog__actions">
						<button type="button" class="aio-login__secondary" @click="open = false">Cancelar</button>
						<button type="submit" class="aio-login__submit aio-login__submit--compact" :disabled="recoveryLoading">
							<span v-if="recoveryLoading">Enviando...</span>
							<span v-else>Enviar enlace</span>
						</button>
					</div>
				</form>
			</div>
		</v-dialog>
	</div>
</template>

<script>
import api from 'Api';
import AppConfig from 'Constants/AppConfig';
import { completeClientLogin } from 'Helpers/loginSession';

export default {
	data() {
		return {
			appLogo: AppConfig.appLogo,
			appLogoWhite: AppConfig.appLogoFooter,
			open: false,
			submitted: false,
			recoverySubmitted: false,
			loading: false,
			recoveryLoading: false,
			showPassword: false,
			formRecovery: {
				email: '',
			},
			form: {
				email: '',
				password: '',
			},
			requiresTwoFactor: false,
			twoFactorToken: '',
			twoFactorCode: '',
			emailRules: [
				(v) => !!v || 'El email es requerido',
				(v) => /.+@.+/.test(v) || 'El email ingresado es incorrecto',
			],
			passwordRules: [
				(v) => !!v || 'La contraseña es requerida',
				(v) => !(v?.length < 8) || 'La contraseña debe tener más de 8 caracteres',
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
		recoveryEmailError() {
			if (!this.recoverySubmitted && !this.formRecovery.email) return '';
			const failed = this.emailRules.find((rule) => rule(this.formRecovery.email) !== true);
			return failed ? failed(this.formRecovery.email) : '';
		},
	},
	methods: {
		validateForm() {
			this.submitted = true;
			return this.emailRules.every((rule) => rule(this.form.email) === true)
				&& this.passwordRules.every((rule) => rule(this.form.password) === true);
		},
		validateRecoveryForm() {
			this.recoverySubmitted = true;
			return this.emailRules.every((rule) => rule(this.formRecovery.email) === true);
		},
		recoverPassword() {
			if (!this.validateRecoveryForm()) return;

			this.recoveryLoading = true;
			api.post('/api/users/resetPassword', this.formRecovery)
				.then(() => {
					this.$snotify.success('Clave recuperada con éxito, revise su correo por favor', {
						closeOnClick: false,
						pauseOnHover: false,
						timeout: 2000,
						showProgressBar: false,
					});
					this.open = false;
				})
				.catch((err) => {
					this.handleApiError(err);
				})
				.finally(() => {
					this.recoveryLoading = false;
				});
		},
		openModalrecoverPassword() {
			this.recoverySubmitted = false;
			this.formRecovery.email = '';
			this.open = true;
		},
		saveDetails() {
			if (!this.validateForm()) return;

			this.loading = true;
			api.post('/api/users/login', this.form)
				.then((res) => {
					const data = res.data && res.data.data;
					if (data && data.requiresTwoFactor) {
						this.requiresTwoFactor = true;
						this.twoFactorToken = data.twoFactorToken;
						return;
					}

					this.$snotify.success('Bienvenido', {
						closeOnClick: false,
						pauseOnHover: false,
						timeout: 2000,
						showProgressBar: false,
					});
					completeClientLogin(this, data);
				})
				.catch((err) => {
					this.handleApiError(err);
				})
				.finally(() => {
					this.loading = false;
				});
		},
		verifyTwoFactor() {
			if (!this.twoFactorCode) return;
			this.loading = true;
			api.post('/api/users/2fa/verify-login', {
				twoFactorToken: this.twoFactorToken,
				code: this.twoFactorCode,
				isAdmin: false,
			})
				.then((res) => {
					const data = res.data && res.data.data;
					this.$snotify.success('Bienvenido', { timeout: 2000 });
					completeClientLogin(this, data);
				})
				.catch((err) => this.handleApiError(err))
				.finally(() => {
					this.loading = false;
				});
		},
		resetTwoFactor() {
			this.requiresTwoFactor = false;
			this.twoFactorToken = '';
			this.twoFactorCode = '';
		},
		handleApiError(err) {
			const defaultErrorMessage = err?.response?.data?.error?.message || 'Ocurrió un error inesperado';
			const validationObject = err?.response?.data?.error?.validationObject;

			if (validationObject && Object.keys(validationObject).length > 0) {
				Object.values(validationObject).forEach((message) => {
					if (message) {
						this.$snotify.error(message, {
							closeOnClick: false,
							pauseOnHover: false,
							timeout: 2000,
							showProgressBar: false,
						});
					}
				});
				return;
			}

			this.$snotify.error(defaultErrorMessage, {
				closeOnClick: false,
				pauseOnHover: false,
				timeout: 2000,
				showProgressBar: false,
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
	min-height: 620px;
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

.aio-login__toggle-pass:hover .v-icon {
	color: #A96DFA !important;
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
	transition: transform 0.2s, opacity 0.2s;
	font-family: inherit;
}

.aio-login__submit:hover:not(:disabled) {
	transform: translateY(-1px);
}

.aio-login__submit:disabled {
	opacity: 0.7;
	cursor: not-allowed;
}

.aio-login__submit--compact {
	width: auto;
	min-width: 140px;
	padding: 0 1.25rem;
	height: 44px;
}

.aio-login__secondary {
	border: none;
	background: none;
	padding: 0;
	font-size: 0.875rem;
	font-weight: 600;
	color: #A96DFA;
	cursor: pointer;
	text-align: center;
	font-family: inherit;
	transition: color 0.2s;
}

.aio-login__secondary:hover {
	color: #CA1DFF;
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

.aio-login__footer a:hover {
	color: #A96DFA;
}

.aio-login__footer-admin {
	display: inline-block;
	margin-top: 0.75rem;
}

.aio-login-dialog__card {
	background: #fff;
	border-radius: 20px;
	padding: 1.75rem;
}

.aio-login-dialog__header {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1.5rem;
}

.aio-login-dialog__icon {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	background: linear-gradient(135deg, #A96DFA, #CA1DFF);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.aio-login-dialog__header h3 {
	margin: 0;
	font-size: 1.125rem;
	font-weight: 700;
	color: #111827;
}

.aio-login-dialog__header p {
	margin: 0.25rem 0 0;
	font-size: 0.8125rem;
	color: #6b7280;
}

.aio-login-dialog__actions {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 1rem;
	margin-top: 1.5rem;
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

<style>
.aio-login-dialog {
	box-shadow: none !important;
	background: transparent !important;
}
</style>
