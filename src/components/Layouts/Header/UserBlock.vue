<template>
	<div class="aio-user-block">
		<v-menu
			v-if="isLoggedIn"
			offset-y
			nudge-bottom="10"
			transition="slide-y-transition"
			content-class="aio-dropdown aio-user-menu"
			min-width="260"
			max-width="260"
		>
			<template v-slot:activator="{ on, attrs }">
				<button type="button" class="onsus-action-btn" v-bind="attrs" v-on="on">
					<span class="onsus-action-btn__icon">
						<v-icon>person_outline</v-icon>
					</span>
					<span class="onsus-action-btn__label">{{ $t('nav.account') }}</span>
				</button>
			</template>

			<div class="aio-user-menu__panel">
				<div class="aio-user-menu__header">
					<span class="aio-user-menu__avatar">
						<v-icon size="22">person</v-icon>
					</span>
					<div>
						<p class="aio-user-menu__title">{{ $t('nav.myAccount') }}</p>
						<p class="aio-user-menu__subtitle">{{ $t('nav.hello', { name: userDisplayName }) }}</p>
					</div>
				</div>

				<nav class="aio-user-menu__nav">
					<router-link
						v-for="(userLink, key) in accountLinks"
						:key="key"
						:to="userLink.path"
						class="aio-user-menu__item"
					>
						<span class="aio-user-menu__item-icon">
							<v-icon size="18">{{ userLink.icon }}</v-icon>
						</span>
						<span class="aio-user-menu__item-text">{{ userLink.title }}</span>
						<v-icon size="16" class="aio-user-menu__item-arrow">chevron_right</v-icon>
					</router-link>

					<button type="button" class="aio-user-menu__item aio-user-menu__item--danger" @click="onLogout">
						<span class="aio-user-menu__item-icon aio-user-menu__item-icon--danger">
							<v-icon size="18">power_settings_new</v-icon>
						</span>
						<span class="aio-user-menu__item-text">{{ $t('nav.logout') }}</span>
						<v-icon size="16" class="aio-user-menu__item-arrow">chevron_right</v-icon>
					</button>
				</nav>
			</div>
		</v-menu>

		<router-link v-else to="/client/login" class="onsus-action-btn aio-user-block__login">
			<span class="onsus-action-btn__icon">
				<v-icon>login</v-icon>
			</span>
			<span class="onsus-action-btn__label">{{ $t('nav.login') }}</span>
		</router-link>
	</div>
</template>

<script>
import { isUserLoggedIn, getUserDisplayName, clearUserSession, isAdminUser } from 'Helpers/auth';

export default {
	props: ['data'],
	data() {
		return {
			isLoggedIn: false,
			isAdmin: false,
			userDisplayName: '',
		};
	},
	computed: {
		accountLinks() {
			const links = (this.data || []).filter((link) => link.icon !== 'power_settings_new');
			const base = links.length ? links : [
				{ icon: 'person_outline', title: this.$t('account.profile'), path: '/account/profile' },
				{ icon: 'history', title: this.$t('account.orderHistory'), path: '/account/order-history' },
				{ icon: 'favorite_border', title: this.$t('nav.favorites'), path: '/favorites' },
			];

			if (this.isAdmin) {
				return [
					{
						icon: 'admin_panel_settings',
						title: this.$t('admin.panel'),
						path: '/admin-panel/reports',
					},
					...base,
				];
			}
			return base;
		},
	},
	watch: {
		$route() {
			this.refreshAuthState();
		},
	},
	created() {
		this.refreshAuthState();
	},
	methods: {
		refreshAuthState() {
			this.isLoggedIn = isUserLoggedIn();
			this.isAdmin = isAdminUser();
			this.userDisplayName = this.isLoggedIn ? getUserDisplayName() : '';
		},
		onLogout() {
			clearUserSession();
			this.$store.dispatch('clearWishlist');
			this.refreshAuthState();
			this.$router.push({ path: '/client/login' });
		},
	},
};
</script>

<style scoped>
.aio-user-block__login {
	text-decoration: none;
}
</style>
