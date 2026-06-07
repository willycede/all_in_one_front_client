<template>
	<div class="aio-payment-validate">
		<div class="aio-payment-validate__bg" aria-hidden="true">
			<div class="aio-payment-validate__glow aio-payment-validate__glow--1"></div>
			<div class="aio-payment-validate__glow aio-payment-validate__glow--2"></div>
		</div>

		<v-container class="aio-payment-validate__container">
			<div class="aio-payment-validate__card">
				<div v-if="cobro" class="aio-payment-validate__state">
					<div class="aio-payment-validate__visual">
						<div class="aio-payment-validate__loader" aria-hidden="true">
							<span class="aio-payment-validate__loader-ring"></span>
							<span class="aio-payment-validate__loader-icon">
								<v-icon size="32">credit_card</v-icon>
							</span>
						</div>
					</div>

					<span class="aio-payment-validate__eyebrow">Pago seguro</span>
					<h1 class="aio-payment-validate__title">Verificando pago</h1>
					<p class="aio-payment-validate__text">
						Estamos confirmando tu transacción con la pasarela de pago.
						En unos segundos serás redirigido automáticamente.
					</p>

					<ul class="aio-payment-validate__steps">
						<li class="aio-payment-validate__step aio-payment-validate__step--active">
							<span class="aio-payment-validate__step-dot"></span>
							<span>Validando transacción</span>
						</li>
						<li class="aio-payment-validate__step">
							<span class="aio-payment-validate__step-dot"></span>
							<span>Confirmando orden</span>
						</li>
						<li class="aio-payment-validate__step">
							<span class="aio-payment-validate__step-dot"></span>
							<span>Generando comprobante</span>
						</li>
					</ul>
				</div>

				<div v-else-if="pago_exitoso" class="aio-payment-validate__state">
					<div class="aio-payment-validate__visual">
						<div class="aio-payment-validate__success-icon" aria-hidden="true">
							<v-icon size="36">check</v-icon>
						</div>
					</div>

					<span class="aio-payment-validate__eyebrow aio-payment-validate__eyebrow--success">Pago confirmado</span>
					<h1 class="aio-payment-validate__title">¡Gracias por tu compra!</h1>
					<p class="aio-payment-validate__text">
						Tu pago fue procesado correctamente. Estamos generando tu factura
						electrónica y te redirigiremos al historial de pedidos.
					</p>

					<ul class="aio-payment-validate__steps">
						<li class="aio-payment-validate__step aio-payment-validate__step--done">
							<span class="aio-payment-validate__step-dot">
								<v-icon size="12">check</v-icon>
							</span>
							<span>Transacción validada</span>
						</li>
						<li class="aio-payment-validate__step aio-payment-validate__step--done">
							<span class="aio-payment-validate__step-dot">
								<v-icon size="12">check</v-icon>
							</span>
							<span>Orden confirmada</span>
						</li>
						<li class="aio-payment-validate__step aio-payment-validate__step--active">
							<span class="aio-payment-validate__step-dot"></span>
							<span>Generando comprobante</span>
						</li>
					</ul>
				</div>

				<div v-else-if="pago_error" class="aio-payment-validate__state">
					<div class="aio-payment-validate__visual">
						<div class="aio-payment-validate__error-icon" aria-hidden="true">
							<v-icon size="36">error_outline</v-icon>
						</div>
					</div>

					<span class="aio-payment-validate__eyebrow aio-payment-validate__eyebrow--error">Error en el pago</span>
					<h1 class="aio-payment-validate__title">No pudimos verificar el pago</h1>
					<p class="aio-payment-validate__text">{{ errorMessage }}</p>

					<div class="aio-payment-validate__actions">
						<button type="button" class="aio-payment-validate__btn" @click="retryValidation">
							Reintentar
						</button>
						<router-link to="/account/order-history" class="aio-payment-validate__btn aio-payment-validate__btn--ghost">
							Ir a mis pedidos
						</router-link>
					</div>
				</div>
			</div>
		</v-container>
	</div>
</template>

<script>
import api from 'Api';
import HtmlElement from 'Constants/HtmlMailComprobante';

export default {
	data() {
		return {
			cobro: true,
			pago_exitoso: false,
			pago_error: false,
			errorMessage: '',
			id: '',
			clientTransactionId: '',
		};
	},
	async mounted() {
		if (this.$route.query && this.$route.query.clientTransactionId) {
			this.clientTransactionId = this.$route.query.clientTransactionId;
		}

		if (this.$route.query && this.$route.query.id) {
			this.id = this.$route.query.id;
		}

		const orden = this.clientTransactionId.split('@')[0];
		this.onConfirmaPagoPayphone(this.id, this.clientTransactionId, orden);
	},
	watch: {
		$route(to) {
			this.clientTransactionId = to.params.clientTransactionId;
			this.id = to.params.id;
		},
	},
	methods: {
		showPaymentError(message) {
			this.cobro = false;
			this.pago_exitoso = false;
			this.pago_error = true;
			this.errorMessage = message || 'Ocurrió un error al validar la transacción.';
		},
		retryValidation() {
			this.pago_error = false;
			this.cobro = true;
			const orden = this.clientTransactionId.split('@')[0];
			this.onConfirmaPagoPayphone(this.id, this.clientTransactionId, orden);
		},
		async onConfirmaPagoPayphone(id, clientTxId, orden) {
			try {
				const arr_pay_confir = {
					id: id,
					clientId: clientTxId,
					orden: orden,
				};

				const urlPayphone = await api.post(
					'/api/shoppingcar/payphone/confirm',
					arr_pay_confir
				);

				if (urlPayphone.data && urlPayphone.data.errorCode === 200 && urlPayphone.data.success !== false) {
					setTimeout(() => {
						this.cobro = false;
						this.pago_exitoso = true;
						this.onProcesarFacturacion(orden);
					}, 3000);
				} else {
					const message = (urlPayphone.data && urlPayphone.data.message)
						|| 'La pasarela no confirmó el pago';
					this.showPaymentError(message);
				}
			} catch (e) {
				const message = (e.response && e.response.data && e.response.data.error && e.response.data.error.message)
					|| 'Error de conexión al verificar el pago';
				this.showPaymentError(message);
			}
		},

		async onProcesarFacturacion(orden) {
			let html = '';

			const shopCartFelec = await api.get(
				'/api/shoppingcar/get_comprobante_electronico/' + localStorage.id_orden
			);

			const clave = shopCartFelec.data.claveAcceso;
			const pathpdf = shopCartFelec.data.pathPdf;
			const pathxml = shopCartFelec.data.pathXml;

			const response = await api.get(`/api/users/${localStorage.id_users}`);
			if (response && response.data && response.data.data) {
				const shopCart = await api.get(
					'/api/shoppingcar/get_shop_by_id/' + localStorage.id_orden
				);

				const comprobante = shopCart.data.data;
				const user = response.data.data;

				html = HtmlElement.html_body
					.replace('@nombre_cliente', user.name_user + ' ' + user.last_name_user)
					.replace('@valor', comprobante[0].shopping_car_total)
					.replace('@documento', '001-001-' + ('000000000' + localStorage.id_orden).slice(-9))
					.replace('@clave', clave)
					.replace(
						'@fecha',
						new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
					);
			}

			const arr_invoice = {
				orden: orden,
			};

			await api.post(
				'/api/shoppingcar/payphone/invoice/state',
				arr_invoice
			);

			const data_send_mail = {
				html: html,
				email: localStorage.email,
				pathPdf: pathpdf,
				pathXml: pathxml,
			};

			api.post(
				'/api/shoppingcar/sendmail_factura',
				data_send_mail
			);

			setTimeout(() => {
				this.$router.push('/account/order-history');
			}, 3000);
		},
	},
};
</script>
