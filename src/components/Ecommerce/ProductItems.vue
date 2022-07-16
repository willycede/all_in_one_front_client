<template>
	<div class="shop-content-wrap">
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
				generalCategoryId: undefined,
			}
		},
		
		methods: {
			...mapActions(['getProductsByCategoryIdAndFilters']),
		},
		mounted(){
			if(this.$route.query?.generalCategoryId) {
				this.generalCategoryId = this.$route.query.generalCategoryId;
				this.getProductsByCategoryIdAndFilters({categoryId: this.generalCategoryId});
			}
		},
		computed: mapGetters(['productList']),
		async created() {
			await this.getProductsByCategoryIdAndFilters({categoryId:this.generalCategoryId});
		}
	};
</script>