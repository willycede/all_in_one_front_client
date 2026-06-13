<template>
	<div class="aio-admin-page">
		<AdminPageHeader />

		<div class="aio-admin-card pa-4 mb-4">
			<div class="aio-admin-invoices__toolbar">
				<v-text-field
					v-model="search"
					:label="$t('adminAuditLogs.searchPlaceholder')"
					outlined
					dense
					hide-details
					clearable
					class="aio-admin-invoices__search"
					@keyup.enter="reload"
				></v-text-field>

				<v-select
					v-model="eventType"
					:items="eventTypeOptions"
					:label="$t('adminAuditLogs.eventTypeFilter')"
					outlined
					dense
					hide-details
					clearable
					class="aio-admin-audit__event-filter"
					@change="reload"
				></v-select>

				<v-btn color="primary" depressed @click="reload">
					<v-icon left>search</v-icon>
					{{ $t('adminAuditLogs.searchButton') }}
				</v-btn>
			</div>
		</div>

		<div v-if="errorMessage" class="aio-admin-page__error mb-4">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ errorMessage }}
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>{{ $t('adminAuditLogs.loading') }}</span>
		</div>

		<div v-else-if="!logs.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="#A96DFA">history</v-icon>
			<h3>{{ $t('adminAuditLogs.empty') }}</h3>
			<p>{{ $t('adminAuditLogs.emptyHint') }}</p>
		</div>

		<div v-else class="aio-admin-card pa-0 aio-admin-table-wrap">
			<table class="aio-admin-table aio-admin-audit__table">
				<thead>
					<tr>
						<th>{{ $t('adminAuditLogs.dateColumn') }}</th>
						<th>{{ $t('adminAuditLogs.eventColumn') }}</th>
						<th>{{ $t('adminAuditLogs.summaryColumn') }}</th>
						<th>{{ $t('adminAuditLogs.actorColumn') }}</th>
						<th>{{ $t('adminAuditLogs.targetColumn') }}</th>
						<th>{{ $t('adminAuditLogs.ipColumn') }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in logs" :key="item.id">
						<td class="aio-admin-audit__date">{{ formatDateTime(item.createdAt) }}</td>
						<td>
							<span class="aio-admin-audit__event">{{ formatEventType(item.eventType) }}</span>
						</td>
						<td>
							<span class="aio-admin-audit__summary">{{ item.summary }}</span>
							<span v-if="item.metadata && item.metadata.reason" class="aio-admin-audit__meta">
								{{ $t('adminAuditLogs.reasonLabel') }}: {{ item.metadata.reason }}
							</span>
						</td>
						<td>{{ item.actorEmail || '—' }}</td>
						<td>{{ item.targetEmail || '—' }}</td>
						<td>{{ item.ipAddress || '—' }}</td>
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
	</div>
</template>

<script>
import api from 'Api';
import { getApiErrorMessage } from 'Helpers/apiError';

export default {
	data() {
		return {
			isLoading: true,
			errorMessage: '',
			search: '',
			eventType: '',
			eventTypes: [],
			logs: [],
			pagination: {
				page: 1,
				limit: 25,
				totalPages: 1,
				hasPrevPage: false,
				hasNextPage: false,
			},
		};
	},
	computed: {
		eventTypeOptions() {
			return [
				{ text: this.$t('adminAuditLogs.allEvents'), value: '' },
				...this.eventTypes.map((type) => ({
					text: this.formatEventType(type),
					value: type,
				})),
			];
		},
	},
	async mounted() {
		await this.loadEventTypes();
		await this.reload();
	},
	methods: {
		async loadEventTypes() {
			try {
				const res = await api.get('/api/admin/audit-logs/event-types');
				const data = res && res.data && res.data.data;
				this.eventTypes = (data && data.eventTypes) || [];
			} catch (error) {
				this.eventTypes = [];
			}
		},
		async reload() {
			this.isLoading = true;
			this.errorMessage = '';
			try {
				const res = await api.get('/api/admin/audit-logs', {
					params: {
						page: this.pagination.page,
						limit: this.pagination.limit,
						search: this.search || undefined,
						eventType: this.eventType || undefined,
					},
				});
				const data = res && res.data && res.data.data;
				this.logs = (data && data.items) || [];
				this.pagination = (data && data.pagination) || this.pagination;
			} catch (error) {
				this.errorMessage = getApiErrorMessage(error, this.$t('adminAuditLogs.loadError'));
			} finally {
				this.isLoading = false;
			}
		},
		goToPage(page) {
			this.pagination.page = page;
			this.reload();
		},
		formatDateTime(value) {
			if (!value) return '—';
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return '—';
			return date.toLocaleString();
		},
		formatEventType(type) {
			const key = `adminAuditLogs.events.${type}`;
			const translated = this.$t(key);
			return translated === key ? type : translated;
		},
	},
};
</script>

<style scoped>
.aio-admin-audit__event-filter {
	min-width: 220px;
	max-width: 280px;
}
</style>
