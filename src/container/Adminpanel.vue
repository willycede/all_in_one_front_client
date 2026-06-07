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
				<span class="aio-admin__sidebar-eyebrow">{{ $t('admin.panel') }}</span>
			</div>

			<nav class="aio-admin__nav" aria-label="Menú administración">
				<template v-for="(item, index) in adminPanelMenus">
					<div v-if="item.children && item.children.length" :key="`group-${index}`" class="aio-admin__nav-group">
						<span class="aio-admin__nav-group-label">{{ $t(item.labelKey) }}</span>
						<router-link
							v-for="child in item.children"
							:key="child.path"
							:to="child.path"
							class="aio-admin__nav-item aio-admin__nav-item--sub"
							active-class="aio-admin__nav-item--active"
							@click="closeSidebar"
						>
							<span>{{ $t(child.labelKey) }}</span>
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
						<span>{{ $t(item.labelKey) }}</span>
						<span
							v-if="item.path === '/admin-panel/invoices' && invoiceAlertCount > 0"
							class="aio-admin__nav-badge"
						>{{ invoiceAlertCount > 99 ? '99+' : invoiceAlertCount }}</span>
					</router-link>
				</template>
			</nav>

			<div class="aio-admin__sidebar-footer">
				<button type="button" class="aio-admin__nav-item" @click="onLogout">
					<span class="aio-admin__nav-icon">
						<v-icon>power_settings_new</v-icon>
					</span>
					<span>{{ $t('admin.logout') }}</span>
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
				<div
					v-if="invoiceAlertCount > 0 && showGlobalInvoiceAlert"
					class="aio-admin__global-alert"
				>
					<v-icon color="warning" size="20">warning_amber</v-icon>
					<div>
						<strong>{{ $t('adminReports.invoiceAlertTitle', { count: invoiceAlertCount }) }}</strong>
						<p>{{ $t('adminReports.invoiceAlertHint') }}</p>
					</div>
					<router-link to="/admin-panel/invoices" class="aio-admin__global-alert-link">
						{{ $t('adminReports.invoiceAlertAction') }}
					</router-link>
					<button type="button" class="aio-admin__global-alert-close" @click="dismissInvoiceAlert">
						<v-icon size="18">close</v-icon>
					</button>
				</div>
				<router-view></router-view>
			</main>
		</div>

		<vue-snotify></vue-snotify>
	</div>
</template>

<script>
import UserBlock from 'Components/Layouts/Header/UserBlock';
import AppConfig from 'Constants/AppConfig';
import api from 'Api';
import { mapGetters } from 'vuex';
import { clearUserSession } from 'Helpers/auth';

const PAGE_META_KEYS = {
	'/admin-panel/reports': 'admin.pages.reports',
	'/admin-panel/orders': 'admin.pages.orders',
	'/admin-panel/invoices': 'admin.pages.invoices',
	'/admin-panel/documents': 'admin.pages.documents',
	'/admin-panel/coupons': 'admin.pages.coupons',
	'/admin-panel/products': 'admin.pages.products',
	'/admin-panel/product-add': 'admin.pages.productAdd',
	'/admin-panel/account/profile': 'admin.pages.profile',
	'/admin-panel/account/settings': 'admin.pages.settings',
	'/admin-panel/account/collaboration': 'admin.pages.collaboration',
};

export default {
	data() {
		return {
			appLogoFooter: AppConfig.appLogoFooter,
			sidebarOpen: false,
			invoiceAlertCount: 0,
			showGlobalInvoiceAlert: true,
		};
	},
	computed: {
		...mapGetters(['adminPanelMenus']),
		userLinks() {
			return [
				{
					icon: 'account_circle',
					title: this.$t('admin.nav.profile'),
					path: '/admin-panel/account/profile',
				},
				{
					icon: 'storefront',
					title: this.$t('admin.nav.goToStore'),
					path: '/mainPage',
				},
			];
		},
		currentPageMeta() {
			const path = this.$route.path;
			const key = PAGE_META_KEYS[path];
			if (key) {
				return {
					title: this.$t(`${key}.title`),
					subtitle: this.$t(`${key}.subtitle`),
				};
			}
			if (path.indexOf('/admin-panel/product-edit') === 0) {
				return {
					title: this.$t('admin.pages.productAdd.title'),
					subtitle: this.$t('admin.pages.products.subtitle'),
				};
			}
			return { title: this.$t('admin.panel'), subtitle: 'All in One' };
		},
		currentPageTitle() {
			return this.currentPageMeta.title;
		},
		currentPageSubtitle() {
			return this.currentPageMeta.subtitle;
		},
	},
	mounted() {
		this.loadInvoiceAlerts();
	},
	methods: {
		async loadInvoiceAlerts() {
			try {
				const response = await api.get('/api/admin/invoices/alerts');
				const data = response.data && response.data.data;
				this.invoiceAlertCount = Number((data && data.count) || 0);
			} catch (error) {
				this.invoiceAlertCount = 0;
			}
		},
		dismissInvoiceAlert() {
			this.showGlobalInvoiceAlert = false;
		},
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
