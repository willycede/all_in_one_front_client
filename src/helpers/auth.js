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

function hasValue(value) {
	return value !== null && value !== undefined && value !== '' && value !== 'undefined' && value !== 'null';
}

export function isUserLoggedIn() {
	const token = localStorage.getItem('access_token');
	const userId = localStorage.getItem('id_users');
	return hasValue(token) && hasValue(userId);
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
