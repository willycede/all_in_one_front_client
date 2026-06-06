import api from 'Api';
import Vue from "vue";
import { moneyMask } from "../../../../helpers/helpers"

const state =  Vue.observable({
   productList: [],
   selectedProduct: {},
}); 


// getters
const getters = {
    productList: state => {
      return state.productList;
   },
   selectedProduct: state => {
      return state.selectedProduct;
   }
}

// actions
const actions = {
   async getRandomProducts(context) {
        const products = await api.get('/api/products/get/randomProducts');
        if(products?.data?.data &&  products?.data?.data.length > 0) {
            products?.data?.data.forEach((product) => { product.price = moneyMask(product.price)});
        }
        context.commit('onGetRandomProducts', products?.data?.data);
   },
   async getProductsByCategoryIdAndFilters(context, data) 
   {  
      const products = await api.get(`/api/products/${data.categoryId}`,{ params: {searchBy:  data.searchBy} });
      const list = products?.data?.data || [];
      if (list.length > 0) {
         list.forEach((product) => { product.price = moneyMask(product.price); });
      }
      context.commit('onGetAllProducts', list);
   },
   async getProductsBId(context, data) 
   {  
      const productId = data;
      const products = await api.get(`/api/products/by_product_id/${productId}`);
      if (products?.data?.data && products?.data?.data.length > 0) {
        context.commit('selectProductHandler', products?.data?.data[0]);
      }
   },
   setSelectedProduct(context, payload) {
      context.commit('selectProductHandler', payload);
   },
   async setSelectedProductById(context, payload) {
      const products = await api.get('/api/products/get/randomProducts');
      context.commit('onGetRandomProducts', products?.data?.data);
      context.commit('setSelectedProductById', payload);
   },
   
   /*async getRandomProducts(context) {
      const products = await api.get('/api/products/get/randomProducts');
      context.commit('onGetRandomProducts', products?.data?.data); 
   },*/
}

// mutations
const mutations = {
   onGetRandomProducts(state, products) {
        state.productList = products;
   },
   onGetAllProducts(state, products) {
      state.productList = products || [];
   },
   selectProductHandler(state, product) {
      state.selectedProduct = product;
   },
   setSelectedProductById(state, productId) {
      const products = state.productList;
      const foundProduct = products.filter(product => parseInt(product.id_products) == parseInt(productId));
      state.selectedProduct = foundProduct[0];
   },
}

export default {
   state,
   getters,
   actions,
   mutations
}
