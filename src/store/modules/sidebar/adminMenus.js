/* eslint-disable */
export const adminPanelMenus = [
	{
		path: '/admin-panel/reports',
		labelKey: 'admin.nav.reports',
		icon: 'poll',
		children: null,
	},
	{
		path: '/admin-panel/orders',
		labelKey: 'admin.nav.orders',
		icon: 'shopping_bag',
		children: null,
	},
	{
		path: '/admin-panel/invoices',
		labelKey: 'admin.nav.invoices',
		icon: 'receipt_long',
		children: null,
	},
	{
		path: '/admin-panel/billing-settings',
		labelKey: 'admin.nav.billing',
		icon: 'settings_suggest',
		children: null,
	},
	{
		path: '/admin-panel/users',
		labelKey: 'admin.nav.users',
		icon: 'people',
		children: null,
	},
	{
		path: '/admin-panel/audit-logs',
		labelKey: 'admin.nav.auditLogs',
		icon: 'history',
		children: null,
	},
	{
		path: '/admin-panel/documents',
		labelKey: 'admin.nav.documents',
		icon: 'description',
		children: null,
	},
	{
		path: '/admin-panel/coupons',
		labelKey: 'admin.nav.coupons',
		icon: 'local_offer',
		children: null,
	},
	{
		path: '',
		labelKey: 'admin.nav.products',
		icon: 'inventory_2',
		children: [
			{
				labelKey: 'admin.nav.productList',
				path: '/admin-panel/products',
			},
			{
				labelKey: 'admin.nav.productAdd',
				path: '/admin-panel/product-add',
			},
		],
	},
	{
		path: '/admin-panel/account/profile',
		labelKey: 'admin.nav.profile',
		icon: 'account_circle',
		children: null,
	},
	{
		path: '/mainPage',
		labelKey: 'admin.nav.goToStore',
		icon: 'storefront',
		children: null,
		external: false,
	},
];
