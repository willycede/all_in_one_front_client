<template>
	<div class="aio-admin-page aio-admin-reports">
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
			<v-btn small outlined color="primary" to="/admin-panel/invoices?status=error">
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

			<div class="aio-admin-reports__charts-row aio-admin-reports__charts-row--products">
				<div class="aio-admin-card aio-admin-reports__chart-card">
					<div class="aio-admin-reports__chart-header">
						<div>
							<h2 class="aio-admin-page__title">{{ $t('adminReports.topProductsTitle') }}</h2>
							<p class="aio-admin-page__subtitle">{{ $t('adminReports.topProductsSubtitle') }}</p>
						</div>
					</div>
					<div v-if="!topProducts.length" class="aio-admin-page__empty">
						<p>{{ $t('adminReports.noTopProducts') }}</p>
					</div>
					<template v-else>
						<AdminHighchart :options="topProductsChartOptions" height="340px" />
						<div class="aio-admin-reports-table-wrap aio-admin-reports__chart-table">
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
					</template>
				</div>

				<div class="aio-admin-card aio-admin-reports__chart-card aio-admin-reports__chart-card--side">
					<div class="aio-admin-reports__chart-header">
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
							<span
								class="aio-admin-badge"
								:class="item.priority === 'high' ? 'aio-admin-badge--warning' : 'aio-admin-badge--muted'"
							>
								{{ item.priority === 'high' ? $t('adminReports.priorityHigh') : $t('adminReports.priorityMedium') }}
							</span>
						</li>
					</ul>
				</div>
			</div>

			<div class="aio-admin-card aio-admin-reports__chart-card mt-4">
				<div class="aio-admin-reports__chart-header">
					<div>
						<h2 class="aio-admin-page__title">{{ $t('adminReports.trendsTitle') }}</h2>
						<p class="aio-admin-page__subtitle">{{ $t('adminReports.trendsSubtitle') }}</p>
					</div>
				</div>
				<div v-if="!weeklyTrend.length" class="aio-admin-page__empty">
					<p>{{ $t('adminReports.noChartData') }}</p>
				</div>
				<AdminHighchart v-else :options="weeklyTrendChartOptions" height="320px" />
			</div>

			<div class="aio-admin-reports__charts-row mt-4">
				<div class="aio-admin-card aio-admin-reports__chart-card">
					<div class="aio-admin-reports__chart-header">
						<div>
							<h2 class="aio-admin-page__title">{{ $t('adminReports.categoriesTitle') }}</h2>
							<p class="aio-admin-page__subtitle">{{ $t('adminReports.categoriesSubtitle') }}</p>
						</div>
					</div>
					<div v-if="!categorySales.length" class="aio-admin-page__empty">
						<p>{{ $t('adminReports.noChartData') }}</p>
					</div>
					<template v-else>
						<AdminHighchart :options="categorySalesChartOptions" height="300px" />
						<div class="aio-admin-reports-table-wrap aio-admin-reports__chart-table">
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
					</template>
				</div>

				<div class="aio-admin-card aio-admin-reports__chart-card">
					<div class="aio-admin-reports__chart-header">
						<div>
							<h2 class="aio-admin-page__title">{{ $t('adminReports.invoiceStatusTitle') }}</h2>
							<p class="aio-admin-page__subtitle">{{ $t('adminReports.invoiceStatusSubtitle') }}</p>
						</div>
					</div>
					<div v-if="!hasInvoiceStatusData" class="aio-admin-page__empty">
						<p>{{ $t('adminReports.noChartData') }}</p>
					</div>
					<AdminHighchart v-else :options="invoiceStatusChartOptions" height="300px" />
				</div>
			</div>

			<div class="aio-admin-card aio-admin-reports__chart-card mt-4">
				<div class="aio-admin-reports__chart-header">
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
import AdminHighchart from '@/components/Admin/AdminHighchart.vue';
import { AIO_CHART_COLORS, formatCurrency, formatWeekLabel } from '@/helpers/adminHighchartsTheme';

export default {
	components: {
		AdminHighchart,
	},
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
			invoiceStatus: {
				invoicedOrders: 0,
				pendingInvoices: 0,
				invoiceErrors: 0,
			},
		};
	},
	computed: {
		hasInvoiceStatusData() {
			const { invoicedOrders, pendingInvoices, invoiceErrors } = this.invoiceStatus;
			return (invoicedOrders + pendingInvoices + invoiceErrors) > 0;
		},
		topProductsChartOptions() {
			if (!this.topProducts.length) {
				return null;
			}

			const rows = [...this.topProducts].slice(0, 8).reverse();

			return {
				chart: { type: 'bar' },
				xAxis: {
					categories: rows.map((row) => row.name),
					labels: {
						style: { color: '#6b7280', fontSize: '12px' },
					},
					lineColor: 'rgba(169, 109, 250, 0.12)',
					tickColor: 'rgba(169, 109, 250, 0.12)',
				},
				yAxis: {
					title: { text: null },
					gridLineColor: 'rgba(169, 109, 250, 0.08)',
					labels: {
						style: { color: '#9ca3af', fontSize: '11px' },
						formatter() {
							return `$${formatCurrency(this.value)}`;
						},
					},
				},
				legend: { enabled: false },
				plotOptions: {
					bar: {
						borderRadius: 6,
						borderWidth: 0,
						pointPadding: 0.12,
						groupPadding: 0.08,
						dataLabels: {
							enabled: true,
							align: 'right',
							style: { color: '#6b7280', fontSize: '11px', fontWeight: '600', textOutline: 'none' },
							formatter() {
								return `$${formatCurrency(this.y)}`;
							},
						},
					},
				},
				series: [{
					name: this.$t('adminReports.revenueColumn'),
					color: {
						linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
						stops: [
							[0, AIO_CHART_COLORS[0]],
							[1, AIO_CHART_COLORS[1]],
						],
					},
					data: rows.map((row) => row.revenueRaw),
				}],
				tooltip: {
					pointFormatter() {
						return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>$${formatCurrency(this.y)}</b><br/>`;
					},
				},
			};
		},
		weeklyTrendChartOptions() {
			if (!this.weeklyTrend.length) {
				return null;
			}

			const categories = this.weeklyTrend.map((row) => formatWeekLabel(row.week_key));

			return {
				chart: { zoomType: 'xy' },
				xAxis: {
					categories,
					crosshair: true,
					labels: { style: { color: '#6b7280', fontSize: '12px' } },
					lineColor: 'rgba(169, 109, 250, 0.12)',
				},
				yAxis: [{
					title: {
						text: this.$t('adminReports.ordersColumn'),
						style: { color: AIO_CHART_COLORS[0], fontSize: '12px' },
					},
					gridLineColor: 'rgba(169, 109, 250, 0.08)',
					labels: { style: { color: '#9ca3af', fontSize: '11px' } },
				}, {
					title: {
						text: this.$t('adminReports.revenueColumn'),
						style: { color: AIO_CHART_COLORS[1], fontSize: '12px' },
					},
					opposite: true,
					gridLineWidth: 0,
					labels: {
						style: { color: '#9ca3af', fontSize: '11px' },
						formatter() {
							return `$${formatCurrency(this.value)}`;
						},
					},
				}],
				plotOptions: {
					column: {
						borderRadius: 6,
						borderWidth: 0,
						maxPointWidth: 48,
					},
					spline: {
						lineWidth: 3,
						marker: {
							enabled: true,
							radius: 4,
							fillColor: '#fff',
							lineWidth: 2,
							lineColor: AIO_CHART_COLORS[1],
						},
					},
				},
				series: [{
					type: 'column',
					name: this.$t('adminReports.ordersColumn'),
					yAxis: 0,
					color: {
						linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
						stops: [
							[0, 'rgba(169, 109, 250, 0.95)'],
							[1, 'rgba(169, 109, 250, 0.55)'],
						],
					},
					data: this.weeklyTrend.map((row) => row.orders_count),
				}, {
					type: 'spline',
					name: this.$t('adminReports.revenueColumn'),
					yAxis: 1,
					color: AIO_CHART_COLORS[1],
					data: this.weeklyTrend.map((row) => row.revenueRaw),
				}],
				tooltip: {
					shared: true,
					formatter() {
						let html = `<b>${this.x}</b><br/>`;
						this.points.forEach((point) => {
							const isRevenue = point.series.index === 1;
							const displayValue = isRevenue ? `$${formatCurrency(point.y)}` : point.y;
							html += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${displayValue}</b><br/>`;
						});
						return html;
					},
				},
			};
		},
		categorySalesChartOptions() {
			if (!this.categorySales.length) {
				return null;
			}

			return {
				chart: { type: 'pie' },
				plotOptions: {
					pie: {
						innerSize: '58%',
						borderWidth: 0,
						borderRadius: 4,
						dataLabels: {
							enabled: true,
							distance: 18,
							style: { color: '#374151', fontSize: '12px', fontWeight: '500', textOutline: 'none' },
							formatter() {
								return `${this.point.name}<br/><b>$${formatCurrency(this.y)}</b>`;
							},
						},
					},
				},
				series: [{
					name: this.$t('adminReports.revenueColumn'),
					data: this.categorySales.map((row, index) => ({
						name: row.category_name,
						y: row.revenueRaw,
						color: AIO_CHART_COLORS[index % AIO_CHART_COLORS.length],
					})),
				}],
				tooltip: {
					pointFormatter() {
						return `<span style="color:${this.color}">●</span> ${this.name}: <b>$${formatCurrency(this.y)}</b> (${this.percentage.toFixed(1)}%)`;
					},
				},
			};
		},
		invoiceStatusChartOptions() {
			if (!this.hasInvoiceStatusData) {
				return null;
			}

			const { invoicedOrders, pendingInvoices, invoiceErrors } = this.invoiceStatus;

			return {
				chart: { type: 'pie' },
				colors: ['#22c55e', '#f59e0b', '#ef4444'],
				plotOptions: {
					pie: {
						innerSize: '62%',
						borderWidth: 0,
						borderRadius: 4,
						dataLabels: {
							enabled: true,
							distance: 16,
							style: { color: '#374151', fontSize: '12px', fontWeight: '500', textOutline: 'none' },
							formatter() {
								return `${this.point.name}<br/><b>${this.y}</b>`;
							},
						},
					},
				},
				series: [{
					name: this.$t('adminReports.exportValue'),
					data: [
						{ name: this.$t('adminReports.invoicedOrders'), y: invoicedOrders },
						{ name: this.$t('adminReports.pendingInvoices'), y: pendingInvoices },
						{ name: this.$t('adminReports.invoiceErrors'), y: invoiceErrors },
					].filter((item) => item.y > 0),
				}],
			};
		},
	},
	async mounted() {
		await this.loadStats();
	},
	methods: {
		formatMoney(value) {
			return formatCurrency(value);
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

				this.invoiceStatus = {
					invoicedOrders: Number(data.invoicedOrders || 0),
					pendingInvoices: Number(data.pendingInvoices || 0),
					invoiceErrors: Number(data.invoiceErrors || 0),
				};

				this.recentOrders = (data.recentOrders || []).map((order) => ({
					...order,
					customerName: `${order.name_user || ''} ${order.last_name_user || ''}`.trim() || 'Cliente',
					total: this.formatMoney(order.shopping_car_total),
					dateLabel: this.formatDate(order.updated_at),
				}));

				this.topProducts = (data.topProducts || []).map((row) => ({
					...row,
					revenueRaw: parseFloat(row.revenue) || 0,
					total: this.formatMoney(row.revenue),
				}));

				this.weeklyTrend = (data.weeklyTrend || []).map((row) => ({
					...row,
					revenueRaw: parseFloat(row.revenue) || 0,
					total: this.formatMoney(row.revenue),
				}));

				this.categorySales = (data.categorySales || []).map((row) => ({
					...row,
					revenueRaw: parseFloat(row.revenue) || 0,
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
