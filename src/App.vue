<template>
	<v-app>
		<router-view></router-view>
	    <cookie-banner />
	</v-app>
</template>

<script>
import { mapGetters } from "vuex";
import CookieBanner from "Components/Global/CookieBanner.vue";
export default {
	components: { CookieBanner },
	computed: {
		...mapGetters(["rtlLayout"]),
		mobileMenu: {
			get() {
				return this.$store.getters.sidebarOpen;
			},
			set(val) {
				this.$store.dispatch("toggleSidebar", val);
			}
		}
	},
	/**
	 * Method To set the Rtl While page is opened
	*/
	mounted() {
		if(this.rtlLayout) {
			this.$vuetify.rtl = this.rtlLayout;
		}
		this.$store.dispatch('loadMenus');
	},
	methods: {
		/**
		 * Method To Toggle The RTL Layout
		 */
		toggleRTLLayout() {
			this.$vuetify.rtl = !this.rtlLayout;
			this.$store.dispatch("changeRtlLayout");
		},
	}
}
</script>


