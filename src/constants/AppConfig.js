//=======================| App Configuration |========================//

const normalizeSiteUrl = (value, fallback) => {
	const base = (value || fallback || 'http://localhost:8080').replace(/\/+$/, '');
	return `${base}/`;
};

const siteUrl = normalizeSiteUrl(
	process.env.VUE_APP_SITE,
	process.env.VUE_APP_NODE_ENV === 'production' ? 'https://aioecuador.com' : 'http://localhost:8080'
);

const buildPayphoneRedirectUrl = (payphoneUrl) => (
	`${siteUrl}botonpagomail?urlPago=${encodeURIComponent(payphoneUrl)}`
);

export default {
	appLogo: '/static/images/logo/AIO_LOGO_NAME_BLACK&COLOR.png',
	appLogoFooter: '/static/images/logo/AIO_LOGO_NAME_ALL_WHITE.png',
	appLogoDark: '/static/images/logo/AIO_LOGO_NAME_ALL_WHITE.png',
	logo: {
		// Imagen original: 3840 × 2160 px (16:9)
		aspectRatio: 16 / 9,
		height: 46,
		heightCompact: 38,
		heightFooter: 48,
		maxWidth: 220,
		maxWidthCompact: 168,
	},
	brand: 'All in One',
	copyrightText: '© 2026 All in One. Todos los derechos reservados.',
	porcentajeIVa:0.15,
	color: {
      primary: '#A96DFA',
      accent: '#CA1DFF',
	},
	apiUrl: process.env.VUE_APP_NODE_ENV == 'production' ? process.env.VUE_APP_API :  'http://localhost:3500',
	algoliaApiKey: '6be0576ff61c053d5f9a3225e2a90f76',
	siteUrl,
	urlSite: siteUrl,
	emailLogoUrl: `${siteUrl}static/images/logo/AIO_LOGO_NAME_ALL_WHITE.png`,
	buildPayphoneRedirectUrl,

	//configuracion correo
	FROM_NAME:'',
	YOUR_SERVICE_ID:'service_wh7v39w',
	YOUR_TEMPLATE_ID:'template_icwodxx',
	YOUR_PUBLIC_KEY:'VdJzJ4cB7eeM5cPnm',

	/*Configuracion Payphone*/
	URL_API_PAYPHONE:'http://localhost:8081/api/Links',
	TOKEN_PAYPHONE:'UOZGAgkXtoJc7mkXh_tIYP2rN4lWkZCoBZ4RuGkYvAZhQ0TLBsmHjWlYW8M3Mqub0ny9XxxzX3TaQDKSrxQ1DTtYGrdJQZI3O0-RcCLiEZS-XJxoe4hpTXc-qSY-t3dV0VamQJYxFQYJtk029dMSg8B4bZkhtkJY5oykhYMzcfp-YhZ5betjIYxHzAwLDD8pi0R3ezsDzk-gOZQFYGVvsIcBxjb9LzoJw0DyCXHLz-w6jpMdjux4eaXS_97o25Sj8xWFIbMmzh8S7mDGIsbaq9UVJLHtYaevliR0Fyd2sqlHWxm5rFiGBes6SRU3mtagqHoZYA'

}
