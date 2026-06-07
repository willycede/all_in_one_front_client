//-----------------------| Sidebar Module |-------------------//

import { menus as defaultMenus } from './data.js';
import { adminPanelMenus } from './adminMenus.js';
import api from 'Api';

const buildCategoryMenus = (categories) => {
	const children = (categories || []).map((category) => ({
		name: category.name,
		path: `/products/category/${category.id_general_category || category.id}`,
		children_menus: null,
	}));

	return [
		{
			name: 'Inicio',
			icon: 'home',
			path: '/mainPage',
		},
		{
			name: 'Categorías',
			icon: 'pages',
			type: 'sub_menu',
			children: children.length ? children : defaultMenus[1].children,
		},
	];
};

const state = {
	menus: defaultMenus,
	adminPanelMenus,
	sidebarOpen: false
}

const getters = {
	menus: state => {
		return state.menus;
	},
	adminPanelMenus: state => {
		return state.adminPanelMenus;
	},
	sidebarOpen: state =>{
		return state.sidebarOpen;
	}
}

const actions = {
   loadMenus(context) {
      return api.get('/api/generalCategories/getGeneralCategories')
         .then((response) => {
            const categories = (response.data && response.data.data) || [];
            context.commit('setMenus', buildCategoryMenus(categories));
         })
         .catch(() => {
            context.commit('setMenus', defaultMenus);
         });
   },
   toggleSidebar(context, payload) {
      context.commit('toggleSidebarHandler', payload);
   },
	changeActiveMenu(context, payload) {
      context.commit('changeActiveMenuHandler', payload);
   },
}

const mutations = {
	setMenus(state, payload) {
		state.menus = payload;
	},
	toggleSidebarHandler(state, payload) {
	  state.sidebarOpen = payload;
	},
	changeActiveMenuHandler(state, payload) {
		var sidebarMenus = state.adminPanelMenus;
		for( let i = 0; i < sidebarMenus.length; i++){
			let index = sidebarMenus.indexOf(payload);
			if(i == index){
				sidebarMenus[i].active = true
			}else{
				sidebarMenus[i].active = false;
			}
		}
	},
}

export default {
	state,
	getters,
	actions,
	mutations
}