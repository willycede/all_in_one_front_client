export function persistClientSession(store, userData) {
	localStorage.email = userData.email;
	localStorage.id_users = userData.id_users;
	localStorage.identification_number = userData.identification_number;
	localStorage.name_user = userData.name_user;
	localStorage.last_name_user = userData.last_name_user;
	localStorage.id_user_rol = userData.id_user_rol;
	localStorage.id_rol = userData.id_rol;
	localStorage.id_company_user = userData.id_company_user;
	localStorage.access_token = userData.access_token;
	localStorage.two_factor_enabled = userData.two_factor_enabled ? '1' : '0';
}

export function completeClientLogin(vm, userData, redirectPath) {
	persistClientSession(vm.$store, userData);
	vm.$store.dispatch('fetchWishlist');
	vm.$store.dispatch('loadUserPreferences').catch(() => {});
	const redirect = redirectPath || vm.$route.query.redirect;
	vm.$router.push(redirect ? redirect : '/mainPage');
}

export function completeAdminLogin(vm, userData, redirectPath) {
	persistClientSession(vm.$store, userData);
	const redirect = redirectPath || vm.$route.query.redirect;
	vm.$router.push(redirect ? redirect : '/admin-panel/reports');
}
