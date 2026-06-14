<template>
	<div class="aio-admin-page aio-admin-products">
		<AdminPageHeader>
			<template #actions>
				<v-btn
					depressed
					class="aio-admin-products__add-btn"
					to="/admin-panel/product-add"
				>
					{{ $t('adminProducts.list.addProduct') }}
					<v-icon right small>add</v-icon>
				</v-btn>
			</template>
		</AdminPageHeader>

		<div class="aio-admin-card aio-admin-products__toolbar-card">
			<div class="aio-admin-products__toolbar">
				<v-text-field
					v-model="searchBy"
					:placeholder="$t('adminProducts.list.searchPlaceholder')"
					prepend-inner-icon="search"
					hide-details
					clearable
					outlined
					dense
					class="aio-admin-products__search"
					@keyup.enter="applySearch"
					@click:clear="clearSearch"
				></v-text-field>
				<v-btn
					depressed
					class="aio-admin-products__search-btn"
					@click="applySearch"
				>
					<v-icon left small>search</v-icon>
					{{ $t('adminProducts.list.searchButton') }}
				</v-btn>
			</div>
		</div>

		<div class="aio-admin-products__meta">
			<span v-if="pagination.total !== null" class="aio-admin-products__count">
				{{ productCountLabel }}
			</span>
			<div class="aio-admin-products__view-toggle" role="group" :aria-label="$t('adminProducts.list.viewCards')">
				<button
					type="button"
					class="aio-admin-products__view-btn"
					:class="{ 'aio-admin-products__view-btn--active': gridView }"
					@click="gridView = true"
				>
					<v-icon small>apps</v-icon>
					<span>{{ $t('adminProducts.list.viewCards') }}</span>
				</button>
				<button
					type="button"
					class="aio-admin-products__view-btn"
					:class="{ 'aio-admin-products__view-btn--active': !gridView }"
					@click="gridView = false"
				>
					<v-icon small>view_list</v-icon>
					<span>{{ $t('adminProducts.list.viewList') }}</span>
				</button>
			</div>
		</div>

		<product-items
			ref="productItems"
			:grid-list-view="gridView"
			:search-by="searchBy"
			@pagination-change="onPaginationChange"
		></product-items>
	</div>
</template>

<script>
import ProductItems from './ProductItems.vue';

export default {
	components: {
		ProductItems,
	},
	data() {
		return {
			searchBy: '',
			gridView: true,
			pagination: { total: null },
		};
	},
	computed: {
		productCountLabel() {
			const total = this.pagination.total || 0;
			return total === 1
				? this.$t('adminProducts.list.productCount', { count: total })
				: this.$t('adminProducts.list.productCountPlural', { count: total });
		},
	},
	methods: {
		applySearch() {
			if (this.$refs.productItems) {
				this.$refs.productItems.reload({ searchBy: this.searchBy, page: 1 });
			}
		},
		clearSearch() {
			this.searchBy = '';
			this.applySearch();
		},
		onPaginationChange(pagination) {
			this.pagination = pagination;
		},
	},
};
</script>
