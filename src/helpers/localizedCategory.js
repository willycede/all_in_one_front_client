/** Mapeo de nombres de categoría en BD → claves i18n del frontend */
const CATEGORY_I18N_KEYS = {
	Accesorios: 'nav.accessories',
	Seguros: 'nav.insurance',
	Rastreo: 'nav.tracking',
};

export function localizedCategoryName(i18n, name) {
	if (!name) {
		return '';
	}
	const key = CATEGORY_I18N_KEYS[name];
	return key ? i18n.t(key) : name;
}

export function localizedCategoryNameLower(i18n, name) {
	return localizedCategoryName(i18n, name).toLowerCase();
}
