<template>
   <div class="home-banner-v2 section-gap pt-4 pb-0"> 
      <div class="slider-container" v-if="generalCategories.length > 0">
         <slick ref="carousel" :options="slickOptions">
            <div class="slider-wrap text-center" v-for="(category,key) in generalCategories" :key="key">
               <div  class="banner-slide">
                  <img :src="'/static/images/generalCategories/' + category.name +'.jpg'" alt="slide-item" width="100%" height="660">
                  <div class="emb-banner-content">
                     <div class="slider-content-v3-inner ma-auto">
						<h3 class="bold-white">{{category.name}}</h3>
						<v-btn color="accent mt-0" to="/products">Ver productos</v-btn>
                     </div>
                </div>
               </div>
            </div>
         </slick>
      </div>
   </div>
</template>

<script>
import Slick from "vue-slick";
import { mapActions, mapGetters } from 'vuex';
export default {
	components: { Slick },
	data() {
    return {
	  responsiveOptions: [],
      slickOptions: {
         infinite: true,
         centerMode: true,
         centerPadding: '420px',
         slidesToShow: 1,
         slidesToScroll: 1,
         autoplay: true,
         autoplaySpeed: 2000,
         dots: false,
         arrows:false,
         rtl: this.isRTL,
        responsive:[
            {
               breakpoint: 1400,
               settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '300px',
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            },
            {
               breakpoint: 1199,
               settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '150px',
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            },
            {
               breakpoint: 899,
               settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '75px',
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            },
            {
               breakpoint: 768,
               settings: {
                  arrows: false,
                  centerMode: false,
                  centerPadding: '0',
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            },
            {
               breakpoint: 480,
               settings: {
                  arrows: false,
                  centerMode: false,
                  centerPadding: '0',
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000
               }
            }
         ]
      }
    };
  },
  methods: {
	...mapActions(['getGeneralCategories']),
  },
  computed: mapGetters(['generalCategories']),
  mounted() {
  },
  async created() {
    await this.getGeneralCategories();
  }
}
</script>

