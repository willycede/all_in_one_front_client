<template>
	<div class="aio-product-detail emb-product-detail">
		<!-- Skeleton de carga -->
		<div v-if="isPageLoading" class="aio-product-detail__loading">
			<v-container>
				<div class="aio-product-detail__skeleton-breadcrumb"></div>
				<div class="aio-product-detail__skeleton-layout">
					<div class="aio-product-detail__skeleton-gallery">
						<div class="aio-product-detail__skeleton-main"></div>
					</div>
					<div class="aio-product-detail__skeleton-info">
						<div class="aio-product-detail__skeleton-line aio-product-detail__skeleton-line--lg"></div>
						<div class="aio-product-detail__skeleton-line aio-product-detail__skeleton-line--md"></div>
						<div class="aio-product-detail__skeleton-line aio-product-detail__skeleton-line--sm"></div>
						<div class="aio-product-detail__skeleton-line aio-product-detail__skeleton-line--block"></div>
					</div>
				</div>
			</v-container>
		</div>

		<template v-else-if="selectedProduct">
			<div class="aio-product-detail__hero">
				<v-container>
					<nav class="aio-product-detail__breadcrumb" aria-label="Breadcrumb">
						<router-link to="/mainPage">Inicio</router-link>
						<v-icon size="14">chevron_right</v-icon>
						<router-link to="/products">Catálogo</router-link>
						<v-icon size="14">chevron_right</v-icon>
						<span>{{ selectedProduct.name }}</span>
					</nav>
					<h1 class="aio-product-detail__hero-title">{{ selectedProduct.name }}</h1>
				</v-container>
			</div>

			<div class="aio-product-detail__body">
				<v-container>
					<div class="aio-product-detail__layout">
						<!-- Galería -->
						<div class="aio-product-detail__gallery">
							<div v-if="productImages.length > 1" class="aio-product-detail__thumbs-col">
								<span class="aio-product-detail__thumbs-label">
									{{ productImages.length }} fotos
								</span>
								<div ref="thumbsScroll" class="aio-product-detail__thumbs">
									<button
										v-for="(img, index) in productImages"
										:key="img.product_images_id || index"
										type="button"
										class="aio-product-detail__thumb"
										:class="{ 'aio-product-detail__thumb--active': selectedImageIndex === index }"
										:aria-label="`Ver imagen ${index + 1} de ${productImages.length}`"
										:aria-current="selectedImageIndex === index ? 'true' : 'false'"
										@click="selectImage(index)"
									>
										<div
											class="aio-product-detail__thumb-inner"
											:class="{ 'aio-product-detail__thumb-inner--loaded': thumbLoaded[index] }"
										>
											<div v-if="!thumbLoaded[index]" class="aio-product-detail__thumb-placeholder"></div>
											<img
												v-if="!thumbErrors[index]"
												:src="img.url"
												:alt="`${selectedProduct.name} ${index + 1}`"
												loading="lazy"
												@load="onThumbLoad(index)"
												@error="onThumbError(index)"
											>
											<v-icon v-else size="20" color="#9ca3af">broken_image</v-icon>
										</div>
										<span class="aio-product-detail__thumb-index">{{ index + 1 }}</span>
									</button>
								</div>
							</div>

							<div class="aio-product-detail__main">
								<div
									class="aio-product-detail__main-frame"
									:class="{
										'aio-product-detail__main-frame--loaded': mainImageLoaded,
										'aio-product-detail__main-frame--error': mainImageError,
										'aio-product-detail__main-frame--zoomable': mainImageLoaded && !mainImageError,
									}"
									@click="onMainFrameClick"
								>
									<div v-if="!mainImageLoaded && !mainImageError" class="aio-product-detail__main-skeleton">
										<v-progress-circular indeterminate color="#A96DFA" size="36" width="3"></v-progress-circular>
									</div>

									<div v-if="mainImageError" class="aio-product-detail__main-fallback">
										<v-icon size="48" color="#A96DFA">image_not_supported</v-icon>
										<span>Imagen no disponible</span>
									</div>

									<img
										v-show="mainImageLoaded && !mainImageError"
										ref="mainImg"
										:src="selectedImage"
										:alt="selectedProduct.name"
										class="aio-product-detail__main-img detailImg"
										draggable="false"
										@load="onMainImageLoad"
										@error="onMainImageError"
									>

									<button
										v-if="mainImageLoaded && !mainImageError"
										type="button"
										class="aio-product-detail__zoom-btn"
										aria-label="Ampliar imagen"
										@click.stop="openLightbox(selectedImageIndex)"
									>
										<v-icon size="20" color="white">zoom_in</v-icon>
									</button>

									<span
										v-if="mainImageLoaded && !mainImageError && productImages.length > 1"
										class="aio-product-detail__image-counter"
									>
										{{ selectedImageIndex + 1 }} / {{ productImages.length }}
									</span>
								</div>

								<p v-if="mainImageLoaded && !mainImageError" class="aio-product-detail__zoom-hint">
									<v-icon size="16">zoom_in</v-icon>
									Clic en la imagen o en la lupa para ampliar
								</p>
							</div>
						</div>

						<!-- Información -->
						<div class="aio-product-detail__info">
							<div class="aio-product-detail__price-row">
								<span class="aio-product-detail__price">{{ formattedPrice }}</span>
								<span
									class="aio-product-detail__stock"
									:class="selectedProduct.status ? 'aio-product-detail__stock--in' : 'aio-product-detail__stock--out'"
								>
									{{ selectedProduct.status ? 'En stock' : 'Fuera de stock' }}
								</span>
							</div>

							<ul class="aio-product-detail__meta">
								<li>
									<span>Código</span>
									<strong>{{ selectedProduct.external_product_id || '—' }}</strong>
								</li>
							</ul>

							<p v-if="selectedProduct.descpription" class="aio-product-detail__desc">
								{{ selectedProduct.descpription }}
							</p>

							<div v-if="hasRequiredDocuments" class="aio-product-detail__alert">
								<v-icon size="18">info</v-icon>
								<p>
									<strong>Documentos requeridos.</strong>
									Podrás subirlos en el carrito antes de confirmar tu pedido.
								</p>
							</div>

							<div class="aio-product-detail__form">
								<div v-if="selectedProduct.cities && selectedProduct.cities.length > 0" class="aio-product-detail__field">
									<label>Ciudad</label>
									<v-select
										v-model="selectedCity"
										:items="selectedProduct.cities"
										item-text="name"
										item-value="id_city"
										placeholder="Seleccionar ciudad"
										outlined
										dense
										hide-details
										class="aio-product-detail__select"
									></v-select>
								</div>

								<div class="aio-product-detail__field aio-product-detail__field--qty">
									<label>Cantidad</label>
									<div class="aio-product-detail__qty">
										<button type="button" aria-label="Disminuir" @click="decreaseQty">−</button>
										<input
											v-model.number="productQuantity"
											type="number"
											min="1"
											aria-label="Cantidad"
										>
										<button type="button" aria-label="Aumentar" @click="increaseQty">+</button>
									</div>
								</div>
							</div>

							<div class="aio-product-detail__actions">
								<button
									type="button"
									class="aio-product-detail__btn aio-product-detail__btn--ghost"
									:class="{ 'aio-product-detail__btn--fav-active': isInWishlist }"
									@click="toggleWishlist"
								>
									<v-icon size="20">{{ isInWishlist ? 'favorite' : 'favorite_border' }}</v-icon>
									{{ isInWishlist ? 'En favoritos' : 'Agregar a favoritos' }}
								</button>
								<button
									v-if="ifItemExistInCart(selectedProduct)"
									type="button"
									class="aio-product-detail__btn aio-product-detail__btn--secondary"
									@click="$router.push('/cart')"
								>
									<v-icon size="20">shopping_bag</v-icon>
									Ver en el carrito
								</button>
								<button
									v-else
									type="button"
									class="aio-product-detail__btn aio-product-detail__btn--primary"
									@click="addProductToCart(selectedProduct)"
								>
									<v-icon size="20" color="white">add_shopping_cart</v-icon>
									Agregar al carrito
								</button>
							</div>
						</div>
					</div>
				</v-container>
			</div>
		</template>

		<div v-else class="aio-product-detail__empty">
			<v-icon size="48" color="#A96DFA">inventory_2</v-icon>
			<h2>Producto no encontrado</h2>
			<router-link to="/products" class="aio-product-detail__btn aio-product-detail__btn--primary">
				Volver al catálogo
			</router-link>
		</div>

		<!-- Lightbox ampliado -->
		<v-dialog
			v-model="lightboxOpen"
			max-width="1100"
			content-class="aio-product-lightbox"
			@click:outside="closeLightbox"
		>
			<div class="aio-product-lightbox__panel" role="dialog" aria-modal="true" :aria-label="`Imagen ampliada: ${selectedProduct?.name || ''}`">
				<button type="button" class="aio-product-lightbox__close" aria-label="Cerrar" @click="closeLightbox">
					<v-icon color="white">close</v-icon>
				</button>

				<button
					v-if="productImages.length > 1"
					type="button"
					class="aio-product-lightbox__nav aio-product-lightbox__nav--prev"
					aria-label="Imagen anterior"
					@click="lightboxPrev"
				>
					<v-icon color="white">chevron_left</v-icon>
				</button>

				<div class="aio-product-lightbox__stage">
					<div v-if="lightboxLoading" class="aio-product-lightbox__loading">
						<v-progress-circular indeterminate color="#A96DFA" size="44" width="3"></v-progress-circular>
					</div>
					<img
						v-show="!lightboxLoading && !lightboxError"
						ref="lightboxImg"
						:src="lightboxImage"
						:alt="selectedProduct?.name"
						class="aio-product-lightbox__img"
						@load="onLightboxImageLoad"
						@error="onLightboxImageError"
					>
					<div v-if="lightboxError" class="aio-product-lightbox__error">
						<v-icon size="40" color="#A96DFA">broken_image</v-icon>
						<span>No se pudo cargar la imagen</span>
					</div>
				</div>

				<button
					v-if="productImages.length > 1"
					type="button"
					class="aio-product-lightbox__nav aio-product-lightbox__nav--next"
					aria-label="Imagen siguiente"
					@click="lightboxNext"
				>
					<v-icon color="white">chevron_right</v-icon>
				</button>

				<div v-if="productImages.length > 1" class="aio-product-lightbox__footer">
					<span class="aio-product-lightbox__counter">
						{{ lightboxIndex + 1 }} / {{ productImages.length }}
					</span>
					<div class="aio-product-lightbox__thumbs">
						<button
							v-for="(img, index) in productImages"
							:key="'lb-' + (img.product_images_id || index)"
							type="button"
							class="aio-product-lightbox__thumb"
							:class="{ 'aio-product-lightbox__thumb--active': lightboxIndex === index }"
							:aria-label="`Ver imagen ${index + 1}`"
							@click="openLightbox(index)"
						>
							<img :src="img.url" :alt="`Miniatura ${index + 1}`" loading="lazy">
						</button>
					</div>
				</div>
			</div>
		</v-dialog>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import { moneyMask } from '../../../../helpers/helpers';
import AppConfig from 'Constants/AppConfig';
import { isProductInCart } from 'Helpers/cart';
import { isProductInWishlist } from 'Helpers/favorites';
import { isUserLoggedIn } from 'Helpers/auth';

export default {
	data() {
		return {
			isPageLoading: true,
			selectedImage: '',
			selectedImageIndex: 0,
			mainImageLoaded: false,
			mainImageError: false,
			thumbLoaded: {},
			thumbErrors: {},
			selectedCity: null,
			productQuantity: 1,
			formattedPrice: '',
			lightboxOpen: false,
			lightboxIndex: 0,
			lightboxImage: '',
			lightboxLoading: true,
			lightboxError: false,
		};
	},
	computed: {
		...mapGetters(['selectedProduct', 'cart', 'wishlist']),
		isInWishlist() {
			return isProductInWishlist(this.wishlist, this.selectedProduct);
		},
		productImages() {
			return this.selectedProduct?.images || [];
		},
		hasRequiredDocuments() {
			const docs = this.selectedProduct?.required_documents_array;
			if (Array.isArray(docs) && docs.length > 0) return true;
			const raw = this.selectedProduct?.required_documents;
			return raw && String(raw).trim() !== '';
		},
		requiredDocumentsArray() {
			if (this.selectedProduct?.required_documents_array?.length) {
				return this.selectedProduct.required_documents_array;
			}
			const raw = this.selectedProduct?.required_documents;
			if (!raw || String(raw).trim() === '') return [];
			try {
				return JSON.parse(raw);
			} catch (e) {
				return [];
			}
		},
	},
	watch: {
		'$route.params.id': {
			handler() {
				this.loadProduct();
			},
		},
	},
	mounted() {
		this.loadProduct();
		if (isUserLoggedIn()) {
			this.$store.dispatch('fetchWishlist');
		}
		window.addEventListener('keydown', this.handleKeydown);
	},
	beforeDestroy() {
		window.removeEventListener('keydown', this.handleKeydown);
	},
	methods: {
		async loadProduct() {
			this.isPageLoading = true;
			this.mainImageLoaded = false;
			this.mainImageError = false;
			this.thumbLoaded = {};
			this.thumbErrors = {};
			this.selectedImageIndex = 0;
			this.selectedCity = null;
			this.productQuantity = 1;

			const id = this.$route.params.id;
			await this.$store.dispatch('getProductsBId', id);

			if (this.selectedProduct?.images?.length) {
				this.formattedPrice = moneyMask(this.selectedProduct.price);
				this.selectImage(0, false);
			} else {
				this.selectedImage = '';
				this.formattedPrice = this.selectedProduct
					? moneyMask(this.selectedProduct.price)
					: '';
			}

			this.isPageLoading = false;
			this.$nextTick(() => this.checkMainImageCached());
		},
		checkMainImageCached() {
			const img = this.$refs.mainImg;
			if (img && img.complete && img.naturalWidth > 0) {
				this.onMainImageLoad();
			}
		},
		selectImage(index, resetLoad = true) {
			this.selectedImageIndex = index;
			const img = this.productImages[index];
			if (!img) return;

			if (resetLoad) {
				this.mainImageLoaded = false;
				this.mainImageError = false;
			}
			this.selectedImage = img.url;
			this.$nextTick(() => {
				this.checkMainImageCached();
				this.scrollThumbIntoView(index);
			});
		},
		scrollThumbIntoView(index) {
			const container = this.$refs.thumbsScroll;
			if (!container) return;
			const thumb = container.children[index];
			if (thumb) {
				thumb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}
		},
		onMainFrameClick() {
			if (this.mainImageLoaded && !this.mainImageError) {
				this.openLightbox(this.selectedImageIndex);
			}
		},
		openLightbox(index) {
			const img = this.productImages[index];
			if (!img) return;

			this.lightboxIndex = index;
			this.lightboxImage = img.url;
			this.lightboxLoading = true;
			this.lightboxError = false;
			this.lightboxOpen = true;
			this.selectImage(index);

			this.$nextTick(() => {
				const lbImg = this.$refs.lightboxImg;
				if (lbImg && lbImg.complete && lbImg.naturalWidth > 0) {
					this.onLightboxImageLoad();
				}
			});
		},
		closeLightbox() {
			this.lightboxOpen = false;
		},
		lightboxPrev() {
			if (this.productImages.length <= 1) return;
			const next = (this.lightboxIndex - 1 + this.productImages.length) % this.productImages.length;
			this.openLightbox(next);
		},
		lightboxNext() {
			if (this.productImages.length <= 1) return;
			const next = (this.lightboxIndex + 1) % this.productImages.length;
			this.openLightbox(next);
		},
		onLightboxImageLoad() {
			this.lightboxLoading = false;
			this.lightboxError = false;
		},
		onLightboxImageError() {
			this.lightboxLoading = false;
			this.lightboxError = true;
		},
		handleKeydown(event) {
			if (!this.lightboxOpen) return;
			if (event.key === 'Escape') {
				this.closeLightbox();
			} else if (event.key === 'ArrowLeft') {
				this.lightboxPrev();
			} else if (event.key === 'ArrowRight') {
				this.lightboxNext();
			}
		},
		onMainImageLoad() {
			this.mainImageLoaded = true;
			this.mainImageError = false;
		},
		onMainImageError() {
			this.mainImageLoaded = true;
			this.mainImageError = true;
		},
		onThumbLoad(index) {
			this.$set(this.thumbLoaded, index, true);
		},
		onThumbError(index) {
			this.$set(this.thumbErrors, index, true);
			this.$set(this.thumbLoaded, index, true);
		},
		decreaseQty() {
			if (this.productQuantity > 1) {
				this.productQuantity -= 1;
			}
		},
		increaseQty() {
			this.productQuantity += 1;
		},
		parsePrice(value) {
			return parseFloat(String(value).replace(/[$,]/g, '')) || 0;
		},
		addProductToCart(item) {
			if (item.cities && item.cities.length > 0 && !this.selectedCity) {
				this.$snotify.error('Por favor selecciona una ciudad', {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 2000,
					showProgressBar: false,
				});
				return;
			}

			if (!this.productQuantity || this.productQuantity < 1) {
				this.$snotify.error('Por favor ingresa una cantidad válida', {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 2000,
					showProgressBar: false,
				});
				return;
			}

			const img = item.images[0].url;
			const price = this.parsePrice(item.price);
			const quantity = this.productQuantity;

			if (typeof localStorage.id_users !== 'undefined' && localStorage.id_users !== null) {
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
					id_city: this.selectedCity,
					required_documents_array: this.requiredDocumentsArray,
					uploaded_documents: {},
				};

				this.$snotify.success('Producto agregado al carrito', {
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 1000,
					showProgressBar: false,
				});

				setTimeout(() => {
					this.$store.dispatch('addProductToCart', newProduct);
				}, 500);
			} else {
				this.$snotify.success('Se requiere inicio de sesión para poder agregar productos al carrito.', {
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
		toggleWishlist() {
			if (!isUserLoggedIn()) {
				this.$snotify.info('Inicia sesión para guardar favoritos', { timeout: 2500 });
				return;
			}

			const product = this.selectedProduct;
			if (this.isInWishlist) {
				const favoriteItem = this.wishlist.find(
					(w) => String(w.id_product || w.id) === String(product.id_products)
				);
				if (!favoriteItem) return;
				this.$store.dispatch('onDeleteProductFromWishlist', favoriteItem)
					.then(() => this.$snotify.success('Eliminado de favoritos', { timeout: 1500 }));
				return;
			}

			this.$store.dispatch('addItemToWishlist', product)
				.then(() => this.$snotify.success('Agregado a favoritos', { timeout: 1500 }))
				.catch((error) => {
					const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
						|| 'No se pudo agregar a favoritos';
					if (message.includes('ya está en favoritos')) {
						this.$store.dispatch('fetchWishlist');
						this.$snotify.info('Este producto ya está en favoritos', { timeout: 2000 });
						return;
					}
					this.$snotify.error(message, { timeout: 2500 });
				});
		},
	},
};
</script>

<style scoped>
.aio-product-detail__select >>> .v-input__slot {
	border-radius: 12px !important;
}
</style>
