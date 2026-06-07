<template>
	<div class="aio-favorites-page">
		<div class="aio-favorites-page__hero">
			<v-container>
				<nav class="aio-favorites-page__breadcrumb" aria-label="Breadcrumb">
					<router-link to="/mainPage">{{ $t('nav.home') }}</router-link>
					<v-icon size="14">chevron_right</v-icon>
					<span>{{ $t('favorites.title') }}</span>
				</nav>
				<h1 class="aio-favorites-page__title">{{ $t('favorites.title') }}</h1>
				<p class="aio-favorites-page__subtitle">
					{{ $t('favorites.subtitle') }}
				</p>
			</v-container>
		</div>

		<div class="aio-favorites-page__body">
			<v-container>
				<div v-if="isLoading" class="aio-favorites-page__loading">
					<v-progress-circular indeterminate color="#A96DFA" size="40" width="3"></v-progress-circular>
					<p>{{ $t('favorites.loading') }}</p>
				</div>

				<div v-else-if="!wishlist.length" class="aio-favorites-page__empty">
					<div class="aio-favorites-page__empty-icon">
						<v-icon size="48">favorite_border</v-icon>
					</div>
					<h2>{{ $t('favorites.empty') }}</h2>
					<p>{{ $t('favorites.emptyHint') }}</p>
					<router-link to="/products" class="aio-favorites-page__btn">
						<v-icon size="18">storefront</v-icon>
						{{ $t('favorites.explore') }}
					</router-link>
				</div>

				<div v-else>
					<div class="aio-favorites-page__toolbar">
						<span>{{ wishlist.length }} {{ wishlist.length === 1 ? $t('productsPage.productSingular') : $t('productsPage.productPlural') }}</span>
						<button type="button" class="aio-favorites-page__btn aio-favorites-page__btn--ghost" @click="addAllToCart">
							<v-icon size="18">add_shopping_cart</v-icon>
							{{ $t('favorites.addAllToCart') }}
						</button>
					</div>

					<ul class="aio-favorites-page__list">
						<li v-for="item in wishlist" :key="item.id_favorite || item.id_product" class="aio-favorites-page__item">
							<router-link :to="`/products/${item.id_product || item.id}`" class="aio-favorites-page__thumb">
								<img :src="item.image" :alt="item.name">
							</router-link>
							<div class="aio-favorites-page__info">
								<router-link :to="`/products/${item.id_product || item.id}`" class="aio-favorites-page__name">
									{{ item.name }}
								</router-link>
								<p class="aio-favorites-page__price">
									<emb-currency-sign></emb-currency-sign>{{ formatPrice(item.price) }}
								</p>
							</div>
							<div class="aio-favorites-page__actions">
								<button type="button" class="aio-favorites-page__icon-btn" :title="$t('favorites.addToCart')" @click="addToCart(item)">
									<v-icon size="20">add_shopping_cart</v-icon>
								</button>
								<button type="button" class="aio-favorites-page__icon-btn aio-favorites-page__icon-btn--danger" :title="$t('favorites.remove')" @click="removeItem(item)">
									<v-icon size="20">close</v-icon>
								</button>
							</div>
						</li>
					</ul>
				</div>
			</v-container>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import AppConfig from 'Constants/AppConfig';

export default {
	data() {
		return {
			isLoading: true,
		};
	},
	computed: {
		...mapGetters(['wishlist']),
	},
	async mounted() {
		try {
			await this.$store.dispatch('fetchWishlist');
		} catch (error) {
			this.$snotify.error(this.$t('favorites.loadError'), { timeout: 2500 });
		} finally {
			this.isLoading = false;
		}
	},
	methods: {
		formatPrice(value) {
			return parseFloat(value || 0).toFixed(2);
		},
		addToCart(item) {
			const price = parseFloat(item.price) || 0;
			const subtotal = price;
			const iva = subtotal * AppConfig.porcentajeIVa;

			this.$store.dispatch('addProductToCart', {
				load_init: false,
				id_user: localStorage.getItem('id_users'),
				url: item.image,
				id_details: 0,
				name: item.name,
				id_shopping_car: localStorage.getItem('id_orden') || 0,
				id_product: item.id_product || item.id,
				details_quantity: 1,
				details_price: price,
				details_discount: 0,
				details_subtotal: subtotal,
				details_iva: iva,
				details_total: subtotal + iva,
				status: 1,
				required_documents_array: [],
				uploaded_documents: {},
			}).then(() => {
				this.$snotify.success(this.$t('productsPage.addedToCart'), { timeout: 1500 });
			});
		},
		addAllToCart() {
			this.$store.dispatch('addAllWishlistItemToCart')
				.then(() => {
					this.$snotify.success(this.$t('favorites.addAllSuccess'), { timeout: 2000 });
					this.$router.push('/cart');
				})
				.catch(() => {
					this.$snotify.error(this.$t('favorites.addAllError'), { timeout: 2500 });
				});
		},
		removeItem(item) {
			this.$store.dispatch('onDeleteProductFromWishlist', item)
				.then(() => {
					this.$snotify.success(this.$t('productsPage.removedFromFavorites'), { timeout: 1500 });
				});
		},
	},
};
</script>
