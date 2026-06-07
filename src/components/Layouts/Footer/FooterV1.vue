<template>
	<footer class="aio-footer footerV1-wrap">
		<div class="aio-footer__accent"></div>

		<v-container class="aio-footer__container">
			<div class="aio-footer__main">
				<div class="aio-footer__brand">
					<router-link to="/mainPage" class="aio-footer__logo-link">
						<img
							:src="footerLogo"
							alt="All in One"
							class="aio-footer__logo"
							:height="logoSize.height"
							:style="{ maxWidth: logoSize.maxWidth + 'px' }"
						>
					</router-link>
					<p class="aio-footer__tagline">
						Tu marketplace de confianza. Productos y servicios de las mejores empresas en un solo lugar.
					</p>
					<div v-if="img" class="aio-footer__payments">
						<span class="aio-footer__payments-label">Métodos de pago</span>
						<img :src="img" alt="Métodos de pago aceptados" class="aio-footer__payments-img">
					</div>
				</div>

				<div class="aio-footer__columns">
					<div v-for="col in linkColumns" :key="col.title" class="aio-footer__col">
						<h3 class="aio-footer__col-title">{{ col.title }}</h3>
						<ul class="aio-footer__links">
							<li v-for="link in col.links" :key="link.label">
								<router-link :to="link.to">{{ link.label }}</router-link>
							</li>
						</ul>
					</div>
				</div>

				<div class="aio-footer__contact">
					<h3 class="aio-footer__col-title">Contacto</h3>
					<ul class="aio-footer__contact-list">
						<li>
							<span class="aio-footer__contact-icon"><v-icon size="18">location_on</v-icon></span>
							<span>Ecuador</span>
						</li>
						<li>
							<span class="aio-footer__contact-icon"><v-icon size="18">phone</v-icon></span>
							<a href="tel:+593000000000">+593 00 000 0000</a>
						</li>
						<li>
							<span class="aio-footer__contact-icon"><v-icon size="18">email</v-icon></span>
							<a href="mailto:soporte@allinone.com">soporte@allinone.com</a>
						</li>
					</ul>
				</div>
			</div>

			<div class="aio-footer__bar">
				<p class="aio-footer__copy">{{ copyrightText }}</p>
				<div class="aio-footer__bar-links">
					<router-link to="/privacy-policy">Privacidad</router-link>
					<span class="aio-footer__dot"></span>
					<router-link to="/term-condition">Términos</router-link>
					<span class="aio-footer__dot"></span>
					<router-link to="/contact">Contacto</router-link>
				</div>
			</div>
		</v-container>
	</footer>
</template>

<script>
import AppConfig from 'Constants/AppConfig';
import { isUserLoggedIn } from 'Helpers/auth';

export default {
	props: ['title', 'description', 'img'],
	data() {
		return {
			isLoggedIn: false,
			footerLogo: AppConfig.appLogoFooter,
			logoSize: {
				height: AppConfig.logo.heightFooter,
				maxWidth: AppConfig.logo.maxWidth,
			},
			copyrightText: AppConfig.copyrightText,
		};
	},
	computed: {
		linkColumns() {
			const accountLinks = this.isLoggedIn
				? [
					{ label: 'Perfil', to: '/account/profile' },
					{ label: 'Historial de pedidos', to: '/account/order-history' },
					{ label: 'Favoritos', to: '/favorites' },
					{ label: 'Carrito', to: '/cart' },
				]
				: [
					{ label: 'Iniciar sesión', to: '/client/login' },
					{ label: 'Registrarse', to: '/client/register' },
					{ label: 'Carrito', to: '/cart' },
				];

			return [
				{
					title: 'Ayuda',
					links: [
						{ label: 'Contacto', to: '/contact' },
						{ label: 'Política de privacidad', to: '/privacy-policy' },
						{ label: 'Términos y condiciones', to: '/term-condition' },
						{ label: 'Preguntas frecuentes', to: '/faq' },
					],
				},
				{
					title: 'Categorías',
					links: [
						{ label: 'Accesorios', to: '/products?generalCategoryId=1' },
						{ label: 'Seguros', to: '/products?generalCategoryId=2' },
						{ label: 'Rastreo', to: '/products?generalCategoryId=3' },
						{ label: 'Ver todos', to: '/products' },
					],
				},
				{
					title: 'Mi cuenta',
					links: accountLinks,
				},
			];
		},
	},
	watch: {
		$route() {
			this.refreshAuthState();
		},
	},
	mounted() {
		this.refreshAuthState();
	},
	methods: {
		refreshAuthState() {
			this.isLoggedIn = isUserLoggedIn();
		},
	},
};
</script>

<style scoped>
.aio-footer {
	position: relative;
	background: linear-gradient(180deg, #08080c 0%, #0f0a18 55%, #120820 100%);
	color: rgba(255, 255, 255, 0.82);
	padding: 0 0 1.5rem;
	overflow: hidden;
}

.aio-footer__accent {
	height: 3px;
	background: linear-gradient(90deg, transparent 0%, #A96DFA 25%, #CA1DFF 50%, #A96DFA 75%, transparent 100%);
}

.aio-footer__container {
	padding-top: 3.5rem !important;
	padding-bottom: 0 !important;
}

.aio-footer__main {
	display: grid;
	grid-template-columns: 1.4fr 2fr 1fr;
	gap: 3rem 2.5rem;
	padding-bottom: 2.5rem;
}

.aio-footer__logo-link {
	display: inline-block;
	line-height: 0;
	margin-bottom: 1.25rem;
}

.aio-footer__logo {
	display: block;
	width: auto;
	height: 48px;
	max-width: 220px;
	object-fit: contain;
	object-position: left center;
}

.aio-footer__tagline {
	margin: 0 0 1.5rem;
	font-size: 0.9375rem;
	line-height: 1.65;
	color: rgba(255, 255, 255, 0.55);
	max-width: 320px;
}

.aio-footer__payments-label {
	display: block;
	font-size: 0.6875rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	color: rgba(255, 255, 255, 0.4);
	margin-bottom: 0.625rem;
}

.aio-footer__payments-img {
	display: block;
	max-width: 200px;
	height: auto;
	opacity: 0.85;
	filter: brightness(1.05);
}

.aio-footer__columns {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1.5rem 2rem;
}

.aio-footer__col-title {
	margin: 0 0 1.125rem;
	font-size: 0.9375rem;
	font-weight: 700;
	color: #fff;
	letter-spacing: 0.01em;
	position: relative;
	padding-bottom: 0.625rem;
}

.aio-footer__col-title::after {
	content: '';
	position: absolute;
	left: 0;
	bottom: 0;
	width: 28px;
	height: 2px;
	border-radius: 2px;
	background: linear-gradient(90deg, #A96DFA, #CA1DFF);
}

.aio-footer__links {
	list-style: none;
	margin: 0;
	padding: 0;
}

.aio-footer__links li {
	margin-bottom: 0.625rem;
}

.aio-footer__links a {
	color: rgba(255, 255, 255, 0.58);
	text-decoration: none;
	font-size: 0.875rem;
	transition: color 0.2s, transform 0.2s;
	display: inline-block;
}

.aio-footer__links a:hover {
	color: #CA1DFF;
	transform: translateX(3px);
}

.aio-footer__contact-list {
	list-style: none;
	margin: 0;
	padding: 0;
}

.aio-footer__contact-list li {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	margin-bottom: 0.875rem;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.65);
}

.aio-footer__contact-icon {
	flex-shrink: 0;
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background: rgba(169, 109, 250, 0.12);
	border: 1px solid rgba(169, 109, 250, 0.22);
	display: flex;
	align-items: center;
	justify-content: center;
}

.aio-footer__contact-icon .v-icon {
	color: #A96DFA !important;
}

.aio-footer__contact-list a {
	color: #CA1DFF;
	text-decoration: none;
	transition: color 0.2s;
}

.aio-footer__contact-list a:hover {
	color: #A96DFA;
}

.aio-footer__bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 1rem;
	padding: 1.25rem 0;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.aio-footer__copy {
	margin: 0;
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.38);
}

.aio-footer__bar-links {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	flex-wrap: wrap;
}

.aio-footer__bar-links a {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.45);
	text-decoration: none;
	transition: color 0.2s;
}

.aio-footer__bar-links a:hover {
	color: #A96DFA;
}

.aio-footer__dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	flex-shrink: 0;
}

@media (max-width: 959px) {
	.aio-footer__main {
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.aio-footer__brand {
		grid-column: 1 / -1;
	}

	.aio-footer__contact {
		grid-column: 1 / -1;
	}
}

@media (max-width: 599px) {
	.aio-footer__main {
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.aio-footer__columns {
		grid-template-columns: 1fr;
		gap: 1.75rem;
	}

	.aio-footer__bar {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
