<template>
	<div>
		<v-menu
			transition="scale-transition"
			class="cart"
			content-class="aio-dropdown aio-cart-menu"
			min-width="360"
			max-width="380"
			offset-y
			nudge-bottom="10"
			light
		>
			<template v-slot:activator="{ on }">
				<button type="button" class="onsus-action-btn" v-on="on">
					<span class="onsus-action-btn__icon">
						<v-icon>shopping_cart</v-icon>
						<span v-if="cart.length > 0" class="onsus-action-btn__badge">{{ cart.length }}</span>
					</span>
					<span class="onsus-action-btn__label">{{ $t('nav.cart') }}</span>
				</button>
			</template>

			<div v-if="!cart.length" class="aio-cart-dropdown aio-cart-dropdown--empty">
				<div class="aio-cart-dropdown__empty-icon">
					<v-icon size="32">shopping_bag</v-icon>
				</div>
				<h3 class="aio-cart-dropdown__empty-title">Tu carrito está vacío</h3>
				<p class="aio-cart-dropdown__empty-text">
					Explora el catálogo y agrega productos para verlos aquí.
				</p>
				<router-link to="/products" class="aio-cart-dropdown__empty-btn">
					<v-icon size="18">storefront</v-icon>
					Explorar productos
				</router-link>
			</div>

			<div v-else class="aio-cart-dropdown">
				<div class="aio-cart-dropdown__header">
					<div>
						<span class="aio-cart-dropdown__eyebrow">Tu carrito</span>
						<h3 class="aio-cart-dropdown__title">
							{{ cart.length }}
							{{ cart.length === 1 ? 'producto' : 'productos' }}
						</h3>
					</div>
					<span class="aio-cart-dropdown__header-total">{{ formattedTotal }}</span>
				</div>

				<emb-perfect-scrollbar class="aio-cart-dropdown__scroll">
					<ul class="aio-cart-dropdown__list">
						<li
							v-for="(item, index) in cart"
							:key="item.id || index"
							class="aio-cart-dropdown__item"
						>
							<div class="aio-cart-dropdown__thumb">
								<img
									:src="item.url"
									:alt="item.name"
									@error="onImageError($event)"
								>
							</div>
							<div class="aio-cart-dropdown__body">
								<p class="aio-cart-dropdown__name">{{ item.name }}</p>
								<p v-if="item.modifier_name" class="aio-cart-dropdown__meta">
									{{ item.modifier_name }}
								</p>
								<p class="aio-cart-dropdown__meta">
									<span v-if="item.details_quantity > 1">{{ item.details_quantity }} × </span>
									<emb-currency-sign></emb-currency-sign>{{ formatPrice(item.details_price) }}
								</p>
							</div>
							<div class="aio-cart-dropdown__side">
								<span class="aio-cart-dropdown__line-total">
									<emb-currency-sign></emb-currency-sign>{{ lineTotal(item) }}
								</span>
								<button
									type="button"
									class="aio-cart-dropdown__remove"
									title="Quitar del carrito"
									@click="deleteProductFromCart(item)"
								>
									<v-icon size="18">close</v-icon>
								</button>
							</div>
						</li>
					</ul>
				</emb-perfect-scrollbar>

				<div class="aio-cart-dropdown__footer">
					<div class="aio-cart-dropdown__subtotal">
						<span>Subtotal</span>
						<strong>{{ formattedTotal }}</strong>
					</div>
					<router-link to="/cart" class="aio-cart-dropdown__checkout-btn">
						Ver carrito
						<v-icon size="18">arrow_forward</v-icon>
					</router-link>
				</div>

				<emb-delete-confirmation
					ref="deleteConfirmationDialog"
					message="¿Desea eliminar el producto?"
					@onConfirm="onDeleteProductFromCart"
				></emb-delete-confirmation>
			</div>
		</v-menu>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

export default {
	components: {
		embPerfectScrollbar: VuePerfectScrollbar,
	},
	data() {
		return {
			selectDeletedProduct: null,
		};
	},
	computed: {
		...mapGetters(['cart']),
		cartTotal() {
			return this.cart.reduce((sum, item) => {
				const qty = item.details_quantity || 1;
				const price = parseFloat(item.details_price) || 0;
				return sum + price * qty;
			}, 0);
		},
		formattedTotal() {
			return `$ ${this.cartTotal.toFixed(2)}`;
		},
	},
	async mounted() {
		if (!localStorage.id_users) {
			this.$store.dispatch('addSetToCart', []);
			return;
		}

		try {
			await this.$store.dispatch('syncActiveCart');
		} catch (error) {
			this.$store.dispatch('addSetToCart', []);
		}
	},
	methods: {
		formatPrice(value) {
			return parseFloat(value || 0).toFixed(2);
		},
		lineTotal(item) {
			const qty = item.details_quantity || 1;
			const price = parseFloat(item.details_price) || 0;
			return (price * qty).toFixed(2);
		},
		onImageError(event) {
			event.target.classList.add('aio-cart-dropdown__thumb-img--error');
		},
		deleteProductFromCart(product) {
			this.selectDeletedProduct = product;
			this.$refs.deleteConfirmationDialog.openDialog();
		},
		onDeleteProductFromCart() {
			this.$refs.deleteConfirmationDialog.close();
			const product = this.selectDeletedProduct;
			this.$store.dispatch('onDeleteProductFromCart', product)
				.then(() => {
					this.$snotify.success('Producto eliminado del carrito', {
						closeOnClick: false,
						pauseOnHover: false,
						timeout: 1500,
					});
				})
				.catch(() => {
					this.$snotify.error('No se pudo eliminar el producto. Intenta de nuevo.', {
						closeOnClick: false,
						pauseOnHover: false,
						timeout: 2500,
					});
				});
		},
	},
};
</script>
