<template>
	<div class="shop-content-wrap">
		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>Cargando productos...</span>
		</div>

		<div v-else-if="!listData.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="grey">inventory_2</v-icon>
			<p>No hay productos para mostrar.</p>
		</div>

		<template v-else>
			<template v-if="gridListView">
				<v-row>
					<v-col
						v-for="product in listData"
						:key="product.id"
						cols="12"
						sm="6"
						md="4"
						lg="3"
					>
						<product-item :data="product" @deleteProduct="itemDeleted"></product-item>
					</v-col>
				</v-row>
			</template>
			<template v-else>
				<product-items-list-view :data="listData" @deleteProduct="itemDeleted"></product-items-list-view>
			</template>

			<div v-if="pagination.totalPages > 1" class="aio-account-orders__pagination-wrap">
				<p class="aio-account-orders__pagination-info">
					Página {{ pagination.page }} de {{ pagination.totalPages }}
				</p>
				<nav class="aio-account-orders__pagination" aria-label="Paginación admin productos">
					<button
						type="button"
						class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
						:disabled="!pagination.hasPrevPage || isLoading"
						@click="goToPage(pagination.page - 1)"
					>
						<v-icon size="20">chevron_left</v-icon>
					</button>
					<button
						type="button"
						class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
						:disabled="!pagination.hasNextPage || isLoading"
						@click="goToPage(pagination.page + 1)"
					>
						<v-icon size="20">chevron_right</v-icon>
					</button>
				</nav>
			</div>
		</template>
	</div>
</template>

<script>
import ProductItem from './ProductItem';
import ProductItemsListView from './ProductItemsListView.vue';
import api from 'Api';
import { emptyProductPagination } from '../../store/modules/client/products/index';

const PLACEHOLDER_IMAGE = '';

export default {
	props: {
		gridListView: {
			type: Boolean,
			default: true,
		},
		searchBy: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			isLoading: true,
			listData: [],
			pagination: emptyProductPagination(),
			activeSearch: '',
		};
	},
	mounted() {
		this.activeSearch = this.searchBy || '';
		this.fetchProducts();
	},
	methods: {
		mapProduct(product) {
			const firstImage = product.images && product.images.length ? product.images[0] : null;
			return {
				id: product.id_products,
				name: product.name,
				price: product.price,
				category: product.cod_products || 'Sin código',
				type: 'product',
				image: (firstImage && (firstImage.url || firstImage.image)) || PLACEHOLDER_IMAGE,
			};
		},
		itemDeleted(item) {
			const index = this.listData.indexOf(item);
			if (index !== -1) {
				this.listData.splice(index, 1);
			}
		},
		emitPagination() {
			this.$emit('pagination-change', { ...this.pagination });
		},
		async fetchProducts(page = 1) {
			this.isLoading = true;
			try {
				const response = await api.get('/api/products/undefined', {
					params: {
						searchBy: this.activeSearch || '',
						page,
						limit: 12,
					},
				});
				const payload = response?.data?.data;
				if (payload?.items) {
					this.listData = payload.items.map(this.mapProduct);
					this.pagination = { ...emptyProductPagination(), ...payload.pagination };
				} else {
					const list = Array.isArray(payload) ? payload : [];
					this.listData = list.map(this.mapProduct);
					this.pagination = {
						...emptyProductPagination(),
						total: list.length,
						totalPages: list.length ? 1 : 0,
					};
				}
				this.emitPagination();
			} catch (error) {
				console.error(error);
				this.listData = [];
				this.pagination = emptyProductPagination();
				this.emitPagination();
			} finally {
				this.isLoading = false;
			}
		},
		reload({ searchBy, page = 1 } = {}) {
			if (searchBy !== undefined) {
				this.activeSearch = searchBy;
			}
			return this.fetchProducts(page);
		},
		goToPage(page) {
			if (page < 1 || page > this.pagination.totalPages) return;
			this.fetchProducts(page);
		},
	},
	components: {
		ProductItem,
		ProductItemsListView,
	},
};
</script>
