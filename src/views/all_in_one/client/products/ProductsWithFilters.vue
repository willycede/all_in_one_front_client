<template>
	<div class="emb-gadget-wrap">
		<div class="gadget-content section-gap">	
			<v-container grid-list-xl py-0>
				<v-layout row wrap>
					<v-flex xs12 sm12 md4 lg3 xl3>
						<emb-sidebar-filters></emb-sidebar-filters>
					</v-flex>
					<v-flex xs12 sm12 md8 lg9 xl9>
						<product-items></product-items> 
					</v-flex>
				</v-layout>
			</v-container>
		</div>	
	</div>
</template>

<script>
import ProductItems from "Components/Ecommerce/ProductItems";
import SidebarFilters from 'Components/Ecommerce/SidebarFilters'

export default {
	components:{
		embSidebarFilters:SidebarFilters,
		ProductItems
	},
	data(){
		return{
		}
	},
	mounted(){
	}
}
</script>