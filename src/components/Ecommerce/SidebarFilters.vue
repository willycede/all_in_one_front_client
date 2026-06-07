<template>
	<aside class="aio-shop-sidebar">
		<div class="aio-shop-sidebar__panel">
			<h3 class="aio-shop-sidebar__title">{{ $t('productsPage.searchTitle') }}</h3>
			<div class="aio-shop-sidebar__search" :class="{ 'aio-shop-sidebar__search--loading': isSearching }">
				<v-icon size="20" class="aio-shop-sidebar__search-icon">search</v-icon>
				<input
					v-model="searchBy"
					type="search"
					class="aio-shop-sidebar__search-input"
					:placeholder="$t('productsPage.searchProductPlaceholder')"
					:aria-label="$t('productsPage.searchProductAria')"
					@input="onSearchInput"
				>
				<v-progress-circular
					v-if="isSearching"
					indeterminate
					color="#A96DFA"
					size="16"
					width="2"
					class="aio-shop-sidebar__search-spinner"
				></v-progress-circular>
			</div>
		</div>

		<div class="aio-shop-sidebar__panel">
			<h3 class="aio-shop-sidebar__title">{{ $t('productsPage.categories') }}</h3>
			<div class="aio-shop-sidebar__categories">
				<button
					type="button"
					class="aio-shop-sidebar__cat"
					:class="{ 'aio-shop-sidebar__cat--active': !selectedCategory }"
					@click="selectCategory(null)"
				>
					<span>{{ $t('productsPage.allCategories') }}</span>
					<v-icon v-if="!selectedCategory" size="16">check</v-icon>
				</button>
				<button
					v-for="category in generalCategories"
					:key="category.idgeneral_categories"
					type="button"
					class="aio-shop-sidebar__cat"
					:class="{ 'aio-shop-sidebar__cat--active': selectedCategory === category.idgeneral_categories }"
					@click="selectCategory(category.idgeneral_categories)"
				>
					<span>{{ category.name }}</span>
					<v-icon
						v-if="selectedCategory === category.idgeneral_categories"
						size="16"
					>check</v-icon>
				</button>
			</div>
		</div>

		<div class="aio-shop-sidebar__panel">
			<h3 class="aio-shop-sidebar__title">{{ $t('productsPage.priceFilter') }}</h3>
			<div class="aio-shop-sidebar__price-row">
				<input
					v-model="minPrice"
					type="number"
					min="0"
					step="0.01"
					class="aio-shop-sidebar__price-input"
					:placeholder="$t('productsPage.priceMinPlaceholder')"
					:aria-label="$t('productsPage.priceMinAria')"
				>
				<span class="aio-shop-sidebar__price-sep">—</span>
				<input
					v-model="maxPrice"
					type="number"
					min="0"
					step="0.01"
					class="aio-shop-sidebar__price-input"
					:placeholder="$t('productsPage.priceMaxPlaceholder')"
					:aria-label="$t('productsPage.priceMaxAria')"
				>
			</div>
			<button type="button" class="aio-shop-sidebar__apply-btn" @click="applyPriceFilter">
				{{ $t('productsPage.applyPrice') }}
			</button>
		</div>

		<div class="aio-shop-sidebar__panel">
			<h3 class="aio-shop-sidebar__title">{{ $t('productsPage.city') }}</h3>
			<select
				v-model="selectedCityId"
				class="aio-shop-sidebar__select"
				:aria-label="$t('productsPage.filterByCity')"
				@change="applyFilters({ syncRoute: true })"
			>
				<option value="">{{ $t('productsPage.allCities') }}</option>
				<option
					v-for="city in catalogCities"
					:key="city.id_city"
					:value="city.id_city"
				>
					{{ city.name }}
				</option>
			</select>
		</div>

		<div class="aio-shop-sidebar__panel">
			<h3 class="aio-shop-sidebar__title">{{ $t('productsPage.sortFilter') }}</h3>
			<select
				v-model="sortBy"
				class="aio-shop-sidebar__select"
				:aria-label="$t('productsPage.sortProductsAria')"
				@change="applyFilters({ syncRoute: true })"
			>
				<option
					v-for="option in translatedSortOptions"
					:key="option.value"
					:value="option.value"
				>
					{{ option.label }}
				</option>
			</select>
		</div>

		<button type="button" class="aio-shop-sidebar__clear" @click="clearFilters">
			<v-icon size="18">filter_alt_off</v-icon>
			{{ $t('productsPage.clearFilters') }}
		</button>
	</aside>
</template>

<script>
import api from 'Api';
import { mapActions, mapGetters } from 'vuex';
import {
	buildCatalogQuery,
	parseCatalogQuery,
	CATALOG_SORT_OPTIONS,
	DEFAULT_CATALOG_SORT,
} from 'Helpers/catalogQuery';

const SORT_LABEL_KEYS = {
	name_asc: 'productsPage.sortNameAsc',
	name_desc: 'productsPage.sortNameDesc',
	price_asc: 'productsPage.sortPriceAsc',
	price_desc: 'productsPage.sortPriceDesc',
};

export default {
	data() {
		return {
			selectedCategory: null,
			searchBy: '',
			minPrice: '',
			maxPrice: '',
			selectedCityId: '',
			sortBy: DEFAULT_CATALOG_SORT,
			catalogCities: [],
			searchDebounce: null,
			isSearching: false,
			skipRouteSync: false,
		};
	},
	computed: {
		...mapGetters(['generalCategories']),
		translatedSortOptions() {
			return CATALOG_SORT_OPTIONS.map((option) => ({
				value: option.value,
				label: this.$t(SORT_LABEL_KEYS[option.value] || option.label),
			}));
		},
	},
	watch: {
		'$route.query': {
			immediate: true,
			handler(query) {
				if (this.skipRouteSync) {
					this.skipRouteSync = false;
					return;
				}
				const parsed = parseCatalogQuery(query);
				this.selectedCategory = parsed.categoryId;
				this.searchBy = parsed.searchBy;
				this.minPrice = parsed.minPrice;
				this.maxPrice = parsed.maxPrice;
				this.selectedCityId = parsed.cityId ? String(parsed.cityId) : '';
				this.sortBy = parsed.sortBy;
			},
		},
	},
	async created() {
		await Promise.all([
			this.getGeneralCategories(),
			this.loadCatalogCities(),
		]);
	},
	methods: {
		...mapActions(['getGeneralCategories']),
		async loadCatalogCities() {
			try {
				const response = await api.get('/api/cities/catalog');
				this.catalogCities = response?.data?.data || [];
			} catch (error) {
				this.catalogCities = [];
			}
		},
		currentFilters() {
			return {
				categoryId: this.selectedCategory,
				searchBy: this.searchBy.trim(),
				minPrice: this.minPrice,
				maxPrice: this.maxPrice,
				cityId: this.selectedCityId || null,
				sortBy: this.sortBy,
			};
		},
		updateRoute() {
			const query = buildCatalogQuery({
				...this.currentFilters(),
				page: 1,
				limit: this.$route.query.limit || 12,
			});
			this.skipRouteSync = true;
			this.$router.replace({ path: '/products', query }).catch(() => {});
		},
		emitFilters() {
			this.$emit('apply-filters', this.currentFilters());
		},
		applyFilters({ syncRoute = false } = {}) {
			if (syncRoute) {
				this.updateRoute();
			}
			this.emitFilters();
		},
		onSearchInput() {
			clearTimeout(this.searchDebounce);
			this.isSearching = true;
			this.searchDebounce = setTimeout(() => {
				this.applyFilters({ syncRoute: true });
			}, 400);
		},
		onSearchComplete() {
			this.isSearching = false;
		},
		selectCategory(categoryId) {
			this.selectedCategory = categoryId;
			this.applyFilters({ syncRoute: true });
		},
		applyPriceFilter() {
			this.applyFilters({ syncRoute: true });
		},
		clearFilters() {
			this.selectedCategory = null;
			this.searchBy = '';
			this.minPrice = '';
			this.maxPrice = '';
			this.selectedCityId = '';
			this.sortBy = DEFAULT_CATALOG_SORT;
			this.isSearching = false;
			clearTimeout(this.searchDebounce);
			this.applyFilters({ syncRoute: true });
		},
	},
};
</script>
