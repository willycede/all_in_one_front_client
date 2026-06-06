<template>
	<div
		class="aio-shop-grid-wrap"
		:class="{
			'aio-shop-grid-wrap--refreshing': isRefreshing,
			'aio-shop-grid-wrap--initial': isInitialLoad && isLoading,
		}"
	>
		<!-- Carga inicial: skeletons -->
		<div v-if="isInitialLoad && isLoading" class="aio-shop-grid aio-shop-grid--skeleton">
			<div v-for="n in 6" :key="'sk-' + n" class="aio-shop-skeleton">
				<div class="aio-shop-skeleton__media"></div>
				<div class="aio-shop-skeleton__body">
					<div class="aio-shop-skeleton__line aio-shop-skeleton__line--wide"></div>
					<div class="aio-shop-skeleton__line aio-shop-skeleton__line--narrow"></div>
				</div>
			</div>
		</div>

		<!-- Sin resultados (solo cuando ya terminó de cargar) -->
		<div v-else-if="!isLoading && !isRefreshing && (!productList || productList.length === 0)" class="aio-shop-grid__state">
			<span class="aio-shop-grid__state-icon">
				<v-icon size="32" color="#A96DFA">inventory_2</v-icon>
			</span>
			<h3>Sin productos</h3>
			<p>No encontramos productos con los filtros seleccionados.</p>
		</div>

		<!-- Grid con productos -->
		<div v-else class="aio-shop-grid__content">
			<div v-if="isRefreshing" class="aio-shop-grid__overlay" aria-hidden="true">
				<div class="aio-shop-grid__overlay-inner">
					<v-progress-circular indeterminate color="#A96DFA" size="28" width="2"></v-progress-circular>
					<span>Actualizando...</span>
				</div>
			</div>

			<transition-group name="aio-shop-item" tag="div" class="aio-shop-grid">
				<product-item
					v-for="product in productList"
					:key="product.id_products"
					:data="product"
				></product-item>
			</transition-group>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ProductItem from './ProductItem';

export default {
	components: {
		ProductItem,
	},
	data() {
		return {
			isLoading: true,
			isInitialLoad: true,
			isRefreshing: false,
			loadRequestId: 0,
		};
	},
	computed: mapGetters(['productList']),
	async mounted() {
		const categoryId = this.$route.query?.generalCategoryId || undefined;
		const searchBy = this.$route.query?.searchBy || '';
		await this.loadProducts({ categoryId, searchBy });
	},
	methods: {
		...mapActions(['getProductsByCategoryIdAndFilters']),
		async loadProducts({ categoryId, searchBy } = {}) {
			const requestId = ++this.loadRequestId;
			const isFirstLoad = this.isInitialLoad;

			if (!isFirstLoad) {
				this.isRefreshing = true;
			} else {
				this.isLoading = true;
			}

			try {
				await this.getProductsByCategoryIdAndFilters({
					categoryId: categoryId || undefined,
					searchBy: searchBy || '',
				});
			} finally {
				if (requestId === this.loadRequestId) {
					this.isLoading = false;
					this.isRefreshing = false;
					this.isInitialLoad = false;
					this.$emit('loaded');
				}
			}
		},
	},
};
</script>
