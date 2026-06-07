<template>
	<div class="aio-admin-page">
		<div class="aio-admin-page__header">
			<div>
				<h2 class="aio-admin-page__title">Listado de facturas</h2>
				<p class="aio-admin-page__subtitle">Pedidos pagados y estado de facturación electrónica.</p>
			</div>
		</div>

		<div class="aio-admin-card pa-4 mb-4">
			<div class="aio-admin-invoices__toolbar">
				<v-text-field
					v-model="search"
					label="Buscar por orden, cliente o correo"
					outlined
					dense
					hide-details
					clearable
					class="aio-admin-invoices__search"
					@keyup.enter="reload"
				></v-text-field>

				<v-btn-toggle v-model="statusFilter" mandatory dense class="aio-admin-invoices__filters" @change="reload">
					<v-btn value="all" small>Todas</v-btn>
					<v-btn value="pending" small>Pendientes</v-btn>
					<v-btn value="invoiced" small>Facturadas</v-btn>
				</v-btn-toggle>

				<v-btn color="primary" depressed @click="reload">
					<v-icon left>search</v-icon>
					Buscar
				</v-btn>
			</div>
		</div>

		<div v-if="errorMessage" class="aio-admin-page__error mb-4">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ errorMessage }}
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>Cargando facturas...</span>
		</div>

		<div v-else-if="!invoices.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="#A96DFA">receipt_long</v-icon>
			<h3>Sin facturas</h3>
			<p>No hay pedidos pagados que coincidan con los filtros.</p>
		</div>

		<div v-else class="aio-admin-card pa-0 aio-admin-table-wrap">
			<table class="aio-admin-table">
				<thead>
					<tr>
						<th>Orden</th>
						<th>Cliente</th>
						<th>Total</th>
						<th>Fecha pago</th>
						<th>Estado</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in invoices" :key="item.id_shopping_car">
						<td><strong>#{{ item.id_shopping_car }}</strong></td>
						<td>
							<span class="aio-admin-invoices__name">{{ item.customerName }}</span>
							<span class="aio-admin-invoices__email">{{ item.email }}</span>
						</td>
						<td>${{ item.total }}</td>
						<td>{{ item.dateLabel }}</td>
						<td>
							<span
								class="aio-admin-badge"
								:class="item.status_invoice === 1 ? 'aio-admin-badge--success' : 'aio-admin-badge--warning'"
							>
								{{ item.status_invoice === 1 ? 'Facturado' : 'Pendiente' }}
							</span>
						</td>
						<td class="aio-admin-invoices__actions">
							<v-btn
								v-if="item.status_invoice === 0"
								small
								depressed
								color="primary"
								:loading="reprocessingId === item.id_shopping_car"
								@click="reprocess(item)"
							>
								<v-icon left small>published_with_changes</v-icon>
								Procesar
							</v-btn>
						</td>
					</tr>
				</tbody>
			</table>

			<div v-if="pagination.totalPages > 1" class="aio-admin-invoices__pagination pa-4">
				<p>Página {{ pagination.page }} de {{ pagination.totalPages }}</p>
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
	</div>
</template>

<script>
import api from 'Api';

export default {
	data() {
		return {
			isLoading: true,
			errorMessage: '',
			search: '',
			statusFilter: 'all',
			invoices: [],
			reprocessingId: null,
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
	mounted() {
		this.loadInvoices();
	},
	methods: {
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
					|| 'No se pudieron cargar las facturas.';
			} finally {
				this.isLoading = false;
			}
		},
		async reprocess(item) {
			this.reprocessingId = item.id_shopping_car;
			try {
				await api.post(`/api/admin/invoices/${item.id_shopping_car}/reprocess`);
				this.$snotify.success(`Factura procesada para orden #${item.id_shopping_car}`, { timeout: 3000 });
				await this.loadInvoices(this.pagination.page);
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| 'No se pudo procesar la factura';
				this.$snotify.error(message, { timeout: 4000 });
			} finally {
				this.reprocessingId = null;
			}
		},
	},
};
</script>

<style scoped>
.aio-admin-invoices__toolbar {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	align-items: center;
}

.aio-admin-invoices__search {
	flex: 1 1 280px;
	max-width: 420px;
}

.aio-admin-invoices__name {
	display: block;
	font-weight: 600;
	color: #111827;
}

.aio-admin-invoices__email {
	display: block;
	font-size: 0.75rem;
	color: #9ca3af;
}

.aio-admin-invoices__actions {
	text-align: right;
	white-space: nowrap;
}

.aio-admin-invoices__pagination {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid rgba(169, 109, 250, 0.1);
	font-size: 0.875rem;
	color: #6b7280;
}
</style>
