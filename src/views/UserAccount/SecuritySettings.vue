<template>
	<div class="aio-account-panel aio-account-security">
		<div class="aio-account-panel__header">
			<div>
				<h2 class="aio-account-panel__title">{{ $t('account.securityTitle') }}</h2>
				<p class="aio-account-panel__subtitle">{{ $t('account.securitySubtitle') }}</p>
			</div>
		</div>

		<div v-if="isLoading" class="aio-account-panel__loading">
			<v-progress-circular indeterminate color="#A96DFA" size="36" width="3"></v-progress-circular>
			<p>{{ $t('common.loading') }}</p>
		</div>

		<template v-else>
			<div class="aio-account-panel__notice">
				<v-icon size="20">shield</v-icon>
				<p>{{ $t('account.securityInfo') }}</p>
			</div>

			<div class="aio-account-security__card aio-account-security__card--password">
				<div class="aio-account-security__status">
					<div>
						<h3>{{ $t('account.passwordSectionTitle') }}</h3>
						<p>{{ $t('account.passwordSectionHint') }}</p>
					</div>
				</div>
				<router-link to="/account/change-password" class="aio-account-panel__edit-btn">
					<v-icon size="18">lock</v-icon>
					{{ $t('account.changePasswordAction') }}
				</router-link>
			</div>

			<div class="aio-account-security__card">
				<div class="aio-account-security__status">
					<div>
						<h3>{{ $t('account.twoFactor') }}</h3>
						<p>{{ status.enabled ? $t('account.twoFactorActive') : $t('account.twoFactorInactive') }}</p>
					</div>
					<span
						class="aio-account-orders__badge"
						:class="status.enabled ? 'aio-account-orders__badge--paid' : 'aio-account-orders__badge--pending'"
					>
						{{ status.enabled ? $t('account.active') : $t('account.inactive') }}
					</span>
				</div>

				<template v-if="!status.enabled && !setupData">
					<button type="button" class="aio-account-panel__edit-btn" :disabled="isBusy" @click="startSetup">
						<v-icon size="18">qr_code_2</v-icon>
						{{ $t('account.enableTwoFactor') }}
					</button>
				</template>

				<template v-if="setupData && !status.enabled">
					<div class="aio-account-security__setup">
						<p>{{ $t('account.scanQr') }}</p>
						<img :src="setupData.qrCodeDataUrl" alt="QR 2FA" class="aio-account-security__qr">
						<p class="aio-account-security__manual">
							{{ $t('account.manualKey') }}: <code>{{ setupData.manualKey }}</code>
						</p>
						<v-text-field
							v-model="verifyCode"
							:label="$t('account.verificationCode')"
							outlined
							dense
							maxlength="6"
							hide-details
							class="aio-account-security__code"
						></v-text-field>
						<button type="button" class="aio-account-panel__edit-btn" :disabled="isBusy" @click="confirmEnable">
							{{ $t('account.confirmActivation') }}
						</button>
					</div>
				</template>

				<template v-if="backupCodes.length">
					<div class="aio-account-security__backup">
						<h4>{{ $t('account.backupCodes') }}</h4>
						<p>{{ $t('account.backupCodesHint') }}</p>
						<ul>
							<li v-for="code in backupCodes" :key="code"><code>{{ code }}</code></li>
						</ul>
					</div>
				</template>

				<template v-if="status.enabled">
					<p v-if="status.backupCodesRemaining" class="aio-account-security__remaining">
						{{ $t('account.backupRemaining', { count: status.backupCodesRemaining }) }}
					</p>
					<div class="aio-account-security__disable">
						<v-text-field v-model="disableCode" :label="$t('account.verificationCode')" outlined dense hide-details></v-text-field>
						<v-text-field v-model="disablePassword" type="password" :label="$t('account.password')" outlined dense hide-details></v-text-field>
						<button type="button" class="aio-account-orders__action aio-account-orders__action--danger" :disabled="isBusy" @click="disableTwoFactor">
							{{ $t('account.disableTwoFactor') }}
						</button>
					</div>
				</template>
			</div>
		</template>
	</div>
</template>

<script>
import api from 'Api';
import { getApiErrorMessage } from 'Helpers/apiError';

export default {
	data() {
		return {
			isLoading: true,
			isBusy: false,
			status: { enabled: false, backupCodesRemaining: 0 },
			setupData: null,
			verifyCode: '',
			disableCode: '',
			disablePassword: '',
			backupCodes: [],
		};
	},
	async mounted() {
		await this.loadStatus();
	},
	methods: {
		async loadStatus() {
			this.isLoading = true;
			try {
				const res = await api.get('/api/users/2fa/status');
				this.status = (res && res.data && res.data.data) || this.status;
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('account.securityLoadError')));
			} finally {
				this.isLoading = false;
			}
		},
		async startSetup() {
			this.isBusy = true;
			try {
				const res = await api.post('/api/users/2fa/setup');
				this.setupData = res && res.data && res.data.data;
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('account.securitySetupError')));
			} finally {
				this.isBusy = false;
			}
		},
		async confirmEnable() {
			if (!this.verifyCode) return;
			this.isBusy = true;
			try {
				const res = await api.post('/api/users/2fa/enable', { token: this.verifyCode });
				const data = res && res.data && res.data.data;
				this.backupCodes = (data && data.backupCodes) || [];
				this.setupData = null;
				this.verifyCode = '';
				await this.loadStatus();
				localStorage.two_factor_enabled = '1';
				this.$snotify.success(this.$t('account.twoFactorEnabledToast'));
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('account.securityCodeError')));
			} finally {
				this.isBusy = false;
			}
		},
		async disableTwoFactor() {
			if (!this.disableCode || !this.disablePassword) return;
			this.isBusy = true;
			try {
				await api.post('/api/users/2fa/disable', {
					token: this.disableCode,
					password: this.disablePassword,
				});
				this.disableCode = '';
				this.disablePassword = '';
				this.backupCodes = [];
				await this.loadStatus();
				localStorage.two_factor_enabled = '0';
				this.$snotify.success(this.$t('account.twoFactorDisabledToast'));
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('account.securityDisableError')));
			} finally {
				this.isBusy = false;
			}
		},
	},
};
</script>

<style scoped>
.aio-account-security__card--password {
	margin-bottom: 1rem;
}
</style>

