<template>
	<div class="aio-payment-validate aio-payment-redirect">
		<div class="aio-payment-validate__bg" aria-hidden="true">
			<div class="aio-payment-validate__glow aio-payment-validate__glow--1"></div>
			<div class="aio-payment-validate__glow aio-payment-validate__glow--2"></div>
		</div>

		<v-container class="aio-payment-validate__container">
			<div class="aio-payment-validate__card">
				<div v-if="redirecting" class="aio-payment-validate__state">
					<div class="aio-payment-redirect__brands">
						<img
							:src="appLogo"
							alt="All in One"
							class="aio-payment-redirect__logo"
						>
						<span class="aio-payment-redirect__divider" aria-hidden="true"></span>
						<img
							src="/static/images/payphone.png"
							alt="Payphone"
							class="aio-payment-redirect__payphone"
						>
					</div>

					<div class="aio-payment-validate__visual">
						<div class="aio-payment-validate__loader" aria-hidden="true">
							<span class="aio-payment-validate__loader-ring"></span>
							<span class="aio-payment-validate__loader-icon">
								<v-icon size="32">lock</v-icon>
							</span>
						</div>
					</div>

					<span class="aio-payment-validate__eyebrow">Enlace seguro</span>
					<h1 class="aio-payment-validate__title">Preparando tu pago</h1>
					<p class="aio-payment-validate__text">
						Estamos validando tu enlace de pago. En unos segundos serás redirigido
						a la pasarela Payphone para completar la transacción.
					</p>

					<ul class="aio-payment-validate__steps">
						<li
							class="aio-payment-validate__step"
							:class="{ 'aio-payment-validate__step--active': activeStep >= 1, 'aio-payment-validate__step--done': activeStep > 1 }"
						>
							<span class="aio-payment-validate__step-dot">
								<v-icon v-if="activeStep > 1" size="12">check</v-icon>
							</span>
							<span>Validando enlace</span>
						</li>
						<li
							class="aio-payment-validate__step"
							:class="{ 'aio-payment-validate__step--active': activeStep >= 2, 'aio-payment-validate__step--done': activeStep > 2 }"
						>
							<span class="aio-payment-validate__step-dot">
								<v-icon v-if="activeStep > 2" size="12">check</v-icon>
							</span>
							<span>Conectando con Payphone</span>
						</li>
						<li
							class="aio-payment-validate__step"
							:class="{ 'aio-payment-validate__step--active': activeStep >= 3 }"
						>
							<span class="aio-payment-validate__step-dot"></span>
							<span>Abriendo pasarela de pago</span>
						</li>
					</ul>
				</div>

				<div v-else class="aio-payment-validate__state">
					<div class="aio-payment-validate__visual">
						<div class="aio-payment-validate__error-icon" aria-hidden="true">
							<v-icon size="36">link_off</v-icon>
						</div>
					</div>
					<span class="aio-payment-validate__eyebrow aio-payment-validate__eyebrow--error">Enlace no válido</span>
					<h1 class="aio-payment-validate__title">{{ errorTitle }}</h1>
					<p class="aio-payment-validate__text">
						{{ errorMessage }}
					</p>
					<div class="aio-payment-validate__actions">
						<router-link to="/account/order-history" class="aio-payment-validate__btn">
							Ir a mis pedidos
						</router-link>
						<router-link to="/cart" class="aio-payment-validate__btn aio-payment-validate__btn--ghost">
							Volver al carrito
						</router-link>
					</div>
				</div>
			</div>
		</v-container>
	</div>
</template>

<script>
import api from 'Api';
import AppConfig from 'Constants/AppConfig';
import { getApiErrorMessage } from 'Helpers/apiError';

export default {
	data() {
		return {
			appLogo: AppConfig.appLogo,
			urlPago: '',
			redirecting: false,
			activeStep: 1,
			stepTimer: null,
			redirectTimer: null,
			errorTitle: 'No pudimos abrir el pago',
			errorMessage: 'El enlace de pago no está disponible o ha expirado. Genera uno nuevo desde tus pedidos.',
		};
	},
	async mounted() {
		const orderId = this.$route.query && this.$route.query.orden;
		const rawUrl = this.$route.query && this.$route.query.urlPago;

		if (!orderId && !rawUrl) {
			this.redirecting = false;
			return;
		}

		this.redirecting = true;

		try {
			const params = {};
			if (orderId) {
				params.orden = orderId;
			} else {
				params.urlPago = rawUrl;
			}

			const response = await api.get('/api/shoppingcar/payphone/resolve_link', { params });
			const payload = response && response.data;

			if (!payload || payload.errorCode !== 200 || !payload.url) {
				this.showLinkError('No pudimos abrir el pago', 'El enlace de pago no está disponible. Genera uno nuevo desde Mis pedidos.');
				return;
			}

			this.urlPago = payload.url;
			this.startRedirectFlow();
		} catch (error) {
			const message = getApiErrorMessage(error, 'El enlace de pago no está disponible.');
			const step = error.response
				&& error.response.data
				&& error.response.data.error
				&& error.response.data.error.step;

			if (step === 'order_cancelled') {
				this.showLinkError(
					'Pedido cancelado',
					'Esta orden fue cancelada. El enlace de pago ya no está activo.'
				);
				return;
			}

			if (step === 'order_paid') {
				this.showLinkError(
					'Pedido ya pagado',
					'Esta orden ya fue pagada. Revisa el comprobante en Mis pedidos.'
				);
				return;
			}

			this.showLinkError('No pudimos abrir el pago', message);
		}
	},
	beforeDestroy() {
		if (this.stepTimer) clearInterval(this.stepTimer);
		if (this.redirectTimer) clearTimeout(this.redirectTimer);
	},
	methods: {
		showLinkError(title, message) {
			this.redirecting = false;
			this.errorTitle = title;
			this.errorMessage = message;
			if (this.stepTimer) clearInterval(this.stepTimer);
			if (this.redirectTimer) clearTimeout(this.redirectTimer);
		},
		startRedirectFlow() {
			this.activeStep = 1;
			this.stepTimer = setInterval(() => {
				if (this.activeStep < 3) {
					this.activeStep += 1;
				}
			}, 800);

			this.redirectTimer = setTimeout(() => {
				window.location.href = this.urlPago;
			}, 2600);
		},
	},
};
</script>
