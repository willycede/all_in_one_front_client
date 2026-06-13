/* eslint-disable */
export const adminPanelMenus = [
	{
		id: 'dashboard',
		path: '/admin-panel/reports',
		labelKey: 'admin.nav.reports',
		icon: 'poll',
	},
	{
		id: 'sales',
		labelKey: 'admin.nav.sales',
		icon: 'shopping_bag',
		children: [
			{
				path: '/admin-panel/orders',
				labelKey: 'admin.nav.orders',
				icon: 'shopping_bag',
			},
			{
				path: '/admin-panel/invoices',
				labelKey: 'admin.nav.invoices',
				icon: 'receipt_long',
				badgeKey: 'invoices',
			},
		],
	},
	{
		id: 'billing',
		labelKey: 'admin.nav.billingSection',
		icon: 'account_balance',
		children: [
			{
				path: '/admin-panel/billing-settings',
				labelKey: 'admin.nav.billing',
				icon: 'settings_suggest',
			},
		],
	},
	{
		id: 'catalog',
		labelKey: 'admin.nav.catalog',
		icon: 'inventory_2',
		children: [
			{
				path: '/admin-panel/products',
				labelKey: 'admin.nav.productList',
				icon: 'view_list',
			},
			{
				path: '/admin-panel/product-add',
				labelKey: 'admin.nav.productAdd',
				icon: 'add_box',
			},
			{
				path: '/admin-panel/coupons',
				labelKey: 'admin.nav.coupons',
				icon: 'local_offer',
			},
		],
	},
	{
		id: 'customers',
		labelKey: 'admin.nav.customers',
		icon: 'groups',
		children: [
			{
				path: '/admin-panel/users',
				labelKey: 'admin.nav.users',
				icon: 'people',
			},
			{
				path: '/admin-panel/documents',
				labelKey: 'admin.nav.documents',
				icon: 'description',
			},
		],
	},
	{
		id: 'security',
		labelKey: 'admin.nav.security',
		icon: 'shield',
		children: [
			{
				path: '/admin-panel/audit-logs',
				labelKey: 'admin.nav.auditLogs',
				icon: 'history',
			},
		],
	},
	{
		id: 'account',
		labelKey: 'admin.nav.account',
		icon: 'manage_accounts',
		children: [
			{
				path: '/admin-panel/account/profile',
				labelKey: 'admin.nav.profile',
				icon: 'account_circle',
			},
			{
				path: '/mainPage',
				labelKey: 'admin.nav.goToStore',
				icon: 'storefront',
			},
		],
	},
];
