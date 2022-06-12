import api from 'Api';

const state = {
   productList: [],
}


// getters
const getters = {
    productList: state => {
      return state.productList;
   }
}

// actions
const actions = {
    async getRandomProducts(context) {
        const products = await api.get('/api/products/get/randomProducts');
        context.commit('onGetRandomProducts', products?.data?.data);
     },
}

// mutations
const mutations = {
    onGetRandomProducts(state, products) {
        state.productList = products;
     },
}

export default {
   state,
   getters,
   actions,
   mutations
}
