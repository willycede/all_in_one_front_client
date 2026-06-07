import UserPanel from 'Container/UserPanel';

const Cart = () => import('Views/Cart');
const AboutUs = () => import('Views/AboutUs');
const TermCondiition = () => import('Views/TermsAndCondition');
const Faq = () => import('Views/Faq');
const Account = () => import('Views/UserAccount/Account.vue');
const OrderHistory = () => import('Views/UserAccount/OrderHistory.vue');
const Profile = () => import('Views/UserAccount/Profile.vue');
const DataInvoice = () => import('Views/UserAccount/data_invoice.vue');
const Address = () => import('Views/UserAccount/Address.vue');
const Cards = () => import ('Views/UserAccount/Cards.vue');
const EditProfile = () => import ('Views/UserAccount/EditProfile.vue');
const EditAddress = () => import ('Views/UserAccount/EditAddress.vue');
const EditProfileInfo = () => import('Views/UserAccount/EditProfileInfo.vue');
const SecuritySettings = () => import('Views/UserAccount/SecuritySettings.vue');
const UserPreferences = () => import('Views/UserAccount/UserPreferences.vue');
const BlogDetail = () => import('Views/Blogs/BlogDetails');
const ContactUs = () => import('Views/Contact');
const PrivacyPolicy = () => import('Views/PrivacyPolicy');
const ForgotPassword = () => import('Views/Sessions/ForgotPassword');
const ThankYou = () => import('Views/Sessions/ThankYou');
const RedirectPayment = () => import('Views/RedirePay');

//all_in_one
const Register = () => import('Views/all_in_one/client/register/Register');
const Login = () => import('Views/all_in_one/client/login/Login');
const AdminLogin = () => import('Views/all_in_one/client/login/AdminLogin');
const MainPage = () => import('Views/all_in_one/client/mainPage/MainPage');
const ProductDetail = () => import('Views/all_in_one/client/productDetail/ProductDetail');
const ProductWithFilters = () => import('Views/all_in_one/client/products/ProductsWithFilters');
const ValidatePayment = () => import('Views/all_in_one/client/payment/ValidatePayment');
const FavoritesPage = () => import('Views/Favorites');

export default {
	path: '/',
	component: UserPanel,
	redirect:'/mainPage',
	children:[
		{ 
			path: '/mainPage',
			component: MainPage ,
			meta: {
				header: 1
			 }
		},
		{
			path: '/home-two',
			redirect: '/mainPage',
		},
		{
			path: '/home-three',
			redirect: '/mainPage',
		},
		{
			path: '/products/accessories',
			redirect: '/products',
		},
		{ 
			path: '/gadget',
			redirect: '/products',
		},
		// {			
		// 	path: '/products/:title',
		// 	component: Product,
		// 	name: 'Products'
		// },
		{			
			path: '/products',
			component: ProductWithFilters,
		},
		{			
			path: '/products/category/:generalCategoryId',
			component: ProductWithFilters,
		},{			
			path: '/botonpagomail',
			component: RedirectPayment,
		},
		{			
			path: '/botonpagomail/:urlPago',
			component: RedirectPayment,
		},
		{ 
			path: '/payment/ValidatePayment',
			component: ValidatePayment,
			meta: { requiresAuth: true },
		},
		{ 
			path: '/payment/ValidatePayment/:id/:clientTransactionId',
			component: ValidatePayment,
			meta: { requiresAuth: true },
		},
		{
			path: '/checkout/payment',
			redirect: '/cart',
		},
		{ 
			path: '/cart',
			component: Cart,
			meta: { requiresAuth: true },
		},
		{
			path: '/favorites',
			component: FavoritesPage,
			meta: { requiresAuth: true },
		},
		{ 
			path: '/products/:id',
			component: ProductDetail, 
			name:'productDetail'
		},
		{
			path: '/checkout/final-receipt',
			redirect: '/account/order-history',
		},
		{ 
			path: '/about',  
			component: AboutUs, 
			name:'about'
		},
		{ 
			path: '/term-condition',  
			component: TermCondiition, 
			name:'term-condition'
		},
		{ 
			path: '/faq',  
			component: Faq, 
			name:'Faq'
		},
		{ 
			path: '/account',  
			component: Account, 
			name:'Account',
			meta: { requiresAuth: true },
			children: [
				{
					path: '/account/order-history',name:'OrderHistory',component: OrderHistory,
				},
				{
					path: '/account/security', name: 'SecuritySettings', component: SecuritySettings,
				},
				{
					path: '/account/preferences', name: 'UserPreferences', component: UserPreferences,
				},
				{
					path: '/account/profile',name:'Profile',component: Profile,
				},
				{
					path: '/account/data_invoice',name:'DataInvoice',component: DataInvoice,
				},
				{
					path: '/account/address',name:'Address',component: Address,
				},
				{
					path: '/account/cards',name:'Cards',component: Cards,
				},
				{
					path: '/account/profile/edit',name:'EditProfile',component: EditProfile
				},
				{
					path: '/account/profile/edit',name:'EditAddress',component: EditAddress
				},
				{
					path: '/account/profile/edit',name:'EditProfileInfo',component: EditProfileInfo,
				},
        ]
		},
		{ 
			path: '/blog-detail/:id',  
			component: BlogDetail, 
			name:'BlogDetail;'
		},
		{ 
			path: '/contact',  
			component: ContactUs, 
			name:'ContactUs'
		},

		{ 
			path: '/privacy-policy',  
			component: PrivacyPolicy, 
			name:'PrivacyPolicy'
		},
		{ 
			path: '/client/register',  
			component: Register, 
			name:'Register'
		},
		{ 
			path: '/client/login',  
			component: Login, 
			name:'Login'
		},
		{
			path: '/client/admin-login',
			component: AdminLogin,
			name: 'AdminLogin',
		},
		{ 
			path: '/session/forgot-password',  
			component: ForgotPassword, 
			name:'ForgotPassword'
		},
		{ 
			path: '/session/thank-you',  
			component: ThankYou, 
			name:'ThankYou'
		},
	]
}