<template>
   <div class="sidebar-filter-wrap">
      <div class="search-box emb-card white mb-6 pa-6">
         <v-text-field  v-model="searchBy" label="Buscar producto"></v-text-field>
      </div>
      <div class="cateogary-block emb-card white mb-6 pa-6">
         <h5>CATEGORÍAS GENERALES</h5>
         <v-radio-group v-model="selectedCategory">
            <v-radio
            v-for="(category, key, index) in generalCategories"
            :key="index"
            :label="category.name"
            :value="category.idgeneral_categories"
            ></v-radio>
         </v-radio-group>
      </div>
      <div class="emb-card white pa-6">
         <button class="v-btn v-btn--contained">
            Limpiar filtros
         </button>
      </div>
   </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
export default {
	data() {
    return {
      selectedCategory: undefined,
      searchBy: '',
	 }
  },
  watch: {
    selectedCategory(newCategory) {
      this.selectedFilterCategory(newCategory);
    },
    searchBy(newSearchBy) {
       this.getProductsByCategoryIdAndFilters({categoryId: this.selectedCategory, searchBy: newSearchBy});
    }
  },
  methods: {
	...mapActions(['getGeneralCategories', 'getProductsByCategoryIdAndFilters']),
   selectedFilterCategory(newCategory) {
      this.getProductsByCategoryIdAndFilters({categoryId: newCategory})
   }
  },
  computed: mapGetters(['generalCategories']),
  mounted() {
   if(this.$route.query?.generalCategoryId) {
      this.selectedCategory = parseInt(this.$route.query.generalCategoryId);
   }
  },
  async created() {
    await this.getGeneralCategories();
  }
}
</script>
,