<template>
	<div class="onsus-header">
		<div class="header-wrap">
			<!-- Top utility bar -->
			<div class="onsus-topbar">
				<v-container>
					<div class="onsus-topbar__inner">
						<span>{{ $t('header.topbarShipping') }}</span>
						<div class="onsus-topbar__links">
							<template v-if="isLoggedIn">
								<router-link to="/account/profile">{{ $t('nav.myAccount') }}</router-link>
								<router-link to="/account/order-history">{{ $t('nav.myOrders') }}</router-link>
								<button type="button" class="onsus-topbar__logout" @click="onLogout">{{ $t('nav.logout') }}</button>
							</template>
							<template v-else>
								<router-link to="/client/login">{{ $t('nav.login') }}</router-link>
								<router-link to="/client/register">{{ $t('nav.register') }}</router-link>
							</template>
						</div>
					</div>
				</v-container>
			</div>

			<!-- Main header: logo + search + actions -->
			<div class="onsus-main-header">
				<v-container>
					<div class="onsus-main-header__inner">
						<div class="onsus-logo">
							<router-link to="/mainPage" class="onsus-logo__link">
								<img
									alt="All in One"
									:src="appLogo"
									class="onsus-logo__img"
									:height="logoSize.height"
									:style="{ maxWidth: logoSize.maxWidth + 'px' }"
								>
							</router-link>
						</div>
						<div class="onsus-search-bar-wrap">
							<emb-search-bar></emb-search-bar>
						</div>
						<div class="onsus-actions">
							<div class="notifications">
								<emb-user-block :data="userLinks"></emb-user-block>
								<emb-wishlist></emb-wishlist>
								<emb-cart></emb-cart>
							</div>
						</div>
					</div>
				</v-container>
			</div>

			<!-- Navigation bar -->
			<div class="bottom-header d-block onsus-navbar">
				<v-container>
					<div class="bottom-header-inner">
						<div class="menu-alignment">
							<emb-menu></emb-menu>
						</div>
						<div class="layout align-left responsive-menu">
							<v-btn icon dark @click="toggleMobileSidebar" class="toggle-btn" large>
								<i class="material-icons">menu</i>
							</v-btn>
						</div>
					</div>
				</v-container>
			</div>
		</div>
		<div id="fixedHeader">
			<emb-fixed-header></emb-fixed-header>
		</div>
	</div>
</template>

<script>
import Menu from './Menu';
import Cart from './Cart';
import Wishlist from './Wishlist';
import UserBlock from './UserBlock';
import SearchBar from './SearchBar';
import AppConfig from 'Constants/AppConfig';
import { isUserLoggedIn, clearUserSession } from 'Helpers/auth';

export default {
	data() {
		return {
			isLoggedIn: false,
			appLogo: AppConfig.appLogo,
			logoSize: {
				height: AppConfig.logo.height,
				maxWidth: AppConfig.logo.maxWidth,
			},
		};
	},
	computed: {
		userLinks() {
			return [
				{
					icon: 'person_outline',
					title: this.$t('account.profile'),
					path: '/account/profile',
				},
				{
					icon: 'settings',
					title: this.$t('account.preferences'),
					path: '/account/profile',
				},
				{
					icon: 'history',
					title: this.$t('account.orderHistory'),
					path: '/account/order-history',
				},
			];
		},
	},
	watch: {
		$route() {
			this.refreshAuthState();
		},
	},
	components: {
		embMenu: Menu,
		embCart: Cart,
		embWishlist: Wishlist,
		embUserBlock: UserBlock,
		embSearchBar: SearchBar,
	},
	mounted() {
		this.refreshAuthState();
		this.fixedHeader();
	},
	methods: {
		refreshAuthState() {
			this.isLoggedIn = isUserLoggedIn();
		},
		onLogout() {
			clearUserSession();
			this.$store.dispatch('clearWishlist');
			this.refreshAuthState();
			this.$router.push({ path: '/client/login' });
		},
		toggleMobileSidebar() {
			this.$store.dispatch('toggleSidebar', true);
		},
		fixedHeader() {
			const fixedHeader = document.getElementById('fixedHeader');
			window.onscroll = function () {
				if (window.pageYOffset > 160) {
					fixedHeader.style.opacity = '1';
					fixedHeader.style.visibility = 'visible';
					fixedHeader.style.translate = 'translateY(0)';
					fixedHeader.style.top = 0;
				} else {
					fixedHeader.style.opacity = '0';
					fixedHeader.style.visibility = 'hidden';
					fixedHeader.style.translate = 'translateY(-200px)';
					fixedHeader.style.top = '0';
				}
			};
		},
	},
};
</script>
