<template>
	<div class="aio-account-panel aio-account-orders order-history-wrap">
		<div v-if="isLoading" class="aio-account-panel__loading">
			<v-progress-circular indeterminate color="#A96DFA" size="36" width="3"></v-progress-circular>
			<p>Cargando tus pedidos...</p>
		</div>

		<template v-else>
			<div class="aio-account-panel__header">
				<div>
					<h2 class="aio-account-panel__title">Historial de pedidos</h2>
					<p class="aio-account-panel__subtitle">
						{{ pagination.total }}
						{{ pagination.total === 1 ? 'pedido registrado' : 'pedidos registrados' }}
					</p>
				</div>
			</div>

			<div class="aio-account-panel__notice">
				<v-icon size="20">info</v-icon>
				<p>
					Si ya realizaste el pago y la factura no se procesó automáticamente,
					usa el botón <strong>Reprocesar</strong> en el pedido correspondiente.
				</p>
			</div>

			<div v-if="!tableData.length" class="aio-account-orders__empty">
				<div class="aio-account-orders__empty-icon">
					<v-icon size="40">receipt_long</v-icon>
				</div>
				<h3>Sin pedidos aún</h3>
				<p>Cuando compres en la tienda, tus órdenes aparecerán aquí.</p>
				<router-link to="/products" class="aio-account-panel__edit-btn">
					<v-icon size="18">storefront</v-icon>
					Ir a la tienda
				</router-link>
			</div>

			<template v-else>
				<div class="aio-account-orders__list" :class="{ 'aio-account-orders__list--loading': isPageLoading }">
					<article
						v-for="item in tableData"
						:key="item.id_shopping_car"
						class="aio-account-orders__card"
					>
						<div class="aio-account-orders__card-top">
							<div>
								<span class="aio-account-orders__order-id">Orden #{{ item.id_shopping_car }}</span>
								<span class="aio-account-orders__date">
									<v-icon size="14">event</v-icon>
									{{ formatDate(item.created_at) }}
								</span>
							</div>
							<span class="aio-account-orders__total">{{ formatCurrency(item.shopping_car_total) }}</span>
						</div>

						<div class="aio-account-orders__badges">
							<span
								class="aio-account-orders__badge"
								:class="orderStatusClass(item.status)"
							>
								{{ formatEstatus(item.status) }}
							</span>
							<span
								class="aio-account-orders__badge"
								:class="invoiceStatusClass(item.status_invoice)"
							>
								{{ formatFacturado(item.status_invoice) }}
							</span>
						</div>

						<div v-if="hasActions(item)" class="aio-account-orders__actions">
							<button
								v-if="item.status == 2"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--primary"
								title="Generar nuevo link de pago"
								@click="openPayment(item)"
							>
								<v-icon size="18">payment</v-icon>
								Pagar
							</button>
							<button
								v-if="item.status == 2"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--danger"
								title="Cancelar orden"
								@click="cancelOrder(item)"
							>
								<v-icon size="18">cancel</v-icon>
								Cancelar
							</button>
							<button
								v-if="item.status === 3 && item.status_invoice === 0"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--secondary"
								title="Procesar factura"
								@click="reprocessInvoice(item)"
							>
								<v-icon size="18">published_with_changes</v-icon>
								Reprocesar
							</button>
						</div>
					</article>
				</div>

				<div class="aio-account-orders__pagination-wrap">
					<div class="aio-account-orders__pagination-toolbar">
						<p class="aio-account-orders__pagination-info">
							Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ pagination.total }} pedidos
						</p>

						<div class="aio-account-orders__page-size" role="group" aria-label="Pedidos por página">
							<span class="aio-account-orders__page-size-label">Por página</span>
							<button
								v-for="size in pageSizeOptions"
								:key="size"
								type="button"
								class="aio-account-orders__page-size-btn"
								:class="{ 'aio-account-orders__page-size-btn--active': pagination.limit === size }"
								:disabled="isPageLoading"
								:aria-pressed="pagination.limit === size"
								@click="changePageSize(size)"
							>
								{{ size }}
							</button>
						</div>
					</div>

					<nav
						v-if="pagination.totalPages > 1"
						class="aio-account-orders__pagination"
						aria-label="Paginación de pedidos"
					>
						<button
							type="button"
							class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
							:disabled="!pagination.hasPrevPage || isPageLoading"
							aria-label="Página anterior"
							@click="goToPage(pagination.page - 1)"
						>
							<v-icon size="20">chevron_left</v-icon>
						</button>

						<template v-for="(pageItem, index) in pageItems">
							<span
								v-if="pageItem === 'ellipsis'"
								:key="`ellipsis-${index}`"
								class="aio-account-orders__page-ellipsis"
							>…</span>
							<button
								v-else
								:key="`page-${pageItem}`"
								type="button"
								class="aio-account-orders__page-btn"
								:class="{ 'aio-account-orders__page-btn--active': pageItem === pagination.page }"
								:disabled="isPageLoading"
								:aria-current="pageItem === pagination.page ? 'page' : null"
								@click="goToPage(pageItem)"
							>
								{{ pageItem }}
							</button>
						</template>

						<button
							type="button"
							class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
							:disabled="!pagination.hasNextPage || isPageLoading"
							aria-label="Página siguiente"
							@click="goToPage(pagination.page + 1)"
						>
							<v-icon size="20">chevron_right</v-icon>
						</button>
					</nav>
				</div>
			</template>
		</template>
	</div>
</template>

<script>
import api from 'Api';
import moment from 'moment';
import AppConfig from 'Constants/AppConfig';
import { getApiErrorMessage, logApiError } from 'Helpers/apiError';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const emptyPagination = () => ({
	page: 1,
	limit: DEFAULT_PAGE_SIZE,
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
			suppressRouteWatch: false,
			dateFormat: 'DD/MM/YYYY',
			tableData: [],
			pagination: emptyPagination(),
			pageSizeOptions: PAGE_SIZE_OPTIONS,
		};
	},
	computed: {
		rangeStart() {
			if (!this.pagination.total) return 0;
			return (this.pagination.page - 1) * this.pagination.limit + 1;
		},
		rangeEnd() {
			return Math.min(this.pagination.page * this.pagination.limit, this.pagination.total);
		},
		pageItems() {
			const total = this.pagination.totalPages;
			const current = this.pagination.page;
			if (total <= 7) {
				return Array.from({ length: total }, (_, i) => i + 1);
			}

			const pages = new Set([1, total, current]);
			if (current > 1) pages.add(current - 1);
			if (current < total) pages.add(current + 1);
			if (current <= 3) {
				pages.add(2);
				pages.add(3);
			}
			if (current >= total - 2) {
				pages.add(total - 1);
				pages.add(total - 2);
			}

			const sorted = [...pages].sort((a, b) => a - b);
			const items = [];
			sorted.forEach((page, index) => {
				if (index > 0 && page - sorted[index - 1] > 1) {
					items.push('ellipsis');
				}
				items.push(page);
			});
			return items;
		},
	},
	watch: {
		'$route.query': {
			handler(newQuery, oldQuery) {
				if (this.suppressRouteWatch || !oldQuery) return;
				const page = this.parsePage(newQuery.page);
				const limit = this.parseLimit(newQuery.limit);
				const prevPage = this.parsePage(oldQuery.page);
				const prevLimit = this.parseLimit(oldQuery.limit);
				if (page === prevPage && limit === prevLimit) return;
				this.pagination.limit = limit;
				this.loadOrders(page, { silent: true });
			},
		},
	},
	async mounted() {
		const page = this.parsePage(this.$route.query.page);
		const limit = this.parseLimit(this.$route.query.limit);
		this.pagination.limit = limit;
		await this.syncRouteQuery(page, limit);
		await this.loadOrders(page);
	},
	methods: {
		parsePage(value) {
			const page = parseInt(value, 10);
			return Number.isFinite(page) && page > 0 ? page : 1;
		},
		parseLimit(value) {
			const limit = parseInt(value, 10);
			return PAGE_SIZE_OPTIONS.includes(limit) ? limit : DEFAULT_PAGE_SIZE;
		},
		async syncRouteQuery(page, limit) {
			const nextPage = this.parsePage(page);
			const nextLimit = this.parseLimit(limit);
			const currentPage = this.parsePage(this.$route.query.page);
			const currentLimit = this.parseLimit(this.$route.query.limit);
			if (currentPage === nextPage && currentLimit === nextLimit) return;

			this.suppressRouteWatch = true;
			try {
				await this.$router.replace({
					query: {
						...this.$route.query,
						page: String(nextPage),
						limit: String(nextLimit),
					},
				});
			} finally {
				this.$nextTick(() => {
					this.suppressRouteWatch = false;
				});
			}
		},
		getRequestParams(page = this.pagination.page) {
			return {
				page: this.parsePage(page),
				limit: this.parseLimit(this.pagination.limit),
			};
		},
		applyOrderResponse(payload) {
			if (payload?.items) {
				this.tableData = payload.items;
				this.pagination = { ...emptyPagination(), ...payload.pagination };
				return;
			}
			this.tableData = Array.isArray(payload) ? payload : [];
			this.pagination = {
				...emptyPagination(),
				limit: this.parseLimit(this.pagination.limit),
				total: this.tableData.length,
				totalPages: this.tableData.length ? 1 : 0,
			};
		},
		async loadOrders(page = this.pagination.page, { silent = false } = {}) {
			if (silent) {
				this.isPageLoading = true;
			} else {
				this.isLoading = true;
			}

			const requestPage = this.parsePage(page);
			const requestLimit = this.parseLimit(this.pagination.limit);

			try {
				const shopCart = await api.get(
					`/api/order_history/get_order_history/${localStorage.id_users}`,
					{
						params: {
							page: requestPage,
							limit: requestLimit,
						},
					}
				);
				this.applyOrderResponse(shopCart?.data?.data);
				await this.syncRouteQuery(this.pagination.page, this.pagination.limit);

				if (this.tableData.length === 0 && this.pagination.page > 1) {
					await this.syncRouteQuery(this.pagination.page - 1, this.pagination.limit);
					await this.loadOrders(this.pagination.page - 1, { silent: true });
				}
			} finally {
				this.isLoading = false;
				this.isPageLoading = false;
			}
		},
		async goToPage(page) {
			const nextPage = this.parsePage(page);
			if (
				nextPage < 1
				|| nextPage > this.pagination.totalPages
				|| nextPage === this.pagination.page
				|| this.isPageLoading
			) {
				return;
			}
			await this.syncRouteQuery(nextPage, this.pagination.limit);
			await this.loadOrders(nextPage, { silent: true });
		},
		async changePageSize(limit) {
			const nextLimit = this.parseLimit(limit);
			if (nextLimit === this.pagination.limit || this.isPageLoading) return;

			this.pagination.limit = nextLimit;
			await this.syncRouteQuery(1, nextLimit);
			await this.loadOrders(1, { silent: true });
		},
		hasActions(item) {
			return item.status == 2 || (item.status === 3 && item.status_invoice === 0);
		},
		formatDate(value) {
			return value ? moment(value).format(this.dateFormat) : '—';
		},
		async openPayment(item) {
			this.isPageLoading = true;

			try {
				const response = await api.post('/api/shoppingcar/payphone/regenerate', {
					id_shopping_car: item.id_shopping_car,
				});

				if (response.data && response.data.errorCode === 200 && response.data.url) {
					const payUrl = AppConfig.buildPayphoneRedirectUrl(response.data.url);
					item.url_payphone = response.data.url;
					window.open(payUrl, '_blank');
					this.$snotify.success('Link de pago generado. Se abrió en una nueva pestaña.', {
						timeout: 3500,
					});
					return;
				}

				const message = getApiErrorMessage(
					{ response: { data: response.data } },
					'No se pudo generar el link de pago'
				);
				this.$snotify.error(message, { timeout: 7000 });
			} catch (error) {
				logApiError('order-history:regenerate-payphone', error);
				const message = getApiErrorMessage(error, 'No se pudo generar el link de pago');
				this.$snotify.error(message, { timeout: 7000 });
			} finally {
				this.isPageLoading = false;
			}
		},
		formatCurrency(value) {
			return `$ ${parseFloat(value || 0).toFixed(2)}`;
		},
		formatEstatus(value) {
			if (value === 2) return 'En pago';
			if (value === 4) return 'Cancelado';
			return 'Pagado';
		},
		formatFacturado(value) {
			return value === 0 ? 'Sin facturar' : 'Facturado';
		},
		orderStatusClass(status) {
			if (status === 2) return 'aio-account-orders__badge--pending';
			if (status === 4) return 'aio-account-orders__badge--cancelled';
			return 'aio-account-orders__badge--paid';
		},
		invoiceStatusClass(statusInvoice) {
			return statusInvoice === 0
				? 'aio-account-orders__badge--invoice-pending'
				: 'aio-account-orders__badge--invoice-done';
		},
		async cancelOrder(item) {
			this.isPageLoading = true;
			const params = this.getRequestParams();

			try {
				const historyDetails = await api.get(
					`/api/order_history/delete_order_history/${item.id_shopping_car}/${localStorage.id_users}`,
					{ params }
				);
				this.applyOrderResponse(historyDetails && historyDetails.data && historyDetails.data.data);
				this.$snotify.success('Orden cancelada', { timeout: 2000 });

				if (this.tableData.length === 0 && this.pagination.page > 1) {
					await this.syncRouteQuery(this.pagination.page - 1, this.pagination.limit);
					await this.loadOrders(this.pagination.page - 1, { silent: true });
				}
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| 'No se pudo cancelar la orden';
				this.$snotify.error(message, { timeout: 3000 });
			} finally {
				this.isPageLoading = false;
			}
		},
		async reprocessInvoice(item) {
			this.isPageLoading = true;
			const params = this.getRequestParams();

			try {
				const historyDetails = await api.post(
					`/api/order_history/reprocess_invoice/${item.id_shopping_car}/${localStorage.id_users}`,
					null,
					{ params }
				);
				this.applyOrderResponse(historyDetails && historyDetails.data && historyDetails.data.data);
				this.$snotify.success('Factura reprocesada correctamente', { timeout: 2500 });
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| 'No se pudo reprocesar la factura';
				this.$snotify.error(message, { timeout: 3000 });
			} finally {
				this.isPageLoading = false;
			}
		},
	},
};
</script>
