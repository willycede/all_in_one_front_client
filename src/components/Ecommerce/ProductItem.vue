<template>
	<article class="aio-shop-card product-item-wrap">
		<div class="aio-shop-card__media thumb-warp">
			<img
				class="aio-shop-card__img"
				:alt="name"
				:src="imageUrl"
				@click="goToDetail(data)"
			>
			<div class="aio-shop-card__hover">
				<div class="aio-shop-card__hover-actions">
					<button
						type="button"
						class="aio-shop-card__btn aio-shop-card__btn--ghost"
						:class="{ 'aio-shop-card__btn--fav-active': isInWishlist }"
						:aria-label="isInWishlist ? $t('productsPage.removeFromFavorites') : $t('productsPage.addToFavorites')"
						@click.stop="toggleWishlist(data)"
					>
						<v-icon size="20">{{ isInWishlist ? 'favorite' : 'favorite_border' }}</v-icon>
					</button>
					<button
						type="button"
						class="aio-shop-card__btn aio-shop-card__btn--ghost"
						:aria-label="$t('productsPage.viewProduct')"
						@click.stop="goToDetail(data)"
					>
						<v-icon size="20">visibility</v-icon>
					</button>
					<button
						v-if="ifItemExistInCart(data)"
						type="button"
						class="aio-shop-card__btn aio-shop-card__btn--primary"
						:aria-label="$t('productsPage.viewCart')"
						@click.stop="$router.push('/cart')"
					>
						<v-icon size="20" color="white">shopping_bag</v-icon>
					</button>
					<button
						v-else
						type="button"
						class="aio-shop-card__btn aio-shop-card__btn--primary"
						:aria-label="$t('productsPage.addToCart')"
						@click.stop="addProductToCart(data)"
					>
						<v-icon size="20" color="white">add_shopping_cart</v-icon>
					</button>
				</div>
			</div>
		</div>

		<div class="aio-shop-card__body emb-card-content">
			<h3 class="aio-shop-card__name" @click="goToDetail(data)">{{ name }}</h3>

			<span v-if="requiresDocuments" class="aio-shop-card__tag">
				<v-icon size="12">description</v-icon>
				{{ $t('productsPage.requiresDocuments') }}
			</span>

			<div class="aio-shop-card__footer emb-meta-info">
				<span class="aio-shop-card__price">{{ price }}</span>
				<button type="button" class="aio-shop-card__link" @click="goToDetail(data)">
					<v-icon size="16" color="white">arrow_forward</v-icon>
				</button>
			</div>
		</div>
	</article>
</template>

<script>
import { mapGetters } from 'vuex';
import { moneyMask } from '../../helpers/helpers';
import AppConfig from 'Constants/AppConfig';
import { isProductInWishlist } from 'Helpers/favorites';
import { isUserLoggedIn } from 'Helpers/auth';
import { isProductInCart } from 'Helpers/cart';

export default {
	props: ['data', 'colxs', 'colsm', 'colmd', 'collg', 'colxl'],
	computed: {
		...mapGetters(['cart', 'wishlist']),
		isInWishlist() {
			return isProductInWishlist(this.wishlist, this.data);
		},
		requiresDocuments() {
			return this.data
				&& this.data.required_documents
				&& this.data.required_documents.length > 0
				&& this.data.required_documents.trim() !== '';
		},
	},
	data() {
		return {
			name: '',
			price: 0,
			imageUrl: '',
		};
	},
	mounted() {
		this.name = this.data.name;
		this.price = moneyMask(this.data.price);
		this.imageUrl = this.data.images?.[0]?.url || '';
	},
	methods: {
		addProductToCart(item) {
			const img = item.images[0].url;
			const price = parseFloat(String(item.price).replace('$', ''));
			const quantity = (typeof item.quantity !== 'undefined' && item.quantity !== null) ? item.quantity : 1;

			if (typeof localStorage.id_users !== 'undefined' && localStorage.id_users !== null) {
				let requiredDocsArray = [];
				if (item.required_documents && item.required_documents.trim() !== '') {
					try {
						requiredDocsArray = JSON.parse(item.required_documents);
					} catch (e) {
						console.error('Error parsing required_documents:', e);
					}
				}

				const newProduct = {
					load_init: false,
					id_user: localStorage.id_users,
					url: img,
					id_details: 0,
					name: item.name,
					id_shopping_car: 0,
					id_product: item.id_products,
					details_quantity: quantity,
					details_price: price,
					details_discount: 0.00,
					details_subtotal: quantity * price,
					details_iva: (quantity * price) * AppConfig.porcentajeIVa,
					details_total: (quantity * price) + (quantity * price) * AppConfig.porcentajeIVa,
					status: 1,
					required_documents_array: requiredDocsArray,
					uploaded_documents: {},
				};

				let message = this.$t('productsPage.addedToCart');
				if (requiredDocsArray.length > 0) {
					message = this.$t('productsPage.addedToCartWithDocs');
				}

				this.$snotify.success(message, {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: requiredDocsArray.length > 0 ? 3000 : 1000,
					showProgressBar: false,
				});

				setTimeout(() => {
					this.$store.dispatch('addProductToCart', newProduct);
				}, 500);
			} else {
				this.$snotify.success(this.$t('productsPage.loginRequiredCart'), {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 4000,
					showProgressBar: false,
				});
			}
		},
		ifItemExistInCart(result) {
			return isProductInCart(this.cart, result);
		},
		toggleWishlist(item) {
			if (!isUserLoggedIn()) {
				this.$snotify.info(this.$t('productsPage.favoritesLogin'), {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 2500,
				});
				return;
			}

			if (this.isInWishlist) {
				const favoriteItem = this.wishlist.find(
					(w) => String(w.id_product || w.id) === String(item.id_products)
				);
				if (!favoriteItem) return;

				this.$store.dispatch('onDeleteProductFromWishlist', favoriteItem)
					.then(() => {
						this.$snotify.success(this.$t('productsPage.removedFromFavorites'), { timeout: 1500 });
					})
					.catch(() => {
						this.$snotify.error(this.$t('productsPage.removeFromFavoritesError'), { timeout: 2000 });
					});
				return;
			}

			this.$store.dispatch('addItemToWishlist', item)
				.then(() => {
					this.$snotify.success(this.$t('productsPage.addedToFavorites'), { timeout: 1500 });
				})
				.catch((error) => {
					const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
						|| (error.message === 'LOGIN_REQUIRED' ? this.$t('productsPage.favoritesLogin') : this.$t('productsPage.favoritesError'));

					if (message.includes('ya está en favoritos') || message.toLowerCase().includes('already in favorites')) {
						this.$store.dispatch('fetchWishlist');
						this.$snotify.info(this.$t('productsPage.alreadyInFavorites'), { timeout: 2000 });
						return;
					}

					this.$snotify.error(message, { timeout: 2500 });
				});
		},
		goToDetail(product) {
			this.$store.dispatch('setSelectedProduct', product);
			this.$router.push({ path: `/products/${product.id_products}` });
		},
	},
};
</script>
