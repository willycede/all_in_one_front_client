<template>
	<div class="shop-content-wrap" v-if="!isLoading">
		<v-layout row>
				<v-flex xs12 sm12 md4 lg4 v-for="(product, key, index) in productList" :key="index">
					<product-item :data="product"></product-item>
				</v-flex>
		</v-layout>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
	import ProductItem from "./ProductItem";

	export default {
		components: {
			ProductItem
		},
		data(){
			return {
				isLoading: false,
				generalCategoryId: undefined,
			}
		},
		
		methods: {
			...mapActions(['getProductsByCategoryIdAndFilters']),
		},
		async mounted(){
			if(this.$route.query?.generalCategoryId) {
				this.generalCategoryId = this.$route.query.generalCategoryId;
			}
			await this.getProductsByCategoryIdAndFilters({categoryId: this.generalCategoryId});
		},
		updated(){
		},
		computed: mapGetters(['productList']),
	};
</script>