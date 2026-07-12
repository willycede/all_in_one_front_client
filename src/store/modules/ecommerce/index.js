//----------------| Ecommerce Module |------------------//

import { wishlist, cart } from "./data";
import router from "../../../router";
import moment from 'moment';
import api from 'Api';
import { mapFavoriteFromApi, getProductIdFromPayload } from 'Helpers/favorites';
import AppConfig from 'Constants/AppConfig';
import { syncActiveCartToStore } from 'Helpers/cartSync';




const state = {
      cart,
      wishlist,
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
            return api.post('/api/shoppingcar/delete_shoppDetails', {
                  id_details: payload.id_details || payload.id,
                  id_shopping_car: payload.id_shopping_car || localStorage.getItem('id_orden'),
                  id_user: localStorage.getItem('id_users'),
            }).then((response) => {
                  context.commit('onDeleteProductFromCart', payload);
                  return response;
            });
      },
      changeQuantityHandler(context, payload) {
            return context.dispatch('updateCartItemQuantity', payload);
      },
      updateCartItemQuantity(context, payload) {
            const id_user = localStorage.getItem('id_users');
            const quantity = parseInt(payload.details_quantity, 10) || 1;
            const price = parseFloat(payload.details_price) || 0;
            const subtotal = quantity * price;
            const iva = subtotal * AppConfig.porcentajeIVa;
            const total = subtotal + iva;

            return api.post('/api/shoppingcar/create_shoppDetails', {
                  id_user,
                  id_details: payload.id_details,
                  id_shopping_car: payload.id_shopping_car || localStorage.getItem('id_orden'),
                  id_product: payload.id_product,
                  details_quantity: quantity,
                  details_price: price,
                  details_discount: 0,
                  details_subtotal: subtotal,
                  details_iva: iva,
                  details_total: total,
                  id_modifier: payload.id_modifier || null,
                  id_city: payload.id_city || null,
                  status: 1,
            }).then((response) => {
                  context.commit('updateCartItemQuantity', {
                        ...payload,
                        details_quantity: quantity,
                        details_subtotal: subtotal,
                        details_iva: iva,
                        details_total: total,
                  });
                  return response;
            });
      },
      fetchWishlist(context) {
            const id_user = localStorage.getItem('id_users');
            if (!id_user) {
                  context.commit('setWishlist', []);
                  return Promise.resolve([]);
            }
            return api.get(`/api/favorites/${id_user}`).then((response) => {
                  const data = (response && response.data && response.data.data) || [];
                  const items = data.map(mapFavoriteFromApi);
                  context.commit('setWishlist', items);
                  return items;
            });
      },
      addItemToWishlist(context, payload) {
            const id_user = localStorage.getItem('id_users');
            const id_product = getProductIdFromPayload(payload);
            if (!id_user) {
                  return Promise.reject(new Error('LOGIN_REQUIRED'));
            }
            return api.post('/api/favorites/add', { id_user, id_product }).then((response) => {
                  context.commit('addWishlistItem', mapFavoriteFromApi(response.data.data));
            });
      },
      onDeleteProductFromWishlist(context, payload) {
            const id_user = localStorage.getItem('id_users');
            return api.post('/api/favorites/remove', {
                  id_user,
                  id_product: payload.id_product || payload.objectID || payload.id,
                  id_favorite: payload.id_favorite,
            }).then(() => {
                  context.commit('onDeleteProductFromWishlist', payload);
            });
      },
      clearWishlist(context) {
            context.commit('setWishlist', []);
      },
      onPrintFinalReceipt(context, payload) {
            context.commit("onPrintFinalReceipt", payload);
      },
      addAllWishlistItemToCart(context) {
            const items = [...context.state.wishlist];
            if (!items.length) {
                  return Promise.resolve([]);
            }

            const promises = items.map((item) => {
                  const price = parseFloat(item.price) || 0;
                  const quantity = 1;
                  const subtotal = quantity * price;
                  const iva = subtotal * AppConfig.porcentajeIVa;
                  return context.dispatch('addProductToCart', {
                        load_init: false,
                        id_user: localStorage.getItem('id_users'),
                        url: item.image,
                        id_details: 0,
                        name: item.name,
                        id_shopping_car: localStorage.getItem('id_orden') || 0,
                        id_product: item.id_product || item.id,
                        details_quantity: quantity,
                        details_price: price,
                        details_discount: 0,
                        details_subtotal: subtotal,
                        details_iva: iva,
                        details_total: subtotal + iva,
                        status: 1,
                        required_documents_array: [],
                        uploaded_documents: {},
                  });
            });

            return Promise.all(promises).then(() => {
                  context.commit('setWishlist', []);
            });
      },
      makePayment(context, payload) {
            context.commit('makePayment', payload);
      },
      syncActiveCart(context) {
            return syncActiveCartToStore(context);
      },
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
                        id_product: payload.id_product,
                        url: payload.url,
                        name: payload.name,
                        details_price: payload.details_price,
                        details_quantity: payload.details_quantity ? payload.details_quantity : 1,
                        id_modifier: payload.id_modifier || null,
                        modifier_name: payload.modifier_name || null,
                        id_city: payload.id_city || null,
                        total: payload.details_price
      
                  }
      
                  state.cart.push(newProduct);

            } else {

                  /*Verificamos si existen datos en el carrito asociado al usuario que inicio session */

                  getShoppCarByUser(payload.id_user).then((shopcar) => {

                        
                        var id_shopp_car =  ((shopcar.data.data).length > 0) ? shopcar.data.data[0].id_shopping_car : 0;
                     
                        if(id_shopp_car > 0){
      
                              shooping_details = 
                              {
                                    "id_user": payload.id_user,
                                    "id_details": payload.id_details,
                                    "id_shopping_car": id_shopp_car,
                                    "id_product": payload.id_product,
                                    "details_quantity": payload.details_quantity ? payload.details_quantity : 1,
                                    "details_price": payload.details_price,
                                    "details_discount": payload.details_discount,
                                    "details_subtotal": payload.details_subtotal,
                                    "details_iva": payload.details_iva,
                                    "details_total": payload.details_total,
                                    "id_modifier": payload.id_modifier || null,
                                    "id_city": payload.id_city || null,
                                    "status": payload.status
                              };
      
                              RegisShoppingCarDetails(shooping_details).then(() => {
      
                                    newProduct = {
      
                                          id: payload.id_details,
                                          id_product: payload.id_product,
                                          url: payload.url,
                                          name: payload.name,
                                          details_price: payload.details_price,
                                          details_quantity: payload.details_quantity ? payload.details_quantity : 1,
                                          id_modifier: payload.id_modifier || null,
                                          modifier_name: payload.modifier_name || null,
                                          id_city: payload.id_city || null,
                                          total: payload.details_price
                        
                                    }
                        
                                    state.cart.push(newProduct);
      
                              });
      
                        } else {
      
      
                              var shoppcar = {
                                    "id_user": payload.id_user,
                                    "shopping_car_quantity": 0,
                                    "shopping_car_subtotal":  payload.details_subtotal,
                                    "shopping_car_total_discount":payload.details_discount,
                                    "shopping_car_iva": payload.details_iva,
                                    "shopping_car_total": payload.details_total,
                                    "status": 1
                              }
      
                              RegisShoppingCar(shoppcar).then((data) => {
      
                                    var id_shopp = data.data.data[0].id_shopping_car;
      
                                    shooping_details = 
                                    {
                                          "id_user": payload.id_user,
                                          "id_details": payload.id_details,
                                          "id_shopping_car": id_shopp,
                                          "id_product": payload.id_product,
                                          "details_quantity": payload.details_quantity ? payload.details_quantity : 1,
                                          "details_price": payload.details_price,
                                          "details_discount": payload.details_discount,
                                          "details_subtotal": payload.details_subtotal,
                                          "details_iva": payload.details_iva,
                                          "details_total": payload.details_total,
                                          "id_modifier": payload.id_modifier || null,
                                          "id_city": payload.id_city || null,
                                          "status": payload.status
                                    };
      
                                    /* Registramos el detalle*/
                                    RegisShoppingCarDetails(shooping_details).then(() => {
      
                                          newProduct = {
            
                                                id: payload.id_details,
                                                id_product: payload.id_product,
                                                url: payload.url,
                                                name: payload.name,
                                                details_price: payload.details_price,
                                                details_quantity: payload.details_quantity ? payload.details_quantity : 1,
                                                id_modifier: payload.id_modifier || null,
                                                modifier_name: payload.modifier_name || null,
                                                id_city: payload.id_city || null,
                                                total: payload.details_price
                              
                                          }
                              
                                          state.cart.push(newProduct);
            
                                    });
      
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
                              id_modifier: payload.id_modifier || null,
                              modifier_name: payload.modifier_name || null,
                              id_city: payload.id_city || null,
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
            const detailId = payload.id_details || payload.id;
            const index = state.cart.findIndex((item) => (item.id_details || item.id) === detailId);
            if (index > -1) {
                  state.cart.splice(index, 1);
            }
      },
      updateCartItemQuantity(state, payload) {
            const detailId = payload.id_details || payload.id;
            const index = state.cart.findIndex((item) => (item.id_details || item.id) === detailId);
            if (index > -1) {
                  state.cart.splice(index, 1, {
                        ...state.cart[index],
                        ...payload,
                  });
            }
      },

      /**
       * method for adding item to wishlist
      */
      setWishlist(state, items) {
            state.wishlist = items;
      },
      addWishlistItem(state, item) {
            const exists = state.wishlist.some(
                  (wishlistItem) => String(wishlistItem.id_product || wishlistItem.id) === String(item.id_product)
            );
            if (!exists) {
                  state.wishlist.push(item);
            }
      },
      /**
       * method for deleting item from wishlist
      */
      onDeleteProductFromWishlist(state, payload) {
            const productId = payload.id_product || payload.objectID || payload.id;
            const index = state.wishlist.findIndex((item) => {
                  if (payload.id_favorite && item.id_favorite === payload.id_favorite) {
                        return true;
                  }
                  return String(item.id_product || item.id) === String(productId);
            });
            if (index > -1) {
                  state.wishlist.splice(index, 1);
            }
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
