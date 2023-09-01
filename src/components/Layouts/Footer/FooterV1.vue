<template>
	<div class="footerV1-wrap section-gap">
		<v-container grid-list-xl py-0>
			<div class="footer-bottom">
				<div class="footer-bottom-content px-3">
					<v-layout row wrap align-center justify-space-between>
						<v-flex xs12 sm12 md6 lg6 xl6 class="text-md-left text-center"> 
							<img :src="img" width="218" height="18"/>
						</v-flex>
						<v-flex xs12 sm12 md6 lg6 xl6 py-3 px-2>
							<div class="text-md-right text-center">
								<span class="white--text">{{copyrightText}}</span>
							</div>
						</v-flex>
					</v-layout>
				</div>
			</div>
		</v-container>
	</div>
</template>

<script>
import AppConfig from "Constants/AppConfig";

export default {
	props:['title','description','img'],
	data () {
		return{
			copyrightText: AppConfig.copyrightText
		}
	}
}
</script>

