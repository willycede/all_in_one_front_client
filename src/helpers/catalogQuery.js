export const CATALOG_SORT_OPTIONS = [
	{ value: 'name_asc', label: 'Nombre A-Z' },
	{ value: 'name_desc', label: 'Nombre Z-A' },
	{ value: 'price_asc', label: 'Precio: menor a mayor' },
	{ value: 'price_desc', label: 'Precio: mayor a menor' },
];

export const DEFAULT_CATALOG_SORT = 'name_asc';

export function parseCatalogQuery(query = {}) {
	return {
		categoryId: query.generalCategoryId ? parseInt(query.generalCategoryId, 10) : null,
		searchBy: query.searchBy || '',
		minPrice: query.minPrice || '',
		maxPrice: query.maxPrice || '',
		cityId: query.cityId && String(query.cityId).trim() ? parseInt(query.cityId, 10) : null,
		sortBy: CATALOG_SORT_OPTIONS.some((opt) => opt.value === query.sortBy)
			? query.sortBy
			: DEFAULT_CATALOG_SORT,
		page: parseInt(query.page, 10) || 1,
		limit: parseInt(query.limit, 10) || 12,
	};
}

export function buildCatalogQuery(filters = {}) {
	const query = {
		page: String(filters.page || 1),
		limit: String(filters.limit || 12),
	};

	if (filters.categoryId) {
		query.generalCategoryId = String(filters.categoryId);
	}
	if (filters.searchBy && String(filters.searchBy).trim()) {
		query.searchBy = String(filters.searchBy).trim();
	}
	if (filters.minPrice !== undefined && filters.minPrice !== null && String(filters.minPrice).trim() !== '') {
		query.minPrice = String(filters.minPrice).trim();
	}
	if (filters.maxPrice !== undefined && filters.maxPrice !== null && String(filters.maxPrice).trim() !== '') {
		query.maxPrice = String(filters.maxPrice).trim();
	}
	if (filters.cityId) {
		query.cityId = String(filters.cityId);
	}
	if (filters.sortBy && filters.sortBy !== DEFAULT_CATALOG_SORT) {
		query.sortBy = filters.sortBy;
	}

	return query;
}

export function catalogFiltersChanged(a, b) {
	return (
		String(a.categoryId || '') !== String(b.categoryId || '')
		|| String(a.searchBy || '') !== String(b.searchBy || '')
		|| String(a.minPrice || '') !== String(b.minPrice || '')
		|| String(a.maxPrice || '') !== String(b.maxPrice || '')
		|| String(a.cityId || '') !== String(b.cityId || '')
		|| String(a.sortBy || DEFAULT_CATALOG_SORT) !== String(b.sortBy || DEFAULT_CATALOG_SORT)
	);
}

export function catalogQueryEquals(a, b) {
	return (
		String(a.page) === String(b.page)
		&& String(a.limit) === String(b.limit)
		&& !catalogFiltersChanged(a, b)
	);
}

export function catalogApiParams(filters) {
	return {
		searchBy: filters.searchBy || '',
		page: filters.page || 1,
		limit: filters.limit || 12,
		minPrice: filters.minPrice || undefined,
		maxPrice: filters.maxPrice || undefined,
		cityId: filters.cityId || undefined,
		sortBy: filters.sortBy || DEFAULT_CATALOG_SORT,
	};
}
