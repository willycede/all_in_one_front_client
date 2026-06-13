<template>
	<header class="aio-admin-page-hero">
		<div class="aio-admin-page-hero__surface">
			<div class="aio-admin-page-hero__glow" aria-hidden="true"></div>

			<nav class="aio-admin-breadcrumb" aria-label="Breadcrumb">
				<ol class="aio-admin-breadcrumb__trail">
					<li
						v-for="(crumb, index) in resolvedBreadcrumbs"
						:key="`${crumb.label}-${index}`"
						class="aio-admin-breadcrumb__item"
					>
						<router-link
							v-if="crumb.to && !crumb.current"
							:to="crumb.to"
							class="aio-admin-breadcrumb__chip"
						>
							<v-icon v-if="index === 0" class="aio-admin-breadcrumb__chip-icon" size="15">dashboard</v-icon>
							<span>{{ crumb.label }}</span>
						</router-link>
						<span
							v-else
							class="aio-admin-breadcrumb__chip aio-admin-breadcrumb__chip--current"
							aria-current="page"
						>
							<span>{{ crumb.label }}</span>
						</span>
						<v-icon
							v-if="index < resolvedBreadcrumbs.length - 1"
							class="aio-admin-breadcrumb__sep"
							size="14"
						>chevron_right</v-icon>
					</li>
				</ol>
			</nav>

			<div class="aio-admin-page-hero__body">
				<div class="aio-admin-page-hero__copy">
					<div class="aio-admin-page-hero__title-block">
						<span class="aio-admin-page-hero__accent" aria-hidden="true"></span>
						<div class="aio-admin-page-hero__text">
							<h1 class="aio-admin-page-hero__title">{{ resolvedTitle }}</h1>
							<p v-if="resolvedSubtitle" class="aio-admin-page-hero__subtitle">
								<v-icon class="aio-admin-page-hero__subtitle-icon" size="16">info_outline</v-icon>
								<span>{{ resolvedSubtitle }}</span>
							</p>
						</div>
					</div>
				</div>
				<div v-if="$slots.actions" class="aio-admin-page-hero__actions">
					<slot name="actions"></slot>
				</div>
			</div>
		</div>
	</header>
</template>

<script>
import { resolveAdminPageMeta } from 'Helpers/adminPageMeta';

export default {
	name: 'AdminPageHeader',
	props: {
		title: { type: String, default: '' },
		subtitle: { type: String, default: '' },
		breadcrumbs: { type: Array, default: null },
	},
	computed: {
		routeMeta() {
			return resolveAdminPageMeta(this.$route.path, (key) => this.$t(key));
		},
		resolvedTitle() {
			return this.title || this.routeMeta.title;
		},
		resolvedSubtitle() {
			return this.subtitle || this.routeMeta.subtitle;
		},
		resolvedBreadcrumbs() {
			if (this.breadcrumbs && this.breadcrumbs.length) {
				return this.breadcrumbs.map((crumb, index, list) => ({
					...crumb,
					current: index === list.length - 1,
				}));
			}
			return this.routeMeta.breadcrumbs;
		},
	},
};
</script>
