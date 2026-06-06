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
					<div>
						<div class="menu-alignment">
							<emb-menu></emb-menu>
						</div>
						<div class="layout align-left responsive-menu">
							<v-btn icon dark @click="toggleMobileSidebar" class="toggle-btn">
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
import AppConfig from 'Constants/AppConfig';

export default {
	data() {
		return {
			appLogo: AppConfig.appLogoDark,
			logoSize: {
				height: AppConfig.logo.heightCompact,
				maxWidth: AppConfig.logo.maxWidthCompact,
			},
		};
	},
	components: {
		embMenu: Menu,
	},
	methods: {
		toggleMobileSidebar() {
			this.$store.dispatch('toggleSidebar', true);
		},
	},
};
</script>
