<template>
	<div class="aio-admin-page">
		<AdminPageHeader>
			<template #actions>
				<v-btn
					class="aio-admin-billing__save-btn"
					depressed
					:loading="saving"
					@click="saveSettings"
				>
					<v-icon left>save</v-icon>
					{{ $t('common.save') }}
				</v-btn>
			</template>
		</AdminPageHeader>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>{{ $t('adminBilling.loading') }}</span>
		</div>

		<div v-else class="aio-admin-billing">
			<section class="aio-admin-billing__card">
				<div class="aio-admin-billing__card-head">
					<div class="aio-admin-billing__card-head-main">
						<span class="aio-admin-billing__section-icon">
							<v-icon size="22">tune</v-icon>
						</span>
						<div>
							<h3 class="aio-admin-billing__section-title">{{ $t('adminBilling.environmentTitle') }}</h3>
							<p class="aio-admin-billing__hint">{{ $t('adminBilling.environmentHint') }}</p>
						</div>
					</div>
					<div class="aio-admin-billing__card-art" aria-hidden="true">
						<v-icon size="56">request_quote</v-icon>
					</div>
				</div>

				<div class="aio-admin-billing__card-body">
					<div class="aio-admin-billing__switch-row">
						<v-switch
							v-model="form.is_billing_enabled"
							:label="$t('adminBilling.enableBilling')"
							color="#A96DFA"
							hide-details
							class="aio-admin-billing__switch"
						></v-switch>
					</div>

					<div class="aio-admin-billing__env-toggle" role="group" :aria-label="$t('adminBilling.environmentTitle')">
						<button
							type="button"
							class="aio-admin-billing__env-btn"
							:class="{ 'aio-admin-billing__env-btn--active': form.environment === 'development' }"
							@click="form.environment = 'development'"
						>
							{{ $t('adminBilling.development') }}
						</button>
						<button
							type="button"
							class="aio-admin-billing__env-btn"
							:class="{ 'aio-admin-billing__env-btn--active': form.environment === 'production' }"
							@click="form.environment = 'production'"
						>
							{{ $t('adminBilling.production') }}
						</button>
					</div>
				</div>
			</section>

			<section class="aio-admin-billing__card">
				<div class="aio-admin-billing__card-head">
					<div class="aio-admin-billing__card-head-main">
						<span class="aio-admin-billing__section-icon">
							<v-icon size="22">business</v-icon>
						</span>
						<div>
							<h3 class="aio-admin-billing__section-title">{{ $t('adminBilling.companyTitle') }}</h3>
						</div>
					</div>
					<div class="aio-admin-billing__card-art" aria-hidden="true">
						<v-icon size="56">domain</v-icon>
					</div>
				</div>

				<div class="aio-admin-billing__card-body">
					<v-row dense class="aio-admin-billing__fields">
						<v-col cols="12" md="4">
							<v-text-field
								v-model="form.company_ruc"
								:label="$t('adminBilling.ruc')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
						<v-col cols="12" md="8">
							<v-text-field
								v-model="form.company_legal_name"
								:label="$t('adminBilling.legalName')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
						<v-col cols="12" md="6">
							<v-text-field
								v-model="form.company_trade_name"
								:label="$t('adminBilling.tradeName')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
						<v-col cols="12" md="6">
							<v-text-field
								v-model="form.company_email"
								:label="$t('adminBilling.companyEmail')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
						<v-col cols="12">
							<v-text-field
								v-model="form.company_address"
								:label="$t('adminBilling.address')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
						<v-col cols="12" md="3">
							<v-text-field
								v-model="form.establishment_code"
								:label="$t('adminBilling.establishment')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
						<v-col cols="12" md="3">
							<v-text-field
								v-model="form.emission_point"
								:label="$t('adminBilling.emissionPoint')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
					</v-row>
				</div>
			</section>

			<section class="aio-admin-billing__card">
				<div class="aio-admin-billing__card-head">
					<div class="aio-admin-billing__card-head-main">
						<span class="aio-admin-billing__section-icon">
							<v-icon size="22">cloud_queue</v-icon>
						</span>
						<div>
							<h3 class="aio-admin-billing__section-title">{{ $t('adminBilling.serviceTitle') }}</h3>
						</div>
					</div>
					<div class="aio-admin-billing__card-art aio-admin-billing__card-art--api" aria-hidden="true">
						<span>API</span>
					</div>
				</div>

				<div class="aio-admin-billing__card-body">
					<v-row dense class="aio-admin-billing__fields">
						<v-col cols="12">
							<v-text-field
								v-model="form.service_url"
								:label="$t('adminBilling.serviceUrl')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
						<v-col cols="12" md="6">
							<v-text-field
								v-model="form.output_path"
								:label="$t('adminBilling.outputPath')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
						<v-col cols="12" md="6">
							<v-text-field
								v-model="form.jasper_path"
								:label="$t('adminBilling.jasperPath')"
								outlined
								dense
								hide-details="auto"
								class="aio-admin-billing__field"
							></v-text-field>
						</v-col>
					</v-row>
				</div>
			</section>

			<section class="aio-admin-billing__card">
				<div class="aio-admin-billing__card-head">
					<div class="aio-admin-billing__card-head-main">
						<span class="aio-admin-billing__section-icon">
							<v-icon size="22">verified_user</v-icon>
						</span>
						<div>
							<h3 class="aio-admin-billing__section-title">{{ $t('adminBilling.signatureTitle') }}</h3>
							<p class="aio-admin-billing__hint">{{ $t('adminBilling.signatureHint') }}</p>
						</div>
					</div>
					<div class="aio-admin-billing__card-art" aria-hidden="true">
						<v-icon size="56">workspace_premium</v-icon>
					</div>
				</div>

				<div class="aio-admin-billing__card-body">
					<div
						v-if="!canManageSignature"
						class="aio-admin-billing__signature-alert mb-4"
						role="alert"
					>
						<v-icon size="18" class="mr-2">info</v-icon>
						<span>{{ companyProfileAlertMessage }}</span>
					</div>

					<p v-if="form.has_signature" class="aio-admin-billing__file">
						<v-icon size="18" color="success">verified</v-icon>
						{{ $t('adminBilling.signatureLoaded') }}: {{ form.signature_file_name || '—' }}
					</p>

					<v-text-field
						v-model="form.signature_deploy_path"
						:label="$t('adminBilling.signatureDeployPath')"
						:hint="$t('adminBilling.signatureDeployPathHint')"
						persistent-hint
						outlined
						dense
						hide-details="auto"
						class="aio-admin-billing__field mb-4"
						:disabled="!canManageSignature"
					></v-text-field>

					<div class="aio-admin-billing__signature-fields">
						<v-file-input
							v-model="signatureFile"
							:label="$t('adminBilling.signatureUpload')"
							accept=".p12,.pfx,.pem"
							outlined
							dense
							hide-details="auto"
							show-size
							prepend-icon="vpn_key"
							class="aio-admin-billing__field"
							:disabled="!canManageSignature"
							@change="onSignatureInputChange"
						></v-file-input>

						<v-text-field
							v-model="form.signature_password"
							:label="$t('adminBilling.signaturePassword')"
							:type="showSignaturePassword ? 'text' : 'password'"
							outlined
							dense
							hide-details="auto"
							prepend-inner-icon="lock"
							:append-icon="showSignaturePassword ? 'visibility_off' : 'visibility'"
							class="aio-admin-billing__field"
							:disabled="!canManageSignature"
							@click:append="showSignaturePassword = !showSignaturePassword"
							@input="onSignatureInputChange"
						></v-text-field>
					</div>

					<div v-if="signatureValidation" class="aio-admin-billing__validation mb-4">
						<v-icon size="18" color="success" class="mr-2">check_circle</v-icon>
						<div>
							<p class="aio-admin-billing__validation-title">{{ $t('adminBilling.signatureValidated') }}</p>
							<p class="aio-admin-billing__validation-detail">
								<template v-if="signatureValidation.usesPersonalCertificate">
									{{ $t('adminBilling.signatureValidationPersonal', {
										id: signatureValidation.certificateId || '—',
										issuerRuc: signatureValidation.certificateRuc,
									}) }}
								</template>
								<template v-else>
									{{ $t('adminBilling.signatureValidationRuc', { ruc: signatureValidation.certificateRuc }) }}
								</template>
							</p>
							<p class="aio-admin-billing__validation-detail">
								{{ $t('adminBilling.signatureValidationHolder', { holder: signatureValidation.subjectCn || signatureValidation.subjectOrganization }) }}
							</p>
							<p class="aio-admin-billing__validation-detail">
								{{ $t('adminBilling.signatureValidationExpiry', { date: formatCertDate(signatureValidation.validTo) }) }}
							</p>
						</div>
					</div>

					<div class="aio-admin-billing__signature-actions">
						<v-btn
							class="aio-admin-billing__upload-btn"
							outlined
							color="#A96DFA"
							:loading="validatingSignature"
							:disabled="!canValidateSignature"
							@click="validateSignature"
						>
							<v-icon left>fact_check</v-icon>
							{{ $t('adminBilling.validateSignature') }}
						</v-btn>

						<v-btn
							class="aio-admin-billing__upload-btn"
							outlined
							color="#A96DFA"
							:loading="uploadingSignature"
							:disabled="!canUploadSignature"
							@click="uploadSignature"
						>
							<v-icon left>cloud_upload</v-icon>
							{{ $t('adminBilling.uploadSignature') }}
						</v-btn>
					</div>
				</div>
			</section>

			<div class="aio-admin-billing__tip">
				<v-icon size="18" class="aio-admin-billing__tip-icon">lightbulb</v-icon>
				<p>{{ $t('adminBilling.tipFooter') }}</p>
			</div>
		</div>
	</div>
</template>

<script>
import api from 'Api';

const emptyForm = () => ({
	environment: 'development',
	is_billing_enabled: false,
	company_ruc: '',
	company_legal_name: '',
	company_trade_name: '',
	company_address: '',
	company_email: '',
	establishment_code: '001',
	emission_point: '001',
	service_url: '',
	output_path: '',
	jasper_path: '',
	signature_deploy_path: '/opt/wildfly/standalone/data/firma',
	signature_password: '',
	has_signature: false,
	signature_file_name: null,
	company_profile_complete: false,
});

const COMPANY_PROFILE_FIELDS = ['company_ruc', 'company_legal_name', 'company_address', 'company_email'];

const normalizeRuc = (value) => String(value || '').replace(/\D/g, '');

const isCompanyProfileComplete = (profile) => {
	if (!profile) return false;

	const ruc = normalizeRuc(profile.company_ruc);
	if (ruc.length !== 13) return false;

	return ['company_legal_name', 'company_address', 'company_email'].every((field) => {
		const value = profile[field];
		return !!(value && String(value).trim());
	});
};

const normalizeProfileField = (value) => String(value || '').trim();

export default {
	data() {
		return {
			isLoading: true,
			saving: false,
			uploadingSignature: false,
			validatingSignature: false,
			showSignaturePassword: false,
			form: emptyForm(),
			signatureFile: null,
			signatureValidation: null,
			savedCompanySnapshot: null,
		};
	},
	computed: {
		savedCompanyProfileComplete() {
			return isCompanyProfileComplete(this.savedCompanySnapshot);
		},
		companyProfileDirty() {
			if (!this.savedCompanySnapshot) return false;
			return COMPANY_PROFILE_FIELDS.some((field) => (
				normalizeProfileField(this.form[field]) !== normalizeProfileField(this.savedCompanySnapshot[field])
			));
		},
		canManageSignature() {
			return this.savedCompanyProfileComplete && !this.companyProfileDirty;
		},
		companyProfileAlertMessage() {
			if (!this.savedCompanyProfileComplete) {
				return this.$t('adminBilling.companyRequiredForSignature');
			}
			if (this.companyProfileDirty) {
				return this.$t('adminBilling.companyDirtyForSignature');
			}
			return '';
		},
		canValidateSignature() {
			return this.canManageSignature && !!this.signatureFile && !!this.form.signature_password;
		},
		canUploadSignature() {
			return this.canValidateSignature && !!this.signatureValidation;
		},
	},
	async mounted() {
		await this.loadSettings();
	},
	methods: {
		buildCompanySnapshot(data) {
			return COMPANY_PROFILE_FIELDS.reduce((snapshot, field) => {
				snapshot[field] = normalizeProfileField(data[field]);
				return snapshot;
			}, {});
		},
		applySettings(data) {
			this.savedCompanySnapshot = this.buildCompanySnapshot(data);
			this.form = {
				...emptyForm(),
				...data,
				company_profile_complete: isCompanyProfileComplete(this.savedCompanySnapshot)
					|| !!data.company_profile_complete,
				signature_password: '',
			};
			this.signatureValidation = null;
		},
		getApiError(error, fallback) {
			const message = error
				&& error.response
				&& error.response.data
				&& error.response.data.error
				&& error.response.data.error.message;
			return message || fallback;
		},
		notifySuccess(message) {
			this.$snotify.success(message, { timeout: 3500 });
		},
		notifyError(message) {
			this.$snotify.error(message, { timeout: 4500 });
		},
		formatCertDate(value) {
			if (!value) return '—';
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return '—';
			return date.toLocaleDateString();
		},
		onSignatureInputChange() {
			this.signatureValidation = null;
		},
		buildSignatureFormData() {
			const file = Array.isArray(this.signatureFile)
				? this.signatureFile[0]
				: this.signatureFile;
			const formData = new FormData();
			formData.append('signature', file);
			formData.append('signature_password', this.form.signature_password || '');
			formData.append('signature_deploy_path', this.form.signature_deploy_path || '');
			return formData;
		},
		async loadSettings() {
			this.isLoading = true;
			try {
				const response = await api.get('/api/admin/billing/settings');
				this.applySettings(response.data.data || {});
			} catch (error) {
				this.notifyError(this.$t('adminBilling.loadError'));
			} finally {
				this.isLoading = false;
			}
		},
		async saveSettings() {
			this.saving = true;
			try {
				const payload = { ...this.form };
				delete payload.has_signature;
				delete payload.signature_file_name;
				delete payload.company_profile_complete;

				const response = await api.put('/api/admin/billing/settings', payload);
				this.applySettings(response.data.data || {});
				this.notifySuccess(this.$t('adminBilling.saveSuccess'));
			} catch (error) {
				this.notifyError(this.$t('adminBilling.saveError'));
			} finally {
				this.saving = false;
			}
		},
		async validateSignature() {
			if (!this.canValidateSignature) return;

			this.validatingSignature = true;
			this.signatureValidation = null;

			try {
				const response = await api.post(
					'/api/admin/billing/signature/validate',
					this.buildSignatureFormData(),
				);
				this.signatureValidation = response.data.data || null;
				this.notifySuccess(this.$t('adminBilling.signatureValidated'));
			} catch (error) {
				this.notifyError(this.getApiError(error, this.$t('adminBilling.signatureValidateError')));
			} finally {
				this.validatingSignature = false;
			}
		},
		async uploadSignature() {
			if (!this.canUploadSignature) return;

			this.uploadingSignature = true;

			try {
				const response = await api.post(
					'/api/admin/billing/signature',
					this.buildSignatureFormData(),
				);

				const payload = response.data.data || {};
				const { signature_validation: validationMeta, signature_deployment: deploymentMeta, ...settings } = payload;
				if (validationMeta) {
					this.signatureValidation = validationMeta;
				}
				this.applySettings(settings);
				this.signatureFile = null;
				const deployPath = deploymentMeta && deploymentMeta.deployedPath;
				this.notifySuccess(deployPath
					? this.$t('adminBilling.signatureSuccessDeployed', { path: deployPath })
					: this.$t('adminBilling.signatureSuccess'));
			} catch (error) {
				this.notifyError(this.getApiError(error, this.$t('adminBilling.signatureError')));
			} finally {
				this.uploadingSignature = false;
			}
		},
	},
};
</script>
