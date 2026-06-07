import api from 'Api';
import Vue from "vue";
import { moneyMask } from "../../../../helpers/helpers";
import { catalogApiParams } from "../../../../helpers/catalogQuery";

const DEFAULT_PAGE_SIZE = 12;
const PAGE_SIZE_OPTIONS = [12, 24, 48];

const emptyPagination = () => ({
	page: 1,
	limit: DEFAULT_PAGE_SIZE,
	total: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPrevPage: false,
});

const state = Vue.observable({
	productList: [],
	selectedProduct: {},
	productPagination: emptyPagination(),
});

const getters = {
	productList: state => state.productList,
	selectedProduct: state => state.selectedProduct,
	productPagination: state => state.productPagination,
};

const actions = {
	async getRandomProducts(context) {
		const products = await api.get('/api/products/get/randomProducts');
		if (products?.data?.data && products?.data?.data.length > 0) {
			products?.data?.data.forEach((product) => { product.price = moneyMask(product.price); });
		}
		context.commit('onGetRandomProducts', products?.data?.data);
	},
	async getProductsByCategoryIdAndFilters(context, data) {
		const page = data.page || 1;
		const limit = data.limit || DEFAULT_PAGE_SIZE;
		const categoryId = data.categoryId || undefined;
		const response = await api.get(`/api/products/${categoryId}`, {
			params: catalogApiParams({
				searchBy: data.searchBy,
				page,
				limit,
				minPrice: data.minPrice,
				maxPrice: data.maxPrice,
				cityId: data.cityId,
				sortBy: data.sortBy,
			}),
		});
		const payload = response?.data?.data;
		if (payload?.items) {
			const list = payload.items;
			if (list.length > 0) {
				list.forEach((product) => { product.price = moneyMask(product.price); });
			}
			context.commit('onGetAllProducts', {
				items: list,
				pagination: payload.pagination,
			});
			return payload;
		}
		const list = Array.isArray(payload) ? payload : [];
		if (list.length > 0) {
			list.forEach((product) => { product.price = moneyMask(product.price); });
		}
		context.commit('onGetAllProducts', {
			items: list,
			pagination: {
				...emptyPagination(),
				limit,
				total: list.length,
				totalPages: list.length ? 1 : 0,
			},
		});
		return { items: list };
	},
	async getProductsBId(context, data) {
		const productId = data;
		const products = await api.get(`/api/products/by_product_id/${productId}`);
		if (products?.data?.data && products?.data?.data.length > 0) {
			context.commit('selectProductHandler', products?.data?.data[0]);
		}
	},
	setSelectedProduct(context, payload) {
		context.commit('selectProductHandler', payload);
	},
	async setSelectedProductById(context, payload) {
		const products = await api.get('/api/products/get/randomProducts');
		context.commit('onGetRandomProducts', products?.data?.data);
		context.commit('setSelectedProductById', payload);
	},
};

const mutations = {
	onGetRandomProducts(state, products) {
		state.productList = products;
	},
	onGetAllProducts(state, payload) {
		if (payload?.items) {
			state.productList = payload.items;
			state.productPagination = { ...emptyPagination(), ...payload.pagination };
			return;
		}
		state.productList = payload || [];
		state.productPagination = emptyPagination();
	},
	selectProductHandler(state, product) {
		state.selectedProduct = product;
	},
	setSelectedProductById(state, productId) {
		const products = state.productList;
		const foundProduct = products.filter(product => parseInt(product.id_products) == parseInt(productId));
		state.selectedProduct = foundProduct[0];
	},
};

export {
	DEFAULT_PAGE_SIZE as PRODUCT_DEFAULT_PAGE_SIZE,
	PAGE_SIZE_OPTIONS as PRODUCT_PAGE_SIZE_OPTIONS,
	emptyPagination as emptyProductPagination,
};

export default {
	state,
	getters,
	actions,
	mutations,
};
