import api from 'Api';
import { parseRequiredDocuments } from 'Helpers/documents';

export async function fetchActiveCartPayload(idUser) {
	if (!idUser) {
		return { cartItems: [], cartId: null, cartMeta: null };
	}

	const shopRes = await api.get(`/api/shoppingcar/get_shop/${idUser}`);
	const carts = shopRes && shopRes.data && shopRes.data.data;

	if (!carts || !carts.length) {
		return { cartItems: [], cartId: null, cartMeta: null };
	}

	const cartMeta = carts[0];
	const cartId = cartMeta.id_shopping_car;
	const detailsRes = await api.get(`/api/shoppingcar/get_shopDetails/${cartId}`);
	const rawItems = (detailsRes && detailsRes.data && detailsRes.data.data) || [];

	const cartItems = rawItems.map((item) => ({
		...item,
		required_documents_array: parseRequiredDocuments(item.required_documents),
	}));

	return { cartItems, cartId, cartMeta };
}

export async function syncActiveCartToStore(store) {
	const idUser = localStorage.getItem('id_users');
	const { cartItems, cartId } = await fetchActiveCartPayload(idUser);

	store.dispatch('addSetToCart', cartItems);

	if (cartId) {
		localStorage.setItem('id_orden', String(cartId));
	} else {
		localStorage.removeItem('id_orden');
	}

	return { cartItems, cartId };
}
