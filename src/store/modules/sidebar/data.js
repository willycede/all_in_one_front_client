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


// adminPanelMenus moved to adminMenus.js (i18n labelKey)
