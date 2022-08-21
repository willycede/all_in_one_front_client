<template>
  <div class="emb-cart-wrap emb-card">
    <div class="page-title-bar-car">
      <div class="container">
        <h1 class="mb-4">Shopping Car</h1>
        <p class="white--text font-weight-regular">Detalle de compra</p>
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
            <h4>Your Shopping Bag is empty</h4>
            <router-link class="primary--text" to="/"
              >Go to Shopping</router-link
            >
          </div>
        </div>
        <div v-else class="cart-shop-list">
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
          <emb-delete-confirmation
            ref="deleteConfirmationDialog"
            message="Are you sure you want to delete this product?"
            @onConfirm="onDeleteProductFromCart"
          >
          </emb-delete-confirmation>
        </div>
      </v-container>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import axios from 'axios';
import emailjs from '@emailjs/browser';
import api from "Api";
import AppConfig from '../constants/AppConfig';

export default {
  data() {
    return {
      //cart: [],
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


    const shopCart = await api.get(
      "/api/shoppingcar/get_shop/" + localStorage.id_users
    );

    let cartsshop = ((shopCart.data.data).length > 0) ? (shopCart.data.data)[0].id_shopping_car :0 ;

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
    getTotalPrice() {
      let totalPrice = this.tax + this.shipping;
      if (this.cart.length > 0) {
        for (const item of this.cart) {
          totalPrice += item.details_price * item.details_quantity;
        }
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
    async registraConfirmaShop() {


      const arr_pay = {
        'amount':5060,
        'tax':600,
        'amountWithTax':5000,
        'currency':'USD',
        'clientTransactionId':'1@14563',
        'reference':'PAGO ORDEN DE PAGO #'
      }

      const payload = JSON.stringify(arr_pay);
      /*
      axios.defaults.headers.common = {
          //'Access-Control-Allow-Origin': '*',
          "Content-Type": 'application/json',
          "Authorization": 'Bearer ' + AppConfig.TOKEN_PAYPHONE
      };*/
     
      //axios.defaults.crossDomain = true;

      var config = {
        method: 'post',
        url: 'https://pay.payphonetodoesposible.com/api/Links',
        headers: { 
          "Authorization": 'Bearer ' + AppConfig.TOKEN_PAYPHONE,
          'Content-Type': 'application/json'//, 
          //'Cookie': 'ARRAffinity=3616f83a67001ded82ad968765451192706e5d85a8a318ef9103ad4b134204a0; ARRAffinitySameSite=3616f83a67001ded82ad968765451192706e5d85a8a318ef9103ad4b134204a0'
        },
        data : payload
      };

      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });


      /*
      axios.post('https://pay.payphonetodoesposible.com/api/Links',arr_pay,{
        headers: {
           "Access-Control-Allow-Origin": "*",
           "Authorization": 'Bearer ' + AppConfig.TOKEN_PAYPHONE
         }
      }).then(response =>{
        console.log(response)
      })
      .catch(() => {
        console.log('dassadasdasdasdasd');
      })
      */
     
      //let response = await axios.post(AppConfig.URL_API_PAYPHONE,{payload});

      


        //console.log(response);
        

      const cod = {
        "from_name":"PRuebas",
        "email_to":localStorage.email,
        "orden_ped":"8",
        "html": "<div style='margin-bottom: 5px;'> <label><strong>Estimad@ </strong> </label> Jonathan Eduardo Mayorga, agradecemos su compra a continuacion encontrara el link para realizar el pago</div> "+
        "</br> "+
            "<div style='margin-bottom: 5px;'> <label><strong>IVA 12% : </strong> </label>$ 84.72</div> "+
            "<div style='margin-bottom: 25px;'> <label><strong>Total a Pagar :</strong> </label>$ 790.72</div> "+
            "<a style='padding: 10px;background: #007239;  color: #FFF;  text-decoration: none;   cursor: pointer;   border-radius: 5px;' href='https://ppls.me/QyjPcdoknbocBq8IpdZXxw'>PAGAR</a>"
      }

      emailjs.send(AppConfig.YOUR_SERVICE_ID, AppConfig.YOUR_TEMPLATE_ID, cod, AppConfig.YOUR_PUBLIC_KEY)
      .then((result) => {
          console.log('SUCCESS!', result.text);
      }, (error) => {
          console.log('FAILED...', error.text);
      });

    },
    deleteProductFromCart(product) {
      console.log(product);

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
  },

  /*mounted: function () {
        
      const shopCart = await api.get('/api/shoppingcar/get_shop/1');
      console.log(shopCart);

   }*/
};
</script>

