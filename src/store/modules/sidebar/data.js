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
      name:"message.reports",
      icon: 'poll',
      children:null,
		active: true
   },
   {
      path: '/admin-panel/invoices',
      name:"message.invoices",
      icon: 'recent_actors',
      children:null,
		active: false
   },
   {
      path: '',
      name:"message.products",
      icon: 'shopping_cart',
		active: false,
      children: [
			{
				name: "message.products",
				path: "/admin-panel/products"
			},
			{
				name: "message.productAdd",
				path: "/admin-panel/product-add"
         },
      ]
      
   },
   {
      path: '/admin-panel/account/profile',
      name:"message.profile",
      icon: 'account_circle',
		active: false,
      children: null
   },
   {
      path: '/home',
      name:"message.goToSite",
      icon: 'home',
		active: false,
      children: null
   },
]