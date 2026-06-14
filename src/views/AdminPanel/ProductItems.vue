<template>
	<div class="aio-admin-products__content">
		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>{{ $t('adminProducts.list.loading') }}</span>
		</div>

		<div v-else-if="!listData.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="#A96DFA">inventory_2</v-icon>
			<h3>{{ $t('adminProducts.list.empty') }}</h3>
			<p>{{ $t('adminProducts.list.emptyHint') }}</p>
		</div>

		<template v-else>
			<div v-if="gridListView" class="aio-admin-products__grid">
				<product-item
					v-for="product in listData"
					:key="product.id"
					:data="product"
					@deleteProduct="itemDeleted"
				></product-item>
			</div>
			<div v-else class="aio-admin-card pa-0 aio-admin-products__list-wrap">
				<product-items-list-view :data="listData" @deleteProduct="itemDeleted"></product-items-list-view>
			</div>

			<div v-if="pagination.totalPages > 1" class="aio-admin-products__pagination">
				<p>{{ $t('adminProducts.list.pageOf', { page: pagination.page, total: pagination.totalPages }) }}</p>
				<div class="aio-admin-products__pagination-controls">
					<v-btn
						icon
						small
						:disabled="!pagination.hasPrevPage || isLoading"
						@click="goToPage(pagination.page - 1)"
					>
						<v-icon>chevron_left</v-icon>
					</v-btn>
					<template v-for="(item, index) in paginationItems">
						<span
							v-if="item.type === 'ellipsis'"
							:key="`ellipsis-${index}`"
							class="aio-admin-products__page-ellipsis"
						>…</span>
						<v-btn
							v-else
							:key="`page-${item.value}`"
							small
							depressed
							class="aio-admin-products__page-btn"
							:class="{ 'aio-admin-products__page-btn--active': item.active }"
							@click="goToPage(item.value)"
						>
							{{ item.value }}
						</v-btn>
					</template>
					<v-btn
						icon
						small
						:disabled="!pagination.hasNextPage || isLoading"
						@click="goToPage(pagination.page + 1)"
					>
						<v-icon>chevron_right</v-icon>
					</v-btn>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import ProductItem from './ProductItem.vue';
import ProductItemsListView from './ProductItemsListView.vue';
import api from 'Api';
import { emptyProductPagination } from '../../store/modules/client/products/index';

const PLACEHOLDER_IMAGE = '/static/images/empty-cart.png';

export default {
	components: {
		ProductItem,
		ProductItemsListView,
	},
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
	computed: {
		paginationItems() {
			const current = this.pagination.page;
			const total = this.pagination.totalPages;
			if (total <= 1) return [];

			const items = [];
			const pushPage = (page) => {
				items.push({
					type: 'page',
					value: page,
					active: page === current,
				});
			};

			if (total <= 7) {
				for (let page = 1; page <= total; page += 1) pushPage(page);
				return items;
			}

			pushPage(1);
			if (current > 3) items.push({ type: 'ellipsis' });

			const start = Math.max(2, current - 1);
			const end = Math.min(total - 1, current + 1);
			for (let page = start; page <= end; page += 1) pushPage(page);

			if (current < total - 2) items.push({ type: 'ellipsis' });
			pushPage(total);
			return items;
		},
	},
	mounted() {
		this.activeSearch = this.searchBy || '';
		this.fetchProducts();
	},
	methods: {
		mapProduct(product) {
			const firstImage = product.images && product.images.length ? product.images[0] : null;
			const imageCount = product.images && product.images.length ? product.images.length : 1;
			return {
				id: product.id_products,
				name: product.name,
				price: product.price,
				category: product.cod_products || 'Sin código',
				type: 'product',
				image: (firstImage && (firstImage.url || firstImage.image)) || PLACEHOLDER_IMAGE,
				stockCount: imageCount,
			};
		},
		itemDeleted(item) {
			const index = this.listData.indexOf(item);
			if (index !== -1) {
				this.listData.splice(index, 1);
				this.pagination.total = Math.max(0, (this.pagination.total || 0) - 1);
				this.emitPagination();
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
};
</script>
