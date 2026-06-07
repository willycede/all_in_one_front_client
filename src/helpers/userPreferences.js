import api from 'Api';

const LOCALE_MAP = {
	en: { name: 'English', locale: 'en' },
	fr: { name: 'Français', locale: 'fr' },
	sp: { name: 'Español', locale: 'sp' },
	jp: { name: '日本語', locale: 'jp' },
	gr: { name: 'Deutsch', locale: 'gr' },
};

const CURRENCY_MAP = {
	USD: { title: 'USD', symbol: '$', img: '/static/images/united-states.png' },
	EUR: { title: 'EUR', symbol: '€', img: '/static/images/france.png' },
	GBP: { title: 'GBP', symbol: '£', img: '/static/images/united-kingdom.png' },
};

export async function fetchUserPreferences(idUser) {
	if (!idUser) return null;
	const response = await api.get(`/api/users/preferences/${idUser}`);
	return response && response.data && response.data.data;
}

export async function saveUserPreferences(payload) {
	const response = await api.put('/api/users/preferences', payload);
	return response && response.data && response.data.data;
}

export function applyPreferencesToApp(store, i18n, prefs) {
	if (!prefs) return;

	if (prefs.locale && LOCALE_MAP[prefs.locale]) {
		i18n.locale = prefs.locale;
		store.commit('changeLanguageHandler', LOCALE_MAP[prefs.locale]);
	}

	if (prefs.currency && CURRENCY_MAP[prefs.currency]) {
		store.commit('changeCurrency', CURRENCY_MAP[prefs.currency]);
	}

	localStorage.setItem('aio_user_prefs', JSON.stringify(prefs));
}

export function getStoredPreferences() {
	try {
		return JSON.parse(localStorage.getItem('aio_user_prefs') || 'null');
	} catch (error) {
		return null;
	}
}

export { LOCALE_MAP, CURRENCY_MAP };
