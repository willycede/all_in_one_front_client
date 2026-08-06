<template>
	<div
		class="aio-shop-grid-wrap"
		:class="{
			'aio-shop-grid-wrap--refreshing': isRefreshing,
			'aio-shop-grid-wrap--initial': isInitialLoad && isLoading,
		}"
	>
		<div v-if="isInitialLoad && isLoading" class="aio-shop-grid aio-shop-grid--skeleton">
			<div v-for="n in skeletonCount" :key="'sk-' + n" class="aio-shop-skeleton">
				<div class="aio-shop-skeleton__media"></div>
				<div class="aio-shop-skeleton__body">
					<div class="aio-shop-skeleton__line aio-shop-skeleton__line--wide"></div>
					<div class="aio-shop-skeleton__line aio-shop-skeleton__line--narrow"></div>
				</div>
			</div>
		</div>

		<div v-else-if="!isLoading && !isRefreshing && (!productList || productList.length === 0)" class="aio-shop-grid__state">
			<span class="aio-shop-grid__state-icon">
				<v-icon size="32" color="#A96DFA">inventory_2</v-icon>
			</span>
			<h3>{{ $t('productsPage.noProducts') }}</h3>
			<p>{{ $t('productsPage.noProductsFiltered') }}</p>
		</div>

		<div v-else class="aio-shop-grid__content">
			<div v-if="isRefreshing || isPageLoading" class="aio-shop-grid__overlay" aria-hidden="true">
				<div class="aio-shop-grid__overlay-inner">
					<v-progress-circular indeterminate color="#A96DFA" size="28" width="2"></v-progress-circular>
					<span>{{ $t('productsPage.refreshing') }}</span>
				</div>
			</div>

			<transition-group name="aio-shop-item" tag="div" class="aio-shop-grid">
				<product-item
					v-for="product in productList"
					:key="product.id_products"
					:data="product"
				></product-item>
			</transition-group>

			<div v-if="pagination.total > 0" class="aio-account-orders__pagination-wrap">
				<div class="aio-account-orders__pagination-toolbar">
					<p class="aio-account-orders__pagination-info">
						{{ $t('productsPage.showingProducts', { start: rangeStart, end: rangeEnd, total: pagination.total }) }}
					</p>
					<div class="aio-account-orders__page-size">
						<span class="aio-account-orders__page-size-label">{{ $t('orders.perPage') }}</span>
						<button
							v-for="size in pageSizeOptions"
							:key="size"
							type="button"
							class="aio-account-orders__page-size-btn"
							:class="{ 'aio-account-orders__page-size-btn--active': pagination.limit === size }"
							:disabled="isLoading || isPageLoading || isRefreshing"
							:aria-pressed="pagination.limit === size"
							@click="changePageSize(size)"
						>
							{{ size }}
						</button>
					</div>
				</div>

				<nav
					v-if="pagination.totalPages > 1"
					class="aio-account-orders__pagination"
					:aria-label="$t('productsPage.catalogPagination')"
				>
					<button
						type="button"
						class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
						:disabled="!pagination.hasPrevPage || isPageLoading || isRefreshing"
						:aria-label="$t('orders.pagePrev')"
						@click="goToPage(pagination.page - 1)"
					>
						<v-icon size="20">chevron_left</v-icon>
					</button>

					<template v-for="(pageItem, index) in pageItems">
						<span
							v-if="pageItem === 'ellipsis'"
							:key="'ellipsis-' + index"
							class="aio-account-orders__page-ellipsis"
							aria-hidden="true"
						>…</span>
						<button
							v-else
							:key="'page-' + pageItem"
							type="button"
							class="aio-account-orders__page-btn"
							:class="{ 'aio-account-orders__page-btn--active': pageItem === pagination.page }"
							:disabled="isPageLoading || isRefreshing"
							:aria-current="pageItem === pagination.page ? 'page' : null"
							@click="goToPage(pageItem)"
						>
							{{ pageItem }}
						</button>
					</template>

					<button
						type="button"
						class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
						:disabled="!pagination.hasNextPage || isPageLoading || isRefreshing"
						:aria-label="$t('orders.pageNext')"
						@click="goToPage(pagination.page + 1)"
					>
						<v-icon size="20">chevron_right</v-icon>
					</button>
				</nav>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ProductItem from './ProductItem';
import {
	PRODUCT_DEFAULT_PAGE_SIZE,
	PRODUCT_PAGE_SIZE_OPTIONS,
	emptyProductPagination,
} from '../../store/modules/client/products/index';
import {
	buildCatalogQuery,
	parseCatalogQuery,
	catalogFiltersChanged,
	catalogQueryEquals,
} from '../../helpers/catalogQuery';

export default {
	components: {
		ProductItem,
	},
	data() {
		return {
			isLoading: true,
			isInitialLoad: true,
			isRefreshing: false,
			isPageLoading: false,
			ownRouteQuery: null,
			loadRequestId: 0,
			activeCategoryId: undefined,
			activeSubcategoryId: null,
			activeSearch: '',
			activeMinPrice: '',
			activeMaxPrice: '',
			activeCityId: null,
			activeSortBy: 'name_asc',
			pageSizeOptions: PRODUCT_PAGE_SIZE_OPTIONS,
		};
	},
	computed: {
		...mapGetters(['productList', 'productPagination']),
		pagination() {
			return this.productPagination || emptyProductPagination();
		},
		skeletonCount() {
			return this.parseLimit(this.$route.query.limit);
		},
		rangeStart() {
			if (!this.pagination.total) return 0;
			return (this.pagination.page - 1) * this.pagination.limit + 1;
		},
		rangeEnd() {
			return Math.min(this.pagination.page * this.pagination.limit, this.pagination.total);
		},
		pageItems() {
			const total = this.pagination.totalPages;
			const current = this.pagination.page;
			if (total <= 7) {
				return Array.from({ length: total }, (_, i) => i + 1);
			}

			const pages = new Set([1, total, current]);
			if (current > 1) pages.add(current - 1);
			if (current < total) pages.add(current + 1);
			if (current <= 3) {
				pages.add(2);
				pages.add(3);
			}
			if (current >= total - 2) {
				pages.add(total - 1);
				pages.add(total - 2);
			}

			const sorted = [...pages].sort((a, b) => a - b);
			const items = [];
			sorted.forEach((page, index) => {
				if (index > 0 && page - sorted[index - 1] > 1) {
					items.push('ellipsis');
				}
				items.push(page);
			});
			return items;
		},
	},
	watch: {
		'$route.query': {
			handler(newQuery, oldQuery) {
				if (!oldQuery || this.isOwnRouteQuery(newQuery)) return;

				const next = parseCatalogQuery(newQuery);
				const prev = parseCatalogQuery(oldQuery);
				const filtersChanged = catalogFiltersChanged(next, prev);
				const paginationChanged = String(next.page) !== String(prev.page)
					|| String(next.limit) !== String(prev.limit);

				if (!filtersChanged && !paginationChanged) return;

				this.syncActiveFilters(next);
				this.loadProducts({
					...next,
					categoryId: next.categoryId || undefined,
					page: filtersChanged ? 1 : next.page,
					limit: next.limit,
					silent: paginationChanged && !filtersChanged,
				});
			},
		},
	},
	async mounted() {
		const parsed = parseCatalogQuery(this.$route.query);
		this.syncActiveFilters(parsed);

		await this.syncRouteQuery(parsed.page, parsed.limit, parsed);
		await this.loadProducts({
			...parsed,
			categoryId: parsed.categoryId || undefined,
		});
	},
	methods: {
		...mapActions(['getProductsByCategoryIdAndFilters']),
		syncActiveFilters(filters) {
			this.activeCategoryId = filters.categoryId || undefined;
			this.activeSubcategoryId = filters.subcategoryId || null;
			this.activeSearch = filters.searchBy || '';
			this.activeMinPrice = filters.minPrice || '';
			this.activeMaxPrice = filters.maxPrice || '';
			this.activeCityId = filters.cityId || null;
			this.activeSortBy = filters.sortBy || 'name_asc';
		},
		parsePage(value) {
			const page = parseInt(value, 10);
			return Number.isFinite(page) && page > 0 ? page : 1;
		},
		parseLimit(value) {
			const limit = parseInt(value, 10);
			return PRODUCT_PAGE_SIZE_OPTIONS.includes(limit) ? limit : PRODUCT_DEFAULT_PAGE_SIZE;
		},
		buildRouteQuery(page, limit, filters = {}) {
			return buildCatalogQuery({
				categoryId: filters.categoryId !== undefined ? filters.categoryId : this.activeCategoryId,
				subcategoryId: filters.subcategoryId !== undefined ? filters.subcategoryId : this.activeSubcategoryId,
				searchBy: filters.searchBy !== undefined ? filters.searchBy : this.activeSearch,
				minPrice: filters.minPrice !== undefined ? filters.minPrice : this.activeMinPrice,
				maxPrice: filters.maxPrice !== undefined ? filters.maxPrice : this.activeMaxPrice,
				cityId: filters.cityId !== undefined ? filters.cityId : this.activeCityId,
				sortBy: filters.sortBy !== undefined ? filters.sortBy : this.activeSortBy,
				page: this.parsePage(page),
				limit: this.parseLimit(limit),
			});
		},
		// Solo se ignoran los cambios de ruta que este componente acaba de escribir;
		// un flag booleano descartaba también los clics del sidebar (filtro sin aplicar).
		isOwnRouteQuery(query) {
			return !!this.ownRouteQuery
				&& catalogQueryEquals(parseCatalogQuery(query), parseCatalogQuery(this.ownRouteQuery));
		},
		async syncRouteQuery(page, limit, filters = {}) {
			const nextQuery = this.buildRouteQuery(page, limit, filters);
			const current = parseCatalogQuery(this.$route.query);
			const nextParsed = parseCatalogQuery(nextQuery);

			if (catalogQueryEquals(current, nextParsed)) return;

			this.ownRouteQuery = nextQuery;
			await this.$router.replace({ path: '/products', query: nextQuery }).catch(() => {});
		},
		async loadProducts({
			categoryId,
			subcategoryId,
			searchBy,
			minPrice,
			maxPrice,
			cityId,
			sortBy,
			page = 1,
			limit,
			silent = false,
		} = {}) {
			const requestId = ++this.loadRequestId;
			const isFirstLoad = this.isInitialLoad;
			const requestPage = this.parsePage(page);
			const requestLimit = this.parseLimit(limit || this.pagination.limit);

			if (categoryId !== undefined) {
				this.activeCategoryId = categoryId || undefined;
			}
			if (subcategoryId !== undefined) {
				this.activeSubcategoryId = subcategoryId || null;
			}
			if (searchBy !== undefined) {
				this.activeSearch = searchBy || '';
			}
			if (minPrice !== undefined) {
				this.activeMinPrice = minPrice || '';
			}
			if (maxPrice !== undefined) {
				this.activeMaxPrice = maxPrice || '';
			}
			if (cityId !== undefined) {
				this.activeCityId = cityId || null;
			}
			if (sortBy !== undefined) {
				this.activeSortBy = sortBy || 'name_asc';
			}

			if (silent) {
				this.isPageLoading = true;
			} else if (!isFirstLoad) {
				this.isRefreshing = true;
			} else {
				this.isLoading = true;
			}

			try {
				await this.getProductsByCategoryIdAndFilters({
					categoryId: this.activeCategoryId,
					subcategoryId: this.activeSubcategoryId,
					searchBy: this.activeSearch,
					minPrice: this.activeMinPrice,
					maxPrice: this.activeMaxPrice,
					cityId: this.activeCityId,
					sortBy: this.activeSortBy,
					page: requestPage,
					limit: requestLimit,
				});
				if (requestId === this.loadRequestId) {
					await this.syncRouteQuery(requestPage, requestLimit);
				}
			} finally {
				if (requestId === this.loadRequestId) {
					this.isLoading = false;
					this.isRefreshing = false;
					this.isPageLoading = false;
					this.isInitialLoad = false;
					this.$emit('loaded');
				}
			}
		},
		async goToPage(page) {
			const nextPage = this.parsePage(page);
			if (nextPage === this.pagination.page) return;
			await this.loadProducts({
				page: nextPage,
				limit: this.pagination.limit,
				silent: true,
			});
			this.scrollToTop();
		},
		async changePageSize(limit) {
			const nextLimit = this.parseLimit(limit);
			if (nextLimit === this.pagination.limit) return;
			await this.loadProducts({
				page: 1,
				limit: nextLimit,
				silent: true,
			});
			this.scrollToTop();
		},
		scrollToTop() {
			const hero = document.querySelector('.aio-shop__body');
			if (hero) {
				hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		},
	},
};
</script>
