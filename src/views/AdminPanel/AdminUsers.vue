<template>
	<div class="aio-admin-page aio-admin-users">
		<AdminPageHeader />

		<div class="aio-admin-card aio-admin-users__toolbar-card">
			<div class="aio-admin-users__toolbar">
				<v-text-field
					v-model="search"
					:placeholder="$t('adminUsers.searchPlaceholder')"
					outlined
					dense
					hide-details
					clearable
					prepend-inner-icon="search"
					class="aio-admin-users__search"
					@keyup.enter="reload"
				></v-text-field>

				<div
					class="aio-admin-users__filters"
					role="group"
					:aria-label="$t('adminUsers.twoFactorColumn')"
				>
					<button
						v-for="filter in filterOptions"
						:key="filter.value"
						type="button"
						class="aio-admin-users__filter-btn"
						:class="{ 'aio-admin-users__filter-btn--active': twoFactorFilter === filter.value }"
						@click="setFilter(filter.value)"
					>
						{{ filter.label }}
					</button>
				</div>

				<v-btn
					depressed
					class="aio-admin-users__search-btn"
					@click="reload"
				>
					<v-icon left small>search</v-icon>
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

		<div v-else class="aio-admin-card pa-0 aio-admin-table-wrap aio-admin-users__table-card">
			<table class="aio-admin-table aio-admin-users__table">
				<thead>
					<tr>
						<th>{{ $t('adminUsers.idColumn') }}</th>
						<th>{{ $t('adminUsers.userColumn') }}</th>
						<th>{{ $t('adminUsers.statusColumn') }}</th>
						<th>{{ $t('adminUsers.twoFactorColumn') }}</th>
						<th>{{ $t('adminUsers.createdColumn') }}</th>
						<th class="aio-admin-users__action-col">{{ $t('adminUsers.actionColumn') }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in users" :key="item.id">
						<td class="aio-admin-users__id">#{{ item.id }}</td>
						<td>
							<div class="aio-admin-users__user">
								<span class="aio-admin-users__avatar" aria-hidden="true">
									{{ userInitials(item) }}
								</span>
								<span class="aio-admin-users__user-copy">
									<span class="aio-admin-users__name">{{ item.fullName || '—' }}</span>
									<span class="aio-admin-users__email">{{ item.email }}</span>
								</span>
							</div>
						</td>
						<td>
							<span
								class="aio-admin-users__badge"
								:class="item.isActive ? 'aio-admin-users__badge--success' : 'aio-admin-users__badge--muted'"
							>
								<span class="aio-admin-users__badge-dot" aria-hidden="true"></span>
								{{ item.isActive ? $t('adminUsers.activeStatus') : $t('adminUsers.inactiveStatus') }}
							</span>
						</td>
						<td>
							<span
								class="aio-admin-users__badge"
								:class="twoFactorBadgeClass(item)"
							>
								<span class="aio-admin-users__badge-dot" aria-hidden="true"></span>
								{{ twoFactorLabel(item) }}
							</span>
						</td>
						<td class="aio-admin-users__date">{{ formatDate(item.createdAt) }}</td>
						<td class="aio-admin-users__actions">
							<v-menu
								v-if="item.twoFactorEnabled || item.twoFactorPending"
								offset-y
								left
							>
								<template v-slot:activator="{ on, attrs }">
									<v-btn
										icon
										small
										class="aio-admin-users__menu-btn"
										v-bind="attrs"
										v-on="on"
									>
										<v-icon small>more_vert</v-icon>
									</v-btn>
								</template>
								<v-list dense>
									<v-list-item @click="openDisableDialog(item)">
										<v-list-item-icon class="mr-2">
											<v-icon small color="error">no_encryption</v-icon>
										</v-list-item-icon>
										<v-list-item-title>{{ $t('adminUsers.disable2fa') }}</v-list-item-title>
									</v-list-item>
								</v-list>
							</v-menu>
							<v-btn
								outlined
								small
								color="primary"
								class="aio-admin-users__action-btn"
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

			<div v-if="pagination.totalPages > 1" class="aio-admin-users__pagination">
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
	computed: {
		filterOptions() {
			return [
				{ value: 'all', label: this.$t('adminUsers.filterAll') },
				{ value: 'enabled', label: this.$t('adminUsers.filterEnabled') },
				{ value: 'pending', label: this.$t('adminUsers.filterPending') },
				{ value: 'disabled', label: this.$t('adminUsers.filterDisabled') },
			];
		},
	},
	mounted() {
		this.reload();
	},
	methods: {
		setFilter(value) {
			if (this.twoFactorFilter === value) return;
			this.twoFactorFilter = value;
			this.pagination.page = 1;
			this.reload();
		},
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
		userInitials(item) {
			const source = (item.fullName || item.email || '').trim();
			if (!source) return '?';
			const parts = source.split(/\s+/).filter(Boolean);
			if (parts.length >= 2) {
				return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
			}
			return source.slice(0, 2).toUpperCase();
		},
		twoFactorLabel(item) {
			if (item.twoFactorEnabled) return this.$t('adminUsers.twoFactorEnabled');
			if (item.twoFactorPending) return this.$t('adminUsers.twoFactorPending');
			return this.$t('adminUsers.twoFactorOff');
		},
		twoFactorBadgeClass(item) {
			if (item.twoFactorEnabled) return 'aio-admin-users__badge--success';
			if (item.twoFactorPending) return 'aio-admin-users__badge--warning';
			return 'aio-admin-users__badge--muted';
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
