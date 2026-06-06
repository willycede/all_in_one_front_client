<template>
	<form class="aio-search" @submit.prevent="onSearch">
		<div class="aio-search__bar">
			<div class="aio-search__category">
				<v-menu
					offset-y
					nudge-bottom="8"
					transition="slide-y-transition"
					content-class="aio-dropdown aio-category-menu"
					min-width="240"
					max-width="280"
				>
					<template v-slot:activator="{ on, attrs }">
						<button
							type="button"
							class="aio-search__category-trigger"
							v-bind="attrs"
							v-on="on"
							aria-haspopup="listbox"
							:aria-expanded="attrs['aria-expanded']"
						>
							<span class="aio-search__category-label">{{ selectedCategoryLabel }}</span>
							<v-icon class="aio-search__select-icon" size="18">expand_more</v-icon>
						</button>
					</template>

					<div class="aio-category-menu__panel" role="listbox">
						<button
							type="button"
							class="aio-category-menu__item"
							:class="{ 'aio-category-menu__item--active': !selectedCategory }"
							role="option"
							:aria-selected="!selectedCategory"
							@click="selectCategory('')"
						>
							<span>Todas las categorías</span>
							<v-icon v-if="!selectedCategory" size="16">check</v-icon>
						</button>
						<button
							v-for="cat in generalCategories"
							:key="cat.idgeneral_categories"
							type="button"
							class="aio-category-menu__item"
							:class="{ 'aio-category-menu__item--active': selectedCategory === String(cat.idgeneral_categories) }"
							role="option"
							:aria-selected="selectedCategory === String(cat.idgeneral_categories)"
							@click="selectCategory(String(cat.idgeneral_categories))"
						>
							<span>{{ cat.name }}</span>
							<v-icon
								v-if="selectedCategory === String(cat.idgeneral_categories)"
								size="16"
							>check</v-icon>
						</button>
					</div>
				</v-menu>
			</div>

			<input
				v-model="query"
				class="aio-search__input"
				type="search"
				placeholder="¿Qué estás buscando?"
				aria-label="Buscar productos"
			/>

			<button type="submit" class="aio-search__btn" aria-label="Buscar">
				<v-icon size="20" color="white">search</v-icon>
			</button>
		</div>
	</form>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	data() {
		return {
			query: '',
			selectedCategory: '',
		};
	},
	computed: {
		...mapGetters(['generalCategories']),
		selectedCategoryLabel() {
			if (!this.selectedCategory) {
				return 'Todas las categorías';
			}
			const match = (this.generalCategories || []).find(
				(cat) => String(cat.idgeneral_categories) === this.selectedCategory
			);
			return match ? match.name : 'Todas las categorías';
		},
	},
	async created() {
		if (!this.generalCategories || this.generalCategories.length === 0) {
			await this.$store.dispatch('getGeneralCategories');
		}
	},
	methods: {
		selectCategory(value) {
			this.selectedCategory = value;
		},
		onSearch() {
			const route = { path: '/products' };
			const query = {};
			if (this.selectedCategory) {
				query.generalCategoryId = this.selectedCategory;
			}
			if (this.query.trim()) {
				query.searchBy = this.query.trim();
			}
			if (Object.keys(query).length) {
				route.query = query;
			}
			this.$router.push(route);
		},
	},
};
</script>
