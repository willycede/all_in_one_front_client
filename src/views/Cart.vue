<script>
import { mapGetters } from "vuex";
import CryptoJS from 'crypto-js';
import api from "Api";
import AppConfig from "../constants/AppConfig";
import HtmlElement from "../constants/HtmlBodyMail";
import CartDocumentsModal from "../components/Cart/CartDocumentsModal.vue";
import CartCoupon from "../components/Cart/CartCoupon.vue";
import { parseRequiredDocuments, formatDocumentName as formatDocLabel } from 'Helpers/documents';

const key = '82f2ceed4c503896c8a291e560bd4325' // change to your key
const iv = 'sinasinasisinaaa' // change to your iv


export default {
  components: {
    CartDocumentsModal,
    CartCoupon,
  },
  data() {
    return {
      isLoading: true,
      selectDeletedProduct: null,
      docsModalOpen: false,
      docsModalItem: null,
      total: null,
      cartId: null,
      couponCode: '',
      couponDescription: '',
      couponDiscount: 0,
      uploadedDocuments: {}, // { id_details: { docType: file } }
      uploadingDocuments: {},
      quantityTimers: {},
      headers: [
        {
          text: "Product",
          align: "left",
          sortable: false,
          value: "image",
        },
        { text: "Product Name", value: "name" },
        { text: "Product Quantity", value: "quantity" },
        { text: "Product Total", value: "total" },
        { text: "Remove", value: "remove" },
      ],
    };
  },
  async mounted() {
    this.tax = 0;
    this.shipping = 0;

    if (!localStorage.id_users) {
      this.isLoading = false;
      return;
    }

    try {
      const shopCart = await api.get(
        '/api/shoppingcar/get_shop/' + localStorage.id_users
      );
      const carts = shopCart && shopCart.data && shopCart.data.data;
      if (!carts || !carts.length) {
        this.$store.dispatch('addSetToCart', []);
        return;
      }

      localStorage.setItem('id_orden', carts[0].id_shopping_car);
      this.cartId = carts[0].id_shopping_car;
      this.couponCode = carts[0].coupon_code || '';
      this.couponDiscount = parseFloat(carts[0].coupon_discount) || 0;
      const cartsshop = carts[0].id_shopping_car;

      const shopCartDetails = await api.get(
        '/api/shoppingcar/get_shopDetails/' + cartsshop
      );

      if (shopCartDetails.data && shopCartDetails.data.data) {
        const cartItems = shopCartDetails.data.data.map((item) => ({
          ...item,
          required_documents_array: parseRequiredDocuments(item.required_documents),
        }));

        this.$store.dispatch('addSetToCart', cartItems);
        await this.loadCartDocuments(cartItems);
      }
    } catch (error) {
      this.$store.dispatch('addSetToCart', []);
    } finally {
      this.isLoading = false;
    }
  },
  computed: {
    ...mapGetters(["cart", "tax", "shipping"]),
    console: () => console,
    window: () => window,
    itemTotal() {
      if (!this.cart.length) return '0.00';
      let productTotal = 0;
      for (const item of this.cart) {
        productTotal += item.details_price * item.details_quantity;
      }
      return productTotal.toFixed(2);
    },
    shipping() {
      return (0.0).toFixed(2);
    },
    couponDiscountFormatted() {
      return (parseFloat(this.couponDiscount) || 0).toFixed(2);
    },
    tax() {
      if (!this.cart.length) return '0.00';
      let tax = 0;
      for (const item of this.cart) {
        tax += item.details_price * item.details_quantity * AppConfig.porcentajeIVa;
      }
      return tax.toFixed(2);
    },
    getTotalPrice() {
      let totalPrice = 0;
      let subtotal = parseFloat(this.itemTotal);
      let descuento = parseFloat(this.couponDiscount) || 0;
      let impuesto = parseFloat(this.tax);
      if (this.cart.length > 0) {
        totalPrice += subtotal - descuento + impuesto;
        return Math.max(0, totalPrice).toFixed(2);
      } else {
        return totalPrice.toFixed(2);
      }
    },
  },
  methods: {
    formatNumber(num) {
      return parseFloat(num).toFixed(2);
    },
    registraConfirmaShop() {
      // Validar que todos los productos con documentos requeridos tengan sus documentos subidos
      const missingDocs = this.validateRequiredDocuments();
      
      if(missingDocs.length > 0) {
        let message = 'Los siguientes productos requieren documentos:\n\n';
        missingDocs.forEach(item => {
          message += `• ${item.productName}: ${item.missingDocs.join(', ')}\n`;
        });
        
        this.$snotify.error(message, {
          closeOnClick: false,
          pauseOnHover: false,
          timeout: 5000,
          showProgressBar: false,
        });
        return;
      }
      
      this.$refs.confirmationDialog.openDialog();
    },
    async onRegisterShop() {
      try {
        /*Creramos variables de los totales de pago de la orden para crear arreglo payphone */
        let subtotal = parseInt(parseFloat(this.itemTotal) * 100);
        let couponCents = parseInt(parseFloat(this.couponDiscount) * 100);
        let subtotalAfterCoupon = Math.max(0, subtotal - couponCents);
        let impuesto = parseInt(parseFloat(this.tax) * 100);
        let total = parseInt(parseFloat(this.getTotalPrice) * 100);
        this.$refs.confirmationDialog.close();
        this.$refs.loadComponent.openDialog();
        const arr_pay = {
          id_shopping_car: localStorage.id_orden,
          amount: total,
          tax: impuesto,
          amountWithTax: subtotalAfterCoupon,
          service: 0,
          tip: 0,
          currency: "USD",
          forceNewTransaction: true,
          reference: "PAGO ORDEN DE PAGO #" + localStorage.id_orden,
          oneTime: false,
          expireIn: 0,
        };
        let detallefinal = "";
        for (const item of this.cart) {
          const totaldetalle = item.details_quantity * item.details_price;
          detallefinal += HtmlElement.htmldetalle
            .replace("@nombre", item.name)
            .replace("@cantidad", item.details_quantity)
            .replace("@totaldetalle", "$ " + parseFloat(totaldetalle).toFixed(2));
        }

        console.log(arr_pay);

        /*Ejecutamos api que genera link de pago payphone */
        const urlPayphone = await api.post(
          "/api/shoppingcar/payphone",
          arr_pay
        );
        /*validamos si el link de pago se genero correctamente */
        if (urlPayphone.data.errorCode === 200) {
          const html = HtmlElement.buildOrderPaymentEmail({
            payUrl: urlPayphone.data.url,
            siteUrl: AppConfig.siteUrl,
            logoUrl: AppConfig.emailLogoUrl,
            customerName: `${localStorage.name_user} ${localStorage.last_name_user}`.trim(),
            orderNumber: localStorage.id_orden,
            date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            itemsHtml: detallefinal,
            itemCount: this.cart.length,
            subtotal: (subtotal / 100).toFixed(2),
            tax: (impuesto / 100).toFixed(2),
            discount: (couponCents / 100).toFixed(2),
            total: (total / 100).toFixed(2),
          });

            const data_send_mail = {
              html: html,
              email: localStorage.email,
              name: `${localStorage.name_user} ${localStorage.last_name_user}`,
            };

            try {
              await api.post(
                "/api/shoppingcar/sendmail",
                data_send_mail
              );
            } catch (mailError) {
              this.$snotify.warning(
                "El link de pago se generó correctamente, pero no se pudo enviar el correo. Puedes pagar desde Mis pedidos.",
                { timeout: 6000 }
              );
            }

            this.$refs.loadComponent.close();
            this.$router.push('/account/order-history');
            
        } else {
          this.$refs.loadComponent.close();
          const message = (urlPayphone.data && urlPayphone.data.error && urlPayphone.data.error.message)
            || 'No se pudo generar el link de pago';
          this.$snotify.error(message, { timeout: 4000 });
        }
      } catch (e) {
        this.$refs.loadComponent.close();
        const message = (e.response && e.response.data && e.response.data.error && e.response.data.error.message)
          || 'Error al procesar la orden';
        this.$snotify.error(message, { timeout: 4000 });
      }
    },
    deleteProductFromCart(product) {
      this.$refs.deleteConfirmationDialog.openDialog();
      this.selectDeletedProduct = product;
    },
    onDeleteProductFromCart() {
      this.$refs.deleteConfirmationDialog.close();
      const product = this.selectDeletedProduct;
      this.$store.dispatch('onDeleteProductFromCart', product)
        .then(() => {
          if (product?.id_details && this.uploadedDocuments[product.id_details]) {
            this.$delete(this.uploadedDocuments, product.id_details);
          }
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
    async updateShoppingPay(pay){
      return await api.post(
        "/api/shoppingcar/pay_shop",
        pay
      );
    },aesEncrypt(txt) {
      const cipher = CryptoJS.AES.encrypt(txt, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC
      })

      return cipher.toString()
    },
    aesDencrypt(txt) {
      const cipher = CryptoJS.AES.decrypt(txt, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC
      })

      return CryptoJS.enc.Utf8.stringify(cipher).toString()
    },
    formatDocumentName(docType) {
      return formatDocLabel(docType);
    },
    async loadCartDocuments(cartItems) {
      for (const item of cartItems) {
        if (!item.id_details || !item.required_documents_array || !item.required_documents_array.length) {
          continue;
        }

        try {
          const response = await api.get(`/api/product_documents/cart-detail/${item.id_details}`);
          const docs = (response.data && response.data.data) || [];
          if (!docs.length) continue;

          const mapped = {};
          docs.forEach((doc) => {
            mapped[doc.document_type] = {
              url: doc.document_url,
              file_name: doc.file_name,
            };
          });
          this.$set(this.uploadedDocuments, item.id_details, mapped);
        } catch (error) {
          // Sin documentos previos para esta línea
        }
      }
    },
    onQuantityChange(item) {
      const detailId = item.id_details;
      if (!detailId) return;

      if (this.quantityTimers[detailId]) {
        clearTimeout(this.quantityTimers[detailId]);
      }

      this.quantityTimers[detailId] = setTimeout(() => {
        const quantity = Math.max(1, parseInt(item.details_quantity, 10) || 1);
        item.details_quantity = quantity;

        this.$store.dispatch('updateCartItemQuantity', item)
          .catch(() => {
            this.$snotify.error('No se pudo actualizar la cantidad', { timeout: 2000 });
          });
      }, 500);
    },
    /* Handle file upload */
    async handleFileUpload(item, docType, file) {
      if(!file) {
        // Si se elimina el archivo
        if(this.uploadedDocuments[item.id_details]) {
          delete this.uploadedDocuments[item.id_details][docType];
        }
        return;
      }

      // Validar que el usuario esté autenticado
      if(typeof(localStorage.id_users) === 'undefined' || localStorage.id_users === null) {
        this.$snotify.error('Debe iniciar sesión para subir documentos',{
          closeOnClick: false,
          pauseOnHover: false,
          timeout: 3000,
          showProgressBar: false,
        });
        return;
      }

      try {
        // Marcar como subiendo
        if(!this.uploadingDocuments[item.id_details]) {
          this.$set(this.uploadingDocuments, item.id_details, {});
        }
        this.$set(this.uploadingDocuments[item.id_details], docType, true);

        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append('document', file);
        formData.append('user_id', localStorage.id_users);
        formData.append('cart_detail_id', item.id_details);
        formData.append('product_id', item.id_product);
        formData.append('document_type', docType);
        formData.append('product_name', item.name);
        
        console.log('Enviando documento:', {
          user_id: localStorage.id_users,
          cart_detail_id: item.id_details,
          product_id: item.id_product,
          document_type: docType,
          product_name: item.name
        });

        // Mostrar mensaje de carga
        this.$snotify.info('Subiendo documento...',{
          closeOnClick: false,
          pauseOnHover: false,
          timeout: 0,
          showProgressBar: false,
        });

        // Subir archivo al servidor
        const response = await api.post('/api/product_documents/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if(response.data && response.data?.data?.success) {
          // Guardar el archivo subido
          if(!this.uploadedDocuments[item.id_details]) {
            this.$set(this.uploadedDocuments, item.id_details, {});
          }
          this.$set(this.uploadedDocuments[item.id_details], docType, {
            file: file,
            url: response.data.fileUrl
          });

          this.$snotify.clear();
          this.$snotify.success('Documento subido correctamente',{
            closeOnClick: false,
            pauseOnHover: false,
            timeout: 2000,
            showProgressBar: false,
          });
        } else {
          this.$snotify.clear();
          this.$snotify.error('Error al subir el documento',{
            closeOnClick: false,
            pauseOnHover: false,
            timeout: 3000,
            showProgressBar: false,
          });
        }
      } catch(error) {
        this.$snotify.clear();
        const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message;
        this.$snotify.error('Error al subir el documento: ' + errorMessage,{
          closeOnClick: false,
          pauseOnHover: false,
          timeout: 3000,
          showProgressBar: false,
        });
        console.error('Error uploading document:', error);
      } finally {
        // Marcar como no subiendo
        if(this.uploadingDocuments[item.id_details]) {
          this.$set(this.uploadingDocuments[item.id_details], docType, false);
        }
      }
    },
    /* Validate required documents */
    validateRequiredDocuments() {
      const missingDocs = [];
      
      for(const item of this.cart) {
        if(item.required_documents_array && item.required_documents_array.length > 0) {
          const missing = [];
          
          for(const docType of item.required_documents_array) {
            const uploaded = this.uploadedDocuments[item.id_details] && this.uploadedDocuments[item.id_details][docType];
            if(!uploaded) {
              missing.push(this.formatDocumentName(docType));
            }
          }
          
          if(missing.length > 0) {
            missingDocs.push({
              productName: item.name,
              missingDocs: missing
            });
          }
        }
      }
      
      return missingDocs;
    },
    /* Check if document is uploaded */
    isDocumentUploaded(item, docType) {
      return !!(this.uploadedDocuments[item.id_details] && this.uploadedDocuments[item.id_details][docType]);
    },
    getDocsUploadedCount(item) {
      if (!item?.required_documents_array?.length) return 0;
      return item.required_documents_array.filter((docType) => this.isDocumentUploaded(item, docType)).length;
    },
    isDocsComplete(item) {
      if (!item?.required_documents_array?.length) return true;
      return this.getDocsUploadedCount(item) === item.required_documents_array.length;
    },
    openDocsModal(item) {
      this.docsModalItem = item;
      this.docsModalOpen = true;
    },
    onDocsUpload({ item, docType, file }) {
      this.handleFileUpload(item, docType, file);
    },
    onCouponApplied(payload) {
      this.couponCode = payload?.coupon_code || '';
      this.couponDescription = payload?.coupon_description || '';
      this.couponDiscount = parseFloat(payload?.discount_amount) || 0;
    },
    onCouponRemoved() {
      this.couponCode = '';
      this.couponDescription = '';
      this.couponDiscount = 0;
    },
  },
};

</script>
<template>
	<div class="aio-cart-page emb-cart-wrap">
		<div class="aio-cart-page__hero">
			<v-container>
				<nav class="aio-cart-page__breadcrumb" aria-label="Ruta">
					<router-link to="/">Inicio</router-link>
					<v-icon size="14">chevron_right</v-icon>
					<span>Carrito</span>
				</nav>
				<h1 class="aio-cart-page__title">Carrito de compras</h1>
				<p class="aio-cart-page__subtitle">
					Revisa tus productos y confirma tu pedido cuando estés listo.
				</p>
			</v-container>
		</div>

		<div class="aio-cart-page__body section-gap">
			<v-container grid-list-xl py-0>
				<div v-if="isLoading" class="aio-cart-page__loading">
					<v-progress-circular indeterminate color="#A96DFA" size="40" width="3"></v-progress-circular>
					<p>Cargando tu carrito...</p>
				</div>

				<div v-else-if="!cart || !cart.length" class="aio-cart-page__empty">
					<div class="aio-cart-page__empty-icon">
						<v-icon size="48">shopping_bag</v-icon>
					</div>
					<h2>Tu carrito está vacío</h2>
					<p>Aún no has agregado productos. Explora el catálogo y encuentra lo que necesitas.</p>
					<router-link to="/products" class="aio-cart-page__empty-btn">
						<v-icon size="18">storefront</v-icon>
						Ver productos
					</router-link>
				</div>

				<div v-else class="aio-cart-page__layout cart-shop-list">
					<div class="aio-cart-page__main">
						<div class="aio-cart-page__notice">
							<v-icon size="20">info</v-icon>
							<p>
								Verifica tus
								<router-link to="/account/profile">datos de facturación</router-link>
								antes de confirmar. La factura se emitirá con la información registrada en tu cuenta.
							</p>
						</div>

						<article
							v-for="(item, index) in cart"
							:key="item.id_details || index"
							class="aio-cart-page__item"
						>
							<div class="aio-cart-page__item-main">
								<div class="aio-cart-page__thumb">
									<img :src="item.url" :alt="item.name_img || item.name">
								</div>

								<div class="aio-cart-page__info">
									<h3 class="aio-cart-page__name">{{ item.name }}</h3>
									<p v-if="item.description" class="aio-cart-page__desc">{{ item.description }}</p>
								</div>

								<div class="aio-cart-page__qty">
									<label>Cantidad</label>
									<v-text-field
										v-model.number="item.details_quantity"
										type="number"
										min="1"
										max="10"
										outlined
										dense
										hide-details
										class="aio-cart-page__qty-input"
										@input="onQuantityChange(item)"
									></v-text-field>
								</div>

								<div class="aio-cart-page__unit-price">
									<label>Precio</label>
									<span>
										<emb-currency-sign></emb-currency-sign>{{ formatNumber(item.details_price) }}
									</span>
								</div>

								<div class="aio-cart-page__line-total">
									<label>Total</label>
									<strong>
										<emb-currency-sign></emb-currency-sign>{{ formatNumber(item.details_quantity * item.details_price) }}
									</strong>
								</div>

								<button
									type="button"
									class="aio-cart-page__remove"
									title="Eliminar producto"
									@click="deleteProductFromCart(item)"
								>
									<v-icon size="20">close</v-icon>
								</button>
							</div>

							<div
								v-if="item.required_documents_array && item.required_documents_array.length > 0"
								class="aio-cart-page__docs-cta"
							>
								<div class="aio-cart-page__docs-cta-content">
									<div class="aio-cart-page__docs-cta-icon">
										<v-icon size="20">description</v-icon>
									</div>
									<div>
										<strong>Documentación obligatoria</strong>
										<p>
											Este producto requiere adjuntar documentos antes de confirmar la compra.
											Usa el botón para cargarlos.
										</p>
									</div>
								</div>
								<div class="aio-cart-page__docs-cta-actions">
									<span
										class="aio-cart-page__docs-badge"
										:class="{ 'aio-cart-page__docs-badge--done': isDocsComplete(item) }"
									>
										<v-icon v-if="isDocsComplete(item)" size="14">check_circle</v-icon>
										{{ getDocsUploadedCount(item) }}/{{ item.required_documents_array.length }} cargados
									</span>
									<button
										type="button"
										class="aio-cart-page__docs-btn"
										@click="openDocsModal(item)"
									>
										<v-icon size="18">upload_file</v-icon>
										Añadir documentación
									</button>
								</div>
							</div>
						</article>
					</div>

					<aside class="aio-cart-page__summary">
						<div class="aio-cart-page__summary-card">
							<h2 class="aio-cart-page__summary-title">Resumen del pedido</h2>

							<cart-coupon
								v-if="cartId"
								:cart-id="cartId"
								:applied-code="couponCode"
								:description="couponDescription"
								@applied="onCouponApplied"
								@removed="onCouponRemoved"
							></cart-coupon>

							<div class="aio-cart-page__summary-row">
								<span>Subtotal</span>
								<span>
									<emb-currency-sign></emb-currency-sign>{{ itemTotal }}
								</span>
							</div>
							<div v-if="parseFloat(couponDiscount) > 0" class="aio-cart-page__summary-row aio-cart-page__summary-row--discount">
								<span>Cupón{{ couponCode ? ` (${couponCode})` : '' }}</span>
								<span>
									-<emb-currency-sign></emb-currency-sign>{{ couponDiscountFormatted }}
								</span>
							</div>
							<div class="aio-cart-page__summary-row">
								<span>Envío</span>
								<span>
									<emb-currency-sign></emb-currency-sign>{{ shipping }}
								</span>
							</div>
							<div class="aio-cart-page__summary-row">
								<span>Impuesto</span>
								<span>
									<emb-currency-sign></emb-currency-sign>{{ tax }}
								</span>
							</div>

							<div class="aio-cart-page__summary-divider"></div>

							<div class="aio-cart-page__summary-row aio-cart-page__summary-row--total">
								<span>Total</span>
								<strong>
									<emb-currency-sign></emb-currency-sign>{{ getTotalPrice }}
								</strong>
							</div>

							<button
								type="button"
								class="aio-cart-page__confirm-btn"
								@click="registraConfirmaShop"
							>
								<v-icon size="20">lock</v-icon>
								Confirmar compra
							</button>

							<router-link to="/products" class="aio-cart-page__continue-link">
								<v-icon size="16">arrow_back</v-icon>
								Seguir comprando
							</router-link>
						</div>
					</aside>
				</div>

				<vue-snotify></vue-snotify>
				<emb-confirmation-component
					ref="confirmationDialog"
					title="¿Confirmar orden?"
					message="Revisa que tu carrito y la documentación requerida estén completos antes de finalizar la compra."
					confirm-label="Sí, confirmar"
					cancel-label="Cancelar"
					@onConfirm="onRegisterShop"
				></emb-confirmation-component>
				<emb-delete-confirmation
					ref="deleteConfirmationDialog"
					title="Eliminar producto"
					message="¿Desea eliminar este producto del carrito? Esta acción no se puede deshacer."
					confirm-label="Sí, eliminar"
					cancel-label="Cancelar"
					@onConfirm="onDeleteProductFromCart"
				></emb-delete-confirmation>
				<cart-documents-modal
					v-model="docsModalOpen"
					:item="docsModalItem"
					:uploaded-documents="uploadedDocuments"
					:uploading-documents="uploadingDocuments"
					@upload="onDocsUpload"
				></cart-documents-modal>
				<emb-load-component
					ref="loadComponent"
					eyebrow="Procesando orden"
					message="Registrando tu orden"
					subtitle="Estamos preparando el enlace de pago. Por favor no cierres esta ventana."
				></emb-load-component>
			</v-container>
		</div>
	</div>
</template>