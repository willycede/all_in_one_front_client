<template>
	<div class="aio-admin-page aio-admin-product-form">
		<AdminPageHeader />

		<div v-if="loadError" class="aio-admin-page__error">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ loadError }}
		</div>

		<form class="aio-admin-product-form__layout" @submit.prevent="submitProduct">
			<div class="aio-admin-product-form__main">
				<section class="aio-admin-card aio-admin-product-form__section">
					<header class="aio-admin-product-form__section-head">
						<span class="aio-admin-product-form__section-icon">
							<v-icon size="20">inventory_2</v-icon>
						</span>
						<div>
							<h3>{{ $t('adminProducts.sectionInfoTitle') }}</h3>
							<p>{{ $t('adminProducts.sectionInfoHint') }}</p>
						</div>
					</header>

					<div class="aio-admin-product-form__fields">
						<v-text-field
							v-model="form.name"
							:label="$t('adminProducts.nameLabel')"
							:placeholder="$t('adminProducts.namePlaceholder')"
							outlined
							dense
							hide-details="auto"
							:error-messages="fieldErrors.name"
						></v-text-field>

						<v-text-field
							v-model="form.cod_products"
							:label="$t('adminProducts.skuLabel')"
							:placeholder="$t('adminProducts.skuPlaceholder')"
							outlined
							dense
							hide-details="auto"
							:hint="$t('adminProducts.skuHint')"
							persistent-hint
							:error-messages="fieldErrors.cod_products"
						></v-text-field>

						<v-textarea
							v-model="form.description"
							:label="$t('adminProducts.descriptionLabel')"
							:placeholder="$t('adminProducts.descriptionPlaceholder')"
							outlined
							dense
							rows="4"
							hide-details="auto"
							counter="500"
							:rules="[v => !v || v.length <= 500 || $t('adminProducts.descriptionMax')]"
						></v-textarea>
					</div>
				</section>

				<section class="aio-admin-card aio-admin-product-form__section">
					<header class="aio-admin-product-form__section-head">
						<span class="aio-admin-product-form__section-icon">
							<v-icon size="20">payments</v-icon>
						</span>
						<div>
							<h3>{{ $t('adminProducts.sectionPriceTitle') }}</h3>
							<p>{{ $t('adminProducts.sectionPriceHint') }}</p>
						</div>
					</header>

					<div class="aio-admin-product-form__fields aio-admin-product-form__fields--row">
						<v-text-field
							v-model="form.price"
							:label="$t('adminProducts.priceLabel')"
							type="number"
							min="0"
							step="0.01"
							prefix="$"
							outlined
							dense
							hide-details="auto"
							:error-messages="fieldErrors.price"
						></v-text-field>

						<v-text-field
							v-model="form.discount"
							:label="$t('adminProducts.discountLabel')"
							type="number"
							min="0"
							step="0.01"
							prefix="$"
							outlined
							dense
							hide-details="auto"
							:hint="$t('adminProducts.discountHint')"
							persistent-hint
							:error-messages="fieldErrors.discount"
						></v-text-field>
					</div>

					<p v-if="previewFinalPrice !== null" class="aio-admin-product-form__price-hint">
						{{ $t('adminProducts.finalPrice') }}
						<strong>${{ previewFinalPrice }}</strong>
					</p>
				</section>

				<section class="aio-admin-card aio-admin-product-form__section">
					<header class="aio-admin-product-form__section-head">
						<span class="aio-admin-product-form__section-icon">
							<v-icon size="20">category</v-icon>
						</span>
						<div>
							<h3>{{ $t('adminProducts.sectionClassTitle') }}</h3>
							<p>{{ $t('adminProducts.sectionClassHint') }}</p>
						</div>
					</header>

					<div class="aio-admin-product-form__fields aio-admin-product-form__fields--row">
						<v-select
							v-model="form.id_cod_catalog"
							:items="catalogs"
							item-text="name_catalog"
							item-value="id_catalog"
							:label="$t('adminProducts.catalogLabel')"
							:placeholder="$t('adminProducts.catalogPlaceholder')"
							outlined
							dense
							hide-details="auto"
							:loading="loadingOptions"
							:no-data-text="loadingOptions ? $t('adminProducts.loadingOptions') : $t('adminProducts.noCatalogs')"
							:error-messages="fieldErrors.id_cod_catalog"
						></v-select>

						<v-select
							v-model="form.id_category"
							:items="categories"
							item-text="display_name"
							item-value="id_category"
							:label="$t('adminProducts.categoryLabel')"
							:placeholder="$t('adminProducts.categoryPlaceholder')"
							outlined
							dense
							hide-details="auto"
							:loading="loadingOptions"
							:no-data-text="loadingOptions ? $t('adminProducts.loadingOptions') : $t('adminProducts.noCategories')"
							:error-messages="fieldErrors.id_category"
						></v-select>
					</div>
				</section>

				<section class="aio-admin-card aio-admin-product-form__section">
					<product-modifiers-section v-model="form.modifiers"></product-modifiers-section>
				</section>

				<section class="aio-admin-card aio-admin-product-form__section">
					<header class="aio-admin-product-form__section-head">
						<span class="aio-admin-product-form__section-icon">
							<v-icon size="20">location_city</v-icon>
						</span>
						<div>
							<h3>{{ $t('adminProducts.sectionCitiesTitle') }}</h3>
							<p>{{ $t('adminProducts.sectionCitiesHint') }}</p>
						</div>
					</header>

					<v-autocomplete
						v-model="form.allowed_cities"
						:items="cities"
						item-text="name"
						item-value="id_city"
						:label="$t('adminProducts.citiesLabel')"
						:placeholder="$t('adminProducts.citiesPlaceholder')"
						multiple
						chips
						small-chips
						deletable-chips
						outlined
						dense
						hide-details="auto"
						:loading="loadingOptions"
						:hint="$t('adminProducts.citiesHint')"
						persistent-hint
					></v-autocomplete>
				</section>

				<section class="aio-admin-card aio-admin-product-form__section">
					<header class="aio-admin-product-form__section-head">
						<span class="aio-admin-product-form__section-icon">
							<v-icon size="20">link</v-icon>
						</span>
						<div>
							<h3>{{ $t('adminProducts.sectionExternalTitle') }}</h3>
							<p>{{ $t('adminProducts.sectionExternalHint') }}</p>
						</div>
					</header>

					<v-text-field
						v-model="form.external_product_id"
						:label="$t('adminProducts.externalIdLabel')"
						:placeholder="$t('adminProducts.externalIdPlaceholder')"
						outlined
						dense
						hide-details="auto"
					></v-text-field>
				</section>

				<section class="aio-admin-card aio-admin-product-form__section aio-admin-product-form__section--muted">
					<product-images-section
						ref="imagesSection"
						:product-id="null"
						:images="[]"
						@cover-change="coverPreview = $event"
					></product-images-section>
				</section>

				<div class="aio-admin-product-form__actions">
					<v-btn
						type="button"
						outlined
						color="primary"
						:disabled="isSubmitting"
						@click="discardChanges"
					>
						{{ $t('adminProducts.discard') }}
					</v-btn>
					<v-btn
						type="submit"
						color="primary"
						depressed
						:loading="isSubmitting"
						:disabled="!canSubmit"
					>
						<v-icon left>publish</v-icon>
						{{ $t('adminProducts.publish') }}
					</v-btn>
				</div>
			</div>

			<aside class="aio-admin-product-form__aside">
				<div class="aio-admin-card aio-admin-product-form__preview">
					<span class="aio-admin-product-form__preview-label">{{ $t('adminProducts.previewLabel') }}</span>

					<div class="aio-admin-product-form__preview-card">
						<div class="aio-admin-product-form__preview-image">
							<img v-if="coverPreview" :src="coverPreview" alt="" class="aio-admin-product-form__preview-img">
							<v-icon v-else size="48" color="#A96DFA">image</v-icon>
						</div>
						<div class="aio-admin-product-form__preview-body">
							<p class="aio-admin-product-form__preview-name">
								{{ form.name || $t('adminProducts.previewNameFallback') }}
							</p>
							<p class="aio-admin-product-form__preview-category">
								{{ selectedCategoryName || $t('adminProducts.previewCategoryFallback') }}
							</p>
							<p class="aio-admin-product-form__preview-price">
								${{ previewFinalPrice !== null ? previewFinalPrice : '0.00' }}
							</p>
						</div>
					</div>

					<p class="aio-admin-product-form__preview-note">
						{{ $t('adminProducts.previewNote') }}
					</p>
				</div>

				<div class="aio-admin-card aio-admin-product-form__checklist">
					<h4>{{ $t('adminProducts.checklistTitle') }}</h4>
					<ul>
						<li :class="{ 'aio-admin-product-form__check--done': !!form.name }">
							<v-icon size="16">{{ form.name ? 'check_circle' : 'radio_button_unchecked' }}</v-icon>
							{{ $t('adminProducts.checkName') }}
						</li>
						<li :class="{ 'aio-admin-product-form__check--done': !!form.cod_products }">
							<v-icon size="16">{{ form.cod_products ? 'check_circle' : 'radio_button_unchecked' }}</v-icon>
							{{ $t('adminProducts.checkSku') }}
						</li>
						<li :class="{ 'aio-admin-product-form__check--done': isPriceValid }">
							<v-icon size="16">{{ isPriceValid ? 'check_circle' : 'radio_button_unchecked' }}</v-icon>
							{{ $t('adminProducts.checkPrice') }}
						</li>
						<li :class="{ 'aio-admin-product-form__check--done': !!form.id_cod_catalog }">
							<v-icon size="16">{{ form.id_cod_catalog ? 'check_circle' : 'radio_button_unchecked' }}</v-icon>
							{{ $t('adminProducts.checkCatalog') }}
						</li>
						<li :class="{ 'aio-admin-product-form__check--done': !!form.id_category }">
							<v-icon size="16">{{ form.id_category ? 'check_circle' : 'radio_button_unchecked' }}</v-icon>
							{{ $t('adminProducts.checkCategory') }}
						</li>
					</ul>
				</div>
			</aside>
		</form>
	</div>
</template>

<script>
import api from 'Api';
import ProductImagesSection from 'Components/Admin/ProductImagesSection';
import ProductModifiersSection from 'Components/Admin/ProductModifiersSection';
import { buildCategoryOptions } from 'Helpers/categoryHierarchy';

function emptyForm() {
	return {
		name: '',
		cod_products: '',
		description: '',
		price: '',
		discount: '0',
		id_cod_catalog: null,
		id_category: null,
		external_product_id: '',
		modifiers: [],
		allowed_cities: [],
	};
}

export default {
	components: {
		ProductImagesSection,
		ProductModifiersSection,
	},
	data() {
		return {
			form: emptyForm(),
			coverPreview: '',
			fieldErrors: {},
			catalogs: [],
			categories: [],
			cities: [],
			loadingOptions: true,
			loadError: '',
			isSubmitting: false,
		};
	},
	computed: {
		previewFinalPrice() {
			const price = parseFloat(this.form.price);
			const discount = parseFloat(this.form.discount) || 0;
			if (!Number.isFinite(price) || price <= 0) {
				return null;
			}
			return Math.max(0, price - discount).toFixed(2);
		},
		isPriceValid() {
			const price = parseFloat(this.form.price);
			const discount = parseFloat(this.form.discount) || 0;
			return Number.isFinite(price) && price > 0 && discount < price;
		},
		selectedCategoryName() {
			if (!this.form.id_category) return '';
			const match = this.categories.find(
				(item) => String(item.id_category) === String(this.form.id_category)
			);
			return match ? match.name : '';
		},
		canSubmit() {
			return !!this.form.name
				&& !!this.form.cod_products
				&& !!this.form.id_cod_catalog
				&& !!this.form.id_category
				&& this.isPriceValid
				&& !this.isSubmitting;
		},
	},
	async mounted() {
		await this.loadFormOptions();
	},
	methods: {
		async loadFormOptions() {
			this.loadingOptions = true;
			this.loadError = '';
			try {
				const [catalogRes, categoryRes, citiesRes] = await Promise.all([
					api.get('/api/catalogs/getCatalogs'),
					api.get('/api/categories/getCategories/1'),
					api.get('/api/cities/catalog'),
				]);
				this.catalogs = (catalogRes.data && catalogRes.data.data) || [];
				this.categories = buildCategoryOptions(
					(categoryRes.data && categoryRes.data.data) || []
				);
				this.cities = (citiesRes.data && citiesRes.data.data) || [];
			} catch (error) {
				this.loadError = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| this.$t('adminProducts.optionsLoadError');
			} finally {
				this.loadingOptions = false;
			}
		},
		validateClientSide() {
			const errors = {};
			if (!this.form.name || !String(this.form.name).trim()) {
				errors.name = this.$t('adminProducts.errors.nameRequired');
			}
			if (!this.form.cod_products || !String(this.form.cod_products).trim()) {
				errors.cod_products = this.$t('adminProducts.errors.skuRequired');
			}
			if (!this.form.id_cod_catalog) {
				errors.id_cod_catalog = this.$t('adminProducts.errors.catalogRequired');
			}
			if (!this.form.id_category) {
				errors.id_category = this.$t('adminProducts.errors.categoryRequired');
			}
			const price = parseFloat(this.form.price);
			const discount = parseFloat(this.form.discount) || 0;
			if (!Number.isFinite(price) || price <= 0) {
				errors.price = this.$t('adminProducts.errors.priceInvalid');
			}
			if (Number.isFinite(price) && discount >= price) {
				errors.discount = this.$t('adminProducts.errors.discountInvalid');
			}
			this.fieldErrors = errors;
			return Object.keys(errors).length === 0;
		},
		buildPayload() {
			return {
				name: String(this.form.name).trim(),
				cod_products: String(this.form.cod_products).trim(),
				description: String(this.form.description || '').trim(),
				price: parseFloat(this.form.price),
				discount: parseFloat(this.form.discount) || 0,
				id_cod_catalog: parseInt(this.form.id_cod_catalog, 10),
				id_category: parseInt(this.form.id_category, 10),
				external_product_id: this.form.external_product_id
					? String(this.form.external_product_id).trim()
					: null,
				modifiers: (this.form.modifiers || [])
					.filter((modifier) => modifier.name && String(modifier.name).trim())
					.map((modifier) => ({
						type: modifier.type || 'color',
						name: String(modifier.name).trim(),
						price_delta: parseFloat(modifier.price_delta) || 0,
					})),
				allowed_cities: this.form.allowed_cities || [],
			};
		},
		async submitProduct() {
			if (!this.validateClientSide()) {
				this.$snotify.warning(this.$t('adminProducts.validationReview'), { timeout: 3000 });
				return;
			}

			this.isSubmitting = true;
			try {
				const response = await api.post('/api/products/createProduct', this.buildPayload());
				const created = response.data && response.data.data;
				const productId = created && created.id_products;
				if (productId && this.$refs.imagesSection) {
					await this.$refs.imagesSection.uploadPending(productId);
				}
				this.$snotify.success(this.$t('adminProducts.createSuccess'), { timeout: 2500 });
				this.$router.push('/admin-panel/products');
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| this.$t('adminProducts.createError');
				this.$snotify.error(message, { timeout: 4000 });
			} finally {
				this.isSubmitting = false;
			}
		},
		discardChanges() {
			this.form = emptyForm();
			this.fieldErrors = {};
			this.$router.push('/admin-panel/products');
		},
	},
};
</script>

<style scoped>
.aio-admin-product-form__intro {
	margin-bottom: 1.5rem;
}

.aio-admin-product-form__back {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	margin-bottom: 1rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: #A96DFA;
	text-decoration: none;
}

.aio-admin-product-form__back:hover {
	color: #CA1DFF;
}

.aio-admin-product-form__eyebrow {
	display: block;
	margin-bottom: 0.5rem;
	font-size: 0.6875rem;
	font-weight: 700;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: #A96DFA;
}

.aio-admin-product-form__lead {
	margin: 0;
	max-width: 640px;
}

.aio-admin-product-form__layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 300px;
	gap: 1.25rem;
	align-items: start;
}

.aio-admin-product-form__main {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.aio-admin-product-form__section {
	padding: 1.25rem 1.5rem;
}

.aio-admin-product-form__section--muted {
	background: rgba(169, 109, 250, 0.04);
}

.aio-admin-product-form__section-head {
	display: flex;
	gap: 1rem;
	margin-bottom: 1.25rem;
}

.aio-admin-product-form__section-head h3 {
	margin: 0 0 0.25rem;
	font-size: 1.0625rem;
	font-weight: 700;
	color: #111827;
}

.aio-admin-product-form__section-head p {
	margin: 0;
	font-size: 0.8125rem;
	color: #6b7280;
	line-height: 1.5;
}

.aio-admin-product-form__section-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 10px;
	background: rgba(169, 109, 250, 0.12);
	flex-shrink: 0;
}

.aio-admin-product-form__section-icon .v-icon {
	color: #A96DFA !important;
}

.aio-admin-product-form__fields {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.aio-admin-product-form__fields--row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}

.aio-admin-product-form__price-hint {
	margin: 0.75rem 0 0;
	font-size: 0.875rem;
	color: #374151;
}

.aio-admin-product-form__actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
	flex-wrap: wrap;
	padding: 0.25rem 0 1rem;
}

.aio-admin-product-form__aside {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	position: sticky;
	top: 5.5rem;
}

.aio-admin-product-form__preview,
.aio-admin-product-form__checklist {
	padding: 1.25rem;
}

.aio-admin-product-form__preview-label {
	display: block;
	margin-bottom: 1rem;
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: #6b7280;
}

.aio-admin-product-form__preview-card {
	border-radius: 14px;
	overflow: hidden;
	border: 1px solid rgba(169, 109, 250, 0.15);
	background: #fff;
}

.aio-admin-product-form__preview-image {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 140px;
	background: linear-gradient(145deg, #f8f5ff 0%, #f3eefb 100%);
	overflow: hidden;
}

.aio-admin-product-form__preview-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.aio-admin-product-form__preview-body {
	padding: 1rem;
}

.aio-admin-product-form__preview-name {
	margin: 0 0 0.25rem;
	font-size: 0.9375rem;
	font-weight: 700;
	color: #111827;
	line-height: 1.35;
}

.aio-admin-product-form__preview-category {
	margin: 0 0 0.5rem;
	font-size: 0.75rem;
	color: #6b7280;
}

.aio-admin-product-form__preview-price {
	margin: 0;
	font-size: 1.125rem;
	font-weight: 700;
	color: #A96DFA;
}

.aio-admin-product-form__preview-note {
	margin: 0.75rem 0 0;
	font-size: 0.75rem;
	color: #9ca3af;
	line-height: 1.45;
}

.aio-admin-product-form__checklist h4 {
	margin: 0 0 0.875rem;
	font-size: 0.9375rem;
	font-weight: 700;
	color: #111827;
}

.aio-admin-product-form__checklist ul {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 0.625rem;
}

.aio-admin-product-form__checklist li {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.8125rem;
	color: #6b7280;
}

.aio-admin-product-form__checklist li .v-icon {
	color: #d1d5db !important;
}

.aio-admin-product-form__check--done {
	color: #111827;
	font-weight: 500;
}

.aio-admin-product-form__check--done .v-icon {
	color: #A96DFA !important;
}

@media (max-width: 1100px) {
	.aio-admin-product-form__layout {
		grid-template-columns: 1fr;
	}

	.aio-admin-product-form__aside {
		position: static;
		order: -1;
	}

	.aio-admin-product-form__fields--row {
		grid-template-columns: 1fr;
	}
}
</style>
