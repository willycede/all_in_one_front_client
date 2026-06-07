<template>
	<div class="aio-shop">
		<div class="aio-shop__hero">
			<v-container>
				<div class="aio-shop__hero-inner">
					<div>
						<span class="aio-shop__eyebrow">Catálogo</span>
						<h1 class="aio-shop__title">{{ pageTitle }}</h1>
						<p class="aio-shop__subtitle">{{ pageSubtitle }}</p>
					</div>
					<div v-if="productCount !== null" class="aio-shop__count">
						<span class="aio-shop__count-num">{{ productCount }}</span>
						<span class="aio-shop__count-label">{{ productCount === 1 ? 'producto' : 'productos' }}</span>
					</div>
				</div>
			</v-container>
		</div>

		<div class="aio-shop__body section-gap">
			<v-container grid-list-xl py-0>
				<v-layout row wrap>
					<v-flex xs12 sm12 md4 lg3 xl3>
						<emb-sidebar-filters
							ref="sidebarFilters"
							@apply-filters="onApplyFilters"
						></emb-sidebar-filters>
					</v-flex>
					<v-flex xs12 sm12 md8 lg9 xl9>
						<product-items
							ref="productItems"
							@loaded="onProductsLoaded"
						></product-items>
					</v-flex>
				</v-layout>
			</v-container>
		</div>
	</div>
</template>

<script>
import ProductItems from 'Components/Ecommerce/ProductItems';
import SidebarFilters from 'Components/Ecommerce/SidebarFilters';
import { mapGetters } from 'vuex';

export default {
	components: {
		embSidebarFilters: SidebarFilters,
		ProductItems,
	},
	data() {
		return {
			activeCategoryId: null,
			activeSearch: '',
		};
	},
	computed: {
		...mapGetters(['generalCategories', 'productPagination']),
		pageTitle() {
			if (this.activeCategoryId && this.generalCategories?.length) {
				const match = this.generalCategories.find(
					(c) => String(c.idgeneral_categories) === String(this.activeCategoryId)
				);
				if (match) return match.name;
			}
			return 'Todos los productos';
		},
		pageSubtitle() {
			const parts = [];
			if (this.activeSearch) {
				parts.push(`"${this.activeSearch}"`);
			}
			if (this.activeCategoryId && this.generalCategories?.length) {
				const match = this.generalCategories.find(
					(c) => String(c.idgeneral_categories) === String(this.activeCategoryId)
				);
				if (match) parts.push(match.name);
			}
			if (parts.length) {
				return `Resultados para ${parts.join(' · ')}`;
			}
			if (this.activeCategoryId) {
				return 'Explora los productos de esta categoría';
			}
			return 'Encuentra lo que necesitas en nuestro marketplace';
		},
		productCount() {
			if (!this.productPagination) return null;
			return this.productPagination.total;
		},
	},
	watch: {
		'$route.query': {
			immediate: true,
			handler(query) {
				this.activeCategoryId = query?.generalCategoryId || null;
				this.activeSearch = query?.searchBy || '';
			},
		},
	},
	methods: {
		onApplyFilters({ categoryId, searchBy }) {
			this.activeCategoryId = categoryId || null;
			this.activeSearch = searchBy || '';
		},
		onProductsLoaded() {
			if (this.$refs.sidebarFilters) {
				this.$refs.sidebarFilters.onSearchComplete();
			}
		},
	},
};
</script>
