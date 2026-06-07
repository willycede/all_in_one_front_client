import Vue from 'vue';

const GOOGLE_MAPS_KEY = 'AIzaSyDC6tKEbtRlB6B0HgrFEN9P6ztTSJ89xt8';

let loadPromise = null;

export function ensureGoogleMaps() {
	if (loadPromise) {
		return loadPromise;
	}

	loadPromise = import('vue2-google-maps').then((VueGoogleMaps) => {
		Vue.use(VueGoogleMaps, {
			load: {
				key: GOOGLE_MAPS_KEY,
				libraries: 'places',
			},
		});
	});

	return loadPromise;
}
