<template>
	<div>
		<v-container class="py-0">
			<emb-general-categories-banner></emb-general-categories-banner>
		</v-container>

		<div class="onsus-features">
			<v-container>
				<div class="onsus-features__grid">
					<div v-for="(feature, index) in features" :key="index" class="onsus-features__item">
						<div class="onsus-features__icon">
							<v-icon>{{ feature.icon }}</v-icon>
						</div>
						<div>
							<p class="onsus-features__title">{{ feature.title }}</p>
							<p class="onsus-features__desc">{{ feature.desc }}</p>
						</div>
					</div>
				</div>
			</v-container>
		</div>

		<div class="aio-page-section">
			<v-container>
				<emb-product-list secTitle="Productos destacados"></emb-product-list>
			</v-container>
		</div>
	</div>
</template>

<script>
import ProductList from '../widgets/ProductList';
import GeneralCategoriesBanner from '../widgets/GeneralCategoriesBanner';
import { mapActions } from 'vuex';

export default {
	components: {
		embProductList: ProductList,
		embGeneralCategoriesBanner: GeneralCategoriesBanner,
	},
	data() {
		return {
			features: [
				{ icon: 'local_shipping', title: 'Envío disponible', desc: 'Entrega en pedidos seleccionados' },
				{ icon: 'support_agent', title: 'Soporte', desc: 'Atención al cliente dedicada' },
				{ icon: 'payment', title: 'Pagos seguros', desc: 'Múltiples métodos de pago' },
				{ icon: 'verified_user', title: 'Confianza', desc: 'Empresas verificadas en la plataforma' },
			],
		};
	},
	async created() {
		if (this.$route.query.denied === 'admin') {
			this.$snotify.warning('No tienes permisos de administrador. Usa el login admin.', { timeout: 4000 });
		}
		await this.getCompanies();
		await this.getRandomProducts();
	},
	methods: {
		...mapActions(['getCompanies', 'getRandomProducts']),
	},
};
</script>
