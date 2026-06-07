<template>
	<div class="aio-account-panel aio-account-form aio-account-password">
		<div class="aio-account-panel__header">
			<div>
				<h2 class="aio-account-panel__title">{{ $t('account.changePasswordTitle') }}</h2>
				<p class="aio-account-panel__subtitle">{{ $t('account.changePasswordSubtitle') }}</p>
			</div>
		</div>

		<div class="aio-account-panel__notice">
			<v-icon size="20">lock</v-icon>
			<p>{{ $t('account.changePasswordNotice') }}</p>
		</div>

		<v-form ref="form" v-model="valid">
			<v-layout row wrap>
				<v-flex xs12 py-1>
					<v-text-field
						v-model="currentPassword"
						:type="showCurrent ? 'text' : 'password'"
						:label="$t('account.currentPassword')"
						:rules="requiredRules"
						outlined
						dense
						hide-details="auto"
						:append-icon="showCurrent ? 'visibility_off' : 'visibility'"
						@click:append="showCurrent = !showCurrent"
					></v-text-field>
				</v-flex>
				<v-flex xs12 py-1>
					<v-text-field
						v-model="newPassword"
						:type="showNew ? 'text' : 'password'"
						:label="$t('account.newPassword')"
						:rules="newPasswordRules"
						outlined
						dense
						hide-details="auto"
						:append-icon="showNew ? 'visibility_off' : 'visibility'"
						@click:append="showNew = !showNew"
					></v-text-field>
				</v-flex>
				<v-flex xs12 py-1>
					<v-text-field
						v-model="confirmPassword"
						:type="showConfirm ? 'text' : 'password'"
						:label="$t('account.confirmNewPassword')"
						:rules="confirmPasswordRules"
						outlined
						dense
						hide-details="auto"
						:append-icon="showConfirm ? 'visibility_off' : 'visibility'"
						@click:append="showConfirm = !showConfirm"
					></v-text-field>
				</v-flex>
				<v-flex xs12 class="aio-account-panel__actions">
					<button type="button" class="aio-account-panel__btn aio-account-panel__btn--ghost" @click="goBack">
						{{ $t('common.cancel') }}
					</button>
					<button
						type="button"
						class="aio-account-panel__btn aio-account-panel__btn--primary"
						:disabled="isSubmitting"
						@click.stop.prevent="submit"
					>
						{{ isSubmitting ? $t('account.changingPassword') : $t('account.changePasswordAction') }}
					</button>
				</v-flex>
			</v-layout>
		</v-form>
	</div>
</template>

<script>
import api from 'Api';
import { getApiErrorMessage } from 'Helpers/apiError';

export default {
	data() {
		return {
			valid: false,
			isSubmitting: false,
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
			showCurrent: false,
			showNew: false,
			showConfirm: false,
		};
	},
	computed: {
		requiredRules() {
			return [(v) => !!v || this.$t('account.currentPasswordRequired')];
		},
		newPasswordRules() {
			return [
				(v) => !!v || this.$t('account.newPasswordRequired'),
				(v) => (v && v.length >= 8) || this.$t('account.passwordMinLength'),
			];
		},
		confirmPasswordRules() {
			return [
				(v) => !!v || this.$t('account.confirmPasswordRequired'),
				(v) => v === this.newPassword || this.$t('account.passwordMismatch'),
			];
		},
	},
	methods: {
		goBack() {
			this.$router.push('/account/security');
		},
		async submit() {
			this.$refs.form.validate();
			if (!this.valid) return;

			this.isSubmitting = true;
			try {
				await api.post('/api/users/change-password', {
					id_users: localStorage.id_users,
					current_password: this.currentPassword,
					new_password: this.newPassword,
				});

				this.currentPassword = '';
				this.newPassword = '';
				this.confirmPassword = '';
				this.$refs.form.resetValidation();

				this.$snotify.success(this.$t('account.passwordChanged'), { timeout: 2500 });
				this.$router.push('/account/security');
			} catch (error) {
				const message = getApiErrorMessage(error, this.$t('account.passwordChangeError'));
				this.$snotify.error(message, { timeout: 4000 });
			} finally {
				this.isSubmitting = false;
			}
		},
	},
};
</script>
