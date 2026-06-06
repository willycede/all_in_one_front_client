export function mapFavoriteFromApi(item) {
	return {
		id_favorite: item.id_favorite,
		id_product: item.id_product,
		id: item.id_product,
		objectID: item.id_product,
		name: item.name,
		description: item.description || '',
		price: parseFloat(item.price) || 0,
		image: item.image || '',
		quantity: 1,
		total: parseFloat(item.price) || 0,
	};
}

export function getProductIdFromPayload(payload) {
	return payload?.id_products
		|| payload?.id_product
		|| payload?.objectID
		|| payload?.id;
}

export function isProductInWishlist(wishlist, product) {
	const productId = getProductIdFromPayload(product);
	return wishlist.some((item) => {
		const itemId = item.id_product || item.objectID || item.id;
		return String(itemId) === String(productId);
	});
}
