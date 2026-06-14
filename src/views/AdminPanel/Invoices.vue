<template>
	<div class="aio-admin-page aio-admin-invoices">
		<AdminPageHeader />

		<div class="aio-admin-card aio-admin-invoices__toolbar-card">
			<div class="aio-admin-invoices__toolbar">
				<v-text-field
					v-model="search"
					:placeholder="$t('adminInvoices.searchPlaceholder')"
					outlined
					dense
					hide-details
					clearable
					prepend-inner-icon="search"
					class="aio-admin-invoices__search"
					@keyup.enter="reload"
				></v-text-field>

				<div
					class="aio-admin-invoices__filters"
					role="group"
					:aria-label="$t('adminInvoices.statusColumn')"
				>
					<button
						v-for="filter in filterOptions"
						:key="filter.value"
						type="button"
						class="aio-admin-invoices__filter-btn"
						:class="{ 'aio-admin-invoices__filter-btn--active': statusFilter === filter.value }"
						@click="setFilter(filter.value)"
					>
						{{ filter.label }}
					</button>
				</div>

				<v-btn
					depressed
					class="aio-admin-invoices__search-btn"
					@click="reload"
				>
					<v-icon left small>search</v-icon>
					{{ $t('adminInvoices.searchButton') }}
				</v-btn>
			</div>
		</div>

		<div v-if="errorMessage" class="aio-admin-page__error mb-4">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ errorMessage }}
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>{{ $t('adminInvoices.loading') }}</span>
		</div>

		<div v-else-if="!invoices.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="#A96DFA">receipt_long</v-icon>
			<h3>{{ $t('adminInvoices.empty') }}</h3>
			<p>{{ $t('adminInvoices.emptyHint') }}</p>
		</div>

		<div v-else class="aio-admin-card pa-0 aio-admin-table-wrap aio-admin-invoices__table-card">
			<table class="aio-admin-table aio-admin-invoices__table">
				<thead>
					<tr>
						<th>{{ $t('adminInvoices.orderColumn') }}</th>
						<th>{{ $t('adminInvoices.customerColumn') }}</th>
						<th>{{ $t('adminInvoices.totalColumn') }}</th>
						<th>{{ $t('adminInvoices.paidDateColumn') }}</th>
						<th>{{ $t('adminInvoices.statusColumn') }}</th>
						<th>{{ $t('adminInvoices.detailColumn') }}</th>
						<th class="aio-admin-invoices__action-col">{{ $t('adminInvoices.actionsColumn') }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in invoices" :key="item.id_shopping_car">
						<td class="aio-admin-invoices__order">#{{ item.id_shopping_car }}</td>
						<td>
							<div class="aio-admin-invoices__customer">
								<span class="aio-admin-invoices__avatar" aria-hidden="true">
									{{ customerInitials(item) }}
								</span>
								<span class="aio-admin-invoices__customer-copy">
									<span class="aio-admin-invoices__name">{{ item.customerName }}</span>
									<span class="aio-admin-invoices__email">{{ item.email }}</span>
								</span>
							</div>
						</td>
						<td class="aio-admin-invoices__total">${{ item.total }}</td>
						<td>
							<div class="aio-admin-invoices__date">
								<v-icon small class="aio-admin-invoices__date-icon">event</v-icon>
								<span>{{ item.dateLabel }}</span>
							</div>
						</td>
						<td>
							<span
								class="aio-admin-invoices__badge"
								:class="invoiceBadgeClass(item)"
							>
								<span class="aio-admin-invoices__badge-dot" aria-hidden="true"></span>
								{{ invoiceStatusLabel(item) }}
							</span>
						</td>
						<td class="aio-admin-invoices__detail">
							<div
								v-if="item.invoice_number"
								class="aio-admin-invoices__detail-success"
							>
								<v-icon small class="aio-admin-invoices__detail-icon">description</v-icon>
								<span>{{ item.invoice_number }}</span>
							</div>
							<span
								v-if="item.invoice_error"
								class="aio-admin-invoices__detail-error"
								:title="item.invoice_error"
							>
								{{ item.invoice_error }}
							</span>
							<span
								v-if="!item.invoice_number && !item.invoice_error"
								class="aio-admin-invoices__muted"
							>—</span>
						</td>
						<td class="aio-admin-invoices__actions">
							<template v-if="!isOrderInvoicePending(item.status_invoice)">
								<v-btn
									v-if="item.has_invoice_pdf"
									outlined
									small
									color="primary"
									class="aio-admin-invoices__action-btn"
									:loading="downloadingKey === `${item.id_shopping_car}-pdf`"
									@click="downloadInvoice(item, 'pdf')"
								>
									<v-icon left small>picture_as_pdf</v-icon>
									{{ $t('adminInvoices.downloadPdf') }}
								</v-btn>
								<v-btn
									v-if="item.has_invoice_xml"
									outlined
									small
									color="primary"
									class="aio-admin-invoices__action-btn"
									:loading="downloadingKey === `${item.id_shopping_car}-xml`"
									@click="downloadInvoice(item, 'xml')"
								>
									<v-icon left small>code</v-icon>
									{{ $t('adminInvoices.downloadXml') }}
								</v-btn>
							</template>
							<v-btn
								v-else
								outlined
								small
								color="primary"
								class="aio-admin-invoices__action-btn aio-admin-invoices__reprocess-btn"
								:loading="reprocessingId === item.id_shopping_car"
								@click="reprocess(item)"
							>
								<v-icon left small>refresh</v-icon>
								{{ $t('adminInvoices.reprocess') }}
							</v-btn>

							<v-menu offset-y left>
								<template v-slot:activator="{ on, attrs }">
									<v-btn
										icon
										small
										class="aio-admin-invoices__menu-btn"
										v-bind="attrs"
										v-on="on"
									>
										<v-icon small>more_vert</v-icon>
									</v-btn>
								</template>
								<v-list dense>
									<v-list-item
										v-if="item.has_invoice_pdf"
										@click="downloadInvoice(item, 'pdf')"
									>
										<v-list-item-icon class="mr-2">
											<v-icon small>picture_as_pdf</v-icon>
										</v-list-item-icon>
										<v-list-item-title>{{ $t('adminInvoices.downloadPdf') }}</v-list-item-title>
									</v-list-item>
									<v-list-item
										v-if="item.has_invoice_xml"
										@click="downloadInvoice(item, 'xml')"
									>
										<v-list-item-icon class="mr-2">
											<v-icon small>code</v-icon>
										</v-list-item-icon>
										<v-list-item-title>{{ $t('adminInvoices.downloadXml') }}</v-list-item-title>
									</v-list-item>
								</v-list>
							</v-menu>
						</td>
					</tr>
				</tbody>
			</table>

			<div v-if="pagination.totalPages > 1" class="aio-admin-invoices__pagination">
				<p>{{ $t('adminInvoices.pageOf', { page: pagination.page, total: pagination.totalPages }) }}</p>
				<div class="aio-admin-invoices__pagination-controls">
					<v-btn
						icon
						small
						:disabled="!pagination.hasPrevPage"
						@click="goToPage(pagination.page - 1)"
					>
						<v-icon>chevron_left</v-icon>
					</v-btn>
					<template v-for="(item, index) in paginationItems">
						<span
							v-if="item.type === 'ellipsis'"
							:key="`ellipsis-${index}`"
							class="aio-admin-invoices__page-ellipsis"
						>…</span>
						<v-btn
							v-else
							:key="`page-${item.value}`"
							small
							depressed
							class="aio-admin-invoices__page-btn"
							:class="{ 'aio-admin-invoices__page-btn--active': item.active }"
							@click="goToPage(item.value)"
						>
							{{ item.value }}
						</v-btn>
					</template>
					<v-btn
						icon
						small
						:disabled="!pagination.hasNextPage"
						@click="goToPage(pagination.page + 1)"
					>
						<v-icon>chevron_right</v-icon>
					</v-btn>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import api from 'Api';
import { isInvoicePending as isOrderInvoicePending } from 'Helpers/invoiceStatus';
import { downloadAdminInvoice } from 'Helpers/downloadInvoiceFile';

export default {
	data() {
		return {
			isLoading: true,
			errorMessage: '',
			search: '',
			statusFilter: 'all',
			invoices: [],
			reprocessingId: null,
			downloadingKey: null,
			pagination: {
				page: 1,
				limit: 10,
				total: 0,
				totalPages: 0,
				hasPrevPage: false,
				hasNextPage: false,
			},
		};
	},
	computed: {
		filterOptions() {
			return [
				{ value: 'all', label: this.$t('adminInvoices.all') },
				{ value: 'error', label: this.$t('adminInvoices.errors') },
				{ value: 'pending', label: this.$t('adminInvoices.pending') },
				{ value: 'invoiced', label: this.$t('adminInvoices.invoiced') },
			];
		},
		paginationItems() {
			const current = this.pagination.page;
			const total = this.pagination.totalPages;
			if (total <= 1) return [];

			const items = [];
			const pushPage = (page) => {
				items.push({
					type: 'page',
					value: page,
					active: page === current,
				});
			};

			if (total <= 7) {
				for (let page = 1; page <= total; page += 1) pushPage(page);
				return items;
			}

			pushPage(1);
			if (current > 3) items.push({ type: 'ellipsis' });

			const start = Math.max(2, current - 1);
			const end = Math.min(total - 1, current + 1);
			for (let page = start; page <= end; page += 1) pushPage(page);

			if (current < total - 2) items.push({ type: 'ellipsis' });
			pushPage(total);
			return items;
		},
	},
	mounted() {
		const status = this.$route && this.$route.query && this.$route.query.status;
		if (status === 'error' || status === 'pending' || status === 'invoiced' || status === 'all') {
			this.statusFilter = status;
		}
		this.loadInvoices();
	},
	methods: {
		isOrderInvoicePending,
		setFilter(value) {
			if (this.statusFilter === value) return;
			this.statusFilter = value;
			this.loadInvoices(1);
		},
		invoiceBadgeClass(item) {
			if (!isOrderInvoicePending(item.status_invoice)) return 'aio-admin-invoices__badge--success';
			if (item.invoice_error) return 'aio-admin-invoices__badge--danger';
			return 'aio-admin-invoices__badge--warning';
		},
		invoiceStatusLabel(item) {
			if (!isOrderInvoicePending(item.status_invoice)) {
				return this.$t('adminInvoices.invoicedStatus');
			}
			if (item.invoice_error) {
				return this.$t('adminInvoices.errorStatus');
			}
			return this.$t('adminInvoices.pendingStatus');
		},
		customerInitials(item) {
			const source = (item.customerName || item.email || '').trim();
			if (!source) return '?';
			const parts = source.split(/\s+/).filter(Boolean);
			if (parts.length >= 2) {
				return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
			}
			return source.slice(0, 1).toUpperCase();
		},
		formatMoney(value) {
			return (parseFloat(value) || 0).toLocaleString('es-EC', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		},
		formatDate(value) {
			if (!value) return '—';
			return new Date(value).toLocaleString('es-EC', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		},
		mapInvoice(row) {
			return {
				...row,
				customerName: `${row.name_user || ''} ${row.last_name_user || ''}`.trim() || 'Cliente',
				total: this.formatMoney(row.shopping_car_total),
				dateLabel: this.formatDate(row.updated_at || row.created_at),
			};
		},
		reload() {
			this.loadInvoices(1);
		},
		goToPage(page) {
			this.loadInvoices(page);
		},
		async loadInvoices(page = 1) {
			this.isLoading = true;
			this.errorMessage = '';
			try {
				const response = await api.get('/api/admin/invoices', {
					params: {
						page,
						limit: this.pagination.limit,
						search: this.search || '',
						status: this.statusFilter,
					},
				});
				const data = response.data && response.data.data;
				this.invoices = (data && data.items ? data.items : []).map(this.mapInvoice);
				this.pagination = { ...this.pagination, ...(data && data.pagination ? data.pagination : {}) };
			} catch (error) {
				this.invoices = [];
				this.errorMessage = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| this.$t('adminInvoices.loadError');
			} finally {
				this.isLoading = false;
			}
		},
		async reprocess(item) {
			this.reprocessingId = item.id_shopping_car;
			try {
				const response = await api.post(`/api/admin/invoices/${item.id_shopping_car}/reprocess`);
				const data = response.data && response.data.data;
				const message = (data && data.invoice_number)
					? this.$t('adminInvoices.reprocessSuccessWithNumber', { number: data.invoice_number })
					: this.$t('adminInvoices.reprocessSuccess');
				this.$snotify.success(message, { timeout: 3500 });
				await this.loadInvoices(this.pagination.page);
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| this.$t('adminInvoices.reprocessError');
				this.$snotify.error(message, { timeout: 4000 });
			} finally {
				this.reprocessingId = null;
			}
		},
		async downloadInvoice(item, type) {
			this.downloadingKey = `${item.id_shopping_car}-${type}`;
			try {
				await downloadAdminInvoice(item.id_shopping_car, type);
			} catch (error) {
				this.$snotify.error(this.$t('adminInvoices.downloadError'), { timeout: 4000 });
			} finally {
				this.downloadingKey = null;
			}
		},
	},
};
</script>
