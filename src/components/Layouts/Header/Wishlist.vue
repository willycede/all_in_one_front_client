<template>
	<div>
		<v-menu
			transition="scale-transition"
			class="wishlit-menu-wrap"
			content-class="aio-dropdown aio-favorites-menu"
			min-width="360"
			max-width="380"
			offset-y
			nudge-bottom="10"
			light
			@input="onMenuToggle"
		>
			<template v-slot:activator="{ on }">
				<button type="button" class="onsus-action-btn" v-on="on">
					<span class="onsus-action-btn__icon">
						<v-icon>favorite_border</v-icon>
						<span v-if="wishlist.length > 0" class="onsus-action-btn__badge">{{ wishlist.length }}</span>
					</span>
					<span class="onsus-action-btn__label">Favoritos</span>
				</button>
			</template>

			<div v-if="!wishlist.length" class="aio-favorites-dropdown aio-favorites-dropdown--empty">
				<div class="aio-favorites-dropdown__empty-icon">
					<v-icon size="32">favorite_border</v-icon>
				</div>
				<h3 class="aio-favorites-dropdown__empty-title">Sin favoritos aún</h3>
				<p class="aio-favorites-dropdown__empty-text">
					Guarda productos que te interesen para encontrarlos fácilmente después.
				</p>
				<router-link to="/products" class="aio-favorites-dropdown__empty-btn">
					<v-icon size="18">storefront</v-icon>
					Explorar productos
				</router-link>
			</div>

			<div v-else class="aio-favorites-dropdown">
				<div class="aio-favorites-dropdown__header">
					<div>
						<span class="aio-favorites-dropdown__eyebrow">Mis favoritos</span>
						<h3 class="aio-favorites-dropdown__title">
							{{ wishlist.length }}
							{{ wishlist.length === 1 ? 'producto' : 'productos' }}
						</h3>
					</div>
				</div>

				<emb-perfect-scrollbar class="aio-favorites-dropdown__scroll">
					<ul class="aio-favorites-dropdown__list">
						<li
							v-for="item in wishlist"
							:key="item.id_favorite || item.id_product"
							class="aio-favorites-dropdown__item"
						>
							<router-link
								:to="`/products/${item.id_product || item.id}`"
								class="aio-favorites-dropdown__thumb"
							>
								<img :src="item.image" :alt="item.name" @error="onImageError($event)">
							</router-link>
							<div class="aio-favorites-dropdown__body">
								<router-link
									:to="`/products/${item.id_product || item.id}`"
									class="aio-favorites-dropdown__name"
								>
									{{ item.name }}
								</router-link>
								<p class="aio-favorites-dropdown__price">
									<emb-currency-sign></emb-currency-sign>{{ formatPrice(item.price) }}
								</p>
							</div>
							<div class="aio-favorites-dropdown__side">
								<button
									type="button"
									class="aio-favorites-dropdown__remove"
									title="Quitar de favoritos"
									@click="deleteProductFromWishlist(item)"
								>
									<v-icon size="18">close</v-icon>
								</button>
							</div>
						</li>
					</ul>
				</emb-perfect-scrollbar>

				<div class="aio-favorites-dropdown__footer">
					<router-link to="/favorites" class="aio-favorites-dropdown__footer-btn">
						<v-icon size="18">favorite</v-icon>
						Ver todos
					</router-link>
					<router-link to="/products" class="aio-favorites-dropdown__footer-btn aio-favorites-dropdown__footer-btn--ghost">
						<v-icon size="18">storefront</v-icon>
						Seguir explorando
					</router-link>
				</div>

				<emb-delete-confirmation
					ref="deleteConfirmationDialog"
					title="Quitar de favoritos"
					message="¿Desea eliminar este producto de favoritos?"
					confirm-label="Sí, quitar"
					cancel-label="Cancelar"
					@onConfirm="onDeleteProductFromWishlist"
				></emb-delete-confirmation>
			</div>
		</v-menu>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { isUserLoggedIn } from 'Helpers/auth';

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
		...mapGetters(['wishlist']),
	},
	async mounted() {
		if (isUserLoggedIn()) {
			try {
				await this.$store.dispatch('fetchWishlist');
			} catch (error) {
				// Sin favoritos o API no disponible
			}
		}
	},
	methods: {
		async onMenuToggle(isOpen) {
			if (!isOpen || !isUserLoggedIn()) return;
			try {
				await this.$store.dispatch('fetchWishlist');
			} catch (error) {
				// La lista se mantiene vacía si la API falla
			}
		},
		formatPrice(value) {
			return parseFloat(value || 0).toFixed(2);
		},
		onImageError(event) {
			event.target.classList.add('aio-favorites-dropdown__thumb-img--error');
		},
		deleteProductFromWishlist(product) {
			this.selectDeletedProduct = product;
			this.$refs.deleteConfirmationDialog.openDialog();
		},
		onDeleteProductFromWishlist() {
			this.$refs.deleteConfirmationDialog.close();
			this.$store.dispatch('onDeleteProductFromWishlist', this.selectDeletedProduct)
				.then(() => {
					this.$snotify.success('Producto eliminado de favoritos', {
						closeOnClick: false,
						pauseOnHover: false,
						timeout: 1500,
					});
				})
				.catch(() => {
					this.$snotify.error('No se pudo eliminar de favoritos', {
						closeOnClick: false,
						pauseOnHover: false,
						timeout: 2500,
					});
				});
		},
	},
};
</script>
