<template>
	<div class="emb-termCondition-wrap">
		<emb-page-title
			:heading="$t('publicPages.terms.title')"
			:subHeading="$t('publicPages.terms.subtitle')"
		></emb-page-title>
		<div class="emb-tnc section-gap">
			<div class="container">
				<div class="tnc-content">
					<div v-for="(data, i) in tnc" :key="i" class="emb-card mb-12 pa-6">
						<h4 class="mb-4">{{ data.name }}</h4>
						<div v-html="data.content"></div>
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
			tnc: [],
		};
	},
	mounted() {
		this.getTerms();
	},
	methods: {
		getTerms() {
			api.get('term_condition.json')
				.then((response) => {
					this.tnc = response.data || [];
				})
				.catch(() => {
					this.tnc = [];
				});
		},
	},
};
</script>
