import api from 'Api';

const state = {
   generalCategories: [],
}


// getters
const getters = {
   generalCategories: state => {
      return state.generalCategories;
   }
}

// actions
const actions = {
    async getGeneralCategories(context) {
        const generalCategories = await api.get('/api/generalCategories/getGeneralCategories');
        context.commit('onGetGeneralCategories', generalCategories?.data?.data);
     },
}

// mutations
const mutations = {
    onGetGeneralCategories(state, generalCategories) {
        state.generalCategories = generalCategories;
     },
}

export default {
   state,
   getters,
   actions,
   mutations
}
