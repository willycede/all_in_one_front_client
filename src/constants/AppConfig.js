//=======================| App Configuration |========================//
export default {
	appLogo: '/static/images/logo2.png', 
	appLogoDark: '/static/images/logo2.png',                         // App Logo,
	brand: 'Embryo',                                        		   // Brand Name
	copyrightText: '© All Rights Reversed | Made With Love by All in one team',     // Copyright Text
	//theme color
	porcentajeIVa:0.12,
	color: {
      primary: '#00006B',
      accent : '#0068FF',
	},
	apiUrl: process.env.VUE_APP_NODE_ENV == 'production' ? 'http://3.14.140.168:3500' :  'http://localhost:3500',
	algoliaApiKey: '6be0576ff61c053d5f9a3225e2a90f76',

	//configuracion correo
	FROM_NAME:'',
	YOUR_SERVICE_ID:'service_wh7v39w',
	YOUR_TEMPLATE_ID:'template_icwodxx',
	YOUR_PUBLIC_KEY:'VdJzJ4cB7eeM5cPnm',

	/*Configuracion Payphone*/
	URL_API_PAYPHONE:'http://localhost:8081/api/Links',
	TOKEN_PAYPHONE:'UOZGAgkXtoJc7mkXh_tIYP2rN4lWkZCoBZ4RuGkYvAZhQ0TLBsmHjWlYW8M3Mqub0ny9XxxzX3TaQDKSrxQ1DTtYGrdJQZI3O0-RcCLiEZS-XJxoe4hpTXc-qSY-t3dV0VamQJYxFQYJtk029dMSg8B4bZkhtkJY5oykhYMzcfp-YhZ5betjIYxHzAwLDD8pi0R3ezsDzk-gOZQFYGVvsIcBxjb9LzoJw0DyCXHLz-w6jpMdjux4eaXS_97o25Sj8xWFIbMmzh8S7mDGIsbaq9UVJLHtYaevliR0Fyd2sqlHWxm5rFiGBes6SRU3mtagqHoZYA'

}
