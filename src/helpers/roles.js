export const ROLE_ADMIN = 1;
export const ROLE_CLIENT = 2;
export const ROLE_SUPER_ADMIN = 3;

const ROLE_LABELS = {
	[ROLE_ADMIN]: 'Administrador',
	[ROLE_CLIENT]: 'Cliente',
	[ROLE_SUPER_ADMIN]: 'Super administrador',
};

export function roleLabel(idRol, fallback = 'Usuario') {
	return ROLE_LABELS[parseInt(idRol, 10)] || fallback;
}

export function isAdminRole(idRol) {
	const roleId = parseInt(idRol, 10);
	return roleId === ROLE_ADMIN || roleId === ROLE_SUPER_ADMIN;
}

export const ROLE_OPTIONS = [
	{ label: ROLE_LABELS[ROLE_SUPER_ADMIN], value: ROLE_SUPER_ADMIN },
	{ label: ROLE_LABELS[ROLE_ADMIN], value: ROLE_ADMIN },
	{ label: ROLE_LABELS[ROLE_CLIENT], value: ROLE_CLIENT },
];
