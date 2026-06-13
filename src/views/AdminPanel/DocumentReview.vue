<template>
	<div class="aio-admin-page">
		<AdminPageHeader>
			<template #actions>
				<div class="aio-admin-docs__filters">
					<v-btn-toggle v-model="statusFilter" mandatory dense @change="onFilterChange">
						<v-btn value="pending" small>{{ $t('adminDocumentReview.filterPending') }}</v-btn>
						<v-btn value="verified" small>{{ $t('adminDocumentReview.filterVerified') }}</v-btn>
						<v-btn value="all" small>{{ $t('adminDocumentReview.filterAll') }}</v-btn>
					</v-btn-toggle>
				</div>
			</template>
		</AdminPageHeader>

		<div v-if="errorMessage" class="aio-admin-page__error">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ errorMessage }}
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>{{ $t('adminDocumentReview.loading') }}</span>
		</div>

		<div v-else-if="!documents.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="#A96DFA">description</v-icon>
			<h3>{{ $t('adminDocumentReview.emptyTitle') }}</h3>
			<p>{{ $t('adminDocumentReview.emptyHint') }}</p>
		</div>

		<div v-else class="aio-admin-docs__list">
			<article
				v-for="doc in documents"
				:key="doc.id"
				class="aio-admin-docs__card aio-admin-card pa-4"
			>
				<div class="aio-admin-docs__card-top">
					<div>
						<span
							class="aio-admin-badge"
							:class="doc.verified ? 'aio-admin-badge--success' : 'aio-admin-badge--warning'"
						>
							{{ doc.verified ? $t('adminDocumentReview.verified') : $t('adminDocumentReview.pending') }}
						</span>
						<h3 class="aio-admin-docs__doc-type">{{ formatDocumentName(doc.document_type) }}</h3>
						<p class="aio-admin-docs__meta">
							{{ $t('adminDocumentReview.orderMeta', {
								order: doc.id_shopping_car,
								product: doc.product_name,
							}) }}
						</p>
						<p class="aio-admin-docs__meta">
							{{ doc.name_user }} {{ doc.last_name_user }} · {{ doc.email }}
						</p>
						<p class="aio-admin-docs__meta aio-admin-docs__meta--muted">
							{{ doc.file_name }} · {{ formatDate(doc.created_at) }}
						</p>
					</div>
					<div class="aio-admin-docs__actions">
						<v-btn
							outlined
							color="primary"
							small
							:href="documentUrl(doc.document_url)"
							target="_blank"
							rel="noopener noreferrer"
						>
							<v-icon left small>open_in_new</v-icon>
							{{ $t('adminDocumentReview.viewFile') }}
						</v-btn>
						<v-btn
							v-if="!doc.verified"
							color="primary"
							small
							:loading="processingId === doc.id"
							@click="verifyDocument(doc, true)"
						>
							{{ $t('adminDocumentReview.approve') }}
						</v-btn>
						<v-btn
							v-if="!doc.verified"
							outlined
							color="error"
							small
							:loading="processingId === doc.id"
							@click="openRejectDialog(doc)"
						>
							{{ $t('adminDocumentReview.reject') }}
						</v-btn>
					</div>
				</div>

				<p v-if="doc.notes" class="aio-admin-docs__notes">
					<strong>{{ $t('adminDocumentReview.notesLabel') }}</strong> {{ doc.notes }}
				</p>
			</article>

			<div v-if="pagination.totalPages > 1" class="aio-account-orders__pagination-wrap">
				<p class="aio-account-orders__pagination-info">
					{{ $t('adminDocumentReview.pagination', {
						page: pagination.page,
						totalPages: pagination.totalPages,
						total: pagination.total,
					}) }}
				</p>
				<nav class="aio-account-orders__pagination" :aria-label="$t('adminDocumentReview.paginationLabel')">
					<button
						type="button"
						class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
						:disabled="!pagination.hasPrevPage || isPageLoading"
						@click="goToPage(pagination.page - 1)"
					>
						<v-icon size="20">chevron_left</v-icon>
					</button>
					<button
						type="button"
						class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
						:disabled="!pagination.hasNextPage || isPageLoading"
						@click="goToPage(pagination.page + 1)"
					>
						<v-icon size="20">chevron_right</v-icon>
					</button>
				</nav>
			</div>
		</div>

		<v-dialog v-model="rejectDialog" max-width="480">
			<v-card>
				<v-card-title>{{ $t('adminDocumentReview.rejectTitle') }}</v-card-title>
				<v-card-text>
					<p class="mb-3">{{ $t('adminDocumentReview.rejectHint') }}</p>
					<v-textarea
						v-model="rejectNotes"
						:label="$t('adminDocumentReview.rejectReasonLabel')"
						outlined
						rows="3"
						hide-details
					></v-textarea>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="rejectDialog = false">{{ $t('adminDocumentReview.cancel') }}</v-btn>
					<v-btn color="error" depressed :loading="processingId !== null" @click="confirmReject">
						{{ $t('adminDocumentReview.reject') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import api from 'Api';
import AppConfig from 'Constants/AppConfig';
import { formatDocumentName } from 'Helpers/documents';
import moment from 'moment';

const emptyPagination = () => ({
	page: 1,
	limit: 20,
	total: 0,
	totalPages: 0,
	hasNextPage: false,
	hasPrevPage: false,
});

export default {
	data() {
		return {
			isLoading: true,
			isPageLoading: false,
			errorMessage: '',
			documents: [],
			pagination: emptyPagination(),
			statusFilter: 'pending',
			processingId: null,
			rejectDialog: false,
			rejectNotes: '',
			selectedDoc: null,
		};
	},
	mounted() {
		this.loadDocuments();
	},
	methods: {
		formatDocumentName,
		formatDate(value) {
			return value ? moment(value).format('DD/MM/YYYY HH:mm') : '';
		},
		documentUrl(path) {
			if (!path) return '#';
			if (path.startsWith('http')) return path;
			return `${AppConfig.apiUrl}${path}`;
		},
		onFilterChange() {
			this.loadDocuments(1);
		},
		async loadDocuments(page = 1) {
			if (page === 1 && !this.isPageLoading) {
				this.isLoading = true;
			} else {
				this.isPageLoading = true;
			}
			this.errorMessage = '';

			try {
				const response = await api.get('/api/product_documents/admin/review', {
					params: {
						page,
						limit: this.pagination.limit,
						status: this.statusFilter,
					},
				});
				const payload = response?.data?.data;
				this.documents = payload?.items || [];
				this.pagination = { ...emptyPagination(), ...payload?.pagination };
			} catch (error) {
				this.documents = [];
				this.pagination = emptyPagination();
				this.errorMessage = error?.response?.data?.error?.message
					|| this.$t('adminDocumentReview.loadError');
			} finally {
				this.isLoading = false;
				this.isPageLoading = false;
			}
		},
		goToPage(page) {
			this.loadDocuments(page);
		},
		async verifyDocument(doc, approved) {
			this.processingId = doc.id;
			try {
				await api.put(`/api/product_documents/${doc.id}/verify`, {
					verified: approved,
					notes: approved ? this.$t('adminDocumentReview.approvedNote') : this.rejectNotes,
				});
				this.$snotify.success(
					approved
						? this.$t('adminDocumentReview.approveSuccess')
						: this.$t('adminDocumentReview.rejectSuccess')
				);
				await this.loadDocuments(this.pagination.page);
			} catch (error) {
				const message = error?.response?.data?.error?.message
					|| this.$t('adminDocumentReview.updateError');
				this.$snotify.error(message);
			} finally {
				this.processingId = null;
				this.rejectDialog = false;
				this.rejectNotes = '';
				this.selectedDoc = null;
			}
		},
		openRejectDialog(doc) {
			this.selectedDoc = doc;
			this.rejectNotes = '';
			this.rejectDialog = true;
		},
		confirmReject() {
			if (!this.selectedDoc) return;
			if (!this.rejectNotes.trim()) {
				this.$snotify.warning(this.$t('adminDocumentReview.rejectReasonRequired'));
				return;
			}
			this.verifyDocument(this.selectedDoc, false);
		},
	},
};
</script>

<style scoped>
.aio-admin-docs__list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.aio-admin-docs__card-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;
	flex-wrap: wrap;
}

.aio-admin-docs__doc-type {
	margin: 0 0 0.35rem;
	font-size: 1.05rem;
}

.aio-admin-docs__meta {
	margin: 0;
	font-size: 0.875rem;
	color: #3d3d48;
}

.aio-admin-docs__meta--muted {
	color: #8a8a96;
	margin-top: 0.25rem;
}

.aio-admin-docs__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.aio-admin-docs__notes {
	margin: 0.75rem 0 0;
	padding-top: 0.75rem;
	border-top: 1px solid rgba(169, 109, 250, 0.12);
	font-size: 0.875rem;
	color: #6b6b78;
}

.aio-admin-badge {
	margin-bottom: 0.5rem;
}
</style>
