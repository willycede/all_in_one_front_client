<template>
	<div class="emb-contact-wrap">
		<emb-page-title
			:heading="$t('publicPages.contact.title')"
			:subHeading="$t('publicPages.contact.subtitle')"
		></emb-page-title>
		<div class="emb-contact-content">
			<div class="Contact-page">
				<div class="contact-map">
					<emb-google-map></emb-google-map>
				</div>
			</div>
			<div class="contact-info-wrapper">
				<v-container grid-list-xl py-0>
					<div class="section-gap">
						<v-layout row wrap>
							<v-flex sm12 md12 lg5 xl5>
								<div class="sec-title">
									<h2 class="v-layout justify-start align-center">{{ $t('publicPages.contact.infoTitle') }}</h2>
									<h5 v-if="contactInfo.info" class="font-italic mb-6">{{ contactInfo.info }}</h5>
								</div>
								<div v-if="contactInfo.call" class="mb-6">
									<h3>{{ $t('publicPages.contact.call') }}</h3>
									<a :href="`tel:${contactInfo.call}`" class="color-inherit">{{ contactInfo.call }}</a>
								</div>
								<div v-if="contactInfo.mail" class="mb-6">
									<h3>{{ $t('publicPages.contact.mail') }}</h3>
									<a :href="`mailto:${contactInfo.mail}`" class="color-inherit">{{ contactInfo.mail }}</a>
								</div>
								<div v-if="contactInfo.address" class="mb-6">
									<h3>{{ $t('publicPages.contact.address') }}</h3>
									<p>{{ contactInfo.address }}</p>
								</div>
							</v-flex>
							<v-flex sm12 md12 lg7 xl7>
								<div class="sec-title">
									<h2>{{ $t('publicPages.contact.writeTitle') }}</h2>
								</div>
								<v-form ref="form" v-model="valid">
									<v-text-field
										type="text"
										:placeholder="$t('publicPages.contact.firstName')"
										:rules="inputRules.basictextRules"
									></v-text-field>
									<v-text-field
										type="text"
										:placeholder="$t('publicPages.contact.lastName')"
										:rules="inputRules.basictextRules"
									></v-text-field>
									<v-text-field
										type="email"
										:placeholder="$t('publicPages.contact.email')"
										:rules="emailRules"
									></v-text-field>
									<v-text-field
										type="text"
										:placeholder="$t('publicPages.contact.subject')"
										:rules="inputRules.basictextRules"
									></v-text-field>
									<v-textarea
										rows="2"
										:label="$t('publicPages.contact.message')"
										:rules="inputRules.basictextRules"
									></v-textarea>
									<v-btn class="accent mx-0 mt-4" large @click.stop.prevent="saveDetails">
										{{ $t('publicPages.contact.send') }}
									</v-btn>
								</v-form>
							</v-flex>
						</v-layout>
					</div>
				</v-container>
			</div>
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
	},
	mounted() {
		this.getContactInfo();
	},
	methods: {
		getContactInfo() {
			api.get('contact.json')
				.then((response) => {
					this.contactInfo = response.data || {};
				})
				.catch(() => {
					this.contactInfo = {};
				});
		},
		saveDetails() {
			this.$refs.form.validate();
		},
	},
};
</script>
