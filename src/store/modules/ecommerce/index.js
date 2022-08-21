//----------------| Ecommerce Module |------------------//

import { wishlist, cart } from "./data";
import router from "../../../router";
import moment from 'moment';
import api from 'Api';




const state = {
      cart,
      wishlist,
      tax: 27.95,
      shipping: 12.95,
      invoiceData: {
            products: [],
            orderId: '',
            transactionId: '',
            orderedDate: '',
            delevieryDate: '',
      }
}



// getters
const getters = {
      cart: state => {
            return state.cart;
      },
      wishlist: state => {
            return state.wishlist;
      },
      tax: state => {
            return state.tax;
      },
      shipping: state => {
            return state.shipping;
      },
      invoiceData: state => {
            return state.invoiceData;
      },
      cartItem: state => {
            return state.cartItem;
      },
      indexOfItem: state => {
            return state.indexOfItem;
      }
}

// actions
const actions = {
      addSetToCart(context, payload){
            context.commit('onSetToCart', payload);
      },

      addProductToCart(context, payload) {
            context.commit('onAddProductToCart', payload);
      },

      addProductToCartInit(context, payload) {
            context.commit('onAddProductToCartInit', payload);
      },

      onDeleteProductFromCart(context, payload) {
            context.commit("onDeleteProductFromCart", payload);
      },
      changeQuantityHandler(context, payload) {
            context.commit('onChangeQuantityHandler', payload);
      },
      addItemToWishlist(context, payload) {
            context.commit('onAddItemToWishlist', payload);
      },
      onDeleteProductFromWishlist(context, payload) {
            context.commit("onDeleteProductFromWishlist", payload);
      },
      onPrintFinalReceipt(context, payload) {
            context.commit("onPrintFinalReceipt", payload);
      },
      addAllWishlistItemToCart(context) {
            context.commit("addAllWishlistItemToCart");
      },
      makePayment(context, payload) {
            context.commit('makePayment', payload);
      }
}

// mutations
const mutations = {
      onSetToCart(state, payload) {
            state.cart = payload
      },

      onAddProductToCart(state, payload) {

            let newProduct = {};
            var shooping_details = {};
           
           

            if(payload.load_init){

                  newProduct = {

                        id: payload.id_details,
                        url: payload.url,
                        name: payload.name,
                        details_price: payload.details_price,
                        details_quantity: payload.details_quantity ? payload.details_quantity : 1,
                        total: payload.details_price
      
                  }
      
                  state.cart.push(newProduct);

            } else {

                  /*Verificamos si existen datos en el carrito asociado al usuario que inicio session */

                  getShoppCarByUser(payload.id_user).then((shopcar) => {

                        
                        var id_shopp_car =  ((shopcar.data.data).length > 0) ? shopcar.data.data[0].id_shopping_car : 0;
                        console.log(id_shopp_car);

                        if(id_shopp_car > 0){
      
                              shooping_details = 
                              {
                                    "id_details": payload.id_details,
                                    "id_shopping_car": id_shopp_car,
                                    "id_product": payload.id_product,
                                    "details_quantity": payload.details_quantity ? payload.details_quantity : 1,
                                    "details_price": payload.details_price,
                                    "details_discount": payload.details_discount,
                                    "details_subtotal": payload.details_subtotal,
                                    "details_iva": payload.details_iva,
                                    "details_total": payload.details_total,
                                    "status": payload.status
                              };
      
                              RegisShoppingCarDetails(shooping_details).then(() => {
      
                                    newProduct = {
      
                                          id: payload.id_details,
                                          url: payload.url,
                                          name: payload.name,
                                          details_price: payload.details_price,
                                          details_quantity: payload.details_quantity ? payload.details_quantity : 1,
                                          total: payload.details_price
                        
                                    }
                        
                                    state.cart.push(newProduct);
      
                              });
      
                        } else {
      
                              console.log("Por aca");
      
      
                              var shoppcar = {
                                    "id_user": payload.id_user,
                                    "shopping_car_quantity": 0,
                                    "shopping_car_subtotal": 300,
                                    "shopping_car_iva": 14.30,
                                    "shopping_car_total": 400,
                                    "status": 1
                              }
      
                              RegisShoppingCar(shoppcar).then((data) => {
      
                                    var id_shopp = data.data.data[0].id_shopping_car;
      
                                    shooping_details = 
                                    {
                                          "id_details": payload.id_details,
                                          "id_shopping_car": id_shopp,
                                          "id_product": payload.id_product,
                                          "details_quantity": payload.details_quantity ? payload.details_quantity : 1,
                                          "details_price": payload.details_price,
                                          "details_discount": payload.details_discount,
                                          "details_subtotal": payload.details_subtotal,
                                          "details_iva": payload.details_iva,
                                          "details_total": payload.details_total,
                                          "status": payload.status
                                    };
      
                                    /* Registramos el detalle*/
                                    RegisShoppingCarDetails(shooping_details).then(() => {
      
                                          newProduct = {
            
                                                id: payload.id_details,
                                                url: payload.url,
                                                name: payload.name,
                                                details_price: payload.details_price,
                                                details_quantity: payload.details_quantity ? payload.details_quantity : 1,
                                                total: payload.details_price
                              
                                          }
                              
                                          state.cart.push(newProduct);
            
                                    });
      
                                    console.log(shooping_details);
      
                              });
      
                             
                              
                        }


                  });


                  

                  

                  /*
                  api.post('/api/shoppingcar/create_shoppDetails', shooping_details)
                    .then((e) => {

                        console.log(e)

                        newProduct = {

                              id: payload.id_details,
                              url: payload.url,
                              name: payload.name,
                              details_price: payload.details_price,
                              details_quantity: payload.details_quantity ? payload.details_quantity : 1,
                              total: payload.details_price
            
                        }
            
                        state.cart.push(newProduct);


                    }).catch((err) => {

                        console.log(err);

                        let defaultErrorMessage = err?.response?.data?.error?.message ? err?.response?.data?.error?.message :  'Ocurrio un error inesperado'; 
                        if (Object.keys(err?.response?.data?.error?.validationObject).length > 0) {
                            
                              console.log(err);

                            return;
                        }
                        
                        console.log(defaultErrorMessage)

                    });
                    */

            }

      },

      /**
       * method for deleting product to cart
      */
      onDeleteProductFromCart(state, payload) {
            let index = state.cart.indexOf(payload);
            state.cart.splice(index, 1);
      },

      /**
       * method for adding item to wishlist
      */
      onAddItemToWishlist(state, payload) {
            let newItem = {
                  id: payload.objectID,
                  image: payload.image,
                  name: payload.name,
                  price: payload.price,
                  quantity: 1,
                  total: payload.price
            }
            state.wishlist.push(newItem);
      },
      /**
       * method for deleting item from wishlist
      */
      onDeleteProductFromWishlist(state, payload) {
            let index = state.wishlist.indexOf(payload);
            state.wishlist.splice(index, 1);
      },

      /**
       * method for adding all wishlist item to cart
      */
      addAllWishlistItemToCart(state) {
            if (state.wishlist && state.wishlist.length > 0) {
                  for (const wishlistItem of state.wishlist) {
                        state.cart.push(wishlistItem);
                  }
            }
            state.wishlist = [];
      },
      /**
       * method to calcualte Order Id , transcation Id, ordered date , delivery date 
      */
      makePayment(state, products) {
            state.invoiceData.products = products;
            state.invoiceData.orderId = '312134645432132132',
                  state.invoiceData.transactionId = new Date().getTime() - 10000,
                  state.invoiceData.orderedDate = moment().format('MMMM DD, YYYY'),
                  state.invoiceData.deliveryDate = moment().add(5, 'days').format('MMMM DD, YYYY')
            state.cart = [];
            router.push('/checkout/final-receipt')
      }
}


async function RegisShoppingCar(shoopingcar) {
      return await api.post('/api/shoppingcar/create_shopp', shoopingcar);
}

async function RegisShoppingCarDetails(shooping_details) {
      return await api.post('/api/shoppingcar/create_shoppDetails', shooping_details);
}

async function getShoppCarByUser(id_user) {
      return await api.get('/api/shoppingcar/get_shop/'+id_user);
}


export default {
      state,
      getters,
      //setters,
      actions,
      mutations
}
