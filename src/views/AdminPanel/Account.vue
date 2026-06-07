<template>
	<div class="aio-admin-page aio-admin-account">
		<div class="aio-admin-account__header">
			<div class="aio-admin-account__avatar" aria-hidden="true">{{ userInitials }}</div>
			<div>
				<p class="aio-admin-account__user-name">{{ userDisplayName }}</p>
				<p class="aio-admin-account__user-email">{{ userEmail }}</p>
			</div>
		</div>

		<nav class="aio-admin-account__nav" aria-label="Secciones de cuenta">
			<router-link
				v-for="item in navItems"
				:key="item.path"
				:to="item.path"
				class="aio-admin-account__nav-item"
				active-class="aio-admin-account__nav-item--active"
			>
				<v-icon>{{ item.icon }}</v-icon>
				<span>{{ item.title }}</span>
			</router-link>
		</nav>

		<div class="aio-admin-account__content">
			<router-view></router-view>
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
					path: '/admin-panel/account/profile',
				},
				{
					title: 'Colaboración',
					icon: 'groups',
					path: '/admin-panel/account/collaboration',
				},
				{
					title: 'Configuración',
					icon: 'settings',
					path: '/admin-panel/account/settings',
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
			if (!name) return 'A';
			const parts = name.split(/\s+/).filter(Boolean);
			if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
			return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
		},
	},
};
</script>
