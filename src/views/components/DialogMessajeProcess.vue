<template>
	<v-dialog
		v-model="open"
		max-width="420"
		persistent
		:overlay-opacity="0.58"
		overlay-color="#14141c"
		content-class="aio-modal-overlay"
	>
		<div class="aio-modal aio-modal--loading" role="status" aria-live="polite">
			<div class="aio-modal__loader" aria-hidden="true">
				<span class="aio-modal__loader-ring"></span>
				<span class="aio-modal__loader-icon">
					<v-icon size="26">sync</v-icon>
				</span>
			</div>
			<span v-if="eyebrow" class="aio-modal__eyebrow">{{ eyebrow }}</span>
			<h3 class="aio-modal__title">{{ message }}</h3>
			<p v-if="subtitle" class="aio-modal__message aio-modal__message--loading">{{ subtitle }}</p>
			<div class="aio-modal__loading-dots" aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
			</div>
		</div>
	</v-dialog>
</template>

<script>
export default {
	props: {
		message: {
			type: String,
			default: 'Procesando...',
		},
		subtitle: {
			type: String,
			default: 'Por favor no cierres esta ventana.',
		},
		eyebrow: {
			type: String,
			default: 'Un momento',
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
	},
};
</script>
