//-----------------------| Sidebar Module |-------------------//

import { menus as defaultMenus } from './data.js';
import { adminPanelMenus } from './adminMenus.js';
import api from 'Api';

const buildSubcategoryMenu = (subcategory, generalId) => {
	const children = Array.isArray(subcategory.categories) ? subcategory.categories : [];
	return {
		name: subcategory.name,
		path: `/products?generalCategoryId=${generalId}&subcategoryId=${subcategory.id_category}`,
		children_menus: null,
		...(children.length ? {
			type: 'sub_menu',
			children: children.map((child) => buildSubcategoryMenu(child, generalId)),
		} : {}),
	};
};

const buildCategoryMenus = (categories) => {
	const categoryItems = (categories || []).map((category) => {
		const generalId = category.idgeneral_categories || category.id_general_category || category.id;
		const subcategories = Array.isArray(category.categories) ? category.categories : [];

		const item = {
			name: category.name,
			path: `/products?generalCategoryId=${generalId}`,
			children_menus: null,
		};

		if (subcategories.length) {
			item.type = 'sub_menu';
			item.children = subcategories.map(
				(subcategory) => buildSubcategoryMenu(subcategory, generalId)
			);
		}

		return item;
	});

	return [
		{
			name: 'Inicio',
			icon: 'home',
			path: '/mainPage',
		},
		...(categoryItems.length ? categoryItems : [defaultMenus[1]]),
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