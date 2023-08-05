<template>
	<div>
		<div class="sec-title">
			<h2>Categorías</h2>
		</div>
		<div class="main">
			<emb-general-categories-banner :data="homeBannerV3Data"></emb-general-categories-banner>
			<emb-product-list
				secTitle="Algunos de nuestros productos"
			>
			</emb-product-list>
		</div>
	</div>
</template>
<script>
import homeBannerV3Data from "Assets/data/homeBannerV3Data";
// widgets
import ProductList from "../widgets/ProductList";
import GeneralCategoriesBanner from "../widgets/GeneralCategoriesBanner";


import { mapActions, mapGetters } from 'vuex';

export default {
  components: {
    embProductList: ProductList,
    embGeneralCategoriesBanner: GeneralCategoriesBanner,
  },
  data() {
    return {
      homeBannerV3Data,
    };
  },
  mounted() {
  },
  methods: {
	...mapActions(['getCompanies', 'getRandomProducts']),
  },
  computed: mapGetters(['companies', 'productList']),
  async created() {
    await this.getCompanies();
    await this.getRandomProducts();
  }
};
</script>