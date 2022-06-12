import api from 'Api';

const state = {
   categories: [],
}


// getters
const getters = {
   categories: state => {
      return state.categories;
   }
}

// actions
const actions = {
    async getCategories(context) {
        const categories = await api.get('/api/categories/getCategories/1');
        context.commit('onGetCategories', categories);
     },
}

// mutations
const mutations = {
    onGetCategories(state, categories) {
        state.categories = categories;
     },
}

export default {
   state,
   getters,
   actions,
   mutations
}
