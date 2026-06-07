<template>
	<div class="aio-admin-page">
		<div class="aio-admin-card pa-4 mb-4">
			<div class="aio-admin-page__header" style="margin-bottom: 1rem;">
				<div></div>
				<v-btn color="primary" depressed to="/admin-panel/product-add">
					Agregar producto
					<v-icon right>add</v-icon>
				</v-btn>
			</div>

			<div class="aio-admin-products__search-row">
				<v-text-field
					v-model="searchBy"
					label="Buscar por nombre"
					prepend-inner-icon="search"
					hide-details
					clearable
					outlined
					dense
					@keyup.enter="applySearch"
					@click:clear="clearSearch"
				></v-text-field>
				<v-btn color="primary" depressed @click="applySearch">Buscar</v-btn>
			</div>
		</div>

		<div class="aio-admin-products__meta">
			<span v-if="pagination.total !== null">
				{{ pagination.total }} {{ pagination.total === 1 ? 'producto' : 'productos' }}
			</span>
			<div class="aio-admin-products__view-toggle">
				<v-btn icon :color="gridView ? 'primary' : ''" @click="gridView = true">
					<v-icon>apps</v-icon>
				</v-btn>
				<v-btn icon :color="!gridView ? 'primary' : ''" @click="gridView = false">
					<v-icon>list</v-icon>
				</v-btn>
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

<style scoped>
.aio-admin-products__search-row {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: 0.75rem;
	align-items: center;
}

.aio-admin-products__meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 0 0 0.75rem;
	color: #6b6b78;
	font-size: 0.875rem;
}

.aio-admin-products__view-toggle {
	display: inline-flex;
	gap: 0.25rem;
}

@media (max-width: 599px) {
	.aio-admin-products__search-row {
		grid-template-columns: 1fr;
	}
}
</style>
