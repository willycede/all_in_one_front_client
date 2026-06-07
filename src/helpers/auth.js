const SESSION_KEYS = [
	'email',
	'id_users',
	'identification_number',
	'name_user',
	'last_name_user',
	'id_user_rol',
	'id_rol',
	'id_company_user',
	'access_token',
	'id_orden',
];

export const GUEST_ONLY_PATHS = ['/client/login', '/client/register'];
export const ADMIN_PATH_PREFIX = '/admin-panel';
export const ADMIN_LOGIN_PATH = '/client/admin-login';

function hasValue(value) {
	return value !== null && value !== undefined && value !== '' && value !== 'undefined' && value !== 'null';
}

export function isUserLoggedIn() {
	const token = localStorage.getItem('access_token');
	const userId = localStorage.getItem('id_users');
	return hasValue(token) && hasValue(userId);
}

export function isAdminUser() {
	return isUserLoggedIn() && String(localStorage.getItem('id_rol')) === '1';
}

export function requiresAuthentication(route) {
	return route.matched.some((record) => record.meta && record.meta.requiresAuth);
}

export function requiresAdmin(route) {
	return route.matched.some((record) => record.meta && record.meta.requiresAdmin);
}

export function isAdminRoute(path) {
	const pathOnly = String(path || '').split('?')[0];
	return pathOnly === ADMIN_PATH_PREFIX || pathOnly.startsWith(`${ADMIN_PATH_PREFIX}/`);
}

export function isGuestOnlyRoute(route) {
	return GUEST_ONLY_PATHS.includes(route.path);
}

export function resolveAuthenticatedHome(redirectQuery) {
	if (redirectQuery && typeof redirectQuery === 'string') {
		const pathOnly = redirectQuery.split('?')[0];
		const isAuthPage = GUEST_ONLY_PATHS.some((path) => pathOnly === path || pathOnly.startsWith(`${path}/`));
		const isAdminPath = isAdminRoute(pathOnly);
		if (!isAuthPage && (!isAdminPath || isAdminUser())) {
			return redirectQuery;
		}
	}

	if (isAdminUser()) {
		return '/admin-panel/reports';
	}

	return '/mainPage';
}

export function getUserDisplayName() {
	const firstName = localStorage.getItem('name_user') || '';
	const lastName = localStorage.getItem('last_name_user') || '';
	const fullName = `${firstName} ${lastName}`.trim();
	if (fullName) {
		return fullName;
	}
	return localStorage.getItem('email') || 'Usuario';
}

export function clearUserSession() {
	SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}
