<template>
	<div class="aio-public-page aio-legal">
		<div class="aio-public-page__hero">
			<v-container>
				<div class="aio-public-page__hero-inner">
					<span class="aio-public-page__eyebrow">{{ $t('footer.termsShort') }}</span>
					<h1 class="aio-public-page__title">{{ $t('publicPages.terms.title') }}</h1>
					<p class="aio-public-page__subtitle">{{ $t('publicPages.terms.subtitle') }}</p>
				</div>
			</v-container>
		</div>

		<div class="aio-public-page__body">
			<v-container py-0>
				<div v-if="isLoading" class="aio-public-page__status">
					<v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
					<p>{{ $t('publicPages.loading') }}</p>
				</div>

				<div v-else-if="loadError" class="aio-public-page__status aio-public-page__status--error">
					<p>{{ $t('publicPages.loadError') }}</p>
				</div>

				<div v-else-if="!tnc.length" class="aio-public-page__status">
					<p>{{ $t('publicPages.empty') }}</p>
				</div>

				<div v-else class="aio-legal__list">
					<article
						v-for="(data, i) in tnc"
						:key="i"
						class="aio-public-page__card aio-legal__section"
					>
						<h2 class="aio-legal__section-title">{{ data.name }}</h2>
						<div class="aio-legal__prose" v-html="data.content"></div>
					</article>
				</div>
			</v-container>
		</div>
	</div>
</template>

<script>
import api from 'Api';

export default {
	data() {
		return {
			tnc: [],
			isLoading: true,
			loadError: false,
		};
	},
	mounted() {
		this.getTerms();
	},
	methods: {
		getTerms() {
			this.isLoading = true;
			this.loadError = false;
			api.get('/api/public/terms')
				.then((response) => {
					this.tnc = response?.data?.data || [];
				})
				.catch(() => {
					this.loadError = true;
					this.tnc = [];
				})
				.finally(() => {
					this.isLoading = false;
				});
		},
	},
};
</script>
