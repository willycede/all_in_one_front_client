const ADMIN_HOME = '/admin-panel/reports';

const PAGE_ROUTES = {
	'/admin-panel/reports': {
		titleKey: 'admin.pages.reports.title',
		subtitleKey: 'admin.pages.reports.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.reports' },
		],
	},
	'/admin-panel/orders': {
		titleKey: 'adminOrders.title',
		subtitleKey: 'adminOrders.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.sales' },
			{ labelKey: 'admin.nav.orders' },
		],
	},
	'/admin-panel/invoices': {
		titleKey: 'adminInvoices.title',
		subtitleKey: 'adminInvoices.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.sales' },
			{ labelKey: 'admin.nav.invoices' },
		],
	},
	'/admin-panel/billing-settings': {
		titleKey: 'adminBilling.title',
		subtitleKey: 'adminBilling.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.billingSection' },
			{ labelKey: 'admin.nav.billing' },
		],
	},
	'/admin-panel/products': {
		titleKey: 'admin.pages.products.title',
		subtitleKey: 'admin.pages.products.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.catalog' },
			{ labelKey: 'admin.nav.productList' },
		],
	},
	'/admin-panel/product-add': {
		titleKey: 'admin.pages.productAdd.title',
		subtitleKey: 'admin.pages.productAdd.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.catalog' },
			{ labelKey: 'admin.nav.productList', to: '/admin-panel/products' },
			{ labelKey: 'admin.nav.productAdd' },
		],
	},
	'/admin-panel/coupons': {
		titleKey: 'admin.pages.coupons.title',
		subtitleKey: 'admin.pages.coupons.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.catalog' },
			{ labelKey: 'admin.nav.coupons' },
		],
	},
	'/admin-panel/users': {
		titleKey: 'adminUsers.title',
		subtitleKey: 'adminUsers.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.customers' },
			{ labelKey: 'admin.nav.users' },
		],
	},
	'/admin-panel/documents': {
		titleKey: 'admin.pages.documents.title',
		subtitleKey: 'admin.pages.documents.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.customers' },
			{ labelKey: 'admin.nav.documents' },
		],
	},
	'/admin-panel/audit-logs': {
		titleKey: 'adminAuditLogs.title',
		subtitleKey: 'adminAuditLogs.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.security' },
			{ labelKey: 'admin.nav.auditLogs' },
		],
	},
	'/admin-panel/account/profile': {
		titleKey: 'admin.pages.profile.title',
		subtitleKey: 'admin.pages.profile.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.account' },
			{ labelKey: 'admin.nav.profile' },
		],
	},
	'/admin-panel/account/collaboration': {
		titleKey: 'admin.pages.collaboration.title',
		subtitleKey: 'admin.pages.collaboration.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.account' },
			{ labelKey: 'admin.pages.collaboration.title' },
		],
	},
	'/admin-panel/account/settings': {
		titleKey: 'admin.pages.settings.title',
		subtitleKey: 'admin.pages.settings.subtitle',
		breadcrumbs: [
			{ labelKey: 'admin.breadcrumb.panel', to: ADMIN_HOME },
			{ labelKey: 'admin.nav.account' },
			{ labelKey: 'admin.pages.settings.title' },
		],
	},
};

const resolvePathKey = (path) => {
	if (PAGE_ROUTES[path]) return path;
	if (path.indexOf('/admin-panel/product-edit') === 0) return '__product_edit__';
	return null;
};

const resolveAdminPageMeta = (path, t) => {
	const key = resolvePathKey(path);

	if (key === '__product_edit__') {
		return {
			title: t('admin.breadcrumb.editProduct'),
			subtitle: t('admin.pages.products.subtitle'),
			breadcrumbs: [
				{ label: t('admin.breadcrumb.panel'), to: ADMIN_HOME },
				{ label: t('admin.nav.catalog') },
				{ label: t('admin.nav.productList'), to: '/admin-panel/products' },
				{ label: t('admin.breadcrumb.editProduct') },
			],
		};
	}

	const config = key ? PAGE_ROUTES[key] : null;
	if (!config) {
		return {
			title: t('admin.panel'),
			subtitle: '',
			breadcrumbs: [
				{ label: t('admin.breadcrumb.panel'), to: ADMIN_HOME },
			],
		};
	}

	return {
		title: t(config.titleKey),
		subtitle: config.subtitleKey ? t(config.subtitleKey) : '',
		breadcrumbs: config.breadcrumbs.map((crumb, index, list) => ({
			label: t(crumb.labelKey),
			to: crumb.to || null,
			current: index === list.length - 1,
		})),
	};
};

module.exports = {
	ADMIN_HOME,
	resolveAdminPageMeta,
};
