<template>
	<v-dialog
		v-model="open"
		max-width="420"
		content-class="aio-modal-overlay"
		@click:outside="close"
	>
		<div class="aio-modal aio-modal--confirm" role="dialog" aria-modal="true">
			<div class="aio-modal__icon aio-modal__icon--danger">
				<v-icon size="28">delete_outline</v-icon>
			</div>
			<h3 class="aio-modal__title">{{ title }}</h3>
			<p class="aio-modal__message">{{ message }}</p>
			<div class="aio-modal__actions">
				<button type="button" class="aio-modal__btn aio-modal__btn--ghost" @click="close">
					{{ cancelLabel }}
				</button>
				<button type="button" class="aio-modal__btn aio-modal__btn--danger" @click="confirm">
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
			default: '¿Desea continuar?',
		},
		title: {
			type: String,
			default: 'Eliminar producto',
		},
		confirmLabel: {
			type: String,
			default: 'Sí, eliminar',
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
