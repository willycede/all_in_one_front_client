<template>
	<article class="aio-admin-product-card">
		<div class="aio-admin-product-card__media">
			<img
				class="aio-admin-product-card__img"
				:alt="data.name"
				:src="data.image || placeholderImage"
			>

			<v-menu offset-y left>
				<template v-slot:activator="{ on, attrs }">
					<v-btn
						icon
						small
						class="aio-admin-product-card__menu-btn"
						v-bind="attrs"
						v-on="on"
					>
						<v-icon small>more_vert</v-icon>
					</v-btn>
				</template>
				<v-list dense>
					<v-list-item @click="deleteItem(data)">
						<v-list-item-icon class="mr-2">
							<v-icon small color="error">delete</v-icon>
						</v-list-item-icon>
						<v-list-item-title>{{ $t('adminProducts.list.deleteProduct') }}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>

			<router-link
				:to="'/admin-panel/product-edit/' + data.id"
				class="aio-admin-product-card__edit-btn"
				:aria-label="$t('adminProducts.list.editProduct')"
			>
				<v-icon small color="white">edit</v-icon>
			</router-link>
		</div>

		<div class="aio-admin-product-card__body">
			<h3 class="aio-admin-product-card__name">{{ data.name }}</h3>
			<div class="aio-admin-product-card__stock">
				<v-icon small class="aio-admin-product-card__stock-icon">layers</v-icon>
				<span>{{ data.stockCount }}</span>
			</div>
			<p class="aio-admin-product-card__price">${{ formattedPrice }}</p>
		</div>

		<emb-delete-confirmation-2
			ref="deleteConfirmationDialog"
			:messageTitle="$t('adminProducts.list.deleteTitle')"
			:messageDescription="$t('adminProducts.list.deleteDescription')"
			@onConfirm="onDeleteItemFromProductsList"
			:btn1="$t('common.cancel')"
			:btn2="$t('adminProducts.list.deleteConfirm')"
		></emb-delete-confirmation-2>
	</article>
</template>

<script>
export default {
	props: {
		data: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			selectedItem: null,
			placeholderImage: '/static/images/empty-cart.png',
		};
	},
	computed: {
		formattedPrice() {
			const value = parseFloat(this.data.price) || 0;
			return value.toLocaleString('es-EC', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		},
	},
	methods: {
		deleteItem(data) {
			this.selectedItem = data;
			this.$refs.deleteConfirmationDialog.openDialog();
		},
		onDeleteItemFromProductsList() {
			this.$refs.deleteConfirmationDialog.close();
			this.$emit('deleteProduct', this.selectedItem);
		},
	},
};
</script>
