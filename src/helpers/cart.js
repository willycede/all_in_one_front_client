export function getProductIdFromPayload(product) {
	if (!product) return null;
	const id = product.id_products ?? product.id_product ?? product.objectID ?? product.id;
	if (id === null || id === undefined || id === '') return null;
	return id;
}

export function isProductInCart(cart, product) {
	const productId = getProductIdFromPayload(product);
	if (productId === null || !Array.isArray(cart) || !cart.length) {
		return false;
	}

	return cart.some((item) => {
		const itemProductId = getProductIdFromPayload(item);
		return itemProductId !== null && String(itemProductId) === String(productId);
	});
}
