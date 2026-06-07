/**
 * App Entry File
 * Copyright 2018. All Rights Reserved
 */
/* eslint-disable */
import 'babel-polyfill'
import Vue from 'vue'
import vuetify from '@/plugins/vuetify'
import Nprogress from 'nprogress'
import { isUserLoggedIn, requiresAuthentication, requiresAdmin, isAdminUser, isGuestOnlyRoute, resolveAuthenticatedHome, ADMIN_LOGIN_PATH } from 'Helpers/auth'
import VueI18n from 'vue-i18n'
import Snotify, { SnotifyPosition } from 'vue-snotify'
import InstantSearch from 'vue-instantsearch'
import VueMoment from 'vue-moment'
import App from './App.vue'
import { store } from './store/store'
import AppConfig from 'Constants/AppConfig'

// add this
import './index.css'

// localisation messages
import messages from './lang'

// global components
import GlobalComponents from './globalComponents'

//router 
import router from './router'

import money from 'v-money'

// all css files included
import './lib/EmbryoCss'

// Alliging Position for the toaster
const options = {
	toast: {
		position: SnotifyPosition.rightTop,
		timeout: 4500,
		showProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		bodyMaxLength: 220,
	},
};

//plugins
Vue.use(VueMoment)
Vue.use(InstantSearch)
Vue.use(VueI18n)
Vue.use(Snotify, options)
Vue.use(money, {precision: 4})
Vue.use(GlobalComponents)

Nprogress.configure({ showSpinner: false, trickleSpeed: 180, minimum: 0.15 });

function isSamePathQueryNavigation(to, from) {
	return to.path === from.path;
}

// router navigation guards
router.beforeEach((to, from, next) => {
	if (!isSamePathQueryNavigation(to, from)) {
		Nprogress.start();
	}

	if (requiresAuthentication(to) && !isUserLoggedIn()) {
		next({ path: '/client/login', query: { redirect: to.fullPath } });
		return;
	}

	if (isGuestOnlyRoute(to) && isUserLoggedIn()) {
		next(resolveAuthenticatedHome(to.query.redirect));
		return;
	}

	if (to.path === ADMIN_LOGIN_PATH && isAdminUser()) {
		next({ path: '/admin-panel/reports' });
		return;
	}

	if (requiresAdmin(to) && !isAdminUser()) {
		if (isUserLoggedIn()) {
			next({ path: '/mainPage', query: { denied: 'admin' } });
			return;
		}
		next({ path: ADMIN_LOGIN_PATH, query: { redirect: to.fullPath } });
		return;
	}

	next();
})

router.afterEach((to, from) => {
	if (!isSamePathQueryNavigation(to, from)) {
		Nprogress.done();
		setTimeout(() => {
			const contentWrapper = document.querySelector('html');
			if (contentWrapper !== null) {
				contentWrapper.scrollTop = 0;
			}
		}, 200);
	} else {
		Nprogress.done();
	}
})

// creating a instance of vue localisation module
const i18n = new VueI18n({
	locale: store.getters.selectedLocale.locale,
	fallbackLocale: 'en',
	messages,
})


Vue.config.productionTip = false

new Vue({
	store,
	router,
	i18n,
	vuetify,
	render: h => h(App)
}).$mount('#app')