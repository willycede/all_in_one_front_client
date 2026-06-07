import Admin from 'Container/Adminpanel.vue';

const Reports = () => import('Views/AdminPanel/Reports.vue');
const Invoice = () => import('Views/AdminPanel/Invoices.vue');
const AdminOrders = () => import('Views/AdminPanel/Orders.vue');
const AdminAccount = () => import('Views/AdminPanel/Account.vue');
const Collaboration = () => import('Views/AdminPanel/Collaboration.vue');
const AccountSetting = () => import('Views/AdminPanel/AccountSetting.vue');
const AdminProfile = () => import('Views/AdminPanel/Profile.vue');
const AdminEditProfileInfo = () => import('Views/AdminPanel/EditProfileInfo.vue');
const AdminProducts = () => import('Views/AdminPanel/Products.vue');
const AdminProductsAdd = () => import('Views/AdminPanel/ProductsAdd.vue');
const AdminProductsEdit = () => import('Views/AdminPanel/ProductsEdit.vue');
const DocumentReview = () => import('Views/AdminPanel/DocumentReview.vue');
const AdminCoupons = () => import('Views/AdminPanel/Coupons.vue');
const PrivacyPolicy = () => import('Views/PrivacyPolicy');

export default {
	path: '/admin-panel',
	component: Admin,
	redirect:'/admin-panel/reports',
	meta: { requiresAdmin: true },
	children:[
		{ 
			path: 'reports',  
			component: Reports, 
			name:'Reports'
		},
		{ 
			path: 'orders',  
			component: AdminOrders, 
			name:'AdminOrders'
		},
		{ 
			path: 'invoices',  
			component: Invoice, 
			name:'Invoice'
		},
		{ 
			path: 'products',  
			component: AdminProducts, 
			name:'AdminProducts'
		},
		{ 
			path: 'product-add',
			component: AdminProductsAdd, 
			name:'AdminProductsAdd'
		},
		{
			path: 'coupons',
			component: AdminCoupons,
			name: 'AdminCoupons',
		},
		{
			path: 'documents',
			component: DocumentReview,
			name: 'AdminDocumentReview',
		},
		{
			path: 'product-edit/:id',
			component: AdminProductsEdit,
			name:'ProductsEdit',
		},
		{ 
			path: 'account/profile',
			component: AdminAccount, 
			name:'Profile1',
			children: [
				{
					path: '/admin-panel/account/profile',name:'AdminProfile',component: AdminProfile,
				},
				{
					path: '/admin-panel/account/collaboration',name:'Collaboration',component: Collaboration,
				},
				{
					path: '/admin-panel/account/settings',name:'AccountSetting',component: AccountSetting,
				},
				{
					path: '/admin-panel/account/profile/:title',name:'AdminEditProfileInfo',component: AdminEditProfileInfo,
				},
         ],
		},

		{ 
			path: 'privacy-policy',  
			component: PrivacyPolicy, 
			name:'PrivacyPolicy1'
		}
	]
}

