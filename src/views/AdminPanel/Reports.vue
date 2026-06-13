<template>
	<div class="aio-admin-page">
		<AdminPageHeader />

		<div v-if="loadError" class="aio-admin-page__error mb-4">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ loadError }}
		</div>

		<div v-if="invoiceAlertCount > 0" class="aio-admin-alert-banner mb-4">
			<v-icon color="warning" class="mr-2">warning_amber</v-icon>
			<div>
				<strong>{{ $t('adminReports.invoiceAlertTitle', { count: invoiceAlertCount }) }}</strong>
				<p>{{ $t('adminReports.invoiceAlertHint') }}</p>
			</div>
			<v-btn small outlined color="primary" to="/admin-panel/invoices">
				{{ $t('adminReports.invoiceAlertAction') }}
			</v-btn>
		</div>

		<div class="aio-admin-stats">
			<div v-for="stat in stats" :key="stat.label" class="aio-admin-card aio-admin-stat">
				<div class="aio-admin-stat__icon">
					<v-icon>{{ stat.icon }}</v-icon>
				</div>
				<p class="aio-admin-stat__label">{{ stat.label }}</p>
				<p class="aio-admin-stat__value">{{ stat.value }}</p>
			</div>
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card pa-4">
			<v-progress-circular indeterminate color="primary" size="28"></v-progress-circular>
			<span>{{ $t('adminReports.loading') }}</span>
		</div>

		<template v-else>
			<div class="aio-admin-reports-toolbar mb-4">
				<v-btn outlined color="primary" depressed @click="exportCsv">
					<v-icon left small>download</v-icon>
					{{ $t('adminReports.exportCsv') }}
				</v-btn>
			</div>

			<div class="aio-admin-reports-grid">
				<div class="aio-admin-card pa-4">
					<div class="aio-admin-page__header" style="margin-bottom: 1rem;">
						<div>
							<h2 class="aio-admin-page__title">{{ $t('adminReports.topProductsTitle') }}</h2>
							<p class="aio-admin-page__subtitle">{{ $t('adminReports.topProductsSubtitle') }}</p>
						</div>
					</div>
					<div v-if="!topProducts.length" class="aio-admin-page__empty">
						<p>{{ $t('adminReports.noTopProducts') }}</p>
					</div>
					<div v-else class="aio-admin-reports-table-wrap">
						<table class="aio-admin-reports-table">
							<thead>
								<tr>
									<th>{{ $t('adminReports.productColumn') }}</th>
									<th>{{ $t('adminReports.unitsColumn') }}</th>
									<th>{{ $t('adminReports.revenueColumn') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="product in topProducts" :key="product.id_product">
									<td>{{ product.name }}</td>
									<td>{{ product.units_sold }}</td>
									<td>${{ product.total }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="aio-admin-card pa-4">
					<div class="aio-admin-page__header" style="margin-bottom: 1rem;">
						<div>
							<h2 class="aio-admin-page__title">{{ $t('adminReports.restockTitle') }}</h2>
							<p class="aio-admin-page__subtitle">{{ $t('adminReports.restockSubtitle') }}</p>
						</div>
					</div>
					<div v-if="!restockSuggestions.length" class="aio-admin-page__empty">
						<p>{{ $t('adminReports.noRestock') }}</p>
					</div>
					<ul v-else class="aio-admin-restock-list">
						<li v-for="item in restockSuggestions" :key="item.id_product">
							<div>
								<strong>{{ item.name }}</strong>
								<span>{{ item.units_sold }} uds · ${{ item.total }}</span>
							</div>
							<span class="aio-admin-badge" :class="item.priority === 'high' ? 'aio-admin-badge--warning' : 'aio-admin-badge--muted'">
								{{ item.priority === 'high' ? $t('adminReports.priorityHigh') : $t('adminReports.priorityMedium') }}
							</span>
						</li>
					</ul>
				</div>
			</div>

			<div class="aio-admin-reports-grid mt-4">
				<div class="aio-admin-card pa-4">
					<div class="aio-admin-page__header" style="margin-bottom: 1rem;">
						<div>
							<h2 class="aio-admin-page__title">{{ $t('adminReports.trendsTitle') }}</h2>
							<p class="aio-admin-page__subtitle">{{ $t('adminReports.trendsSubtitle') }}</p>
						</div>
					</div>
					<div class="aio-admin-reports-table-wrap">
						<table class="aio-admin-reports-table">
							<thead>
								<tr>
									<th>{{ $t('adminReports.weekColumn') }}</th>
									<th>{{ $t('adminReports.ordersColumn') }}</th>
									<th>{{ $t('adminReports.revenueColumn') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="week in weeklyTrend" :key="week.week_key">
									<td>{{ week.week_key }}</td>
									<td>{{ week.orders_count }}</td>
									<td>${{ week.total }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="aio-admin-card pa-4">
					<div class="aio-admin-page__header" style="margin-bottom: 1rem;">
						<div>
							<h2 class="aio-admin-page__title">{{ $t('adminReports.categoriesTitle') }}</h2>
						</div>
					</div>
					<div class="aio-admin-reports-table-wrap">
						<table class="aio-admin-reports-table">
							<thead>
								<tr>
									<th>{{ $t('adminReports.categoryColumn') }}</th>
									<th>{{ $t('adminReports.unitsColumn') }}</th>
									<th>{{ $t('adminReports.revenueColumn') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="cat in categorySales" :key="cat.id_category || cat.category_name">
									<td>{{ cat.category_name }}</td>
									<td>{{ cat.units_sold }}</td>
									<td>${{ cat.total }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<div class="aio-admin-card pa-4 mt-4">
				<div class="aio-admin-page__header" style="margin-bottom: 1rem;">
					<div>
						<h2 class="aio-admin-page__title">{{ $t('adminReports.recentOrdersTitle') }}</h2>
						<p class="aio-admin-page__subtitle">{{ $t('adminReports.recentOrdersSubtitle') }}</p>
					</div>
				</div>

				<div v-if="!recentOrders.length" class="aio-admin-page__empty">
					<v-icon size="36" color="grey">receipt_long</v-icon>
					<p>{{ $t('adminReports.noRecentOrders') }}</p>
				</div>

				<div v-else class="aio-admin-reports-table-wrap">
					<table class="aio-admin-reports-table">
						<thead>
							<tr>
								<th>{{ $t('adminReports.orderColumn') }}</th>
								<th>{{ $t('adminReports.customerColumn') }}</th>
								<th>{{ $t('adminReports.totalColumn') }}</th>
								<th>{{ $t('adminReports.dateColumn') }}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="order in recentOrders" :key="order.id_shopping_car">
								<td>#{{ order.id_shopping_car }}</td>
								<td>
									<span class="aio-admin-reports-table__name">{{ order.customerName }}</span>
									<span class="aio-admin-reports-table__email">{{ order.email }}</span>
								</td>
								<td>${{ order.total }}</td>
								<td>{{ order.dateLabel }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import api from 'Api';

export default {
	data() {
		return {
			isLoading: true,
			loadError: '',
			stats: [],
			recentOrders: [],
			topProducts: [],
			weeklyTrend: [],
			categorySales: [],
			restockSuggestions: [],
			invoiceAlertCount: 0,
		};
	},
	async mounted() {
		await this.loadStats();
	},
	methods: {
		formatMoney(value) {
			const amount = parseFloat(value) || 0;
			return amount.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
		async loadStats() {
			this.isLoading = true;
			this.loadError = '';
			try {
				const response = await api.get('/api/admin/dashboard/stats');
				const data = response.data && response.data.data;
				if (!data) return;

				this.stats = [
					{ label: this.$t('adminReports.ordersToday'), value: String(data.ordersToday || 0), icon: 'shopping_bag' },
					{ label: this.$t('adminReports.revenueTotal'), value: `$${this.formatMoney(data.revenue)}`, icon: 'payments' },
					{ label: this.$t('adminReports.revenue30'), value: `$${this.formatMoney(data.revenue30Days)}`, icon: 'trending_up' },
					{ label: this.$t('adminReports.pendingInvoices'), value: String(data.pendingInvoices || 0), icon: 'receipt_long' },
					{ label: this.$t('adminReports.invoicedOrders'), value: String(data.invoicedOrders || 0), icon: 'task_alt' },
					{ label: this.$t('adminReports.activeProducts'), value: String(data.productsCount || 0), icon: 'inventory_2' },
					{ label: this.$t('adminReports.clients'), value: String(data.clientsCount || 0), icon: 'groups' },
					{ label: this.$t('adminReports.invoiceErrors'), value: String(data.invoiceErrors || 0), icon: 'error_outline' },
				];

				this.recentOrders = (data.recentOrders || []).map((order) => ({
					...order,
					customerName: `${order.name_user || ''} ${order.last_name_user || ''}`.trim() || 'Cliente',
					total: this.formatMoney(order.shopping_car_total),
					dateLabel: this.formatDate(order.updated_at),
				}));

				this.topProducts = (data.topProducts || []).map((row) => ({
					...row,
					total: this.formatMoney(row.revenue),
				}));

				this.weeklyTrend = (data.weeklyTrend || []).map((row) => ({
					...row,
					total: this.formatMoney(row.revenue),
				}));

				this.categorySales = (data.categorySales || []).map((row) => ({
					...row,
					total: this.formatMoney(row.revenue),
				}));

				this.restockSuggestions = (data.restockSuggestions || []).map((row) => ({
					...row,
					total: this.formatMoney(row.revenue),
				}));

				this.invoiceAlertCount = Number(data.invoiceAlertCount || data.invoiceErrors || 0);
			} catch (error) {
				this.loadError = this.$t('adminReports.loadError');
			} finally {
				this.isLoading = false;
			}
		},
		csvEscape(value) {
			const text = value == null ? '' : String(value);
			if (/[",\n]/.test(text)) {
				return `"${text.replace(/"/g, '""')}"`;
			}
			return text;
		},
		exportCsv() {
			const lines = [];
			const pushSection = (title, headers, rows) => {
				lines.push(this.csvEscape(title));
				lines.push(headers.map((header) => this.csvEscape(header)).join(','));
				rows.forEach((row) => {
					lines.push(row.map((cell) => this.csvEscape(cell)).join(','));
				});
				lines.push('');
			};

			pushSection(
				this.$t('adminReports.exportSummary'),
				[this.$t('adminReports.exportMetric'), this.$t('adminReports.exportValue')],
				this.stats.map((stat) => [stat.label, stat.value])
			);

			pushSection(
				this.$t('adminReports.topProductsTitle'),
				[
					this.$t('adminReports.productColumn'),
					this.$t('adminReports.unitsColumn'),
					this.$t('adminReports.revenueColumn'),
				],
				this.topProducts.map((row) => [row.name, row.units_sold, row.total])
			);

			pushSection(
				this.$t('adminReports.trendsTitle'),
				[
					this.$t('adminReports.weekColumn'),
					this.$t('adminReports.ordersColumn'),
					this.$t('adminReports.revenueColumn'),
				],
				this.weeklyTrend.map((row) => [row.week_key, row.orders_count, row.total])
			);

			pushSection(
				this.$t('adminReports.categoriesTitle'),
				[
					this.$t('adminReports.categoryColumn'),
					this.$t('adminReports.unitsColumn'),
					this.$t('adminReports.revenueColumn'),
				],
				this.categorySales.map((row) => [row.category_name, row.units_sold, row.total])
			);

			pushSection(
				this.$t('adminReports.recentOrdersTitle'),
				[
					this.$t('adminReports.orderColumn'),
					this.$t('adminReports.customerColumn'),
					this.$t('adminReports.totalColumn'),
					this.$t('adminReports.dateColumn'),
				],
				this.recentOrders.map((row) => [
					`#${row.id_shopping_car}`,
					row.customerName,
					row.total,
					row.dateLabel,
				])
			);

			const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `reportes-${new Date().toISOString().slice(0, 10)}.csv`;
			link.click();
			URL.revokeObjectURL(url);
		},
	},
};
</script>

<style scoped>
.aio-admin-reports-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
}

.aio-admin-reports-toolbar {
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.aio-admin-alert-banner {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	padding: 1rem 1.25rem;
	border-radius: 12px;
	background: rgba(245, 158, 11, 0.1);
	border: 1px solid rgba(245, 158, 11, 0.25);
}

.aio-admin-alert-banner p {
	margin: 0.25rem 0 0;
	font-size: 0.875rem;
	color: #6b7280;
}

.aio-admin-alert-banner .v-btn {
	margin-left: auto;
	flex-shrink: 0;
}

.aio-admin-restock-list {
	list-style: none;
	margin: 0;
	padding: 0;
}

.aio-admin-restock-list li {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 0.75rem 0;
	border-bottom: 1px solid rgba(169, 109, 250, 0.1);
}

.aio-admin-restock-list li div {
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
}

.aio-admin-restock-list li span {
	font-size: 0.8125rem;
	color: #6b7280;
}

.aio-admin-reports-table-wrap {
	overflow-x: auto;
}

.aio-admin-reports-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.aio-admin-reports-table th,
.aio-admin-reports-table td {
	padding: 0.75rem 0.5rem;
	text-align: left;
	border-bottom: 1px solid rgba(169, 109, 250, 0.1);
}

.aio-admin-reports-table th {
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: #6b7280;
}

.aio-admin-reports-table__name {
	display: block;
	font-weight: 600;
	color: #111827;
}

.aio-admin-reports-table__email {
	display: block;
	font-size: 0.75rem;
	color: #9ca3af;
}

@media (max-width: 960px) {
	.aio-admin-reports-grid {
		grid-template-columns: 1fr;
	}
}
</style>
