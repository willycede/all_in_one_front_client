
import {languages, currencies} from "./data";

const state = {
	languages,
	selectedLocale: languages[0],
	currencies,
	selectedCurrency: currencies[0],
	rtlLayout: false
	
}

// getters
const getters = {
	languages: state => {
		return state.languages;
	},
	selectedLocale: state => {
		return state.selectedLocale;
	},
	currencies: state =>{
		return state.currencies;
	},
	selectedCurrency: state => {
		return state.selectedCurrency;
	},
	rtlLayout: state =>{
		return state.rtlLayout;
	}
}

// actions
const actions = {
	changeLanguage(context, payload) {
		context.commit('changeLanguageHandler', payload);
	},
	changeCurrency(context, payload){
		context.commit('changeCurrency', payload);
	},
	changeRtlLayout(context){
		context.commit('rtlLayoutHandler');
	},
	loadUserPreferences(context) {
		const idUser = localStorage.getItem('id_users');
		if (!idUser) return Promise.resolve(null);

		return import('Helpers/userPreferences').then(({ fetchUserPreferences, getStoredPreferences, LOCALE_MAP, CURRENCY_MAP }) => {
			const applyToStore = (prefs) => {
				if (!prefs) return prefs;
				localStorage.setItem('aio_user_prefs', JSON.stringify(prefs));
				if (prefs.locale && LOCALE_MAP[prefs.locale]) {
					context.commit('changeLanguageHandler', LOCALE_MAP[prefs.locale]);
				}
				if (prefs.currency && CURRENCY_MAP[prefs.currency]) {
					context.commit('changeCurrency', CURRENCY_MAP[prefs.currency]);
				}
				return prefs;
			};

			return fetchUserPreferences(idUser)
				.then((prefs) => applyToStore(prefs || getStoredPreferences()))
				.catch(() => applyToStore(getStoredPreferences()));
		});
	},
}

// mutations
const mutations = {
	/**
    * method for setting language state
   */
	changeLanguageHandler(state, language) {
		state.selectedLocale = language;
	},
	/**
    * method for setting currency
   */
	changeCurrency(state, currencies){
		state.selectedCurrency = currencies;
	},
	/**
    * method for setting rtl layout
   */
	rtlLayoutHandler(state){
		state.rtlLayout = !state.rtlLayout;
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}
