<template>
	<div>
		<div class="sec-title">
			<h2>Categorías</h2>
		</div>
		<div class="main">
			<emb-companies-list></emb-companies-list>
			<emb-product-list
				secTitle="Productos"
				:data="latestArrivalData"
			>
			</emb-product-list>
		</div>
	</div>
</template>
<script>
// widgets
import ProductList from "../widgets/ProductList";
import CompaniesList from "../widgets/CompaniesList";

// data
import latestArrivalData from "Assets/data/latestArrivalData";

import api from "Api";
import { mapActions, mapGetters } from 'vuex';

export default {
  components: {
    embProductList: ProductList,
    embCompaniesList: CompaniesList,
  },
  data() {
    return {
      latestArrivalData,
    };
  },
  mounted() {
    this.getBlogData();
  },
  methods: {
	...mapActions(['getCompanies']),
    getBlogData() {
      api
        .get("blogs.json")
        .then(response => {
          this.blogData = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  computed: mapGetters(['companies']),
  created() {
    this.getCompanies();
  }
};
</script>