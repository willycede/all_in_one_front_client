<template>
	<div class="aio-auth">
		<div class="aio-auth__layout aio-auth__layout--register">
			<section class="aio-auth__brand" aria-hidden="true">
				<div class="aio-auth__brand-glow"></div>
				<div class="aio-auth__brand-content">
					<img :src="appLogoWhite" alt="All in One" class="aio-auth__brand-logo">
					<h1 class="aio-auth__brand-title">{{ $t('signup.brandTitle') }}</h1>
					<p class="aio-auth__brand-text">
						{{ $t('signup.brandText') }}
					</p>
					<ul class="aio-auth__brand-list">
						<li><v-icon size="18">check_circle</v-icon> {{ $t('signup.benefitSecure') }}</li>
						<li><v-icon size="18">check_circle</v-icon> {{ $t('signup.benefitOrders') }}</li>
						<li><v-icon size="18">check_circle</v-icon> {{ $t('signup.benefitOffers') }}</li>
					</ul>
				</div>
			</section>

			<section class="aio-auth__form-wrap">
				<div class="aio-auth__card">
					<div class="aio-auth__card-header">
						<img :src="appLogo" alt="All in One" class="aio-auth__logo-mobile">
						<h2>{{ $t('signup.title') }}</h2>
						<p>{{ $t('signup.subtitle') }}</p>
					</div>

					<form class="aio-auth__form" @submit.prevent="saveDetails">
						<div class="aio-auth__row">
							<label class="aio-auth__field">
								<span class="aio-auth__label">{{ $t('signup.firstName') }}</span>
								<div class="aio-auth__input-wrap">
									<v-icon size="20" class="aio-auth__field-icon">person_outline</v-icon>
									<input
										v-model="formData.name_user"
										type="text"
										class="aio-auth__input"
										:placeholder="$t('signup.placeholderFirstName')"
										autocomplete="given-name"
									>
								</div>
								<span v-if="fieldError('name_user')" class="aio-auth__error">{{ fieldError('name_user') }}</span>
							</label>

							<label class="aio-auth__field">
								<span class="aio-auth__label">{{ $t('signup.lastName') }}</span>
								<div class="aio-auth__input-wrap">
									<v-icon size="20" class="aio-auth__field-icon">person_outline</v-icon>
									<input
										v-model="formData.last_name_user"
										type="text"
										class="aio-auth__input"
										:placeholder="$t('signup.placeholderLastName')"
										autocomplete="family-name"
									>
								</div>
								<span v-if="fieldError('last_name_user')" class="aio-auth__error">{{ fieldError('last_name_user') }}</span>
							</label>
						</div>

						<label class="aio-auth__field">
							<span class="aio-auth__label">{{ $t('signup.idNumber') }}</span>
							<div class="aio-auth__input-wrap">
								<v-icon size="20" class="aio-auth__field-icon">badge</v-icon>
								<input
									v-model="formData.identification_number"
									type="text"
									class="aio-auth__input"
									:placeholder="$t('signup.placeholderId')"
									inputmode="numeric"
								>
							</div>
							<span v-if="fieldError('identification_number')" class="aio-auth__error">{{ fieldError('identification_number') }}</span>
						</label>

						<label class="aio-auth__field">
							<span class="aio-auth__label">{{ $t('signup.email') }}</span>
							<div class="aio-auth__input-wrap">
								<v-icon size="20" class="aio-auth__field-icon">email</v-icon>
								<input
									v-model="formData.email"
									type="email"
									class="aio-auth__input"
									:placeholder="$t('signup.placeholderEmail')"
									autocomplete="email"
								>
							</div>
							<span v-if="fieldError('email')" class="aio-auth__error">{{ fieldError('email') }}</span>
						</label>

						<label class="aio-auth__field">
							<span class="aio-auth__label">{{ $t('signup.password') }}</span>
							<div class="aio-auth__input-wrap">
								<v-icon size="20" class="aio-auth__field-icon">lock_outline</v-icon>
								<input
									v-model="formData.password"
									:type="showPassword ? 'text' : 'password'"
									class="aio-auth__input"
									:placeholder="$t('signup.placeholderPassword')"
									autocomplete="new-password"
								>
								<button
									type="button"
									class="aio-auth__toggle-pass"
									:aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
									@click="showPassword = !showPassword"
								>
									<v-icon size="20">{{ showPassword ? 'visibility_off' : 'visibility' }}</v-icon>
								</button>
							</div>
							<span v-if="fieldError('password')" class="aio-auth__error">{{ fieldError('password') }}</span>
						</label>

						<label class="aio-auth__field">
							<span class="aio-auth__label">{{ $t('signup.confirmPassword') }}</span>
							<div class="aio-auth__input-wrap">
								<v-icon size="20" class="aio-auth__field-icon">lock_outline</v-icon>
								<input
									v-model="formData.confirm_password"
									:type="showConfirmPassword ? 'text' : 'password'"
									class="aio-auth__input"
									:placeholder="$t('signup.placeholderConfirmPassword')"
									autocomplete="new-password"
								>
								<button
									type="button"
									class="aio-auth__toggle-pass"
									:aria-label="showConfirmPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
									@click="showConfirmPassword = !showConfirmPassword"
								>
									<v-icon size="20">{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</v-icon>
								</button>
							</div>
							<span v-if="fieldError('confirm_password')" class="aio-auth__error">{{ fieldError('confirm_password') }}</span>
						</label>

						<div class="aio-auth__legal">
							<p class="aio-auth__legal-title">{{ $t('signup.legalTitle') }}</p>

							<div v-if="loadingDocuments" class="aio-auth__legal-status">
								<v-progress-circular indeterminate size="20" width="2" color="#A96DFA"></v-progress-circular>
								{{ $t('signup.loadingDocs') }}
							</div>
							<div v-else-if="documentsError" class="aio-auth__legal-status aio-auth__legal-status--error">
								{{ $t('signup.docsLoadError') }}
							</div>
							<div v-else-if="!legalDocuments.length" class="aio-auth__legal-status aio-auth__legal-status--error">
								{{ $t('signup.noDocsConfigured') }}
							</div>

							<label
								v-for="doc in legalDocuments"
								:key="doc.document_key + '-' + doc.version"
								class="aio-auth__consent"
								:class="{ 'aio-auth__consent--checked': acceptedConsents.includes(doc.document_key) }"
							>
								<input
									v-model="acceptedConsents"
									type="checkbox"
									:value="doc.document_key"
									class="aio-auth__consent-input"
								>
								<span class="aio-auth__consent-box">
									<v-icon v-if="acceptedConsents.includes(doc.document_key)" size="14" color="white">check</v-icon>
								</span>
								<span class="aio-auth__consent-text">
									{{ $t('signup.consentPrefix') }}
									<a
										:href="buildPdfUrl(doc)"
										target="_blank"
										rel="noopener"
										@click.stop
									>{{ doc.title }}</a>
									<span v-if="doc.is_required" class="aio-auth__required">*</span>
								</span>
							</label>

							<span v-if="consentError" class="aio-auth__error">{{ consentError }}</span>
						</div>

						<button type="submit" class="aio-auth__submit" :disabled="!canSubmit || loading">
							<span v-if="loading">{{ $t('signup.registering') }}</span>
							<span v-else>{{ $t('signup.submit') }}</span>
						</button>
					</form>

					<p class="aio-auth__footer">
						{{ $t('signup.hasAccount') }}
						<router-link to="/client/login">{{ $t('signup.signIn') }}</router-link>
					</p>
				</div>
			</section>
		</div>
	</div>
</template>

<script>
import api from 'Api';
import AppConfig from 'Constants/AppConfig';
import { buildApiFileUrl } from 'Helpers/apiUrls';

export default {
	data() {
		return {
			appLogo: AppConfig.appLogo,
			appLogoWhite: AppConfig.appLogoFooter,
			submitted: false,
			loading: false,
			showPassword: false,
			showConfirmPassword: false,
			formData: {
				name_user: '',
				last_name_user: '',
				identification_number: '',
				email: '',
				password: '',
				confirm_password: '',
			},
			legalDocuments: [],
			acceptedConsents: [],
			loadingDocuments: true,
			documentsError: false,
		};
	},
	computed: {
		emailRules() {
			return [
				(v) => !!v || this.$t('signup.emailRequired'),
				(v) => /.+@.+/.test(v) || this.$t('signup.emailInvalid'),
			];
		},
		passwordRules() {
			return [
				(v) => !!v || this.$t('signup.passwordRequired'),
				(v) => !(v?.length < 8) || this.$t('signup.passwordMinLength'),
			];
		},
		basicTextRules() {
			return [(v) => !!v || this.$t('signup.fieldRequired')];
		},
		identificationNumberRules() {
			return [
				(v) => !!v || this.$t('signup.idRequired'),
				(v) => (v?.length === 10 || v?.length === 13) || this.$t('signup.idInvalid'),
			];
		},
		confirmPasswordRules() {
			return [
				(v) => !!v || this.$t('signup.passwordRequired'),
				(v) => this.formData.password === v || this.$t('signup.passwordMismatch'),
			];
		},
		canSubmit() {
			if (this.loadingDocuments || this.documentsError) return false;
			if (!this.legalDocuments.length) return false;
			const requiredKeys = this.legalDocuments
				.filter((d) => d.is_required)
				.map((d) => d.document_key);
			return requiredKeys.every((k) => this.acceptedConsents.includes(k));
		},
		consentError() {
			if (!this.submitted) return '';
			if (this.canSubmit) return '';
			return this.$t('signup.consentRequired');
		},
	},
	mounted() {
		this.loadLegalDocuments();
	},
	methods: {
		fieldRules(field) {
			const rulesMap = {
				name_user: this.basicTextRules,
				last_name_user: this.basicTextRules,
				identification_number: this.identificationNumberRules,
				email: this.emailRules,
				password: this.passwordRules,
				confirm_password: this.confirmPasswordRules,
			};
			return rulesMap[field] || [];
		},
		fieldError(field) {
			const value = this.formData[field];
			if (!this.submitted && !value) return '';
			const failed = this.fieldRules(field).find((rule) => rule(value) !== true);
			return failed ? failed(value) : '';
		},
		validateForm() {
			this.submitted = true;
			const fields = ['name_user', 'last_name_user', 'identification_number', 'email', 'password', 'confirm_password'];
			return fields.every((field) => this.fieldRules(field).every((rule) => rule(this.formData[field]) === true));
		},
		buildPdfUrl(doc) {
			return buildApiFileUrl(doc);
		},
		loadLegalDocuments() {
			this.loadingDocuments = true;
			this.documentsError = false;
			api.get('/api/legal_documents/active')
				.then((res) => {
					this.legalDocuments = res?.data?.data || [];
				})
				.catch(() => {
					this.documentsError = true;
				})
				.finally(() => {
					this.loadingDocuments = false;
				});
		},
		handleApiError(err) {
			const defaultErrorMessage = err?.response?.data?.error?.message || this.$t('signup.unexpectedError');
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
		saveDetails() {
			if (!this.validateForm()) return;

			const requiredKeys = this.legalDocuments
				.filter((d) => d.is_required)
				.map((d) => d.document_key);
			const missing = requiredKeys.filter((k) => !this.acceptedConsents.includes(k));
			if (missing.length > 0) {
				this.$snotify.error(this.$t('signup.consentPolicyRequired'), {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 2500,
					showProgressBar: false,
				});
				return;
			}

			this.loading = true;
			const consents = this.legalDocuments
				.filter((d) => this.acceptedConsents.includes(d.document_key))
				.map((d) => ({ document_key: d.document_key, version: d.version }));
			const userData = { ...this.formData };
			delete userData.confirm_password;
			const payload = { ...userData, consents };

			api.post('/api/users/register', payload)
				.then(() => {
					this.$snotify.success(this.$t('signup.success'), {
						closeOnClick: false,
						pauseOnHover: false,
						timeout: 2000,
						showProgressBar: false,
					});
					setTimeout(() => {
						this.$router.push({ path: '/client/login' });
					}, 300);
				})
				.catch((err) => {
					this.handleApiError(err);
				})
				.finally(() => {
					this.loading = false;
				});
		},
	},
};
</script>

<style scoped>
.aio-auth {
	min-height: calc(100vh - 180px);
	padding: 2rem 1.25rem 3rem;
	background: linear-gradient(180deg, #faf8ff 0%, #f3eefb 100%);
}

.aio-auth__layout {
	max-width: 1080px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: 1fr 1fr;
	border-radius: 24px;
	overflow: hidden;
	box-shadow: 0 24px 64px rgba(169, 109, 250, 0.15);
	min-height: 620px;
}

.aio-auth__layout--register {
	max-width: 1140px;
}

.aio-auth__brand {
	position: relative;
	background: linear-gradient(145deg, #08080c 0%, #150820 55%, #1a0a28 100%);
	padding: 3rem;
	display: flex;
	align-items: center;
	overflow: hidden;
}

.aio-auth__brand-glow {
	position: absolute;
	width: 320px;
	height: 320px;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(202, 29, 255, 0.35) 0%, transparent 70%);
	top: -80px;
	right: -80px;
	pointer-events: none;
}

.aio-auth__brand-content {
	position: relative;
	z-index: 1;
}

.aio-auth__brand-logo {
	height: 48px;
	max-width: 220px;
	object-fit: contain;
	margin-bottom: 2rem;
}

.aio-auth__brand-title {
	margin: 0 0 1rem;
	font-size: 1.75rem;
	font-weight: 700;
	color: #fff;
	line-height: 1.25;
}

.aio-auth__brand-text {
	margin: 0 0 1.5rem;
	font-size: 1rem;
	line-height: 1.65;
	color: rgba(255, 255, 255, 0.65);
	max-width: 360px;
}

.aio-auth__brand-list {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.aio-auth__brand-list li {
	display: flex;
	align-items: center;
	gap: 0.625rem;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.75);
}

.aio-auth__brand-list .v-icon {
	color: #CA1DFF !important;
}

.aio-auth__form-wrap {
	background: #fff;
	padding: 2.5rem 2.75rem;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	overflow-y: auto;
	max-height: calc(100vh - 220px);
}

.aio-auth__card {
	width: 100%;
	max-width: 460px;
}

.aio-auth__card-header {
	margin-bottom: 1.75rem;
}

.aio-auth__logo-mobile {
	display: none;
	height: 40px;
	max-width: 180px;
	object-fit: contain;
	margin-bottom: 1.25rem;
}

.aio-auth__card-header h2 {
	margin: 0 0 0.375rem;
	font-size: 1.625rem;
	font-weight: 700;
	color: #111827;
}

.aio-auth__card-header p {
	margin: 0;
	font-size: 0.9375rem;
	color: #6b7280;
}

.aio-auth__form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.aio-auth__row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}

.aio-auth__field {
	display: block;
}

.aio-auth__label {
	display: block;
	margin-bottom: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 600;
	color: #374151;
}

.aio-auth__input-wrap {
	display: flex;
	align-items: center;
	gap: 0.625rem;
	padding: 0 1rem;
	height: 48px;
	border: 2px solid #e5e7eb;
	border-radius: 12px;
	background: #fafafa;
	transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.aio-auth__input-wrap:focus-within {
	border-color: #A96DFA;
	background: #fff;
	box-shadow: 0 0 0 4px rgba(169, 109, 250, 0.12);
}

.aio-auth__field-icon {
	color: #9ca3af !important;
	flex-shrink: 0;
}

.aio-auth__input {
	flex: 1;
	border: none;
	background: transparent;
	outline: none;
	font-size: 0.9375rem;
	color: #111827;
	font-family: inherit;
	min-width: 0;
}

.aio-auth__input::placeholder {
	color: #9ca3af;
}

.aio-auth__toggle-pass {
	border: none;
	background: none;
	padding: 0;
	cursor: pointer;
	display: flex;
	align-items: center;
	color: #9ca3af;
}

.aio-auth__toggle-pass:hover .v-icon {
	color: #A96DFA !important;
}

.aio-auth__error {
	display: block;
	margin-top: 0.375rem;
	font-size: 0.75rem;
	color: #dc2626;
}

.aio-auth__legal {
	margin-top: 0.25rem;
	padding: 1rem;
	border-radius: 14px;
	background: #faf8ff;
	border: 1px solid rgba(169, 109, 250, 0.15);
}

.aio-auth__legal-title {
	margin: 0 0 0.75rem;
	font-size: 0.8125rem;
	font-weight: 700;
	color: #374151;
	text-transform: uppercase;
	letter-spacing: 0.06em;
}

.aio-auth__legal-status {
	display: flex;
	align-items: center;
	gap: 0.625rem;
	font-size: 0.8125rem;
	color: #6b7280;
	margin-bottom: 0.75rem;
}

.aio-auth__legal-status--error {
	color: #dc2626;
}

.aio-auth__consent {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	padding: 0.625rem 0.75rem;
	border-radius: 10px;
	cursor: pointer;
	transition: background 0.2s;
	margin-bottom: 0.375rem;
}

.aio-auth__consent:hover {
	background: rgba(169, 109, 250, 0.06);
}

.aio-auth__consent--checked {
	background: rgba(169, 109, 250, 0.08);
}

.aio-auth__consent-input {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
	pointer-events: none;
}

.aio-auth__consent-box {
	flex-shrink: 0;
	width: 20px;
	height: 20px;
	border-radius: 6px;
	border: 2px solid #d1d5db;
	background: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: border-color 0.2s, background 0.2s;
	margin-top: 1px;
}

.aio-auth__consent--checked .aio-auth__consent-box {
	background: linear-gradient(135deg, #A96DFA, #CA1DFF);
	border-color: transparent;
}

.aio-auth__consent-text {
	font-size: 0.8125rem;
	line-height: 1.5;
	color: #4b5563;
}

.aio-auth__consent-text a {
	color: #CA1DFF;
	font-weight: 600;
	text-decoration: none;
}

.aio-auth__consent-text a:hover {
	color: #A96DFA;
}

.aio-auth__required {
	color: #dc2626;
}

.aio-auth__submit {
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
	margin-top: 0.5rem;
}

.aio-auth__submit:hover:not(:disabled) {
	transform: translateY(-1px);
}

.aio-auth__submit:disabled {
	opacity: 0.55;
	cursor: not-allowed;
	transform: none;
}

.aio-auth__footer {
	margin: 1.5rem 0 0;
	text-align: center;
	font-size: 0.875rem;
	color: #6b7280;
}

.aio-auth__footer a {
	color: #CA1DFF;
	font-weight: 600;
	text-decoration: none;
}

.aio-auth__footer a:hover {
	color: #A96DFA;
}

@media (max-width: 959px) {
	.aio-auth__layout {
		grid-template-columns: 1fr;
		min-height: auto;
	}

	.aio-auth__brand {
		display: none;
	}

	.aio-auth__form-wrap {
		padding: 2rem 1.5rem;
		max-height: none;
	}

	.aio-auth__logo-mobile {
		display: block;
	}

	.aio-auth__row {
		grid-template-columns: 1fr;
	}
}
</style>
