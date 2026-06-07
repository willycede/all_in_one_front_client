<template>
	<div class="emb-faq-wrap">
		<emb-page-title
			:heading="$t('publicPages.faq.title')"
			:subHeading="$t('publicPages.faq.subtitle')"
		></emb-page-title>
		<div class="emb-faq-content section-gap pb-0">
			<div class="container">
				<div class="faq">
					<div class="sec-title mb-12">
						<div class="layout align-start">
							<h2 class="mb-6">{{ $t('publicPages.faq.sectionTitle') }}</h2>
						</div>
						<p>{{ $t('publicPages.faq.sectionLead') }}</p>
					</div>
					<div class="section-gap pt-4">
						<v-expansion-panels>
							<v-expansion-panel
								v-for="(question, key) in faq"
								:key="key"
							>
								<v-expansion-panel-header>
									<h5 class="mb-0">{{ question.ques }}</h5>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									{{ question.ans }}
								</v-expansion-panel-content>
							</v-expansion-panel>
						</v-expansion-panels>
					</div>
				</div>
			</div>
			<div class="subscribe-block subscribe-bg section-gap text-center">
				<div class="container pt-0">
					<v-layout row warp align-center justify-center>
						<v-flex sm12 xl6 lg6 md6>
							<h2 class="font-bold white--text mb-6">{{ $t('publicPages.faq.ctaTitle') }}</h2>
							<h6 class="white--text mb-6">{{ $t('publicPages.faq.ctaHint') }}</h6>
							<v-btn class="accent" large to="/contact">
								{{ $t('publicPages.faq.ctaButton') }}
							</v-btn>
						</v-flex>
					</v-layout>
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
			faq: [],
		};
	},
	mounted() {
		this.getFaq();
	},
	methods: {
		getFaq() {
			api.get('/api/public/faq')
				.then((response) => {
					this.faq = (response?.data?.data && response.data.data.faqs) || [];
				})
				.catch(() => {
					this.faq = [];
				});
		},
	},
};
</script>
