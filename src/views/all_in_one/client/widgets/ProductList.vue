<template>
	<section class="aio-featured">
		<div class="aio-featured__head">
			<div class="aio-featured__head-text">
				<span class="aio-featured__eyebrow">Selección especial</span>
				<h2 class="aio-featured__title">{{ secTitle }}</h2>
				<p class="aio-featured__subtitle">Lo mejor de nuestro catálogo, seleccionado para ti</p>
			</div>
			<router-link to="/products" class="aio-featured__link">
				Ver catálogo completo
				<v-icon size="16">east</v-icon>
			</router-link>
		</div>

		<div v-if="loading" class="aio-featured__state">
			<v-progress-circular indeterminate color="#A96DFA" size="36" width="3"></v-progress-circular>
		</div>

		<div v-else-if="featuredProducts.length === 0" class="aio-featured__state">
			<v-icon size="40" color="#A96DFA">inventory_2</v-icon>
			<p>No hay productos disponibles por el momento</p>
		</div>

		<div v-else class="aio-featured__grid">
			<article
				v-for="product in featuredProducts"
				:key="product.id_products"
				class="aio-featured__card"
				@click="goToDetail(product)"
			>
				<div class="aio-featured__media">
					<span class="aio-featured__badge">Destacado</span>
					<img
						v-if="product.images && product.images[0]"
						class="aio-featured__img"
						:alt="product.name"
						:src="product.images[0].url"
					>
					<div v-else class="aio-featured__placeholder">
						<v-icon size="32" color="#A96DFA">image</v-icon>
					</div>
				</div>

				<div class="aio-featured__body">
					<h3 class="aio-featured__name">{{ product.name }}</h3>
					<div class="aio-featured__row">
						<span class="aio-featured__price">{{ product.price }}</span>
						<button type="button" class="aio-featured__btn" aria-label="Ver producto">
							<v-icon size="16" color="white">arrow_forward</v-icon>
						</button>
					</div>
				</div>
			</article>
		</div>
	</section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
	props: {
		secTitle: {
			type: String,
			default: 'Productos destacados',
		},
		limit: {
			type: Number,
			default: 8,
		},
	},
	data() {
		return {
			loading: true,
		};
	},
	computed: {
		...mapGetters(['productList']),
		featuredProducts() {
			if (!this.productList || !this.productList.length) return [];
			return this.productList.slice(0, this.limit);
		},
	},
	async created() {
		try {
			await this.getRandomProducts();
		} finally {
			this.loading = false;
		}
	},
	methods: {
		...mapActions(['getRandomProducts']),
		goToDetail(product) {
			this.$store.dispatch('setSelectedProduct', product);
			this.$router.push({ path: `/products/${product.id_products}` });
		},
	},
};
</script>

<style scoped>
.aio-featured {
	background: #fff;
	border: 1px solid #ece8f4;
	border-radius: 24px;
	padding: 2rem 2rem 2.25rem;
	box-shadow: 0 8px 40px rgba(169, 109, 250, 0.07);
}

.aio-featured__head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1.5rem;
	margin-bottom: 2rem;
	flex-wrap: wrap;
}

.aio-featured__eyebrow {
	display: inline-block;
	font-size: 0.6875rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.16em;
	color: #A96DFA;
	margin-bottom: 0.5rem;
}

.aio-featured__title {
	margin: 0 0 0.375rem;
	font-size: clamp(1.5rem, 2.5vw, 2rem);
	font-weight: 700;
	color: #12121a;
	letter-spacing: -0.03em;
	line-height: 1.2;
}

.aio-featured__subtitle {
	margin: 0;
	font-size: 0.9375rem;
	color: #6b7280;
	line-height: 1.5;
}

.aio-featured__link {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	flex-shrink: 0;
	margin-top: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 600;
	color: #fff;
	text-decoration: none;
	padding: 0.625rem 1.125rem;
	border-radius: 999px;
	background: linear-gradient(135deg, #A96DFA 0%, #CA1DFF 100%);
	box-shadow: 0 4px 16px rgba(202, 29, 255, 0.3);
	transition: transform 0.2s, box-shadow 0.2s;
}

.aio-featured__link:hover {
	transform: translateY(-1px);
	box-shadow: 0 8px 24px rgba(202, 29, 255, 0.4);
}

.aio-featured__grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 1.25rem;
}

.aio-featured__card {
	display: flex;
	flex-direction: column;
	background: #faf9fd;
	border: 1px solid #ece8f4;
	border-radius: 16px;
	overflow: hidden;
	cursor: pointer;
	transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s;
	min-width: 0;
}

.aio-featured__card:hover {
	transform: translateY(-4px);
	border-color: rgba(169, 109, 250, 0.45);
	box-shadow: 0 16px 40px rgba(169, 109, 250, 0.14);
}

.aio-featured__media {
	position: relative;
	height: 200px;
	width: 100%;
	overflow: hidden;
	background: linear-gradient(160deg, #ffffff 0%, #f3f0fa 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem;
	box-sizing: border-box;
}

.aio-featured__badge {
	position: absolute;
	top: 0.625rem;
	left: 0.625rem;
	z-index: 2;
	font-size: 0.625rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: #fff;
	background: linear-gradient(135deg, #A96DFA, #CA1DFF);
	padding: 0.25rem 0.625rem;
	border-radius: 999px;
	box-shadow: 0 2px 8px rgba(202, 29, 255, 0.35);
}

.aio-featured__img {
	display: block;
	max-width: 100%;
	max-height: 100%;
	width: auto;
	height: auto;
	object-fit: contain;
	transition: transform 0.4s ease;
}

.aio-featured__card:hover .aio-featured__img {
	transform: scale(1.04);
}

.aio-featured__placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.aio-featured__body {
	display: flex;
	flex-direction: column;
	flex: 1;
	padding: 1rem 1.125rem 1.125rem;
	background: #fff;
}

.aio-featured__name {
	margin: 0 0 auto;
	padding-bottom: 0.875rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: #12121a;
	line-height: 1.45;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	min-height: 2.6em;
}

.aio-featured__row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	padding-top: 0.875rem;
	border-top: 1px solid #f0edf5;
}

.aio-featured__price {
	font-size: 1rem;
	font-weight: 700;
	color: #CA1DFF;
	white-space: nowrap;
}

.aio-featured__btn {
	flex-shrink: 0;
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	background: linear-gradient(135deg, #A96DFA, #CA1DFF);
	box-shadow: 0 3px 10px rgba(202, 29, 255, 0.3);
	transition: transform 0.2s;
}

.aio-featured__card:hover .aio-featured__btn {
	transform: scale(1.08);
}

.aio-featured__state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 3rem 1rem;
	color: #6b7280;
	font-size: 0.9375rem;
}

@media (max-width: 1199px) {
	.aio-featured__grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}

@media (max-width: 899px) {
	.aio-featured {
		padding: 1.5rem;
		border-radius: 18px;
	}

	.aio-featured__grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.aio-featured__media {
		height: 170px;
	}
}

@media (max-width: 539px) {
	.aio-featured__grid {
		grid-template-columns: 1fr;
	}

	.aio-featured__head {
		flex-direction: column;
	}

	.aio-featured__link {
		align-self: flex-start;
	}
}
</style>
