<template>
	<div class="aio-admin-page">
		<div class="aio-admin-page__header">
			<div>
				<h2 class="aio-admin-page__title">{{ $t('adminBilling.title') }}</h2>
				<p class="aio-admin-page__subtitle">{{ $t('adminBilling.subtitle') }}</p>
			</div>
			<v-btn color="primary" depressed :loading="saving" @click="saveSettings">
				<v-icon left>save</v-icon>
				{{ $t('common.save') }}
			</v-btn>
		</div>

		<div v-if="errorMessage" class="aio-admin-page__error">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ errorMessage }}
		</div>

		<div v-if="successMessage" class="aio-admin-page__success mb-4">
			<v-icon color="success" class="mr-2">check_circle</v-icon>
			{{ successMessage }}
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>{{ $t('adminBilling.loading') }}</span>
		</div>

		<div v-else class="aio-admin-billing">
			<div class="aio-admin-card pa-4 mb-4">
				<h3 class="aio-admin-billing__section-title">{{ $t('adminBilling.environmentTitle') }}</h3>
				<p class="aio-admin-billing__hint">{{ $t('adminBilling.environmentHint') }}</p>

				<v-switch
					v-model="form.is_billing_enabled"
					:label="$t('adminBilling.enableBilling')"
					color="primary"
					hide-details
					class="mt-2"
				></v-switch>

				<v-btn-toggle v-model="form.environment" mandatory dense class="aio-admin-billing__env mt-4">
					<v-btn value="development" small>{{ $t('adminBilling.development') }}</v-btn>
					<v-btn value="production" small>{{ $t('adminBilling.production') }}</v-btn>
				</v-btn-toggle>
			</div>

			<div class="aio-admin-card pa-4 mb-4">
				<h3 class="aio-admin-billing__section-title">{{ $t('adminBilling.companyTitle') }}</h3>
				<v-row dense>
					<v-col cols="12" md="4">
						<v-text-field v-model="form.company_ruc" :label="$t('adminBilling.ruc')" outlined dense />
					</v-col>
					<v-col cols="12" md="8">
						<v-text-field v-model="form.company_legal_name" :label="$t('adminBilling.legalName')" outlined dense />
					</v-col>
					<v-col cols="12" md="6">
						<v-text-field v-model="form.company_trade_name" :label="$t('adminBilling.tradeName')" outlined dense />
					</v-col>
					<v-col cols="12" md="6">
						<v-text-field v-model="form.company_email" :label="$t('adminBilling.companyEmail')" outlined dense />
					</v-col>
					<v-col cols="12">
						<v-text-field v-model="form.company_address" :label="$t('adminBilling.address')" outlined dense />
					</v-col>
					<v-col cols="12" md="3">
						<v-text-field v-model="form.establishment_code" :label="$t('adminBilling.establishment')" outlined dense />
					</v-col>
					<v-col cols="12" md="3">
						<v-text-field v-model="form.emission_point" :label="$t('adminBilling.emissionPoint')" outlined dense />
					</v-col>
				</v-row>
			</div>

			<div class="aio-admin-card pa-4 mb-4">
				<h3 class="aio-admin-billing__section-title">{{ $t('adminBilling.serviceTitle') }}</h3>
				<v-row dense>
					<v-col cols="12">
						<v-text-field v-model="form.service_url" :label="$t('adminBilling.serviceUrl')" outlined dense />
					</v-col>
					<v-col cols="12" md="6">
						<v-text-field v-model="form.output_path" :label="$t('adminBilling.outputPath')" outlined dense />
					</v-col>
					<v-col cols="12" md="6">
						<v-text-field v-model="form.jasper_path" :label="$t('adminBilling.jasperPath')" outlined dense />
					</v-col>
				</v-row>
			</div>

			<div class="aio-admin-card pa-4">
				<h3 class="aio-admin-billing__section-title">{{ $t('adminBilling.signatureTitle') }}</h3>
				<p class="aio-admin-billing__hint">{{ $t('adminBilling.signatureHint') }}</p>

				<p v-if="form.has_signature" class="aio-admin-billing__file">
					<v-icon size="18" color="success">verified</v-icon>
					{{ $t('adminBilling.signatureLoaded') }}: {{ form.signature_file_name || '—' }}
				</p>

				<v-file-input
					v-model="signatureFile"
					:label="$t('adminBilling.signatureUpload')"
					accept=".p12,.pfx,.pem"
					outlined
					dense
					show-size
					prepend-icon="vpn_key"
					class="mt-3"
				></v-file-input>

				<v-text-field
					v-model="form.signature_password"
					:label="$t('adminBilling.signaturePassword')"
					type="password"
					outlined
					dense
					class="mt-2"
				></v-text-field>

				<v-btn color="primary" depressed :loading="uploadingSignature" :disabled="!signatureFile" @click="uploadSignature">
					<v-icon left>cloud_upload</v-icon>
					{{ $t('adminBilling.uploadSignature') }}
				</v-btn>
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
	signature_password: '',
	has_signature: false,
	signature_file_name: null,
});

export default {
	data() {
		return {
			isLoading: true,
			saving: false,
			uploadingSignature: false,
			errorMessage: '',
			successMessage: '',
			form: emptyForm(),
			signatureFile: null,
		};
	},
	async mounted() {
		await this.loadSettings();
	},
	methods: {
		applySettings(data) {
			this.form = {
				...emptyForm(),
				...data,
				signature_password: '',
			};
		},
		async loadSettings() {
			this.isLoading = true;
			this.errorMessage = '';
			try {
				const response = await api.get('/api/admin/billing/settings');
				this.applySettings(response.data.data || {});
			} catch (error) {
				this.errorMessage = this.$t('adminBilling.loadError');
			} finally {
				this.isLoading = false;
			}
		},
		async saveSettings() {
			this.saving = true;
			this.errorMessage = '';
			this.successMessage = '';
			try {
				const payload = { ...this.form };
				delete payload.has_signature;
				delete payload.signature_file_name;

				const response = await api.put('/api/admin/billing/settings', payload);
				this.applySettings(response.data.data || {});
				this.successMessage = this.$t('adminBilling.saveSuccess');
			} catch (error) {
				this.errorMessage = this.$t('adminBilling.saveError');
			} finally {
				this.saving = false;
			}
		},
		async uploadSignature() {
			if (!this.signatureFile) return;

			this.uploadingSignature = true;
			this.errorMessage = '';
			this.successMessage = '';

			try {
				const formData = new FormData();
				formData.append('signature', this.signatureFile);

				const response = await api.post('/api/admin/billing/signature', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});

				this.applySettings(response.data.data || {});
				this.signatureFile = null;
				this.successMessage = this.$t('adminBilling.signatureSuccess');
			} catch (error) {
				this.errorMessage = this.$t('adminBilling.signatureError');
			} finally {
				this.uploadingSignature = false;
			}
		},
	},
};
</script>

<style scoped>
.aio-admin-billing__section-title {
	margin: 0 0 0.35rem;
	font-size: 1.05rem;
	font-weight: 700;
	color: #1a1a2e;
}

.aio-admin-billing__hint {
	margin: 0 0 0.75rem;
	font-size: 0.875rem;
	color: #6b7280;
	line-height: 1.5;
}

.aio-admin-billing__env {
	display: flex;
}

.aio-admin-billing__file {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.875rem;
	color: #374151;
}

.aio-admin-page__success {
	display: flex;
	align-items: center;
	padding: 0.75rem 1rem;
	border-radius: 12px;
	background: rgba(34, 197, 94, 0.08);
	color: #166534;
	font-size: 0.875rem;
}
</style>
