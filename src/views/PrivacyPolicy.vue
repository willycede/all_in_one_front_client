<template>
	<div class="aio-public-page aio-legal">
		<div class="aio-public-page__hero">
			<v-container>
				<div class="aio-public-page__hero-inner">
					<span class="aio-public-page__eyebrow">{{ $t('footer.privacyShort') }}</span>
					<h1 class="aio-public-page__title">{{ $t('publicPages.privacy.title') }}</h1>
					<p class="aio-public-page__subtitle">{{ $t('publicPages.privacy.subtitle') }}</p>
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

				<div v-else class="aio-legal__list">
					<article v-if="legalDocuments.length" class="aio-public-page__card aio-legal__docs">
						<h2 class="aio-legal__section-title">{{ $t('publicPages.privacy.officialDocsTitle') }}</h2>
						<p class="aio-legal__docs-lead">{{ $t('publicPages.privacy.officialDocsLead') }}</p>
						<ul class="aio-legal__doc-list">
							<li v-for="doc in legalDocuments" :key="doc.document_key + '-' + doc.version" class="aio-legal__doc-item">
								<div class="aio-legal__doc-icon" aria-hidden="true">
									<v-icon size="22">picture_as_pdf</v-icon>
								</div>
								<div class="aio-legal__doc-body">
									<a
										:href="buildPdfUrl(doc)"
										target="_blank"
										rel="noopener"
										class="aio-legal__doc-link"
									>{{ doc.title }}</a>
									<span v-if="doc.is_required" class="aio-legal__doc-badge">{{ $t('publicPages.privacy.requiredDoc') }}</span>
								</div>
								<a
									:href="buildPdfUrl(doc)"
									target="_blank"
									rel="noopener"
									class="aio-legal__doc-action"
								>
									{{ $t('publicPages.privacy.viewPdf') }}
									<v-icon size="16">open_in_new</v-icon>
								</a>
							</li>
						</ul>
					</article>

					<article
						v-for="(policy, key) in policylist"
						:key="key"
						class="aio-public-page__card aio-legal__section"
					>
						<h2 class="aio-legal__section-title">{{ policy.name }}</h2>
						<div class="aio-legal__prose" v-html="policy.content"></div>
					</article>
				</div>
			</v-container>
		</div>
	</div>
</template>

<script>
import api from 'Api';
import { buildApiFileUrl } from 'Helpers/apiUrls';

export default {
	data() {
		return {
			policylist: [],
			legalDocuments: [],
			isLoading: true,
			loadError: false,
		};
	},
	mounted() {
		this.loadPageData();
	},
	methods: {
		buildPdfUrl(doc) {
			return buildApiFileUrl(doc);
		},
		loadPageData() {
			this.isLoading = true;
			this.loadError = false;

			Promise.all([
				api.get('/api/public/privacy-policy'),
				api.get('/api/legal_documents/active'),
			])
				.then(([privacyRes, legalRes]) => {
					const payload = privacyRes?.data?.data || {};
					this.policylist = payload.sections || [];
					this.legalDocuments = legalRes?.data?.data || [];
				})
				.catch(() => {
					this.loadError = true;
					this.policylist = [];
					this.legalDocuments = [];
				})
				.finally(() => {
					this.isLoading = false;
				});
		},
	},
};
</script>
