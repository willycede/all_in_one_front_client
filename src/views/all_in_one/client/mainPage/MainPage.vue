<template>
	<div>
		<v-container class="py-0">
			<emb-general-categories-banner></emb-general-categories-banner>
		</v-container>

		<div class="onsus-features">
			<v-container>
				<div class="onsus-features__grid">
					<div v-for="(feature, index) in features" :key="index" class="onsus-features__item">
						<div class="onsus-features__icon">
							<v-icon>{{ feature.icon }}</v-icon>
						</div>
						<div>
							<p class="onsus-features__title">{{ feature.title }}</p>
							<p class="onsus-features__desc">{{ feature.desc }}</p>
						</div>
					</div>
				</div>
			</v-container>
		</div>

		<div class="aio-page-section">
			<v-container>
				<emb-product-list :sec-title="$t('homePage.featuredTitle')"></emb-product-list>
			</v-container>
		</div>
	</div>
</template>

<script>
import ProductList from '../widgets/ProductList';
import GeneralCategoriesBanner from '../widgets/GeneralCategoriesBanner';
import { mapActions } from 'vuex';

export default {
	components: {
		embProductList: ProductList,
		embGeneralCategoriesBanner: GeneralCategoriesBanner,
	},
	computed: {
		features() {
			return [
				{ icon: 'local_shipping', title: this.$t('homePage.featureShipping'), desc: this.$t('homePage.featureShippingDesc') },
				{ icon: 'support_agent', title: this.$t('homePage.featureSupport'), desc: this.$t('homePage.featureSupportDesc') },
				{ icon: 'payment', title: this.$t('homePage.featurePayments'), desc: this.$t('homePage.featurePaymentsDesc') },
				{ icon: 'verified_user', title: this.$t('homePage.featureTrust'), desc: this.$t('homePage.featureTrustDesc') },
			];
		},
	},
	async created() {
		if (this.$route.query.denied === 'admin') {
			this.$snotify.warning(this.$t('homePage.adminDenied'), { timeout: 4000 });
		}
		await this.getCompanies();
		await this.getRandomProducts();
	},
	methods: {
		...mapActions(['getCompanies', 'getRandomProducts']),
	},
};
</script>
