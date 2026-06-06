<template>
	<div class="aio-account account-wrap">
		<div class="aio-account__hero">
			<v-container>
				<div class="aio-account__hero-inner">
					<div class="aio-account__avatar" aria-hidden="true">
						{{ userInitials }}
					</div>
					<div>
						<span class="aio-account__eyebrow">Mi cuenta</span>
						<h1 class="aio-account__title">Hola, {{ userDisplayName }}</h1>
						<p class="aio-account__email">{{ userEmail }}</p>
					</div>
				</div>
			</v-container>
		</div>

		<div class="aio-account__body section-gap">
			<v-container grid-list-xl py-0>
				<v-layout row wrap>
					<v-flex xs12 sm12 md4 lg3 xl3>
						<nav class="aio-account__nav" aria-label="Menú de cuenta">
							<router-link
								v-for="item in navItems"
								:key="item.path"
								:to="item.path"
								class="aio-account__nav-item"
								active-class="aio-account__nav-item--active"
							>
								<span class="aio-account__nav-icon">
									<v-icon size="20">{{ item.icon }}</v-icon>
								</span>
								<span class="aio-account__nav-text">{{ item.title }}</span>
								<v-icon size="16" class="aio-account__nav-arrow">chevron_right</v-icon>
							</router-link>
						</nav>
					</v-flex>

					<v-flex xs12 sm12 md8 lg9 xl9>
						<router-view></router-view>
					</v-flex>
				</v-layout>
			</v-container>
		</div>
	</div>
</template>

<script>
import { getUserDisplayName } from 'Helpers/auth';

export default {
	data() {
		return {
			navItems: [
				{
					title: 'Perfil',
					icon: 'person_outline',
					path: '/account/profile',
				},
				{
					title: 'Historial de pedidos',
					icon: 'history',
					path: '/account/order-history',
				},
			],
		};
	},
	computed: {
		userDisplayName() {
			return getUserDisplayName();
		},
		userEmail() {
			return localStorage.getItem('email') || '';
		},
		userInitials() {
			const name = this.userDisplayName.trim();
			if (!name) return 'U';
			const parts = name.split(/\s+/).filter(Boolean);
			if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
			return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
		},
	},
};
</script>
