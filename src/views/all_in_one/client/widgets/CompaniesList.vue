<template>
	<div class="emb-detailOffer-wrap">
		<div class="offer-list">
			<v-layout row wrap>
				<v-flex xs12 sm12 md12 lg4 xl4 v-for="(company, index) in companies" :key="index">
					<router-link to="/products/women">
						<div class="overlay-wrap">
							<a href="javascript:void(0)">
								<img class="w-100 fixed" :src="company.img" width="640">
							</a>
							<div class="overlay-content primary-rgba">
								<div>
									<h2>{{company.name}}</h2>
									<h5>{{company.description}}</h5>
								</div>
							</div>
					  </div>
					</router-link>
				</v-flex>
			</v-layout>
		</div>
	</div>
</template>
<script>

import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
    };
  },
  mounted() {
  },
  methods: {
	...mapActions(['getCompanies']),
  },
  computed: mapGetters(['companies']),
  created() {
    this.getCompanies();
  }
};
</script>