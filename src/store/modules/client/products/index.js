import api from 'Api';

const state = {
   productList: [],
   selectedProduct: {},
}


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
        context.commit('onGetRandomProducts', products?.data?.data);
   
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
   selectProductHandler(state, product) {
      state.selectedProduct = product;
   },
   setSelectedProductById(state, productId) {
      const products = state.productList;
      console.log(products, "prrr")
      const foundProduct = products.filter(product => parseInt(product.id_products) == parseInt(productId));
      console.log(foundProduct, "Sdsdsds",parseInt(productId) )
      state.selectedProduct = foundProduct[0];
   },
}

export default {
   state,
   getters,
   actions,
   mutations
}
