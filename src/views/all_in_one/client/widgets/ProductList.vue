<template>
	<div class="feature-product-wrap section-gap title-gap">
		<div class="container">
			<div class="sec-title">
				<h2>{{secTitle}}</h2>
			</div>
			<div class="tab-content">
				<template>
					<div>
						<slick ref="carousel" :options="slickOptions" :key="productList">
							<div class="tab-item"  v-for="(product, key) in productList" :key="key">
								<div class="emb-card">
									<div class="thumb-wrap">
											<img 
												alt="feature product image"
												:src="product.images[0].url"
												width="626"
												height="800"
                        @click="goToDetail(product)"
											>
										<!-- <div class="wishlist-icon">
											<v-btn v-if="ifItemExistInWishlist(cateogary)" @click="addItemToWishlist(cateogary)" icon >
												<v-icon  class="black--text">favorite</v-icon>
											</v-btn>
											<v-btn v-else @click="addItemToWishlist(cateogary)" icon >
												<v-icon class="grey--text">favorite</v-icon>
											</v-btn>
										</div>
										<div class="add-to-cart">
											<v-btn v-if="ifItemExistInCart(cateogary,cart)" to="/cart" class="accent" icon absolute bottom>
												<v-icon>remove_red_eye</v-icon>
											</v-btn>
											<v-btn v-else @click="addProductToCart(cateogary)" class="accent" icon >
												<v-icon>shopping_cart</v-icon>
											</v-btn>
										</div> -->
									</div>
									<div class="emb-card-content pa-4">
										<h5  class="font-weight-medium" v-text="product.name"></h5>
										<div class="emb-meta-info layout align-center my-1">
											<div class="inline-block">
												<h6 class="accent--text font-weight-medium">
													{{product.price}}
												</h6>
											</div>
										</div>
									</div>
								</div>
							</div>
						</slick>
					</div>
				</template>	
			</div>	
		</div>
	</div>
</template>

<script>
import Slick from "vue-slick";
import { mapActions, mapGetters } from "vuex";
export default {
  props: ["secTitle"],
  computed: {
    ...mapGetters(["rtlLayout", "cart", "wishlist", "products", "productList"])
  },
  components: {
    Slick
  },
  mounted() {
  },
  async created() {
    await this.getRandomProducts();
    console.log("moneymask", this.productList)
  },
  data() {
    return {
      selectedTab: 0,
      activeTab: null,
      slickOptions: {
        autoplay: true,
        slidesToShow: 4,
        infinite: true,
        arrows: true,
        dots: false,
        rtl: this.rtlLayout,
        responsive: [
          {
            breakpoint: 1200,
            settings: {
              slidesToShow: 3
            }
          },
          {
            breakpoint: 992,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1,
              arrows: false,
              dots: false
            }
          }
        ]
      }
    };
  },
  methods: {
    ...mapActions(['getRandomProducts']),
    changeSelectedProduct(cateogary) {
      this.$store.dispatch("changeSelectedProduct", cateogary);
    },
    /**
     * method for adding item to cart
     */
    addProductToCart(newItem) {
      
      this.$snotify.success("Product adding to the cart", {
        closeOnClick: false,
        pauseOnHover: false,
        timeout: 1000
      });

      setTimeout(() => {
        this.$store.dispatch("addProductToCart", newItem);
      }, 100);

    },
    /**
     * method for to change item
     */
    onTabChange(key) {
      this.selectedTab = key;
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
    goToDetail(product) {
       this.$store.dispatch("setSelectedProduct", product);
       this.$router.push({ path: `/products/${product.id_products}` });
    },
    // this method is use to add a product in wishlist
    addItemToWishlist(item) {
      if (this.ifItemExistInWishlist(item)) {
        this.$snotify.error("Product already exist in the wishlist", {
          showProgressBar: false
        });
      } else {
        this.$snotify.success("Product adding to the wishlist", {
          closeOnClick: false,
          pauseOnHover: false,
          timeout: 1000,
          showProgressBar: false
        });
        setTimeout(() => {
          this.$store.dispatch("addItemToWishlist", item);
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
    }
  }
};
</script>


