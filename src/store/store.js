/**
* VueShop Store
*/

import Vue from 'vue'
import Vuex from 'vuex'

// modules
import ecommerce from './modules/ecommerce';
import sidebar from './modules/sidebar';
import settings from './modules/settings';
import payment from './modules/payment';
import blog from './modules/blog';
import productDetail from './modules/productDetail';
import categories from './modules/client/categories';
import companies from './modules/client/companies'

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        ecommerce,
        sidebar,
        settings,
        payment,
        blog,
        productDetail,
        categories,
        companies,
    }
})
