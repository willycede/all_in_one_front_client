<script setup>
import { mapGetters } from "vuex";
import CryptoJS from 'crypto-js';
//import emailjs from "@emailjs/browser";
import api from "Api";
import AppConfig from "../constants/AppConfig";
import HtmlElement from "../constants/HtmlBodyMail";

//import { Modal } from 'flowbite-vue'
//import { ref } from 'vue'

const key = '82f2ceed4c503896c8a291e560bd4325' // change to your key
const iv = 'sinasinasisinaaa' // change to your iv


export default {
  data() {
    return {
      selectDeletedProduct: null,
      total: null,
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
    /* Cobtenemos la orden activa del usuario para mostrar en la lista */
    const shopCart = await api.get(
      "/api/shoppingcar/get_shop/" + localStorage.id_users
    );
    /* Guardamos sesion de id shopp */
    localStorage.setItem('id_orden',shopCart.data.data[0].id_shopping_car)
    let cartsshop =
      shopCart.data.data.length > 0 ? shopCart.data.data[0].id_shopping_car : 0;
   /* obtenemos todos los detalle del shopp activo */
    const shopCartDetails = await api.get(
      "/api/shoppingcar/get_shopDetails/" + cartsshop
    );
    this.cart = shopCartDetails;
  },
  computed: {
    ...mapGetters(["cart", "tax", "shipping"]),
    console: () => console,
    window: () => window,
    itemTotal() {
      let productTotal = null;
      if (this.cart.length > 0) {
        for (const item of this.cart) {
          productTotal += item.details_price * item.details_quantity;
        }
        return productTotal.toFixed(2);
      } else {
        return productTotal.toFixed(2);
      }
    },
    shipping() {
      return (0.0).toFixed(2);
    },
    tax() {
      let tax = null;
      if (this.cart.length > 0) {
        for (const item of this.cart) {
          tax += item.details_price * item.details_quantity * AppConfig.porcentajeIVa;
        }
        return tax.toFixed(2);
      } else {
        return tax.toFixed(2);
      }
    },
    getTotalPrice() {
      let totalPrice = 0;
      let subtotal = parseFloat(this.itemTotal);
      let descuento = parseFloat(this.shipping);
      let impuesto = parseFloat(this.tax);
      if (this.cart.length > 0) {
        totalPrice += subtotal - descuento + impuesto;
        return totalPrice.toFixed(2);
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
      this.$refs.confirmationDialog.openDialog();
    },
    async onRegisterShop() {
      try {
        /*Creramos variables de los totales de pago de la orden para crear arreglo payphone */
        let subtotal = parseInt(parseFloat(this.itemTotal) * 100);
        let impuesto = parseInt(parseFloat(this.tax) * 100);
        let total = parseInt(parseFloat(this.getTotalPrice * 100).toFixed(2));
        this.$refs.confirmationDialog.close();
        this.$refs.loadComponent.openDialog();
        const arr_pay = {
          amount: total,
          tax: impuesto,
          amountWithTax: subtotal,
          service: 0,
          tip: 0,
          currency: "USD",
          clientTransactionId: localStorage.id_orden+"@145636",
          reference: "PAGO ORDEN DE PAGO #" + localStorage.id_orden,
          oneTime: false,
          expireIn: 0,
        };
        let detallefinal = "";
        /*Recorremos detalle para crear plantilla del detalle para modelo de correo */
        for (const item of this.cart) {
          let totaldetalle = item.details_quantity * item.details_price;
          detallefinal += HtmlElement.htmldetalle
            .replace("@nombre", item.name)
            .replace("@cantidad", item.details_quantity)
            .replace("@totaldetalle", "$ " + totaldetalle);
        }
        /*fin recorrido*/

        console.log(arr_pay);

        /*Ejecutamos api que genera link de pago payphone */
        const urlPayphone = await api.post(
          "/api/shoppingcar/payphone",
          arr_pay
        );
        /*validamos si el link de pago se genero correctamente */
        if (urlPayphone.data.errorCode === 200) {
          /*Remplazamos las variables del formato html para envio de correo */

        this.aesEncrypt(urlPayphone.data.url)

          let html = HtmlElement.html_body
            .replace("@url_payphone", AppConfig.urlSite+"botonpagomail?urlPago="+urlPayphone.data.url)
            .replace("@detalle", detallefinal)
            .replace(
              "@fecha",
              new Date().toLocaleDateString() +
                " " +
                new Date().toLocaleTimeString()
            )
            .replace("@numeroorden", localStorage.id_orden)
            .replace("@totalcantidad", this.cart.length)
            .replace("@subtotal", subtotal / 100)
            .replace("@impuesto", impuesto / 100)
            .replaceAll("@total", total / 100);


            const data_send_mail = {
              html: html,
              email: localStorage.email,
            };
            await api.post(
              "/api/shoppingcar/sendmail",
              data_send_mail
            );
            //console.log(EventoSendMail);
            this.$refs.loadComponent.close();
            const upd_shop = {
              url_payphone: urlPayphone.data.url,
              status: 2,
              id_shopping_car: localStorage.id_orden
            };
            this.updateShoppingPay(upd_shop).then((data) => {
                if(data.status === 200){
                  this.$router.push('/account/order-history');
                }else{
                  this.$snotify.error("El proceso no pudo ser gestionado", {
                    closeOnClick: false,
                    pauseOnHover: false,
                    timeout: 1000,
                  });
                }
            });
            
        } else {
          console.log(urlPayphone.data);
        }
      } catch (e) {
        //console.log(e);
        this.$refs.loadComponent.close();
      }
    },
    deleteProductFromCart(product) {
      this.$refs.deleteConfirmationDialog.openDialog();
      this.selectDeletedProduct = product;
    },
    onDeleteProductFromCart() {
      this.$refs.deleteConfirmationDialog.close();
      this.$snotify.error("Product Removing from cart", {
        closeOnClick: false,
        pauseOnHover: false,
        timeout: 1000,
      });
      this.$store.dispatch(
        "onDeleteProductFromCart",
        this.selectDeletedProduct
      );
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
  },
};

</script>
<template>


  <div class="emb-cart-wrap emb-card">
    <div class="page-title-bar-car">
      <div class="container">
        <h1 class="mb-4" style="color: #000;">Carrito de compras</h1>
        <p class="font-weight-regular">A continuacion encontrara el detalle de tus productos agregados al carrito.</p>
      </div>
    </div>
    <div class="cart-content section-gap">
      <v-container grid-list-xl py-0>
        <div v-if="cart == ''" class="text-center">
          <div class="text-center">
            <div class="mb-6">
              <img
                alt="cart-empty"
                height="128"
                src="static/images/empty-cart.png"
                width="128"
              />
            </div>
            <h4>Tu Carrito Se Encuentra Vacío</h4>
            <router-link class="primary--text" to="/"
              >Ver Productos</router-link
            >
          </div>
        </div>
        <div v-else class="cart-shop-list">

          <div class="layout justify mt-0 mb-4 mx-0">
            <div class="alert alert-info" role="alert">
                <v-icon class="accent--text">info</v-icon> ALLINONE, te recomineda verificar tus datos de facturacion previo a confirmar la compra, ya que una vez generada la confirmacion la factura se emitira con los datos previmante ingresados
            </div>
          </div>
          
          <div class="emb-card mb-12 pa-6 white">
            <div v-for="(item, index) in cart" :key="index">
              <v-row class="cart-item-wrap">
                <v-col
                  cols="12"
                  sm="12"
                  md="2"
                  class="d-inline-flex align-center justify-center"
                >
                  <img :src="item.url" :alt="item.name_img" width="100" />
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                  class="d-inline-flex align-center justify-center"
                >
                  <div class="text-center">
                    <h5 class="mb-1">{{ item.name }}</h5>
                    <p class="mb-0">{{ item.description }}</p>
                  </div>
                </v-col>
                <v-col
                  cols="5"
                  sm="2"
                  md="1"
                  class="d-inline-flex align-center justify-center"
                >
                  <v-text-field
                    class="d-inline-block"
                    type="number"
                    v-model="item.details_quantity"
                    min="1"
                    max="10"
                    placeholder="Quantity"
                  >
                  </v-text-field>
                </v-col>
                <v-col
                  cols="5"
                  sm="2"
                  md="1"
                  class="d-inline-flex align-center justify-center"
                >
                  <h5 class="mb-0">
                    {{ formatNumber(item.details_price) }}
                  </h5>
                </v-col>
                <v-col
                  cols="6"
                  sm="3"
                  md="2"
                  class="d-inline-flex align-center justify-center"
                >
                  <h4 class="mb-0">
                    <emb-currency-sign></emb-currency-sign>
                    {{ item.details_quantity * item.details_price }}
                  </h4>
                </v-col>
                <v-col
                  cols="2"
                  sm="2"
                  md="2"
                  class="
                    res-float-icon
                    d-inline-flex
                    align-center
                    justify-md-center justify-end
                  "
                >
                  <a
                    class="accent--text remove-cart"
                    @click="deleteProductFromCart(item)"
                    href="javascript:void(0)"
                  >
                    <i class="material-icons font-weight-bold">close </i>
                  </a>
                </v-col>
              </v-row>
            </div>
          </div>
          <v-layout align-center justify-end>
            <vue-snotify></vue-snotify>
            <v-flex xs12 sm12 md5 lg5 xl5 py-0>
              <div class="layout align-center justify-space-between subtotal">
                <p>Subtotal</p>
                <span>
                  <emb-currency-sign></emb-currency-sign>
                  {{ itemTotal }}
                </span>
              </div>
              <div class="layout align-center justify-space-between subtotal">
                <p>Descuento</p>
                <span>
                  <emb-currency-sign></emb-currency-sign>
                  {{ shipping }}
                </span>
              </div>
              <div class="layout align-center justify-space-between subtotal">
                <p>Impuesto</p>
                <span>
                  <emb-currency-sign></emb-currency-sign>
                  {{ tax }}
                </span>
              </div>
              <v-divider class="my-3"></v-divider>
              <div
                class="
                  layout
                  align-center
                  justify-space-between
                  subtotal
                  layout-gap
                "
              >
                <h4>Total</h4>
                <h4>
                  <emb-currency-sign></emb-currency-sign>
                  {{ getTotalPrice }}
                </h4>
              </div>
              <div class="layout justify-end subtotal">
                <v-btn
                  large
                  class="accent mr-0"
                  @click="registraConfirmaShop()"
                  href="javascript:void(0)"
                >
                  Confirmar
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
          <emb-confirmation-component
            ref="confirmationDialog"
            message="Por favor confirmar orden"
            @onConfirm="onRegisterShop"
          >
          </emb-confirmation-component>
          <emb-delete-confirmation
            ref="deleteConfirmationDialog"
            message="¿Desea Eliminar El Producto?"
            @onConfirm="onDeleteProductFromCart"
          >
          </emb-delete-confirmation>

          <emb-load-component
            ref="loadComponent"
            message="Registrando Orden.."
          >
          </emb-load-component>

        </div>
      </v-container>
    </div>
  </div>
</template>