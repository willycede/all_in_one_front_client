import api from 'Api';

const state = {
   companies: [],
}


// getters
const getters = {
   companies: state => {
      return state.companies;
   }
}

// actions
const actions = {
    async getCompanies(context) {
        const companies = await api.get('/api/company');
        context.commit('onGetCompanies', companies?.data?.data);
     },
}

// mutations
const mutations = {
    onGetCompanies(state, companies) {
        state.companies = companies;
     },
}

export default {
   state,
   getters,
   actions,
   mutations
}
