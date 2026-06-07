/* eslint-disable */
// Sidebar Routers
export const menus = [
   {
      path: '',
      name: "Inicio",
		icon: "home",
      path: "/mainPage"
   },
   {
      path:'',
      name: "Categorías",
      icon: "pages",
      type: "sub_menu",
      children: [
			{
				name: "Accesorios",
				children_menus:null,
            path: "/products?generalCategoryId=1"
			},
			{
				name: "Seguros",
				children_menus:null,
            path: "/products?generalCategoryId=2"
			},
			{
				name: "Rastreo",
				children_menus:null,
            path: "/products?generalCategoryId=3",
			},
      ]
   } 
]


export const adminPanelMenus = [
	{
		path: '/admin-panel/reports',
		label: 'Reportes',
		icon: 'poll',
		children: null,
	},
	{
		path: '/admin-panel/invoices',
		label: 'Facturas',
		icon: 'receipt_long',
		children: null,
	},
	{
		path: '/admin-panel/documents',
		label: 'Documentos',
		icon: 'description',
		children: null,
	},
	{
		path: '/admin-panel/coupons',
		label: 'Cupones',
		icon: 'local_offer',
		children: null,
	},
	{
		path: '',
		label: 'Productos',
		icon: 'inventory_2',
		children: [
			{
				label: 'Listado',
				path: '/admin-panel/products',
			},
			{
				label: 'Nuevo producto',
				path: '/admin-panel/product-add',
			},
		],
	},
	{
		path: '/admin-panel/account/profile',
		label: 'Mi perfil',
		icon: 'account_circle',
		children: null,
	},
	{
		path: '/mainPage',
		label: 'Ir a la tienda',
		icon: 'storefront',
		children: null,
		external: false,
	},
]
