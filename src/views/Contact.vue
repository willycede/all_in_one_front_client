<template>
	<div class="aio-public-page aio-contact">
		<div class="aio-public-page__hero">
			<v-container>
				<div class="aio-public-page__hero-inner">
					<span class="aio-public-page__eyebrow">{{ $t('nav.contact') }}</span>
					<h1 class="aio-public-page__title">{{ $t('publicPages.contact.title') }}</h1>
					<p class="aio-public-page__subtitle">{{ $t('publicPages.contact.subtitle') }}</p>
				</div>
			</v-container>
		</div>

		<div class="aio-public-page__body">
			<v-container grid-list-xl py-0>
				<div v-if="isLoading" class="aio-public-page__status">
					<v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
					<p>{{ $t('publicPages.loading') }}</p>
				</div>

				<div v-else-if="loadError" class="aio-public-page__status aio-public-page__status--error">
					<p>{{ $t('publicPages.loadError') }}</p>
				</div>

				<template v-else>
					<div class="aio-contact__map-card">
						<emb-google-map
							:map-center="mapCenter"
							:map-zoom="mapZoom"
						></emb-google-map>
					</div>

					<v-layout row wrap class="aio-contact__grid">
						<v-flex sm12 md12 lg5 xl5>
							<div class="aio-public-page__card aio-contact__info">
								<h2 class="aio-public-page__card-title">{{ $t('publicPages.contact.infoTitle') }}</h2>
								<p v-if="contactInfo.info" class="aio-public-page__card-lead">{{ contactInfo.info }}</p>

							<ul class="aio-contact__details">
								<li v-if="contactInfo.legalName" class="aio-contact__detail">
									<span class="aio-contact__icon" aria-hidden="true">
										<v-icon size="20">business</v-icon>
									</span>
									<div class="aio-contact__detail-body">
										<span class="aio-contact__label">{{ $t('publicPages.contact.legalName') }}</span>
										<p>{{ contactInfo.legalName }}</p>
									</div>
								</li>
								<li v-if="contactInfo.ruc" class="aio-contact__detail">
									<span class="aio-contact__icon" aria-hidden="true">
										<v-icon size="20">badge</v-icon>
									</span>
									<div class="aio-contact__detail-body">
										<span class="aio-contact__label">{{ $t('publicPages.contact.ruc') }}</span>
										<p>{{ contactInfo.ruc }}</p>
									</div>
								</li>
								<li v-if="contactInfo.call" class="aio-contact__detail">
										<span class="aio-contact__icon" aria-hidden="true">
											<v-icon size="20">phone</v-icon>
										</span>
										<div class="aio-contact__detail-body">
											<span class="aio-contact__label">{{ $t('publicPages.contact.call') }}</span>
											<a :href="`tel:${contactInfo.call}`">{{ contactInfo.call }}</a>
										</div>
									</li>
								<li v-if="contactInfo.mail" class="aio-contact__detail">
									<span class="aio-contact__icon" aria-hidden="true">
										<v-icon size="20">email</v-icon>
									</span>
									<div class="aio-contact__detail-body">
										<span class="aio-contact__label">{{ $t('publicPages.contact.mail') }}</span>
										<a :href="`mailto:${contactInfo.mail}`">{{ contactInfo.mail }}</a>
									</div>
								</li>
								<li v-if="contactInfo.dataProtectionEmail" class="aio-contact__detail">
									<span class="aio-contact__icon" aria-hidden="true">
										<v-icon size="20">shield</v-icon>
									</span>
									<div class="aio-contact__detail-body">
										<span class="aio-contact__label">{{ $t('publicPages.contact.dataProtection') }}</span>
										<a :href="`mailto:${contactInfo.dataProtectionEmail}`">{{ contactInfo.dataProtectionEmail }}</a>
									</div>
								</li>
									<li v-if="contactInfo.address" class="aio-contact__detail">
										<span class="aio-contact__icon" aria-hidden="true">
											<v-icon size="20">location_on</v-icon>
										</span>
										<div class="aio-contact__detail-body">
											<span class="aio-contact__label">{{ $t('publicPages.contact.address') }}</span>
											<p>{{ contactInfo.address }}</p>
										</div>
									</li>
								</ul>
							</div>
						</v-flex>

						<v-flex sm12 md12 lg7 xl7>
							<div class="aio-public-page__card aio-contact__form">
								<h2 class="aio-public-page__card-title">{{ $t('publicPages.contact.writeTitle') }}</h2>
								<v-form ref="form" v-model="valid" class="aio-contact__form-fields">
									<v-text-field
										type="text"
										:placeholder="$t('publicPages.contact.firstName')"
										:rules="inputRules.basictextRules"
										outlined
										dense
										hide-details="auto"
									></v-text-field>
									<v-text-field
										type="text"
										:placeholder="$t('publicPages.contact.lastName')"
										:rules="inputRules.basictextRules"
										outlined
										dense
										hide-details="auto"
									></v-text-field>
									<v-text-field
										type="email"
										:placeholder="$t('publicPages.contact.email')"
										:rules="emailRules"
										outlined
										dense
										hide-details="auto"
									></v-text-field>
									<v-text-field
										type="text"
										:placeholder="$t('publicPages.contact.subject')"
										:rules="inputRules.basictextRules"
										outlined
										dense
										hide-details="auto"
									></v-text-field>
									<v-textarea
										rows="4"
										:label="$t('publicPages.contact.message')"
										:rules="inputRules.basictextRules"
										outlined
										dense
										hide-details="auto"
									></v-textarea>
									<v-btn class="accent aio-contact__submit" large @click.stop.prevent="saveDetails">
										{{ $t('publicPages.contact.send') }}
									</v-btn>
								</v-form>
							</div>
						</v-flex>
					</v-layout>
				</template>
			</v-container>
		</div>
	</div>
</template>

<script>
import api from 'Api';

export default {
	data() {
		return {
			valid: false,
			contactInfo: {},
			isLoading: true,
			loadError: false,
		};
	},
	computed: {
		emailRules() {
			return [
				(v) => !!v || this.$t('publicPages.contact.emailRequired'),
				(v) => /.+@.+/.test(v) || this.$t('publicPages.contact.emailInvalid'),
			];
		},
		inputRules() {
			return {
				basictextRules: [(v) => !!v || this.$t('publicPages.contact.fieldRequired')],
			};
		},
		mapCenter() {
			const map = this.contactInfo.map;
			if (map && map.lat != null && map.lng != null) {
				return { lat: map.lat, lng: map.lng };
			}
			return null;
		},
		mapZoom() {
			return this.contactInfo.map?.zoom || 12;
		},
	},
	mounted() {
		this.getContactInfo();
	},
	methods: {
		getContactInfo() {
			this.isLoading = true;
			this.loadError = false;
			api.get('/api/public/contact')
				.then((response) => {
					this.contactInfo = response?.data?.data || {};
				})
				.catch(() => {
					this.loadError = true;
					this.contactInfo = {};
				})
				.finally(() => {
					this.isLoading = false;
				});
		},
		saveDetails() {
			this.$refs.form.validate();
		},
	},
};
</script>
