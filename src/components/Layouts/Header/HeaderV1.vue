<template>
	<div>
		<div class="header-v1-wrap" >
			<div  class="header-wrap">
				<div  class="top-header-wrap d-block primary">
					<div class="top-header">
						<v-container>
							<v-layout align-center justify-space-between>
								<div class="site-logo d-inline-block">
									<router-link to="/mainPage">
										<img class="logo-small" alt="site-logo" height="34" :src="appLogo">
									</router-link>
								</div>
								<div class="notifications d-inline-flex align-items-center">
									<emb-cart></emb-cart>
									<emb-user-block :data="userLinks"></emb-user-block>
								</div>
							</v-layout>
						</v-container>
					</div>
				</div>
				<div class="bottom-header d-block primary">
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
		</div>
		<div id="fixedHeader">
			<emb-fixed-header></emb-fixed-header>
		</div>
	</div>
</template>

<script>
import Menu from './Menu';
import Cart from './Cart'
import UserBlock from './UserBlock'
import AppConfig from "Constants/AppConfig";

export default {
	data (){
	   return{
			appLogo: AppConfig.appLogo,
			userLinks: [
				{
					icon:'account_circle',
					title: 'Perfil Usuario',
					path:"/account/profile"
				},
				{	
					icon:'power_settings_new',
					title: 'Salir',
					path:"/client/login"
				}
			],
		}
	},
	components: {
		embMenu: Menu,
		embCart:Cart,
		embUserBlock:UserBlock,
	},
	mounted() {
		this.fixedHeader();
	},
	methods: {
		toggleMobileSidebar() {
			this.$store.dispatch("toggleSidebar", true);
		},
		fixedHeader(){
			var fixedHeader = document.getElementById("fixedHeader");
			window.onscroll = function() {
				if (window.pageYOffset > 160) {
					fixedHeader.style.opacity = "1";
					fixedHeader.style.visibility = "visible";
					fixedHeader.style.translate = "translateY(0)";
					fixedHeader.style.top =0
				} 
				else {
					fixedHeader.style.opacity = "0";
					fixedHeader.style.visibility = "hidden";
					fixedHeader.style.translate = "translateY(-200px)";
					fixedHeader.style.top = "0";
				}
			}
		}
	}	
};
</script>