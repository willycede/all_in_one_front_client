<template>
	<section class="aio-admin-card aio-admin-product-form__section">
		<header class="aio-admin-product-form__section-head">
			<span class="aio-admin-product-form__section-icon">
				<v-icon size="20">photo_library</v-icon>
			</span>
			<div>
				<h3>Imágenes del producto</h3>
				<p>
					Sube JPG, PNG o WEBP (máx. 5 MB). La primera imagen se usa como portada.
					<strong>Se guardan al seleccionarlas</strong>; no dependen del botón Guardar cambios.
				</p>
			</div>
		</header>

		<div v-if="!productId && !pendingFiles.length" class="aio-product-images__hint">
			Guarda el producto primero para poder subir imágenes.
		</div>

		<div v-if="displayImages.length" class="aio-product-images__grid">
			<div
				v-for="img in displayImages"
				:key="img.key"
				class="aio-product-images__item"
				:class="{ 'aio-product-images__item--cover': img.isCover }"
			>
				<img :src="img.src" :alt="img.name">
				<button
					v-if="productId && img.imageId"
					type="button"
					class="aio-product-images__remove"
					:disabled="isUploading"
					@click="removeImage(img)"
				>
					<v-icon size="16" color="white">close</v-icon>
				</button>
				<button
					v-else-if="!productId"
					type="button"
					class="aio-product-images__remove"
					@click="removePending(img.pendingIndex)"
				>
					<v-icon size="16" color="white">close</v-icon>
				</button>
				<span v-if="img.isCover" class="aio-product-images__badge">Portada</span>
			</div>
		</div>

		<div v-if="productId || allowPending" class="aio-product-images__upload">
			<label class="aio-product-images__dropzone">
				<input
					ref="fileInput"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					multiple
					class="aio-product-images__input"
					:disabled="isUploading"
					@change="onFilesSelected"
				>
				<v-icon size="28" color="#A96DFA">cloud_upload</v-icon>
				<span>{{ isUploading ? 'Subiendo...' : 'Seleccionar imágenes' }}</span>
			</label>
		</div>
	</section>
</template>

<script>
import api from 'Api';
import AppConfig from 'Constants/AppConfig';

export default {
	props: {
		productId: {
			type: [Number, String],
			default: null,
		},
		images: {
			type: Array,
			default: () => [],
		},
		allowPending: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			localImages: [],
			pendingFiles: [],
			isUploading: false,
		};
	},
	computed: {
		displayImages() {
			const saved = this.localImages.map((img, index) => ({
				key: `saved-${img.product_images_id || index}`,
				src: this.resolveUrl(img.url),
				name: img.name,
				imageId: img.product_images_id,
				isCover: index === 0,
			}));
			const pending = this.pendingFiles.map((file, index) => ({
				key: `pending-${index}`,
				src: file.preview,
				name: file.file.name,
				pendingIndex: index,
				isCover: saved.length === 0 && index === 0,
			}));
			return saved.concat(pending);
		},
		coverPreviewUrl() {
			const first = this.displayImages[0];
			return first ? first.src : '';
		},
	},
	watch: {
		images: {
			immediate: true,
			handler(value) {
				this.localImages = Array.isArray(value) ? [...value] : [];
			},
		},
		coverPreviewUrl: {
			immediate: true,
			handler(url) {
				this.$emit('cover-change', url);
			},
		},
	},
	beforeDestroy() {
		this.pendingFiles.forEach((item) => {
			if (item.preview) {
				URL.revokeObjectURL(item.preview);
			}
		});
	},
	methods: {
		resolveUrl(url) {
			if (!url) return '';
			if (String(url).startsWith('http')) return url;
			return `${AppConfig.apiUrl}${url}`;
		},
		onFilesSelected(event) {
			const files = Array.from(event.target.files || []);
			if (!files.length) return;

			if (this.productId) {
				this.uploadFiles(files);
			} else {
				files.forEach((file) => {
					this.pendingFiles.push({
						file,
						preview: URL.createObjectURL(file),
					});
				});
			}
			event.target.value = '';
		},
		async uploadFiles(files) {
			this.isUploading = true;
			try {
				for (let i = 0; i < files.length; i += 1) {
					const file = files[i];
					const formData = new FormData();
					formData.append('image', file);
					formData.append('name', file.name);
					formData.append('order', String(this.localImages.length + i));
					const response = await api.post(
						`/api/products/${this.productId}/images`,
						formData,
						{ headers: { 'Content-Type': 'multipart/form-data' } }
					);
					const created = response.data && response.data.data;
					if (created) {
						this.localImages.push(created);
					}
				}
				this.$emit('images-updated', this.localImages);
				this.$snotify.success('Imágenes subidas correctamente', { timeout: 2500 });
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| 'No se pudieron subir las imágenes';
				this.$snotify.error(message, { timeout: 4000 });
			} finally {
				this.isUploading = false;
			}
		},
		async uploadPending(productId) {
			if (!productId || !this.pendingFiles.length) {
				return this.localImages;
			}
			const files = this.pendingFiles.map((item) => item.file);
			this.pendingFiles.forEach((item) => {
				if (item.preview) URL.revokeObjectURL(item.preview);
			});
			this.pendingFiles = [];
			this.$emit('update:productId', productId);
			await this.uploadFiles(files);
			return this.localImages;
		},
		async removeImage(img) {
			if (!this.productId || !img.imageId) return;
			this.isUploading = true;
			try {
				await api.delete(`/api/products/${this.productId}/images/${img.imageId}`);
				this.localImages = this.localImages.filter(
					(item) => String(item.product_images_id) !== String(img.imageId)
				);
				this.$emit('images-updated', this.localImages);
				this.$snotify.success('Imagen eliminada', { timeout: 2000 });
			} catch (error) {
				this.$snotify.error('No se pudo eliminar la imagen', { timeout: 3000 });
			} finally {
				this.isUploading = false;
			}
		},
		removePending(index) {
			const item = this.pendingFiles[index];
			if (item && item.preview) {
				URL.revokeObjectURL(item.preview);
			}
			this.pendingFiles.splice(index, 1);
		},
	},
};
</script>

<style scoped>
.aio-product-images__hint {
	margin-bottom: 1rem;
	padding: 0.875rem 1rem;
	border-radius: 10px;
	background: rgba(169, 109, 250, 0.08);
	font-size: 0.8125rem;
	color: #6b7280;
}

.aio-product-images__grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 0.75rem;
	margin-bottom: 1rem;
}

.aio-product-images__item {
	position: relative;
	border-radius: 12px;
	overflow: hidden;
	aspect-ratio: 1;
	border: 1px solid rgba(169, 109, 250, 0.15);
	background: #f9fafb;
}

.aio-product-images__item img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.aio-product-images__item--cover {
	border-color: #A96DFA;
	box-shadow: 0 0 0 2px rgba(169, 109, 250, 0.25);
}

.aio-product-images__remove {
	position: absolute;
	top: 6px;
	right: 6px;
	width: 24px;
	height: 24px;
	border: none;
	border-radius: 50%;
	background: rgba(17, 24, 39, 0.65);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.aio-product-images__badge {
	position: absolute;
	left: 6px;
	bottom: 6px;
	padding: 2px 8px;
	border-radius: 999px;
	background: rgba(169, 109, 250, 0.92);
	color: #fff;
	font-size: 0.625rem;
	font-weight: 700;
	text-transform: uppercase;
}

.aio-product-images__dropzone {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 1.25rem;
	border: 2px dashed rgba(169, 109, 250, 0.35);
	border-radius: 12px;
	cursor: pointer;
	color: #6b7280;
	font-size: 0.875rem;
	transition: border-color 0.2s, background 0.2s;
}

.aio-product-images__dropzone:hover {
	border-color: #A96DFA;
	background: rgba(169, 109, 250, 0.04);
}

.aio-product-images__input {
	display: none;
}
</style>
