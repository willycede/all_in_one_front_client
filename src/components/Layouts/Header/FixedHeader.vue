<template>
	<div class="fixed-header-wrap onsus-header">
		<div class="header-wrap onsus-navbar px-4">
			<v-container grid-list-xl>
				<v-layout align-center justify-space-between row ma-0>
					<div class="onsus-logo">
						<router-link to="/mainPage" class="onsus-logo__link">
							<img
								alt="All in One"
								class="onsus-logo__img onsus-logo__img--compact"
								:src="appLogo"
								:height="logoSize.height"
								:style="{ maxWidth: logoSize.maxWidth + 'px' }"
							>
						</router-link>
					</div>

					<div class="onsus-fixed-header__actions">
						<emb-user-block :data="userLinks"></emb-user-block>
						<emb-wishlist></emb-wishlist>
						<emb-cart></emb-cart>
					</div>

					<div class="onsus-fixed-header__menu">
						<div class="menu-alignment">
							<emb-menu></emb-menu>
						</div>
						<div class="layout align-left responsive-menu">
							<v-btn icon class="onsus-fixed-header__toggle toggle-btn" @click="toggleMobileSidebar">
								<i class="material-icons">menu</i>
							</v-btn>
						</div>
					</div>
				</v-layout>
			</v-container>
		</div>
	</div>
</template>

<script>
import Menu from './Menu';
import UserBlock from './UserBlock';
import Wishlist from './Wishlist';
import Cart from './Cart';
import AppConfig from 'Constants/AppConfig';

export default {
		data() {
		return {
			appLogo: AppConfig.appLogoDark,
			logoSize: {
				height: AppConfig.logo.heightCompact,
				maxWidth: AppConfig.logo.maxWidthCompact,
			},
			userLinks: [
				{ title: 'Mi cuenta', path: '/account/profile' },
				{ title: 'Mis pedidos', path: '/account/order-history' },
				{ title: 'Favoritos', path: '/favorites' },
			],
		};
	},
	components: {
		embMenu: Menu,
		embUserBlock: UserBlock,
		embWishlist: Wishlist,
		embCart: Cart,
	},
	methods: {
		toggleMobileSidebar() {
			this.$store.dispatch('toggleSidebar', true);
		},
	},
};
</script>
