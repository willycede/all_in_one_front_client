<template>
	<div class="emb-privacy-policy-wrap">
		<emb-page-title
			:heading="$t('publicPages.privacy.title')"
			:subHeading="$t('publicPages.privacy.subtitle')"
		></emb-page-title>
		<div class="section-gap bg-white">
			<div class="container">
				<div class="privacy-page">
					<div
						v-for="(policy, key) in policylist"
						:key="key"
						class="emb-card mb-12 pa-6"
					>
						<h4 class="mb-4">{{ policy.name }}</h4>
						<div v-html="policy.content"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import api from 'Api';

export default {
	data() {
		return {
			policylist: [],
		};
	},
	mounted() {
		this.getPrivacyPolicyData();
	},
	methods: {
		getPrivacyPolicyData() {
			api.get('privacy_policy.json')
				.then((response) => {
					this.policylist = response.data || [];
				})
				.catch(() => {
					this.policylist = [];
				});
		},
	},
};
</script>
