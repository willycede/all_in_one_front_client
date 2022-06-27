<template>
	<div class="emb-product-detail">
		<template v-if="selectedProduct != null">
			<emb-page-title :heading="selectedProduct.name"></emb-page-title>
			<div class="emb-productDetail-content white">
				<div class="product-detail section-gap">
					<v-container grid-list-xl py-0>
						<v-layout row wrap product-detail-row>
							<v-flex xs12 sm12 md6 lg6 xl6 text-center>
								<v-layout row wrap>
									<v-flex xs2 sm2 md2 lg2 xl2 product-gallery>
										<div 
											class="detail-image-gallery d-inline-block mb-6 mx-2"  
											v-for="(productItemImg,product_images_id) in selectedProduct.images" 
											:key="product_images_id"
											@mouseover="togglePreviewImage(productItemImg.url)"
										>
											<a href="javascript:void(0)">
												<img :src="productItemImg.url" width="71" height="91" alt="product image">
											</a>
										</div>
									</v-flex>
									<v-flex xs10 lg10 sm10 md10 xl10 product-detail-img>
										<div class="product-detail-thumb">
											<div class="image-wrapper emb-card">
												<a href="javascript:void(0)">
													<img class="detailImg" :src="selectedImage"  width="auto" height="auto" alt="product detail image">
												</a>
											</div>
										</div>
									</v-flex>
								</v-layout>
							</v-flex>
							<v-flex xs12 sm12 md6 lg6 xl5>
								<router-link to="/">Back to shop</router-link>
								<h3>{{selectedProduct.name}}</h3>
								<a href="javascript:void(0)" class="color-inherit text-underline mb-4 d-inline-block" @click="showReviewPopup">ADD A REVIEW</a>
								<emb-review-popup ref="productReviewPopup"></emb-review-popup>
								<h4 class="accent--text"><emb-currency-sign></emb-currency-sign>{{selectedProduct.price}}</h4>
								<ul class="product-availablity list-unstyled pl-0 mb-4 mt-4">
									<li>
										<template v-if="selectedProduct.status === true">
											<span class="font-weight-medium">Availablity</span> : <span class="font-weight-regular">In Stocks</span>
										</template>
										<template v-else>
											<span class="font-weight-medium">Availablity</span> : <span class="font-weight-regular">Out Of Stocks</span>
										</template>
									</li>
									<li>
										<span class="font-weight-medium">Product Code</span> : <span class="font-weight-regular">{{selectedProduct.external_product_id}}</span>
									</li>
								</ul>
								<p>{{selectedProduct.descpription}}</p>
									<!-- <div class="bullet-points mb-4">
										<ul class="features pl-13">
											<li v-for="(Features,key) in selectedProduct.features" 	:key="key">
												{{Features}}
											</li>
										</ul>
									</div> -->
								<div class="select-group mb-4">
									<v-layout wrap>
										<v-flex xs12 sm4 lg4 md4 lg3 xl3 pb-0>
											<v-select
												v-model="selectedProduct.quantity"
												:items="[1,2,3,4,5]"
												placeholder="Cantidad"
											>
											</v-select>
										</v-flex>
									</v-layout>
								</div>
								<div class="mb-6 btn-wrap">
									<v-btn 
										v-if="ifItemExistInCart(selectedProduct)"
										class="accent cpx-0"
										large
										to="/cart"
									>
										Ver en el carrito
									</v-btn>
									<v-btn 
										v-else
										class="accent d-inline-block cpx-0"
										large 
										@click="addProductToCart(selectedProduct)"
									>
										Agregar al carrito
									</v-btn>
									<v-btn large to="/checkout" class="white buyProduct cpx-0">Comprar</v-btn>
								</div>
							</v-flex>
						</v-layout>
					</v-container>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
	computed: {
		...mapGetters(["selectedProduct"]),
	},
	async mounted() {
		this.id = this.$route.params.id;
		await this.$store.dispatch("setSelectedProductById", this.id);
		this.selectedImage = this.selectedProduct?.images[0].url;
	},
	watch: {
    "$route"(to) {
		 this.title = to.params.title;
		 this.id = to.params.id;
    },
},
	data () {
		return{
			id: "",
			selectedImage: null
		}
	},
	methods: {
		/* for opening the popup **/
		showReviewPopup() {
			this.$refs.productReviewPopup.open();
		},
		/* for toggling image **/
		togglePreviewImage(image) {
			this.selectedImage = image;
		},
		/* for adding product in car	**/
		addProductToCart(item) {
			console.log(item)
			// this.$snotify.success('Product adding to the cart',{
			// 	closeOnClick: false,
			// 	pauseOnHover: false,
			// 	timeout: 1000,
			// 	showProgressBar:false,
			// });
			// setTimeout(() => {
			// 	this.$store.dispatch("addProductToCart", item);
			// }, 50);
		},
		/* check weather the product exist in cart
			* retun the boolean 
		*/ 
		ifItemExistInCart(result) {
			console.log(result)
			// let exists = false;
			// for (let item of this.cart) {
			// 	if (item.id == result.objectID) {
			// 		exists = true;
			// 	}
			// }
			// return exists;
		},
		/* to add a product in wishlist */
		addItemToWishlist(product) {
			console.log(product)
			// if(this.ifItemExistInWishlist(product)) {
			// 	this.$snotify.error('Product already exist in the wishlist',{
			// 		showProgressBar:false,
			// 	});
			// } 
			// else {
			// 	this.$snotify.success('Product adding to the wishlist',{
			// 		closeOnClick: false,
			// 		pauseOnHover: false,
			// 		timeout: 1000,
			// 		showProgressBar:false,
			// 	});
			// 	setTimeout(() => {
			// 		this.$store.dispatch("addItemToWishlist", product);
			// 	}, 2000);
			// }
		},
		/* check weather the product exist in the wishlist
		 * Return boolean
		*/
		ifItemExistInWishlist(result) {
			console.log(result)
			// let exists = false;
			// for (let item of this.wishlist) {
			// 	if (item.id == result.objectID) {
			// 		exists = true;
			// 	}
			// }
			// return exists;
		},
	}
}
</script>
