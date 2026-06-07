<template>
	<div class="aio-admin">
		<div
			class="aio-admin__overlay"
			:class="{ 'aio-admin__overlay--visible': sidebarOpen }"
			@click="closeSidebar"
		></div>

		<aside
			class="aio-admin__sidebar"
			:class="{ 'aio-admin__sidebar--open': sidebarOpen }"
		>
			<div class="aio-admin__sidebar-brand">
				<router-link to="/admin-panel/reports">
					<img
						alt="All in One"
						class="aio-admin__sidebar-logo"
						:src="appLogoFooter"
					>
				</router-link>
				<span class="aio-admin__sidebar-eyebrow">Panel admin</span>
			</div>

			<nav class="aio-admin__nav" aria-label="Menú administración">
				<template v-for="(item, index) in adminPanelMenus">
					<div v-if="item.children && item.children.length" :key="`group-${index}`" class="aio-admin__nav-group">
						<span class="aio-admin__nav-group-label">{{ item.label }}</span>
						<router-link
							v-for="child in item.children"
							:key="child.path"
							:to="child.path"
							class="aio-admin__nav-item aio-admin__nav-item--sub"
							active-class="aio-admin__nav-item--active"
							@click="closeSidebar"
						>
							<span>{{ child.label }}</span>
						</router-link>
					</div>

					<router-link
						v-else
						:key="item.path || index"
						:to="item.path"
						class="aio-admin__nav-item"
						active-class="aio-admin__nav-item--active"
						@click="closeSidebar"
					>
						<span class="aio-admin__nav-icon">
							<v-icon>{{ item.icon }}</v-icon>
						</span>
						<span>{{ item.label }}</span>
					</router-link>
				</template>
			</nav>

			<div class="aio-admin__sidebar-footer">
				<button type="button" class="aio-admin__nav-item" @click="onLogout">
					<span class="aio-admin__nav-icon">
						<v-icon>power_settings_new</v-icon>
					</span>
					<span>Cerrar sesión admin</span>
				</button>
			</div>
		</aside>

		<div class="aio-admin__main">
			<header class="aio-admin__topbar">
				<div class="aio-admin__topbar-left">
					<button type="button" class="aio-admin__menu-btn" @click="toggleSidebar">
						<v-icon color="white">menu</v-icon>
					</button>
					<div>
						<h1 class="aio-admin__page-title">{{ currentPageTitle }}</h1>
						<p v-if="currentPageSubtitle" class="aio-admin__page-subtitle">{{ currentPageSubtitle }}</p>
					</div>
				</div>
				<div class="aio-admin__topbar-actions">
					<emb-user-block :data="userLinks"></emb-user-block>
				</div>
			</header>

			<main class="aio-admin__content">
				<router-view></router-view>
			</main>
		</div>

		<vue-snotify></vue-snotify>
	</div>
</template>

<script>
import UserBlock from 'Components/Layouts/Header/UserBlock';
import AppConfig from 'Constants/AppConfig';
import { mapGetters } from 'vuex';
import { clearUserSession } from 'Helpers/auth';

const PAGE_META = {
	'/admin-panel/reports': { title: 'Reportes', subtitle: 'Resumen de actividad del marketplace' },
	'/admin-panel/invoices': { title: 'Facturas', subtitle: 'Listado y gestión de facturación' },
	'/admin-panel/documents': { title: 'Documentos', subtitle: 'Verificación de archivos de clientes' },
	'/admin-panel/coupons': { title: 'Cupones', subtitle: 'Códigos promocionales del carrito' },
	'/admin-panel/products': { title: 'Productos', subtitle: 'Catálogo conectado a la API' },
	'/admin-panel/product-add': { title: 'Nuevo producto', subtitle: 'Publica un artículo en el catálogo de la tienda' },
	'/admin-panel/account/profile': { title: 'Mi perfil', subtitle: 'Datos de tu cuenta administrador' },
	'/admin-panel/account/settings': { title: 'Configuración', subtitle: 'Preferencias y seguridad de tu cuenta admin' },
	'/admin-panel/account/collaboration': { title: 'Colaboración', subtitle: 'Usuarios con acceso al panel' },
};

export default {
	data() {
		return {
			appLogoFooter: AppConfig.appLogoFooter,
			sidebarOpen: false,
			userLinks: [
				{
					icon: 'account_circle',
					title: 'Perfil',
					path: '/admin-panel/account/profile',
				},
				{
					icon: 'storefront',
					title: 'Ir a la tienda',
					path: '/mainPage',
				},
			],
		};
	},
	computed: {
		...mapGetters(['adminPanelMenus']),
		currentPageMeta() {
			const path = this.$route.path;
			if (PAGE_META[path]) {
				return PAGE_META[path];
			}
			if (path.indexOf('/admin-panel/product-edit') === 0) {
				return { title: 'Editar producto', subtitle: 'Modifica los datos del catálogo' };
			}
			return { title: 'Administración', subtitle: 'All in One' };
		},
		currentPageTitle() {
			return this.currentPageMeta.title;
		},
		currentPageSubtitle() {
			return this.currentPageMeta.subtitle;
		},
	},
	methods: {
		toggleSidebar() {
			this.sidebarOpen = !this.sidebarOpen;
		},
		closeSidebar() {
			this.sidebarOpen = false;
		},
		onLogout() {
			clearUserSession();
			this.$store.dispatch('clearWishlist');
			this.$router.push('/client/admin-login');
		},
	},
	components: {
		embUserBlock: UserBlock,
	},
};
</script>
