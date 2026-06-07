<template>
	<div class="aio-account-panel aio-account-preferences">
		<div class="aio-account-panel__header">
			<div>
				<h2 class="aio-account-panel__title">{{ $t('account.preferencesTitle') }}</h2>
				<p class="aio-account-panel__subtitle">{{ $t('account.preferencesSubtitle') }}</p>
			</div>
		</div>

		<div v-if="isLoading" class="aio-account-panel__loading">
			<v-progress-circular indeterminate color="#A96DFA" size="36" width="3"></v-progress-circular>
			<p>{{ $t('common.loading') }}</p>
		</div>

		<form v-else class="aio-account-preferences__form" @submit.prevent="save">
			<section class="aio-account-preferences__card">
				<header class="aio-account-preferences__card-head">
					<span class="aio-account-preferences__card-icon">
						<v-icon size="22">language</v-icon>
					</span>
					<div>
						<h3>{{ $t('account.languageCurrency') }}</h3>
						<p>{{ $t('account.languageCurrencyHint') }}</p>
					</div>
				</header>

				<div class="aio-account-preferences__grid aio-account-preferences__grid--2">
					<div class="aio-account-preferences__field">
						<v-select
							v-model="form.locale"
							:items="localeOptions"
							item-text="label"
							item-value="value"
							:label="$t('account.language')"
							outlined
							dense
							hide-details
							class="aio-account-preferences__select"
						></v-select>
					</div>
					<div class="aio-account-preferences__field">
						<v-select
							v-model="form.currency"
							:items="currencyOptions"
							item-text="label"
							item-value="value"
							:label="$t('account.currency')"
							outlined
							dense
							hide-details
							class="aio-account-preferences__select"
						></v-select>
					</div>
				</div>
			</section>

			<section class="aio-account-preferences__card">
				<header class="aio-account-preferences__card-head">
					<span class="aio-account-preferences__card-icon">
						<v-icon size="22">local_shipping</v-icon>
					</span>
					<div>
						<h3>{{ $t('account.deliveryDefaults') }}</h3>
						<p>{{ $t('account.deliveryDefaultsHint') }}</p>
					</div>
				</header>

				<div class="aio-account-preferences__switch-row">
					<v-switch
						v-model="form.use_delivery_on_orders"
						:label="$t('account.useDeliveryByDefault')"
						color="#A96DFA"
						hide-details
						class="aio-account-preferences__switch"
					></v-switch>
				</div>

				<div
					v-if="form.use_delivery_on_orders"
					class="aio-account-preferences__grid aio-account-preferences__grid--delivery"
				>
					<v-text-field
						v-model="form.default_delivery_recipient"
						:label="$t('account.recipientName')"
						outlined
						dense
						hide-details
						class="aio-account-preferences__input"
					></v-text-field>
					<v-text-field
						v-model="form.default_delivery_phone"
						:label="$t('account.recipientPhone')"
						outlined
						dense
						hide-details
						class="aio-account-preferences__input"
					></v-text-field>
					<v-textarea
						v-model="form.default_delivery_address"
						:label="$t('account.deliveryAddress')"
						outlined
						dense
						rows="3"
						hide-details
						class="aio-account-preferences__input aio-account-preferences__input--full"
					></v-textarea>
				</div>
			</section>

			<div class="aio-account-preferences__actions">
				<button type="submit" class="aio-account-panel__btn aio-account-panel__btn--primary" :disabled="isSaving">
					<v-icon size="18">save</v-icon>
					{{ isSaving ? $t('account.saving') : $t('account.savePreferences') }}
				</button>
			</div>
		</form>
	</div>
</template>

<script>
import api from 'Api';
import { LOCALE_MAP, CURRENCY_MAP, applyPreferencesToApp } from 'Helpers/userPreferences';
import { getApiErrorMessage } from 'Helpers/apiError';

export default {
	data() {
		return {
			isLoading: true,
			isSaving: false,
			form: {
				locale: 'sp',
				currency: 'USD',
				use_delivery_on_orders: false,
				default_delivery_address: '',
				default_delivery_recipient: '',
				default_delivery_phone: '',
			},
		};
	},
	computed: {
		localeOptions() {
			return Object.keys(LOCALE_MAP).map((key) => ({
				value: key,
				label: LOCALE_MAP[key].name,
			}));
		},
		currencyOptions() {
			return Object.keys(CURRENCY_MAP).map((key) => ({
				value: key,
				label: `${CURRENCY_MAP[key].title} (${CURRENCY_MAP[key].symbol})`,
			}));
		},
	},
	async mounted() {
		await this.load();
	},
	methods: {
		async load() {
			this.isLoading = true;
			try {
				const res = await api.get(`/api/users/preferences/${localStorage.id_users}`);
				const data = res && res.data && res.data.data;
				if (data) {
					this.form = {
						locale: data.locale || 'sp',
						currency: data.currency || 'USD',
						use_delivery_on_orders: !!data.use_delivery_on_orders,
						default_delivery_address: data.default_delivery_address || '',
						default_delivery_recipient: data.default_delivery_recipient || '',
						default_delivery_phone: data.default_delivery_phone || '',
					};
				}
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('account.preferencesLoadError')));
			} finally {
				this.isLoading = false;
			}
		},
		async save() {
			this.isSaving = true;
			try {
				const payload = {
					id_user: localStorage.id_users,
					...this.form,
				};
				const res = await api.put('/api/users/preferences', payload);
				const saved = res && res.data && res.data.data;
				applyPreferencesToApp(this.$store, this.$i18n, saved);
				this.$snotify.success(this.$t('account.preferencesSaved'));
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('account.preferencesSaveError')));
			} finally {
				this.isSaving = false;
			}
		},
	},
};
</script>
