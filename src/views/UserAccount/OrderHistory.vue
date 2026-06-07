<template>
	<div class="aio-account-panel aio-account-orders order-history-wrap">
		<div v-if="isLoading" class="aio-account-panel__loading">
			<v-progress-circular indeterminate color="#A96DFA" size="36" width="3"></v-progress-circular>
			<p>{{ $t('orders.loading') }}</p>
		</div>

		<template v-else>
			<div class="aio-account-panel__header">
				<div>
					<h2 class="aio-account-panel__title">{{ $t('orders.title') }}</h2>
					<p class="aio-account-panel__subtitle">
						{{ pagination.total === 1
							? $t('orders.subtitleOne')
							: $t('orders.subtitle', { count: pagination.total }) }}
					</p>
				</div>
			</div>

			<div class="aio-account-panel__notice">
				<v-icon size="20">info</v-icon>
				<p>{{ $t('orders.invoiceNotice') }}</p>
			</div>

			<div v-if="!tableData.length" class="aio-account-orders__empty">
				<div class="aio-account-orders__empty-icon">
					<v-icon size="40">receipt_long</v-icon>
				</div>
				<h3>{{ $t('orders.empty') }}</h3>
				<p>{{ $t('orders.emptyHint') }}</p>
				<router-link to="/products" class="aio-account-panel__edit-btn">
					<v-icon size="18">storefront</v-icon>
					{{ $t('orders.goToShop') }}
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
								<span class="aio-account-orders__order-id">{{ $t('orders.orderId', { id: item.id_shopping_car }) }}</span>
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

						<div
							v-if="item.status === 3 && (item.invoice_number || item.invoice_access_key)"
							class="aio-account-orders__invoice-info"
						>
							<p v-if="item.invoice_number" class="aio-account-orders__invoice-line">
								<span class="aio-account-orders__invoice-label">{{ $t('orders.invoiceNumber') }}:</span>
								{{ item.invoice_number }}
							</p>
							<p v-if="item.invoice_access_key" class="aio-account-orders__invoice-line">
								<span class="aio-account-orders__invoice-label">{{ $t('orders.invoiceAccessKey') }}:</span>
								<code class="aio-account-orders__invoice-key">{{ item.invoice_access_key }}</code>
							</p>
						</div>

						<div v-if="hasActions(item)" class="aio-account-orders__actions">
							<button
								v-if="item.status == 2"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--primary"
								:title="$t('orders.payLinkTitle')"
								@click="openPayment(item)"
							>
								<v-icon size="18">payment</v-icon>
								{{ $t('orders.pay') }}
							</button>
							<button
								v-if="item.status == 2"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--danger"
								:title="$t('orders.cancelTitle')"
								@click="cancelOrder(item)"
							>
								<v-icon size="18">cancel</v-icon>
								{{ $t('orders.cancel') }}
							</button>
							<button
								v-if="item.status === 3"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--secondary"
								:title="$t('orders.repeatTitle')"
								:disabled="isPageLoading"
								@click="repeatOrder(item)"
							>
								<v-icon size="18">replay</v-icon>
								{{ $t('orders.repeat') }}
							</button>
							<button
								v-if="item.status === 3 && isInvoicePending(item.status_invoice)"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--secondary"
								:title="$t('orders.reprocessTitle')"
								@click="reprocessInvoice(item)"
							>
								<v-icon size="18">published_with_changes</v-icon>
								{{ $t('orders.reprocess') }}
							</button>
							<button
								v-if="item.status === 3 && !isInvoicePending(item.status_invoice) && item.has_invoice_pdf"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--secondary"
								:disabled="isPageLoading"
								@click="downloadInvoice(item, 'pdf')"
							>
								<v-icon size="18">picture_as_pdf</v-icon>
								{{ $t('orders.downloadPdf') }}
							</button>
							<button
								v-if="item.status === 3 && !isInvoicePending(item.status_invoice) && item.has_invoice_xml"
								type="button"
								class="aio-account-orders__action aio-account-orders__action--secondary"
								:disabled="isPageLoading"
								@click="downloadInvoice(item, 'xml')"
							>
								<v-icon size="18">code</v-icon>
								{{ $t('orders.downloadXml') }}
							</button>
						</div>
					</article>
				</div>

				<div class="aio-account-orders__pagination-wrap">
					<div class="aio-account-orders__pagination-toolbar">
						<p class="aio-account-orders__pagination-info">
							{{ $t('orders.showing', { start: rangeStart, end: rangeEnd, total: pagination.total }) }}
						</p>

						<div class="aio-account-orders__page-size" role="group" :aria-label="$t('orders.perPage')">
							<span class="aio-account-orders__page-size-label">{{ $t('orders.perPage') }}</span>
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
						:aria-label="$t('orders.paginationLabel')"
					>
						<button
							type="button"
							class="aio-account-orders__page-btn aio-account-orders__page-btn--nav"
							:disabled="!pagination.hasPrevPage || isPageLoading"
							:aria-label="$t('orders.pagePrev')"
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
							:aria-label="$t('orders.pageNext')"
							@click="goToPage(pagination.page + 1)"
						>
							<v-icon size="20">chevron_right</v-icon>
						</button>
					</nav>
				</div>
			</template>
		</template>

		<emb-delete-confirmation
			ref="cancelOrderDialog"
			icon="cancel"
			:title="$t('orders.cancelTitle')"
			:message="pendingCancelMessage"
			:confirm-label="$t('orders.cancelConfirmYes')"
			:cancel-label="$t('common.cancel')"
			@onConfirm="executeCancelOrder"
		></emb-delete-confirmation>
	</div>
</template>

<script>
import api from 'Api';
import moment from 'moment';
import AppConfig from 'Constants/AppConfig';
import { isInvoicePending as isOrderInvoicePending } from 'Helpers/invoiceStatus';
import { getApiErrorMessage, logApiError } from 'Helpers/apiError';
import { downloadUserInvoice } from 'Helpers/downloadInvoiceFile';

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
			pendingCancelItem: null,
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
		pendingCancelMessage() {
			if (!this.pendingCancelItem) return '';
			return this.$t('orders.cancelConfirm', { id: this.pendingCancelItem.id_shopping_car });
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
		if (localStorage.id_users) {
			this.$store.dispatch('syncActiveCart').catch(() => {
				this.$store.dispatch('addSetToCart', []);
			});
		}

		const page = this.parsePage(this.$route.query.page);
		const limit = this.parseLimit(this.$route.query.limit);
		this.pagination.limit = limit;
		await this.syncRouteQuery(page, limit);
		await this.loadOrders(page);
	},
	methods: {
		isInvoicePending: isOrderInvoicePending,
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
			return item.status == 2 || item.status === 3;
		},
		async repeatOrder(item) {
			this.isPageLoading = true;

			try {
				const response = await api.post(
					`/api/order_history/repeat_order/${item.id_shopping_car}/${localStorage.id_users}`
				);

				const result = response && response.data && response.data.data;
				await this.$store.dispatch('syncActiveCart');

				let message = this.$t('orders.repeatSuccess');
				if (result && result.itemsAdded) {
					message = this.$t('orders.repeatSuccessCount', { count: result.itemsAdded });
				}
				if (result && result.skipped && result.skipped.length) {
					message += `. ${this.$t('orders.repeatSkipped', { count: result.skipped.length })}`;
				}

				this.$snotify.success(message, { timeout: 3500 });
				this.$router.push('/cart');
			} catch (error) {
				logApiError('order-history:repeat-order', error);
				this.$snotify.error(getApiErrorMessage(error, this.$t('orders.repeatError')), { timeout: 4000 });
			} finally {
				this.isPageLoading = false;
			}
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
					const payUrl = AppConfig.buildOrderPaymentLinkUrl(item.id_shopping_car);
					item.url_payphone = response.data.url;
					await this.$store.dispatch('syncActiveCart');
					window.open(payUrl, '_blank');
					this.$snotify.success(this.$t('orders.payLinkSuccess'), { timeout: 3500 });
					return;
				}

				const message = getApiErrorMessage(
					{ response: { data: response.data } },
					this.$t('orders.payLinkError')
				);
				this.$snotify.error(message, { timeout: 7000 });
			} catch (error) {
				logApiError('order-history:regenerate-payphone', error);
				this.$snotify.error(getApiErrorMessage(error, this.$t('orders.payLinkError')), { timeout: 7000 });
			} finally {
				this.isPageLoading = false;
			}
		},
		formatCurrency(value) {
			return `$ ${parseFloat(value || 0).toFixed(2)}`;
		},
		formatEstatus(value) {
			if (value === 2) return this.$t('orders.statusPending');
			if (value === 4) return this.$t('orders.statusCancelled');
			return this.$t('orders.statusPaid');
		},
		formatFacturado(value) {
			return isOrderInvoicePending(value) ? this.$t('orders.invoicePending') : this.$t('orders.invoiceDone');
		},
		orderStatusClass(status) {
			if (status === 2) return 'aio-account-orders__badge--pending';
			if (status === 4) return 'aio-account-orders__badge--cancelled';
			return 'aio-account-orders__badge--paid';
		},
		invoiceStatusClass(statusInvoice) {
			return isOrderInvoicePending(statusInvoice)
				? 'aio-account-orders__badge--invoice-pending'
				: 'aio-account-orders__badge--invoice-done';
		},
		cancelOrder(item) {
			this.pendingCancelItem = item;
			this.$refs.cancelOrderDialog.openDialog();
		},
		async executeCancelOrder() {
			this.$refs.cancelOrderDialog.close();
			const item = this.pendingCancelItem;
			this.pendingCancelItem = null;
			if (!item) return;

			this.isPageLoading = true;
			const params = this.getRequestParams();

			try {
				const historyDetails = await api.get(
					`/api/order_history/delete_order_history/${item.id_shopping_car}/${localStorage.id_users}`,
					{ params }
				);
				this.applyOrderResponse(historyDetails && historyDetails.data && historyDetails.data.data);
				await this.$store.dispatch('syncActiveCart');
				this.$snotify.success(this.$t('orders.cancelled'), { timeout: 3500 });

				if (this.tableData.length === 0 && this.pagination.page > 1) {
					await this.syncRouteQuery(this.pagination.page - 1, this.pagination.limit);
					await this.loadOrders(this.pagination.page - 1, { silent: true });
				}
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| this.$t('orders.cancelError');
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
				this.$snotify.success(this.$t('orders.reprocessSuccess'), { timeout: 2500 });
			} catch (error) {
				const message = (error.response && error.response.data && error.response.data.error && error.response.data.error.message)
					|| this.$t('orders.reprocessError');
				this.$snotify.error(message, { timeout: 3000 });
			} finally {
				this.isPageLoading = false;
			}
		},
		async downloadInvoice(item, type) {
			this.isPageLoading = true;
			try {
				await downloadUserInvoice(item.id_shopping_car, localStorage.id_users, type);
			} catch (error) {
				this.$snotify.error(this.$t('orders.downloadError'), { timeout: 4000 });
			} finally {
				this.isPageLoading = false;
			}
		},
	},
};
</script>

<style scoped>
.aio-account-orders__invoice-info {
	margin-top: 0.75rem;
	padding: 0.75rem 0.875rem;
	border-radius: 10px;
	background: rgba(169, 109, 250, 0.06);
	border: 1px solid rgba(169, 109, 250, 0.12);
}

.aio-account-orders__invoice-line {
	margin: 0;
	font-size: 0.8125rem;
	color: #374151;
	line-height: 1.5;
}

.aio-account-orders__invoice-line + .aio-account-orders__invoice-line {
	margin-top: 0.35rem;
}

.aio-account-orders__invoice-label {
	font-weight: 600;
	color: #111827;
}

.aio-account-orders__invoice-key {
	display: inline-block;
	margin-top: 0.15rem;
	padding: 0.15rem 0.35rem;
	border-radius: 4px;
	background: rgba(17, 24, 39, 0.06);
	font-size: 0.75rem;
	word-break: break-all;
}
</style>
