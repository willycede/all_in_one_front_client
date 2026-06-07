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
							<span>{{ $t('header.allCategories') }}</span>
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
							<span>{{ localizedCategoryName(cat.name) }}</span>
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
				:placeholder="$t('header.searchPlaceholder')"
				:aria-label="$t('header.searchProductsAria')"
			/>

			<button type="submit" class="aio-search__btn" :aria-label="$t('common.search')">
				<v-icon size="20" color="white">search</v-icon>
			</button>
		</div>
	</form>
</template>

<script>
import { mapGetters } from 'vuex';
import { buildCatalogQuery } from 'Helpers/catalogQuery';
import { localizedCategoryName } from 'Helpers/localizedCategory';

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
				return this.$t('header.allCategories');
			}
			const match = (this.generalCategories || []).find(
				(cat) => String(cat.idgeneral_categories) === this.selectedCategory
			);
			return match ? this.localizedCategoryName(match.name) : this.$t('header.allCategories');
		},
	},
	async created() {
		if (!this.generalCategories || this.generalCategories.length === 0) {
			await this.$store.dispatch('getGeneralCategories');
		}
	},
	methods: {
		localizedCategoryName(name) {
			return localizedCategoryName(this.$i18n, name);
		},
		selectCategory(value) {
			this.selectedCategory = value;
		},
		onSearch() {
			const query = buildCatalogQuery({
				categoryId: this.selectedCategory ? parseInt(this.selectedCategory, 10) : null,
				searchBy: this.query.trim(),
				page: 1,
				limit: this.$route.query.limit || 12,
			});
			this.$router.push({ path: '/products', query });
		},
	},
};
</script>
