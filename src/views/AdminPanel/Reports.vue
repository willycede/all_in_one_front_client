<template>

	<div class="aio-admin-page">

		<div v-if="loadError" class="aio-admin-page__error mb-4">

			<v-icon color="error" class="mr-2">error_outline</v-icon>

			{{ loadError }}

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



		<div class="aio-admin-card pa-4">

			<div class="aio-admin-page__header" style="margin-bottom: 1rem;">

				<div>

					<h2 class="aio-admin-page__title">Pedidos recientes</h2>

					<p class="aio-admin-page__subtitle">Últimas compras confirmadas en la tienda</p>

				</div>

			</div>



			<div v-if="isLoading" class="aio-admin-page__loading">

				<v-progress-circular indeterminate color="primary" size="28"></v-progress-circular>

				<span>Cargando reportes...</span>

			</div>



			<div v-else-if="!recentOrders.length" class="aio-admin-page__empty">

				<v-icon size="36" color="grey">receipt_long</v-icon>

				<p>Aún no hay pedidos pagados registrados.</p>

			</div>



			<div v-else-if="!recentOrders.length" class="aio-admin-page__empty aio-admin-card pa-4">
				<v-icon size="36" color="grey">receipt_long</v-icon>
				<p>No hay pedidos recientes para mostrar.</p>
			</div>

			<div v-else class="aio-admin-reports-table-wrap">

				<table class="aio-admin-reports-table">

					<thead>

						<tr>

							<th>Orden</th>

							<th>Cliente</th>

							<th>Total</th>

							<th>Fecha</th>

						</tr>

					</thead>

					<tbody>

						<tr v-for="order in recentOrders" :key="order.id_shopping_car">

							<td>#{{ order.id_shopping_car }}</td>

							<td>

								<span class="aio-admin-reports-table__name">

									{{ order.customerName }}

								</span>

								<span class="aio-admin-reports-table__email">{{ order.email }}</span>

							</td>

							<td>${{ order.total }}</td>

							<td>{{ order.dateLabel }}</td>

						</tr>

					</tbody>

				</table>

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

			loadError: '',

			stats: [

				{ label: 'Pedidos hoy', value: '—', icon: 'shopping_bag' },

				{ label: 'Ingresos totales', value: '—', icon: 'payments' },

				{ label: 'Productos activos', value: '—', icon: 'inventory_2' },

				{ label: 'Clientes', value: '—', icon: 'groups' },

			],

			recentOrders: [],

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

			const date = new Date(value);

			return date.toLocaleString('es-EC', {

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

					{ label: 'Pedidos hoy', value: String(data.ordersToday || 0), icon: 'shopping_bag' },

					{ label: 'Ingresos totales', value: `$${this.formatMoney(data.revenue)}`, icon: 'payments' },

					{ label: 'Productos activos', value: String(data.productsCount || 0), icon: 'inventory_2' },

					{ label: 'Clientes', value: String(data.clientsCount || 0), icon: 'groups' },

				];



				this.recentOrders = (data.recentOrders || []).map((order) => ({

					...order,

					customerName: `${order.name_user || ''} ${order.last_name_user || ''}`.trim() || 'Cliente',

					total: this.formatMoney(order.shopping_car_total),

					dateLabel: this.formatDate(order.updated_at),

				}));

			} catch (error) {

				this.loadError = 'No se pudieron cargar los reportes del panel.';

			} finally {

				this.isLoading = false;

			}

		},

	},

};

</script>



<style scoped>

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

</style>

