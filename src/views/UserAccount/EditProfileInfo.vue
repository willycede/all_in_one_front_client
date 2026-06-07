<template>
	<div class="aio-account-panel aio-account-form editInfo-wrap">
		<div class="aio-account-panel__header">
			<div>
				<h2 class="aio-account-panel__title">{{ $t('account.editInfoTitle') }}</h2>
				<p class="aio-account-panel__subtitle">{{ $t('account.editInfoSubtitle') }}</p>
			</div>
		</div>

		<div class="aio-account-panel__notice">
			<v-icon size="20">info</v-icon>
			<p>{{ $t('account.editInfoNotice') }}</p>
		</div>

		<v-form ref="form" v-model="valid">
			<v-layout row wrap>
				<v-flex xs12 sm6 py-1>
					<v-text-field
						:label="$t('account.idFieldLabel')"
						v-model="identification_number"
						outlined
						dense
						readonly
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 sm6 py-1>
					<v-text-field
						:label="$t('account.nameFieldLabel')"
						v-model="name_user"
						outlined
						dense
						readonly
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 sm6 py-1>
					<v-text-field
						:label="$t('account.lastNameFieldLabel')"
						v-model="last_name_user"
						outlined
						dense
						readonly
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 sm6 py-1>
					<v-text-field
						:label="$t('account.emailLabel')"
						:rules="emailRules"
						v-model="email"
						outlined
						dense
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 py-1>
					<v-text-field
						:label="$t('account.fullAddressLabel')"
						:rules="addressRules"
						v-model="address"
						outlined
						dense
						hide-details="auto"
					></v-text-field>
				</v-flex>
				<v-flex xs12 class="aio-account-panel__password-link">
					<router-link to="/account/change-password" class="aio-account-panel__edit-btn">
						<v-icon size="18">lock</v-icon>
						{{ $t('account.changePasswordLink') }}
					</router-link>
				</v-flex>
				<v-flex xs12 class="aio-account-panel__actions">
					<button type="button" class="aio-account-panel__btn aio-account-panel__btn--ghost" @click="goBack">
						{{ $t('common.cancel') }}
					</button>
					<button type="button" class="aio-account-panel__btn aio-account-panel__btn--primary" @click.stop.prevent="edit">
						{{ $t('account.saveChanges') }}
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
			identification_number: '',
			name_user: '',
			last_name_user: '',
			email: '',
			address: '',
		};
	},
	computed: {
		emailRules() {
			return [
				(v) => !!v || this.$t('account.emailRequired'),
				(v) => /.+@.+/.test(v) || this.$t('account.emailInvalid'),
			];
		},
		addressRules() {
			return [
				(v) => !!v || this.$t('account.addressRequired'),
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

				const response = await api.post('/api/users/update', payload);
				const user = response?.data?.data;
				if (user?.email) {
					localStorage.setItem('email', user.email);
				}

				this.$snotify.success(this.$t('account.profileUpdated'), {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 2000,
					showProgressBar: false,
				});
				setTimeout(() => {
					this.$router.push({ path: '/account/profile' });
				}, 50);
			} catch (error) {
				this.$snotify.error(this.$t('account.profileUpdateError'), {
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
