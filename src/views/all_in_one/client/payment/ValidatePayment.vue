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

					<span class="aio-payment-validate__eyebrow">{{ $t('paymentPage.securePayment') }}</span>
					<h1 class="aio-payment-validate__title">{{ $t('paymentPage.verifying') }}</h1>
					<p class="aio-payment-validate__text">
						{{ $t('paymentPage.verifyingHint') }}
					</p>

					<ul class="aio-payment-validate__steps">
						<li class="aio-payment-validate__step aio-payment-validate__step--active">
							<span class="aio-payment-validate__step-dot"></span>
							<span>{{ $t('paymentPage.stepValidating') }}</span>
						</li>
						<li class="aio-payment-validate__step" :class="{ 'aio-payment-validate__step--active': confirmingPayment }">
							<span class="aio-payment-validate__step-dot"></span>
							<span>{{ $t('paymentPage.stepConfirming') }}</span>
						</li>
						<li class="aio-payment-validate__step" :class="{ 'aio-payment-validate__step--active': processingInvoice }">
							<span class="aio-payment-validate__step-dot"></span>
							<span>{{ $t('paymentPage.stepReceipt') }}</span>
						</li>
					</ul>
				</div>

				<div v-else-if="pago_exitoso" class="aio-payment-validate__state">
					<div class="aio-payment-validate__visual">
						<div class="aio-payment-validate__success-icon" aria-hidden="true">
							<v-icon size="36">check</v-icon>
						</div>
					</div>

					<span class="aio-payment-validate__eyebrow aio-payment-validate__eyebrow--success">{{ $t('paymentPage.paymentConfirmed') }}</span>
					<h1 class="aio-payment-validate__title">{{ $t('paymentPage.success') }}</h1>
					<p class="aio-payment-validate__text">{{ successMessage }}</p>

					<ul class="aio-payment-validate__steps">
						<li class="aio-payment-validate__step aio-payment-validate__step--done">
							<span class="aio-payment-validate__step-dot">
								<v-icon size="12">check</v-icon>
							</span>
							<span>{{ $t('paymentPage.stepValidated') }}</span>
						</li>
						<li class="aio-payment-validate__step aio-payment-validate__step--done">
							<span class="aio-payment-validate__step-dot">
								<v-icon size="12">check</v-icon>
							</span>
							<span>{{ $t('paymentPage.stepOrderConfirmed') }}</span>
						</li>
						<li class="aio-payment-validate__step" :class="invoiceStepClass">
							<span class="aio-payment-validate__step-dot">
								<v-icon v-if="invoiceDone" size="12">check</v-icon>
							</span>
							<span>{{ invoiceStepLabel }}</span>
						</li>
					</ul>
				</div>

				<div v-else-if="pago_error" class="aio-payment-validate__state">
					<div class="aio-payment-validate__visual">
						<div class="aio-payment-validate__error-icon" aria-hidden="true">
							<v-icon size="36">error_outline</v-icon>
						</div>
					</div>

					<span class="aio-payment-validate__eyebrow aio-payment-validate__eyebrow--error">{{ $t('paymentPage.paymentErrorEyebrow') }}</span>
					<h1 class="aio-payment-validate__title">{{ $t('paymentPage.error') }}</h1>
					<p class="aio-payment-validate__text">{{ errorMessage }}</p>

					<div class="aio-payment-validate__actions">
						<button type="button" class="aio-payment-validate__btn" @click="retryValidation">
							{{ $t('paymentPage.retry') }}
						</button>
						<router-link to="/account/order-history" class="aio-payment-validate__btn aio-payment-validate__btn--ghost">
							{{ $t('paymentPage.goToOrders') }}
						</router-link>
					</div>
				</div>
			</div>
		</v-container>
	</div>
</template>

<script>
import api from 'Api';
import { getApiErrorMessage } from 'Helpers/apiError';

export default {
	data() {
		return {
			cobro: true,
			pago_exitoso: false,
			pago_error: false,
			confirmingPayment: false,
			processingInvoice: false,
			invoiceDone: false,
			invoiceSkipped: false,
			successMessage: '',
			errorMessage: '',
			id: '',
			clientTransactionId: '',
			orderId: '',
		};
	},
	computed: {
		invoiceStepClass() {
			if (this.invoiceDone) return 'aio-payment-validate__step--done';
			if (this.invoiceSkipped) return 'aio-payment-validate__step--active';
			return '';
		},
		invoiceStepLabel() {
			if (this.invoiceDone) return this.$t('paymentPage.stepReceiptDone');
			if (this.invoiceSkipped) return this.$t('paymentPage.stepReceiptPending');
			return this.$t('paymentPage.stepReceipt');
		},
	},
	async mounted() {
		if (this.$route.query && this.$route.query.clientTransactionId) {
			this.clientTransactionId = this.$route.query.clientTransactionId;
		}

		if (this.$route.query && this.$route.query.id) {
			this.id = this.$route.query.id;
		}

		this.orderId = this.clientTransactionId.split('@')[0];
		this.onConfirmaPagoPayphone(this.id, this.clientTransactionId, this.orderId);
	},
	methods: {
		showPaymentError(message) {
			this.cobro = false;
			this.pago_exitoso = false;
			this.pago_error = true;
			this.errorMessage = message || this.$t('paymentPage.validationError');
		},
		retryValidation() {
			this.pago_error = false;
			this.cobro = true;
			this.confirmingPayment = false;
			this.processingInvoice = false;
			this.onConfirmaPagoPayphone(this.id, this.clientTransactionId, this.orderId);
		},
		resolveSuccessMessage(invoice) {
			if (invoice && invoice.success && !invoice.skipped) {
				return this.$t('paymentPage.successHintComplete');
			}
			if (invoice && invoice.skipped) {
				return this.$t('paymentPage.successHintInvoicePending');
			}
			if (invoice && invoice.success === false) {
				return this.$t('paymentPage.successHintInvoicePending');
			}
			return this.$t('paymentPage.successHintRedirect');
		},
		async onConfirmaPagoPayphone(id, clientTxId, orden) {
			try {
				this.confirmingPayment = true;
				const urlPayphone = await api.post('/api/shoppingcar/payphone/confirm', {
					id,
					clientId: clientTxId,
					orden,
				});

				if (!(urlPayphone.data && urlPayphone.data.errorCode === 200 && urlPayphone.data.success !== false)) {
					const message = (urlPayphone.data && urlPayphone.data.message)
						|| 'La pasarela no confirmó el pago';
					this.showPaymentError(message);
					return;
				}

				await this.$store.dispatch('syncActiveCart');
				this.processingInvoice = true;

				const invoice = urlPayphone.data.invoice || null;
				this.invoiceDone = !!(invoice && invoice.success && !invoice.skipped);
				this.invoiceSkipped = !!(invoice && (invoice.skipped || invoice.success === false));

				this.cobro = false;
				this.pago_exitoso = true;
				this.successMessage = this.resolveSuccessMessage(invoice);

				setTimeout(async () => {
					await this.$store.dispatch('syncActiveCart');
					this.$router.push('/account/order-history');
				}, 3500);
			} catch (e) {
				const message = getApiErrorMessage(e, 'Error de conexión al verificar el pago');
				this.showPaymentError(message);
			}
		},
	},
};
</script>
