<template>
	<aside class="aio-shop-sidebar">
		<div class="aio-shop-sidebar__panel">
			<h3 class="aio-shop-sidebar__title">Buscar</h3>
			<div class="aio-shop-sidebar__search" :class="{ 'aio-shop-sidebar__search--loading': isSearching }">
				<v-icon size="20" class="aio-shop-sidebar__search-icon">search</v-icon>
				<input
					v-model="searchBy"
					type="search"
					class="aio-shop-sidebar__search-input"
					placeholder="Nombre del producto..."
					aria-label="Buscar producto"
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
			<h3 class="aio-shop-sidebar__title">Categorías</h3>
			<div class="aio-shop-sidebar__categories">
				<button
					type="button"
					class="aio-shop-sidebar__cat"
					:class="{ 'aio-shop-sidebar__cat--active': !selectedCategory }"
					@click="selectCategory(null)"
				>
					<span>Todas</span>
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

		<button type="button" class="aio-shop-sidebar__clear" @click="clearFilters">
			<v-icon size="18">filter_alt_off</v-icon>
			Limpiar filtros
		</button>
	</aside>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
	data() {
		return {
			selectedCategory: null,
			searchBy: '',
			searchDebounce: null,
			isSearching: false,
			skipRouteSync: false,
		};
	},
	computed: mapGetters(['generalCategories']),
	watch: {
		'$route.query': {
			immediate: true,
			handler(query) {
				if (this.skipRouteSync) {
					this.skipRouteSync = false;
					return;
				}
				this.selectedCategory = query?.generalCategoryId
					? parseInt(query.generalCategoryId, 10)
					: null;
				this.searchBy = query?.searchBy || '';
			},
		},
	},
	async created() {
		await this.getGeneralCategories();
	},
	methods: {
		...mapActions(['getGeneralCategories']),
		currentFilters() {
			return {
				categoryId: this.selectedCategory,
				searchBy: this.searchBy.trim(),
			};
		},
		syncUrlSilently() {
			const url = new URL(window.location.href);
			url.pathname = '/products';
			url.search = '';

			if (this.selectedCategory) {
				url.searchParams.set('generalCategoryId', this.selectedCategory);
			}
			if (this.searchBy.trim()) {
				url.searchParams.set('searchBy', this.searchBy.trim());
			}

			window.history.replaceState(window.history.state, '', url.toString());
		},
		updateRoute() {
			const query = {};
			if (this.selectedCategory) {
				query.generalCategoryId = this.selectedCategory;
			}
			if (this.searchBy.trim()) {
				query.searchBy = this.searchBy.trim();
			}
			this.skipRouteSync = true;
			this.$router.replace({ path: '/products', query }).catch(() => {});
		},
		emitFilters() {
			this.$emit('apply-filters', this.currentFilters());
		},
		applyFilters({ syncRoute = false, silentUrl = false } = {}) {
			if (syncRoute) {
				this.updateRoute();
			} else if (silentUrl) {
				this.syncUrlSilently();
			}
			this.emitFilters();
		},
		onSearchInput() {
			clearTimeout(this.searchDebounce);
			this.isSearching = true;
			this.searchDebounce = setTimeout(() => {
				this.applyFilters({ silentUrl: true });
			}, 400);
		},
		onSearchComplete() {
			this.isSearching = false;
		},
		selectCategory(categoryId) {
			this.selectedCategory = categoryId;
			this.applyFilters({ syncRoute: true });
		},
		clearFilters() {
			this.selectedCategory = null;
			this.searchBy = '';
			this.isSearching = false;
			clearTimeout(this.searchDebounce);
			this.applyFilters({ syncRoute: true });
		},
	},
};
</script>
