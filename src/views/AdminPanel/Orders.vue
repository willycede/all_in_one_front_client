<template>
	<div class="aio-admin-page">
		<AdminPageHeader />

		<div class="aio-admin-card pa-4 mb-4">
			<div class="aio-admin-invoices__toolbar">
				<v-text-field
					v-model="search"
					:label="$t('adminOrders.searchPlaceholder')"
					outlined
					dense
					hide-details
					clearable
					class="aio-admin-invoices__search"
					@keyup.enter="reload"
				></v-text-field>

				<v-btn-toggle v-model="statusFilter" mandatory dense class="aio-admin-invoices__filters" @change="reload">
					<v-btn value="all" small>{{ $t('adminOrders.all') }}</v-btn>
					<v-btn value="pending_payment" small>{{ $t('adminOrders.pendingPayment') }}</v-btn>
					<v-btn value="paid" small>{{ $t('adminOrders.paid') }}</v-btn>
					<v-btn value="cancelled" small>{{ $t('adminOrders.cancelled') }}</v-btn>
				</v-btn-toggle>

				<v-btn-toggle v-model="invoiceFilter" mandatory dense class="aio-admin-invoices__filters" @change="reload">
					<v-btn value="all" small>{{ $t('adminOrders.invoiceAll') }}</v-btn>
					<v-btn value="pending" small>{{ $t('adminOrders.invoicePending') }}</v-btn>
					<v-btn value="invoiced" small>{{ $t('adminOrders.invoiceDone') }}</v-btn>
				</v-btn-toggle>

				<v-btn color="primary" depressed @click="reload">
					<v-icon left>search</v-icon>
					{{ $t('adminOrders.searchButton') }}
				</v-btn>
			</div>
		</div>

		<div v-if="errorMessage" class="aio-admin-page__error mb-4">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ errorMessage }}
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
		</div>

		<div v-else-if="!orders.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="#A96DFA">shopping_bag</v-icon>
			<h3>{{ $t('adminOrders.noOrders') }}</h3>
		</div>

		<div v-else class="aio-admin-card pa-0 aio-admin-table-wrap">
			<table class="aio-admin-table">
				<thead>
					<tr>
						<th>{{ $t('adminOrders.orderColumn') }}</th>
						<th>{{ $t('adminOrders.customerColumn') }}</th>
						<th>{{ $t('adminOrders.totalColumn') }}</th>
						<th>{{ $t('adminOrders.statusColumn') }}</th>
						<th>{{ $t('adminOrders.invoiceColumn') }}</th>
						<th>{{ $t('adminOrders.delivery') }}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in orders" :key="item.id_shopping_car">
						<td><strong>#{{ item.id_shopping_car }}</strong></td>
						<td>
							<span class="aio-admin-invoices__name">{{ item.customerName }}</span>
							<span class="aio-admin-invoices__email">{{ item.email }}</span>
						</td>
						<td>${{ item.total }}</td>
						<td>
							<span class="aio-admin-badge" :class="statusClass(item.status)">{{ item.statusLabel }}</span>
						</td>
						<td>
							<span class="aio-admin-badge" :class="isOrderInvoicePending(item.status_invoice) ? 'aio-admin-badge--warning' : 'aio-admin-badge--success'">
								{{ isOrderInvoicePending(item.status_invoice) ? $t('adminOrders.invoicePending') : $t('adminOrders.invoiceDone') }}
							</span>
						</td>
						<td>
							<template v-if="item.use_delivery_address">
								<span class="aio-admin-invoices__name">{{ item.delivery_recipient_name || '—' }}</span>
								<span class="aio-admin-invoices__email">{{ item.delivery_address || '—' }}</span>
							</template>
							<span v-else class="aio-admin-invoices__email">{{ $t('adminOrders.sameAddress') }}</span>
						</td>
						<td class="aio-admin-invoices__actions">
							<v-btn
								v-if="item.status === 2"
								small
								depressed
								color="error"
								:loading="cancellingId === item.id_shopping_car"
								@click="cancelOrder(item)"
							>
								{{ $t('adminOrders.cancel') }}
							</v-btn>
							<v-btn
								v-if="item.status === 3 && isOrderInvoicePending(item.status_invoice)"
								small
								depressed
								color="primary"
								:loading="reprocessingId === item.id_shopping_car"
								@click="reprocess(item)"
							>
								{{ $t('adminOrders.reprocess') }}
							</v-btn>
							<template v-if="item.status === 3 && !isOrderInvoicePending(item.status_invoice)">
								<v-btn
									v-if="item.has_invoice_pdf"
									small
									depressed
									class="mr-1"
									:loading="downloadingKey === `${item.id_shopping_car}-pdf`"
									@click="downloadInvoice(item, 'pdf')"
								>
									{{ $t('adminOrders.downloadPdf') }}
								</v-btn>
								<v-btn
									v-if="item.has_invoice_xml"
									small
									depressed
									:loading="downloadingKey === `${item.id_shopping_car}-xml`"
									@click="downloadInvoice(item, 'xml')"
								>
									{{ $t('adminOrders.downloadXml') }}
								</v-btn>
							</template>
						</td>
					</tr>
				</tbody>
			</table>

			<div v-if="pagination.totalPages > 1" class="aio-admin-invoices__pagination pa-4">
				<p>{{ $t('adminOrders.pageOf', { page: pagination.page, total: pagination.totalPages }) }}</p>
				<div>
					<v-btn icon small :disabled="!pagination.hasPrevPage" @click="goToPage(pagination.page - 1)">
						<v-icon>chevron_left</v-icon>
					</v-btn>
					<v-btn icon small :disabled="!pagination.hasNextPage" @click="goToPage(pagination.page + 1)">
						<v-icon>chevron_right</v-icon>
					</v-btn>
				</div>
			</div>
		</div>

		<emb-delete-confirmation
			ref="cancelOrderDialog"
			icon="cancel"
			:title="$t('adminOrders.cancelTitle')"
			:message="pendingCancelMessage"
			:confirm-label="$t('adminOrders.cancelConfirmYes')"
			:cancel-label="$t('common.cancel')"
			@onConfirm="executeCancelOrder"
		></emb-delete-confirmation>
	</div>
</template>

<script>
import api from 'Api';
import { getApiErrorMessage } from 'Helpers/apiError';
import { isInvoicePending as isOrderInvoicePending } from 'Helpers/invoiceStatus';
import { downloadAdminInvoice } from 'Helpers/downloadInvoiceFile';

export default {
	data() {
		return {
			isLoading: true,
			errorMessage: '',
			search: '',
			statusFilter: 'all',
			invoiceFilter: 'all',
			orders: [],
			reprocessingId: null,
			cancellingId: null,
			downloadingKey: null,
			pendingCancelItem: null,
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
		pendingCancelMessage() {
			if (!this.pendingCancelItem) return '';
			return this.$t('adminOrders.cancelConfirm', { id: this.pendingCancelItem.id_shopping_car });
		},
	},
	mounted() {
		this.loadOrders();
	},
	methods: {
		isOrderInvoicePending,
		statusClass(status) {
			if (status === 2) return 'aio-admin-badge--warning';
			if (status === 4) return 'aio-admin-badge--error';
			return 'aio-admin-badge--success';
		},
		formatMoney(value) {
			return (parseFloat(value) || 0).toLocaleString('es-EC', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		},
		mapOrder(row) {
			return {
				...row,
				customerName: `${row.name_user || ''} ${row.last_name_user || ''}`.trim() || 'Cliente',
				total: this.formatMoney(row.shopping_car_total),
			};
		},
		reload() {
			this.loadOrders(1);
		},
		goToPage(page) {
			this.loadOrders(page);
		},
		async loadOrders(page = 1) {
			this.isLoading = true;
			this.errorMessage = '';
			try {
				const response = await api.get('/api/admin/orders', {
					params: {
						page,
						limit: this.pagination.limit,
						search: this.search || '',
						status: this.statusFilter,
						invoiceStatus: this.invoiceFilter,
					},
				});
				const payload = response && response.data && response.data.data;
				this.orders = (payload && payload.items ? payload.items.map(this.mapOrder) : []);
				this.pagination = { ...this.pagination, ...(payload && payload.pagination) };
			} catch (error) {
				this.errorMessage = getApiErrorMessage(error, this.$t('adminOrders.loadError'));
			} finally {
				this.isLoading = false;
			}
		},
		async reprocess(item) {
			this.reprocessingId = item.id_shopping_car;
			try {
				await api.post(`/api/admin/invoices/${item.id_shopping_car}/reprocess`);
				this.$snotify.success(this.$t('adminOrders.reprocessSuccess'));
				await this.loadOrders(this.pagination.page);
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('adminOrders.reprocessError')));
			} finally {
				this.reprocessingId = null;
			}
		},
		cancelOrder(item) {
			this.pendingCancelItem = item;
			this.$refs.cancelOrderDialog.openDialog();
		},
		async downloadInvoice(item, type) {
			this.downloadingKey = `${item.id_shopping_car}-${type}`;
			try {
				await downloadAdminInvoice(item.id_shopping_car, type);
			} catch (error) {
				this.$snotify.error(this.$t('adminOrders.downloadError'), { timeout: 4000 });
			} finally {
				this.downloadingKey = null;
			}
		},
		async executeCancelOrder() {
			this.$refs.cancelOrderDialog.close();
			const item = this.pendingCancelItem;
			this.pendingCancelItem = null;
			if (!item) return;

			this.cancellingId = item.id_shopping_car;
			try {
				await api.post(`/api/admin/orders/${item.id_shopping_car}/cancel`);
				this.$snotify.success(this.$t('adminOrders.cancelSuccess'));
				await this.loadOrders(this.pagination.page);
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('adminOrders.cancelError')));
			} finally {
				this.cancellingId = null;
			}
		},
	},
};
</script>
