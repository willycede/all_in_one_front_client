<template>
	<div v-if="generalCategories.length > 0" class="aio-hero">
		<div class="aio-hero__frame">
			<button type="button" class="aio-hero__arrow aio-hero__arrow--prev" aria-label="Anterior" @click="prev">
				<v-icon>chevron_left</v-icon>
			</button>

			<div class="aio-hero__stage">
				<transition name="aio-hero-fade" mode="out-in">
					<div
						:key="activeIndex"
						class="aio-hero__slide"
						:style="{ backgroundImage: `url(${slideImage(activeCategory)})` }"
					>
						<div class="aio-hero__overlay"></div>
						<div class="aio-hero__container">
							<div class="aio-hero__content">
								<span class="aio-hero__eyebrow">Explora nuestras categorías</span>
								<h2 class="aio-hero__title">{{ activeCategory.name }}</h2>
								<p class="aio-hero__desc">
									Descubre productos y servicios de {{ activeCategory.name.toLowerCase() }} en un solo lugar.
								</p>
								<button
									type="button"
									class="aio-hero__cta"
									@click="goToProducts(activeCategory.idgeneral_categories)"
								>
									Ver productos
									<v-icon size="18">arrow_forward</v-icon>
								</button>
							</div>
						</div>
					</div>
				</transition>
			</div>

			<button type="button" class="aio-hero__arrow aio-hero__arrow--next" aria-label="Siguiente" @click="next">
				<v-icon>chevron_right</v-icon>
			</button>
		</div>

		<div class="aio-hero__nav">
			<div class="aio-hero__dots">
				<button
					v-for="(category, index) in generalCategories"
					:key="category.idgeneral_categories"
					type="button"
					class="aio-hero__dot"
					:class="{ 'aio-hero__dot--active': index === activeIndex }"
					:aria-label="`Ir a ${category.name}`"
					@click="goTo(index)"
				></button>
			</div>
		</div>

		<div class="aio-hero__thumbs">
			<button
				v-for="(category, index) in generalCategories"
				:key="`thumb-${category.idgeneral_categories}`"
				type="button"
				class="aio-hero__thumb"
				:class="{ 'aio-hero__thumb--active': index === activeIndex }"
				@click="goTo(index)"
			>
				<img :src="slideImage(category)" :alt="category.name">
				<span>{{ category.name }}</span>
			</button>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
	data() {
		return {
			activeIndex: 0,
			autoplayTimer: null,
		};
	},
	computed: {
		...mapGetters(['generalCategories']),
		activeCategory() {
			return this.generalCategories[this.activeIndex] || {};
		},
	},
	async created() {
		await this.getGeneralCategories();
	},
	mounted() {
		this.startAutoplay();
	},
	beforeDestroy() {
		this.stopAutoplay();
	},
	methods: {
		...mapActions(['getGeneralCategories']),
		slideImage(category) {
			return `/static/images/generalCategories/${category.name}.jpg`;
		},
		goTo(index) {
			this.activeIndex = index;
			this.restartAutoplay();
		},
		next() {
			const total = this.generalCategories.length;
			if (!total) return;
			this.activeIndex = (this.activeIndex + 1) % total;
			this.restartAutoplay();
		},
		prev() {
			const total = this.generalCategories.length;
			if (!total) return;
			this.activeIndex = (this.activeIndex - 1 + total) % total;
			this.restartAutoplay();
		},
		startAutoplay() {
			this.stopAutoplay();
			this.autoplayTimer = setInterval(this.next, 6000);
		},
		stopAutoplay() {
			if (this.autoplayTimer) {
				clearInterval(this.autoplayTimer);
				this.autoplayTimer = null;
			}
		},
		restartAutoplay() {
			this.stopAutoplay();
			this.startAutoplay();
		},
		goToProducts(generalCategoryId) {
			this.$router.push({ path: 'products', query: { generalCategoryId } });
		},
	},
};
</script>

<style scoped>
.aio-hero {
	padding: 1.5rem 0 0;
}

.aio-hero__frame {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.aio-hero__stage {
	position: relative;
	flex: 1;
	border-radius: 24px;
	overflow: hidden;
	min-height: 400px;
	box-shadow: 0 20px 60px rgba(169, 109, 250, 0.16);
}

.aio-hero__slide {
	position: relative;
	min-height: 400px;
	background-size: cover;
	background-position: center;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.aio-hero__overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(
		90deg,
		rgba(0, 0, 0, 0.15) 0%,
		rgba(0, 0, 0, 0.35) 40%,
		rgba(8, 8, 12, 0.78) 100%
	);
}

.aio-hero__container {
	position: relative;
	z-index: 2;
	width: 100%;
	max-width: 520px;
	padding: 2.5rem 3rem 2.5rem 2rem;
	margin-left: auto;
}

.aio-hero__content {
	padding: 2rem 2.25rem;
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(16px);
}

.aio-hero__eyebrow {
	display: inline-block;
	font-size: 0.6875rem;
	font-weight: 700;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 0.8);
	margin-bottom: 0.75rem;
}

.aio-hero__title {
	margin: 0 0 0.75rem;
	font-size: clamp(1.75rem, 3.5vw, 2.75rem);
	font-weight: 700;
	color: #fff;
	line-height: 1.15;
	letter-spacing: -0.02em;
	word-break: break-word;
}

.aio-hero__desc {
	margin: 0 0 1.5rem;
	font-size: 0.9375rem;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.75);
}

.aio-hero__cta {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	border: none;
	border-radius: 999px;
	padding: 0.875rem 1.75rem;
	font-size: 0.9375rem;
	font-weight: 600;
	color: #fff;
	cursor: pointer;
	background: linear-gradient(135deg, #A96DFA 0%, #CA1DFF 100%);
	box-shadow: 0 8px 28px rgba(202, 29, 255, 0.4);
	transition: transform 0.25s, box-shadow 0.25s;
}

.aio-hero__cta:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 36px rgba(202, 29, 255, 0.5);
}

.aio-hero__arrow {
	flex-shrink: 0;
	width: 44px;
	height: 44px;
	border: 1px solid #e8e4f0;
	border-radius: 50%;
	background: #fff;
	color: #1a1a2e;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 16px rgba(26, 26, 46, 0.08);
	transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.aio-hero__arrow:hover {
	transform: scale(1.06);
	border-color: #A96DFA;
	box-shadow: 0 6px 20px rgba(169, 109, 250, 0.2);
}

.aio-hero__nav {
	display: flex;
	justify-content: center;
	margin-top: 1rem;
}

.aio-hero__dots {
	display: flex;
	justify-content: center;
	gap: 0.5rem;
}

.aio-hero__dot {
	width: 8px;
	height: 8px;
	border: none;
	border-radius: 50%;
	background: rgba(169, 109, 250, 0.25);
	cursor: pointer;
	padding: 0;
	transition: width 0.25s, background 0.25s;
}

.aio-hero__dot--active {
	width: 28px;
	border-radius: 999px;
	background: linear-gradient(90deg, #A96DFA, #CA1DFF);
}

.aio-hero__thumbs {
	display: flex;
	gap: 0.875rem;
	margin-top: 1.25rem;
	overflow-x: auto;
	padding-bottom: 0.25rem;
}

.aio-hero__thumb {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	border: 2px solid transparent;
	border-radius: 14px;
	padding: 0.5rem 1rem 0.5rem 0.5rem;
	background: #fff;
	cursor: pointer;
	transition: border-color 0.25s, box-shadow 0.25s;
	min-width: 130px;
	box-shadow: 0 2px 8px rgba(26, 26, 46, 0.06);
}

.aio-hero__thumb img {
	width: 44px;
	height: 44px;
	border-radius: 10px;
	object-fit: cover;
}

.aio-hero__thumb span {
	font-size: 0.8125rem;
	font-weight: 600;
	color: #1a1a2e;
	white-space: nowrap;
}

.aio-hero__thumb--active {
	border-color: #A96DFA;
	box-shadow: 0 6px 20px rgba(169, 109, 250, 0.18);
}

.aio-hero-fade-enter-active,
.aio-hero-fade-leave-active {
	transition: opacity 0.45s ease;
}

.aio-hero-fade-enter,
.aio-hero-fade-leave-to {
	opacity: 0;
}

@media (max-width: 767px) {
	.aio-hero__frame {
		flex-direction: column;
		gap: 0.5rem;
	}

	.aio-hero__arrow {
		display: none;
	}

	.aio-hero__stage {
		width: 100%;
		min-height: 340px;
		border-radius: 16px;
	}

	.aio-hero__slide {
		min-height: 340px;
		justify-content: center;
	}

	.aio-hero__container {
		max-width: 100%;
		padding: 1.5rem;
		margin: 0;
	}

	.aio-hero__content {
		padding: 1.25rem;
	}

	.aio-hero__thumbs {
		display: none;
	}
}
</style>
