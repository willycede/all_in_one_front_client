<template>
	<div class="aio-admin-products__list-table-wrap">
		<table class="aio-admin-table aio-admin-products__list-table">
			<thead>
				<tr>
					<th>{{ $t('adminProducts.list.tableImage') }}</th>
					<th>{{ $t('adminProducts.list.tableName') }}</th>
					<th>{{ $t('adminProducts.list.tableSku') }}</th>
					<th>{{ $t('adminProducts.list.tablePrice') }}</th>
					<th class="aio-admin-products__list-actions-col">{{ $t('adminProducts.list.tableActions') }}</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in data" :key="item.id">
					<td>
						<img :src="item.image" :alt="item.name" class="aio-admin-products__list-thumb">
					</td>
					<td>
						<span class="aio-admin-products__list-name">{{ item.name }}</span>
					</td>
					<td>{{ item.category }}</td>
					<td class="aio-admin-products__list-price">${{ formatPrice(item.price) }}</td>
					<td class="aio-admin-products__list-actions">
						<router-link :to="'/admin-panel/product-edit/' + item.id">
							<v-btn outlined small color="primary" class="aio-admin-products__list-action-btn">
								<v-icon left small>edit</v-icon>
								{{ $t('adminProducts.list.editProduct') }}
							</v-btn>
						</router-link>
						<v-btn
							icon
							small
							class="aio-admin-products__menu-btn"
							@click="deleteItem(item)"
						>
							<v-icon small color="error">delete</v-icon>
						</v-btn>
					</td>
				</tr>
			</tbody>
		</table>

		<emb-delete-confirmation-2
			ref="deleteConfirmationDialog"
			:messageTitle="$t('adminProducts.list.deleteTitle')"
			:messageDescription="$t('adminProducts.list.deleteDescription')"
			@onConfirm="ondeleteItemFromListView"
			:btn1="$t('common.cancel')"
			:btn2="$t('adminProducts.list.deleteConfirm')"
		></emb-delete-confirmation-2>
	</div>
</template>

<script>
export default {
	props: {
		data: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			selectedItem: null,
		};
	},
	methods: {
		formatPrice(value) {
			return (parseFloat(value) || 0).toLocaleString('es-EC', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		},
		deleteItem(data) {
			this.selectedItem = data;
			this.$refs.deleteConfirmationDialog.openDialog();
		},
		ondeleteItemFromListView() {
			this.$refs.deleteConfirmationDialog.close();
			this.$emit('deleteProduct', this.selectedItem);
		},
	},
};
</script>
