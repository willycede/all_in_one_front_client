<template>
	<div class="aio-account-panel profile-wrapper">
		<div v-if="isLoading" class="aio-account-panel__loading">
			<v-progress-circular indeterminate color="#A96DFA" size="36" width="3"></v-progress-circular>
			<p>{{ $t('account.profileLoading') }}</p>
		</div>

		<template v-else>
			<div class="aio-account-panel__header">
				<div>
					<h2 class="aio-account-panel__title">{{ $t('account.profileTitle') }}</h2>
					<p class="aio-account-panel__subtitle">{{ $t('account.profileSubtitle') }}</p>
				</div>
				<router-link
					:to="{ name: 'EditProfileInfo', query: { type: 'info' } }"
					class="aio-account-panel__edit-btn"
				>
					<v-icon size="18">edit</v-icon>
					{{ $t('common.edit') }}
				</router-link>
			</div>

			<div class="aio-account-panel__notice">
				<v-icon size="20">info</v-icon>
				<p>{{ $t('account.profileNotice') }}</p>
			</div>

			<div
				class="aio-account-panel__notice"
				:class="billingReady ? 'aio-account-panel__notice--success' : 'aio-account-panel__notice--warning'"
			>
				<v-icon size="20">{{ billingReady ? 'check_circle' : 'warning' }}</v-icon>
				<p>
					<strong>{{ billingReady ? $t('account.billingReady') : $t('account.billingIncomplete') }}</strong>
					<span v-if="!billingReady && billingMissing.length">
						{{ $t('account.billingMissingFields', { fields: billingMissing.join(', ') }) }}
					</span>
				</p>
			</div>

			<h3 class="aio-account-panel__section-title">{{ $t('account.billingData') }}</h3>

			<div class="aio-account-panel__grid">
				<div
					v-for="field in profileFields"
					:key="field.key"
					class="aio-account-panel__field proflie-field"
					:class="{ 'aio-account-panel__field--full': field.full }"
				>
					<span class="aio-account-panel__field-icon">
						<v-icon size="18">{{ field.icon }}</v-icon>
					</span>
					<div class="aio-account-panel__field-body">
						<label>{{ field.label }}</label>
						<span>{{ field.value || '—' }}</span>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import api from 'Api';

const TYPE_LABEL_KEYS = {
	C: 'account.billingTypeCedula',
	R: 'account.billingTypeRuc',
	P: 'account.billingTypePassport',
};

export default {
	data() {
		return {
			isLoading: true,
			user: null,
			billing: null,
			billingReady: false,
			billingMissing: [],
		};
	},
	computed: {
		profileFields() {
			if (!this.user) return [];
			const billing = this.billing || {};
			const typeId = billing.type_id;
			const typeLabel = typeId && TYPE_LABEL_KEYS[typeId]
				? this.$t(TYPE_LABEL_KEYS[typeId])
				: '—';

			return [
				{
					key: 'type',
					label: this.$t('account.idFieldLabel'),
					value: typeLabel,
					icon: 'badge',
				},
				{
					key: 'id',
					label: this.$t('account.idNumber'),
					value: billing.id_document || this.user.identification_number || localStorage.getItem('identification_number'),
					icon: 'fingerprint',
				},
				{
					key: 'name',
					label: this.$t('account.nameFieldLabel'),
					value: billing.razon_social || this.user.name_user || localStorage.getItem('name_user'),
					icon: 'person_outline',
				},
				{
					key: 'last',
					label: this.$t('account.lastNameFieldLabel'),
					value: billing.razon_comercial || this.user.last_name_user || localStorage.getItem('last_name_user'),
					icon: 'person_outline',
				},
				{
					key: 'email',
					label: this.$t('account.emailLabel'),
					value: billing.mail || this.user.email || localStorage.getItem('email'),
					icon: 'email',
				},
				{
					key: 'address',
					label: this.$t('account.addressLabel'),
					value: billing.address || this.user.address,
					icon: 'location_on',
					full: true,
				},
			];
		},
	},
	mounted() {
		this.loadProfile();
	},
	methods: {
		async loadProfile() {
			this.isLoading = true;
			try {
				const [userResponse, billingResponse] = await Promise.all([
					api.get(`/api/users/${localStorage.id_users}`),
					api.get(`/api/shoppingcar/get_invoice_data/${localStorage.id_users}`),
				]);

				if (userResponse?.data?.data) {
					this.user = userResponse.data.data;
				}

				const billingPayload = billingResponse?.data?.data;
				if (billingPayload) {
					this.billing = billingPayload.billing || null;
					this.billingReady = !!billingPayload.ready;
					this.billingMissing = billingPayload.missing || [];
				}
			} finally {
				this.isLoading = false;
			}
		},
	},
};
</script>
