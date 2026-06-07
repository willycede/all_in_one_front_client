<template>
	<v-app>
		<router-view></router-view>
	    <cookie-banner />
	</v-app>
</template>

<script>
import { mapGetters } from "vuex";
import CookieBanner from "Components/Global/CookieBanner.vue";
import { removeAppSplash } from "Helpers/appSplash";
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
		this.$nextTick(() => {
			removeAppSplash();
		});

		if(this.rtlLayout) {
			this.$vuetify.rtl = this.rtlLayout;
		}
		this.$store.dispatch('loadMenus');

		if (localStorage.id_users) {
			this.$store.dispatch('syncActiveCart').catch(() => {
				this.$store.dispatch('addSetToCart', []);
			});
			this.$store.dispatch('loadUserPreferences').then((prefs) => {
				if (prefs && prefs.locale) {
					this.$i18n.locale = prefs.locale;
				}
			});
		}
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


