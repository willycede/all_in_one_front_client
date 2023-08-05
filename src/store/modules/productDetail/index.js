import { products } from "./data";
import api from 'Api'

const state = {
   products,
}

// getters
const getters = {
   products: state => {
      return state.products
   },
}

// actions 
const actions = {
   getProducts(context) {
      context.commit('getProductsHandler')
   }
}

// mutations
const mutations = {
   getProductsHandler() {
      api
         .get("products.json")
         .then(response => {
            state.products = response.data;
            // console.log(state.products);s
         })
         .catch(error => {
            console.log(error);
         });
   },
}

export default {
   state,
   getters,
   actions,
   mutations
}
