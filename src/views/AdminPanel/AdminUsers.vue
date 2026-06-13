<template>
	<div class="aio-admin-page">
		<div class="aio-admin-page__header">
			<div>
				<h2 class="aio-admin-page__title">{{ $t('adminUsers.title') }}</h2>
				<p class="aio-admin-page__subtitle">{{ $t('adminUsers.subtitle') }}</p>
			</div>
		</div>

		<div class="aio-admin-card pa-4 mb-4">
			<div class="aio-admin-invoices__toolbar">
				<v-text-field
					v-model="search"
					:label="$t('adminUsers.searchPlaceholder')"
					outlined
					dense
					hide-details
					clearable
					class="aio-admin-invoices__search"
					@keyup.enter="reload"
				></v-text-field>

				<v-btn-toggle v-model="twoFactorFilter" mandatory dense class="aio-admin-invoices__filters" @change="reload">
					<v-btn value="all" small>{{ $t('adminUsers.filterAll') }}</v-btn>
					<v-btn value="enabled" small>{{ $t('adminUsers.filterEnabled') }}</v-btn>
					<v-btn value="pending" small>{{ $t('adminUsers.filterPending') }}</v-btn>
					<v-btn value="disabled" small>{{ $t('adminUsers.filterDisabled') }}</v-btn>
				</v-btn-toggle>

				<v-btn color="primary" depressed @click="reload">
					<v-icon left>search</v-icon>
					{{ $t('adminUsers.searchButton') }}
				</v-btn>
			</div>
		</div>

		<div v-if="errorMessage" class="aio-admin-page__error mb-4">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ errorMessage }}
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>{{ $t('adminUsers.loading') }}</span>
		</div>

		<div v-else-if="!users.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="#A96DFA">people</v-icon>
			<h3>{{ $t('adminUsers.empty') }}</h3>
			<p>{{ $t('adminUsers.emptyHint') }}</p>
		</div>

		<div v-else class="aio-admin-card pa-0 aio-admin-table-wrap">
			<table class="aio-admin-table">
				<thead>
					<tr>
						<th>{{ $t('adminUsers.idColumn') }}</th>
						<th>{{ $t('adminUsers.userColumn') }}</th>
						<th>{{ $t('adminUsers.statusColumn') }}</th>
						<th>{{ $t('adminUsers.twoFactorColumn') }}</th>
						<th>{{ $t('adminUsers.createdColumn') }}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in users" :key="item.id">
						<td><strong>#{{ item.id }}</strong></td>
						<td>
							<span class="aio-admin-invoices__name">{{ item.fullName || '—' }}</span>
							<span class="aio-admin-invoices__email">{{ item.email }}</span>
						</td>
						<td>
							<span
								class="aio-admin-badge"
								:class="item.isActive ? 'aio-admin-badge--success' : 'aio-admin-badge--warning'"
							>
								{{ item.isActive ? $t('adminUsers.activeStatus') : $t('adminUsers.inactiveStatus') }}
							</span>
						</td>
						<td>
							<span
								class="aio-admin-badge"
								:class="twoFactorBadgeClass(item)"
							>
								{{ twoFactorLabel(item) }}
							</span>
						</td>
						<td>{{ formatDate(item.createdAt) }}</td>
						<td class="aio-admin-invoices__actions">
							<v-btn
								v-if="item.twoFactorEnabled || item.twoFactorPending"
								small
								depressed
								color="error"
								class="mr-1"
								:loading="disablingId === item.id"
								@click="openDisableDialog(item)"
							>
								<v-icon left small>no_encryption</v-icon>
								{{ $t('adminUsers.disable2fa') }}
							</v-btn>
							<v-btn
								small
								depressed
								:color="item.isActive ? 'warning' : 'success'"
								:loading="togglingId === item.id"
								@click="toggleStatus(item)"
							>
								<v-icon left small>{{ item.isActive ? 'person_off' : 'person' }}</v-icon>
								{{ item.isActive ? $t('adminUsers.deactivateUser') : $t('adminUsers.activateUser') }}
							</v-btn>
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

		<v-dialog v-model="disableDialog" max-width="480">
			<v-card>
				<v-card-title>{{ $t('adminUsers.disable2faTitle') }}</v-card-title>
				<v-card-text>
					<p class="mb-3">{{ $t('adminUsers.disable2faHint', { email: selectedUser && selectedUser.email }) }}</p>
					<v-textarea
						v-model="disableReason"
						:label="$t('adminUsers.disable2faReason')"
						outlined
						dense
						hide-details
						rows="3"
					></v-textarea>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="disableDialog = false">{{ $t('common.cancel') }}</v-btn>
					<v-btn color="error" depressed :loading="disablingId !== null" @click="confirmDisable2fa">
						{{ $t('adminUsers.disable2faConfirm') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
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
			twoFactorFilter: 'all',
			users: [],
			pagination: {
				page: 1,
				limit: 20,
				totalPages: 1,
				hasPrevPage: false,
				hasNextPage: false,
			},
			disablingId: null,
			togglingId: null,
			disableDialog: false,
			disableReason: '',
			selectedUser: null,
		};
	},
	mounted() {
		this.reload();
	},
	methods: {
		async reload() {
			this.isLoading = true;
			this.errorMessage = '';
			try {
				const res = await api.get('/api/admin/users', {
					params: {
						page: this.pagination.page,
						limit: this.pagination.limit,
						search: this.search || undefined,
						twoFactor: this.twoFactorFilter,
					},
				});
				const data = res && res.data && res.data.data;
				this.users = (data && data.items) || [];
				this.pagination = (data && data.pagination) || this.pagination;
			} catch (error) {
				this.errorMessage = getApiErrorMessage(error, this.$t('adminUsers.loadError'));
			} finally {
				this.isLoading = false;
			}
		},
		goToPage(page) {
			this.pagination.page = page;
			this.reload();
		},
		twoFactorLabel(item) {
			if (item.twoFactorEnabled) return this.$t('adminUsers.twoFactorEnabled');
			if (item.twoFactorPending) return this.$t('adminUsers.twoFactorPending');
			return this.$t('adminUsers.twoFactorOff');
		},
		twoFactorBadgeClass(item) {
			if (item.twoFactorEnabled) return 'aio-admin-badge--success';
			if (item.twoFactorPending) return 'aio-admin-badge--warning';
			return 'aio-admin-badge--muted';
		},
		formatDate(value) {
			if (!value) return '—';
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return '—';
			return date.toLocaleDateString();
		},
		openDisableDialog(user) {
			this.selectedUser = user;
			this.disableReason = '';
			this.disableDialog = true;
		},
		async confirmDisable2fa() {
			if (!this.selectedUser) return;
			this.disablingId = this.selectedUser.id;
			try {
				await api.post(`/api/admin/users/${this.selectedUser.id}/disable-2fa`, {
					reason: this.disableReason || undefined,
				});
				this.$snotify.success(this.$t('adminUsers.disable2faSuccess'));
				this.disableDialog = false;
				await this.reload();
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('adminUsers.disable2faError')));
			} finally {
				this.disablingId = null;
			}
		},
		async toggleStatus(user) {
			const nextStatus = user.isActive ? 2 : 1;
			const confirmKey = user.isActive ? 'adminUsers.deactivateConfirm' : 'adminUsers.activateConfirm';
			const confirmed = window.confirm(this.$t(confirmKey, { email: user.email }));
			if (!confirmed) return;

			this.togglingId = user.id;
			try {
				await api.patch(`/api/admin/users/${user.id}/status`, { status: nextStatus });
				this.$snotify.success(this.$t(user.isActive ? 'adminUsers.deactivateSuccess' : 'adminUsers.activateSuccess'));
				await this.reload();
			} catch (error) {
				this.$snotify.error(getApiErrorMessage(error, this.$t('adminUsers.statusError')));
			} finally {
				this.togglingId = null;
			}
		},
	},
};
</script>
