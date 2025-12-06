<template>	
	<div>
	<div class="product-item-wrap emb-card">
		<div>
			<div class="thumb-warp" >
				
				<img alt="product" :src="imageUrl" @click="goToDetail(data)">
				<div class="add-to-cart">
				<v-btn v-if="ifItemExistInCart(data)" to="/cart" class="accent" small icon>
					<v-icon>remove_red_eye</v-icon>
				</v-btn>
				<v-btn
					v-else
					class="accent"
					small icon
					@click="addProductToCart(data)"
				>
					<v-icon>shopping_cart</v-icon>
				</v-btn>
			</div>
			</div>
			<div class="emb-card-content pa-4">
			<h5 class="font-weight-medium text-capitalize">{{name}}</h5>
			<v-chip v-if="requiresDocuments" x-small color="warning" text-color="white" class="mb-2">
				<v-icon x-small left>mdi-file-document</v-icon>
				Requiere documentos
			</v-chip>
			<div class="emb-meta-info layout align-center justify-space-between">
				<div class="inline-block">
					<h6 class="accent--text">
						{{price}}
					</h6>
				</div>
			</div>
		</div>
		</div>	
	</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { moneyMask } from "../../helpers/helpers"
import AppConfig from "Constants/AppConfig";
export default {

	props: ['data','colxs','colsm','colmd','collg','colxl'],
	computed: {
	  ...mapGetters(["cart","wishlist"]),
	  requiresDocuments() {
	  	// Verificar si el producto tiene required_documents y no está vacío
	  	return this.data && 
	  		   this.data.required_documents && 
	  		   this.data.required_documents.length > 0 &&
	  		   this.data.required_documents.trim() !== '';
	  }
	},
	data(){
		return {
			name: '',
			price: 0,
			imageUrl: '',
		}
	},
	mounted(){
		this.name = this.data.name;
		this.price = moneyMask(this.data.price);
		this.imageUrl = this.data.images[0].url;
	},
	methods: {
		/**
		 * method for adding item to cart
		*/
		addProductToCart(item) {


			var img = (item.images)[0].url;
			let price = parseFloat((item.price).replace('$',''));

			let quantity = (typeof(item.quantity) !== 'undefined' && item.quantity !== null) ? item.quantity : 1;


			if(typeof(localStorage.id_users) !== 'undefined' && localStorage.id_users !== null) {

				// Parsear required_documents si existe
				let requiredDocsArray = [];
				if(item.required_documents && item.required_documents.trim() !== '') {
					try {
						requiredDocsArray = JSON.parse(item.required_documents);
					} catch(e) {
						console.error('Error parsing required_documents:', e);
					}
				}

				let newProduct = {
					load_init:false,
					id_user:localStorage.id_users,
					url:img,
					id_details:0,
					name:item.name,
					id_shopping_car:0,
					id_product:item.id_products,
					details_quantity:quantity,
					details_price:price,
					details_discount:0.00,
					details_subtotal:(quantity*price),
					details_iva:(quantity*price)*AppConfig.porcentajeIVa,
					details_total:(quantity*price)+(quantity*price)*AppConfig.porcentajeIVa,
					status:1,
					required_documents_array: requiredDocsArray,
					uploaded_documents: {}
				};

				let message = 'Producto agregado al carrito';
				if(requiredDocsArray.length > 0) {
					message += '. Recuerda subir los documentos requeridos en el carrito.';
				}
				
				this.$snotify.success(message,{
					closeOnClick: false,
					pauseOnHover: false,
					timeout: requiredDocsArray.length > 0 ? 3000 : 1000,
					showProgressBar:false,
				});

				setTimeout(() => {
					this.$store.dispatch("addProductToCart", newProduct);
				}, 500);

			}else{

				this.$snotify.success('Se requiere inicio de sesion para poder agregar productos al carrito.',{
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 4000,
					showProgressBar:false,
				});

			}



			/*this.$snotify.success('ahora Product adding to the cart',{
				closeOnClick: false,
				pauseOnHover: false,
				timeout: 1000,
				showProgressBar:false,
			});
			setTimeout(() => {
				this.$store.dispatch("addProductToCart", item);
			}, 500);*/
		},
		/**
		 * method for checking if item exists in cart
		*/
		ifItemExistInCart(result) {
			let exists = false;
			for (let item of this.cart) {
				if (item.id == result.objectID) {
					exists = true;
				}
			}
			return exists;
		},
		 // this method is use to add a product in wishlist
		addItemToWishlist(data) {
			if(this.ifItemExistInWishlist(data)) {
				this.$snotify.error('Product already exist in the wishlist',{
					showProgressBar:false,
				});
			} 
			else {
				this.$snotify.success('Product adding to the wishlist',{
					closeOnClick: false,
					pauseOnHover: false,
					timeout: 1000,
					showProgressBar:false,
				});
				setTimeout(() => {
					this.$store.dispatch("addItemToWishlist", data);
				}, 2000);
			}
		},
		/**
		 * This Function Is use to check weather the product exist in the wishlist
		 * Return boolean
		*/
		ifItemExistInWishlist(result) {
			let exists = false;
			for (let item of this.wishlist) {
				if (item.id == result.objectID) {
					exists = true;
				}
			}
			return exists;
		}, 
		async goToDetail(product) {
			console.log("sds", product)
			this.$store.dispatch("setSelectedProduct", product);
			this.$router.push({ path: `/products/${product.id_products}` });
		},
  	}
};
</script>