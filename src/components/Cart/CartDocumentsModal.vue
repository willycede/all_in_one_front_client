<template>
	<v-dialog
		:value="value"
		max-width="520"
		content-class="aio-modal-overlay"
		@click:outside="close"
		@input="onDialogInput"
	>
		<div v-if="item" class="aio-modal aio-modal--docs" role="dialog" aria-modal="true">
			<div class="aio-modal__header aio-modal__header--docs">
				<div class="aio-modal__header-icon">
					<v-icon size="24">folder_open</v-icon>
				</div>
				<div>
					<span class="aio-modal__eyebrow">Documentación obligatoria</span>
					<h3 class="aio-modal__title aio-modal__title--left">{{ item.name }}</h3>
				</div>
				<button type="button" class="aio-modal__close" aria-label="Cerrar" @click="close">
					<v-icon size="20">close</v-icon>
				</button>
			</div>

			<div class="aio-modal__progress">
				<div class="aio-modal__progress-top">
					<span>Progreso de carga</span>
					<strong>{{ uploadedCount }}/{{ totalCount }} documentos</strong>
				</div>
				<div class="aio-modal__progress-bar">
					<div
						class="aio-modal__progress-fill"
						:style="{ width: progressPercent + '%' }"
					></div>
				</div>
				<p v-if="isComplete" class="aio-modal__progress-done">
					<v-icon size="16">check_circle</v-icon>
					Documentación completa para este producto
				</p>
				<p v-else class="aio-modal__progress-hint">
					Formatos aceptados: PDF, JPG, JPEG, PNG
				</p>
			</div>

			<div class="aio-modal__docs-list">
				<div
					v-for="(docType, index) in requiredDocs"
					:key="index"
					class="aio-modal__doc-item"
					:class="{ 'aio-modal__doc-item--done': isUploaded(docType) }"
				>
					<div class="aio-modal__doc-head">
						<div class="aio-modal__doc-status-icon">
							<v-icon v-if="isUploaded(docType)" size="18">check</v-icon>
							<v-icon v-else size="18">description</v-icon>
						</div>
						<div class="aio-modal__doc-info">
							<span class="aio-modal__doc-name">{{ formatDocumentName(docType) }}</span>
							<span class="aio-modal__doc-state">
								{{ isUploaded(docType) ? 'Archivo cargado' : 'Pendiente de carga' }}
							</span>
						</div>
					</div>
					<v-file-input
						:value="getUploadedFile(docType)"
						@change="onFileChange(docType, $event)"
						:label="isUploaded(docType) ? 'Reemplazar archivo' : 'Seleccionar archivo'"
						accept=".pdf,.jpg,.jpeg,.png"
						prepend-icon="attach_file"
						:loading="isUploading(docType)"
						:disabled="isUploading(docType)"
						outlined
						dense
						hide-details
						show-size
						class="aio-modal__doc-input"
					></v-file-input>
				</div>
			</div>

			<div class="aio-modal__actions aio-modal__actions--single">
				<button type="button" class="aio-modal__btn aio-modal__btn--primary-full" @click="close">
					{{ isComplete ? 'Listo' : 'Cerrar' }}
				</button>
			</div>
		</div>
	</v-dialog>
</template>

<script>
export default {
	name: 'CartDocumentsModal',
	props: {
		value: {
			type: Boolean,
			default: false,
		},
		item: {
			type: Object,
			default: null,
		},
		uploadedDocuments: {
			type: Object,
			default: () => ({}),
		},
		uploadingDocuments: {
			type: Object,
			default: () => ({}),
		},
	},
	computed: {
		requiredDocs() {
			return this.item?.required_documents_array || [];
		},
		totalCount() {
			return this.requiredDocs.length;
		},
		uploadedCount() {
			if (!this.item) return 0;
			return this.requiredDocs.filter((docType) => this.isUploaded(docType)).length;
		},
		progressPercent() {
			if (!this.totalCount) return 0;
			return Math.round((this.uploadedCount / this.totalCount) * 100);
		},
		isComplete() {
			return this.totalCount > 0 && this.uploadedCount === this.totalCount;
		},
	},
	methods: {
		onDialogInput(open) {
			if (!open) this.close();
		},
		close() {
			this.$emit('input', false);
		},
		formatDocumentName(docType) {
			return docType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
		},
		isUploaded(docType) {
			if (!this.item) return false;
			return !!(
				this.uploadedDocuments[this.item.id_details]
				&& this.uploadedDocuments[this.item.id_details][docType]
			);
		},
		isUploading(docType) {
			if (!this.item) return false;
			return !!(
				this.uploadingDocuments[this.item.id_details]
				&& this.uploadingDocuments[this.item.id_details][docType]
			);
		},
		getUploadedFile(docType) {
			if (!this.isUploaded(docType)) return null;
			return this.uploadedDocuments[this.item.id_details][docType].file;
		},
		onFileChange(docType, file) {
			this.$emit('upload', { item: this.item, docType, file });
		},
	},
};
</script>
