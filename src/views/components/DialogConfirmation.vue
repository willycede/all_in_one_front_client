<template>
	<v-dialog
		v-model="open"
		max-width="440"
		content-class="aio-modal-overlay"
		@click:outside="close"
	>
		<div class="aio-modal aio-modal--confirm" role="dialog" aria-modal="true">
			<div class="aio-modal__icon aio-modal__icon--primary">
				<v-icon size="28">lock</v-icon>
			</div>
			<span class="aio-modal__eyebrow">{{ eyebrow }}</span>
			<h3 class="aio-modal__title">{{ title }}</h3>
			<p class="aio-modal__message">{{ message }}</p>
			<div class="aio-modal__actions">
				<button type="button" class="aio-modal__btn aio-modal__btn--ghost" @click="close">
					{{ cancelLabel }}
				</button>
				<button type="button" class="aio-modal__btn aio-modal__btn--primary" @click="confirm">
					{{ confirmLabel }}
				</button>
			</div>
		</div>
	</v-dialog>
</template>

<script>
export default {
	props: {
		message: {
			type: String,
			default: 'Revisa que tu carrito esté completo antes de continuar.',
		},
		title: {
			type: String,
			default: '¿Confirmar orden?',
		},
		eyebrow: {
			type: String,
			default: 'Finalizar compra',
		},
		confirmLabel: {
			type: String,
			default: 'Sí, confirmar',
		},
		cancelLabel: {
			type: String,
			default: 'Cancelar',
		},
	},
	data() {
		return {
			open: false,
		};
	},
	methods: {
		openDialog() {
			this.open = true;
		},
		close() {
			this.open = false;
		},
		confirm() {
			this.$emit('onConfirm');
		},
	},
};
</script>
