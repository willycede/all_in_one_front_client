<template>
	<div class="aio-admin-page">
		<div class="aio-admin-page__header">
			<div></div>
			<v-btn color="primary" depressed @click="openCreateDialog">
				<v-icon left>add</v-icon>
				{{ $t('adminCoupons.newCoupon') }}
			</v-btn>
		</div>

		<div v-if="errorMessage" class="aio-admin-page__error">
			<v-icon color="error" class="mr-2">error_outline</v-icon>
			{{ errorMessage }}
		</div>

		<div v-if="isLoading" class="aio-admin-page__loading aio-admin-card">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
			<span>{{ $t('adminCoupons.loading') }}</span>
		</div>

		<div v-else-if="!coupons.length" class="aio-admin-page__empty aio-admin-card">
			<v-icon size="40" color="#A96DFA">local_offer</v-icon>
			<h3>{{ $t('adminCoupons.empty') }}</h3>
			<p>{{ $t('adminCoupons.emptyHint') }}</p>
		</div>

		<div v-else class="aio-admin-card pa-0 aio-admin-table-wrap">
			<table class="aio-admin-table">
				<thead>
					<tr>
						<th>{{ $t('adminCoupons.codeColumn') }}</th>
						<th>{{ $t('adminCoupons.descriptionColumn') }}</th>
						<th>{{ $t('adminCoupons.discountColumn') }}</th>
						<th>{{ $t('adminCoupons.minColumn') }}</th>
						<th>{{ $t('adminCoupons.usesColumn') }}</th>
						<th>{{ $t('adminCoupons.validityColumn') }}</th>
						<th>{{ $t('adminCoupons.statusColumn') }}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="coupon in coupons" :key="coupon.id_coupon">
						<td><strong>{{ coupon.code }}</strong></td>
						<td>{{ coupon.description || '—' }}</td>
						<td>{{ formatDiscount(coupon) }}</td>
						<td>${{ formatMoney(coupon.min_purchase) }}</td>
						<td>{{ formatUses(coupon) }}</td>
						<td>{{ formatValidity(coupon) }}</td>
						<td>
							<span
								class="aio-admin-badge"
								:class="coupon.status === 1 ? 'aio-admin-badge--success' : 'aio-admin-badge--muted'"
							>
								{{ coupon.status === 1 ? $t('adminCoupons.active') : $t('adminCoupons.inactive') }}
							</span>
						</td>
						<td class="aio-admin-coupons__actions">
							<v-btn icon small @click="openEditDialog(coupon)">
								<v-icon size="18">edit</v-icon>
							</v-btn>
							<v-btn
								icon
								small
								:color="coupon.status === 1 ? 'error' : 'success'"
								@click="toggleStatus(coupon)"
							>
								<v-icon size="18">{{ coupon.status === 1 ? 'block' : 'check_circle' }}</v-icon>
							</v-btn>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<v-dialog v-model="dialogOpen" max-width="560" persistent>
			<v-card>
				<v-card-title>{{ editingId ? $t('adminCoupons.editTitle') : $t('adminCoupons.createTitle') }}</v-card-title>
				<v-card-text>
					<v-text-field
						v-model="form.code"
						label="Código"
						:disabled="!!editingId"
						outlined
						dense
						class="mt-2"
					></v-text-field>
					<v-text-field
						v-model="form.description"
						label="Descripción"
						outlined
						dense
					></v-text-field>
					<v-select
						v-model="form.discount_type"
						:items="discountTypes"
						item-text="label"
						item-value="value"
						label="Tipo de descuento"
						outlined
						dense
					></v-select>
					<v-text-field
						v-model="form.discount_value"
						label="Valor"
						type="number"
						min="0"
						step="0.01"
						outlined
						dense
					></v-text-field>
					<v-text-field
						v-model="form.min_purchase"
						label="Compra mínima ($)"
						type="number"
						min="0"
						step="0.01"
						outlined
						dense
					></v-text-field>
					<v-text-field
						v-model="form.max_uses"
						label="Máximo de usos (vacío = ilimitado)"
						type="number"
						min="1"
						outlined
						dense
					></v-text-field>

					<div class="aio-admin-coupons__dates">
						<v-menu
							v-model="menuValidFrom"
							:close-on-content-click="false"
							transition="scale-transition"
							offset-y
							min-width="290px"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-text-field
									v-model="form.valid_from"
									label="Válido desde"
									prepend-inner-icon="event"
									readonly
									outlined
									dense
									clearable
									hide-details
									v-bind="attrs"
									v-on="on"
									@click:clear="form.valid_from = ''"
								></v-text-field>
							</template>
							<v-date-picker
								v-model="form.valid_from"
								@input="menuValidFrom = false"
							></v-date-picker>
						</v-menu>

						<v-menu
							v-model="menuValidUntil"
							:close-on-content-click="false"
							transition="scale-transition"
							offset-y
							min-width="290px"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-text-field
									v-model="form.valid_until"
									label="Válido hasta"
									prepend-inner-icon="event"
									readonly
									outlined
									dense
									clearable
									hide-details
									v-bind="attrs"
									v-on="on"
									@click:clear="form.valid_until = ''"
								></v-text-field>
							</template>
							<v-date-picker
								v-model="form.valid_until"
								:min="form.valid_from || undefined"
								@input="menuValidUntil = false"
							></v-date-picker>
						</v-menu>
					</div>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="dialogOpen = false">Cancelar</v-btn>
					<v-btn color="primary" depressed :loading="saving" @click="saveCoupon">
						Guardar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import api from 'Api';

const emptyForm = () => ({
	code: '',
	description: '',
	discount_type: 'percent',
	discount_value: '',
	min_purchase: '0',
	max_uses: '',
	valid_from: '',
	valid_until: '',
});

export default {
	data() {
		return {
			isLoading: true,
			saving: false,
			errorMessage: '',
			coupons: [],
			dialogOpen: false,
			editingId: null,
			menuValidFrom: false,
			menuValidUntil: false,
			form: emptyForm(),
			discountTypes: [
				{ label: 'Porcentaje (%)', value: 'percent' },
				{ label: 'Monto fijo ($)', value: 'fixed' },
			],
		};
	},
	mounted() {
		this.loadCoupons();
	},
	methods: {
		formatMoney(value) {
			return (parseFloat(value) || 0).toFixed(2);
		},
		formatDiscount(coupon) {
			if (coupon.discount_type === 'percent') {
				return `${coupon.discount_value}%`;
			}
			return `$${this.formatMoney(coupon.discount_value)}`;
		},
		formatUses(coupon) {
			const used = parseInt(coupon.used_count, 10) || 0;
			if (coupon.max_uses === null || coupon.max_uses === undefined) {
				return `${used} / ∞`;
			}
			return `${used} / ${coupon.max_uses}`;
		},
		formatDateLabel(value) {
			if (!value) return '';
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return '';
			return date.toLocaleDateString('es-EC', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			});
		},
		formatValidity(coupon) {
			const from = this.formatDateLabel(coupon.valid_from);
			const until = this.formatDateLabel(coupon.valid_until);
			if (!from && !until) return 'Sin límite';
			if (from && until) return `${from} – ${until}`;
			if (from) return `Desde ${from}`;
			return `Hasta ${until}`;
		},
		toDateField(value) {
			if (!value) return '';
			return String(value).substr(0, 10);
		},
		toApiDate(value, endOfDay) {
			if (!value) return null;
			const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
			return `${value}${suffix}`;
		},
		formatLoadError(message) {
			if (!message) {
				return 'No se pudieron cargar los cupones. Verifica sesión de administrador.';
			}
			if (message.indexOf("doesn't exist") !== -1 || message.indexOf('no existe') !== -1) {
				return 'La tabla de cupones no existe en la base de datos. En la carpeta de la API ejecuta: npm run migrate:coupons';
			}
			return message;
		},
		async loadCoupons() {
			this.isLoading = true;
			this.errorMessage = '';
			try {
				const response = await api.get('/api/coupons/admin/list');
				this.coupons = response?.data?.data?.items || [];
			} catch (error) {
				this.coupons = [];
				const rawMessage = error?.response?.data?.error?.message;
				this.errorMessage = this.formatLoadError(rawMessage);
			} finally {
				this.isLoading = false;
			}
		},
		openCreateDialog() {
			this.editingId = null;
			this.form = emptyForm();
			this.dialogOpen = true;
		},
		openEditDialog(coupon) {
			this.editingId = coupon.id_coupon;
			this.form = {
				code: coupon.code,
				description: coupon.description || '',
				discount_type: coupon.discount_type,
				discount_value: String(coupon.discount_value),
				min_purchase: String(coupon.min_purchase || 0),
				max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
				valid_from: this.toDateField(coupon.valid_from),
				valid_until: this.toDateField(coupon.valid_until),
			};
			this.dialogOpen = true;
		},
		buildPayload() {
			return {
				code: this.form.code,
				description: this.form.description,
				discount_type: this.form.discount_type,
				discount_value: this.form.discount_value,
				min_purchase: this.form.min_purchase || 0,
				max_uses: this.form.max_uses || null,
				valid_from: this.toApiDate(this.form.valid_from, false),
				valid_until: this.toApiDate(this.form.valid_until, true),
			};
		},
		async saveCoupon() {
			this.saving = true;
			try {
				const payload = this.buildPayload();
				if (this.editingId) {
					await api.put(`/api/coupons/admin/${this.editingId}`, payload);
					this.$snotify.success('Cupón actualizado');
				} else {
					await api.post('/api/coupons/admin', payload);
					this.$snotify.success('Cupón creado');
				}
				this.dialogOpen = false;
				await this.loadCoupons();
			} catch (error) {
				const message = error?.response?.data?.error?.message || 'No se pudo guardar el cupón';
				this.$snotify.error(message);
			} finally {
				this.saving = false;
			}
		},
		async toggleStatus(coupon) {
			const nextStatus = coupon.status === 1 ? 2 : 1;
			try {
				await api.put(`/api/coupons/admin/${coupon.id_coupon}`, { status: nextStatus });
				this.$snotify.success(nextStatus === 1 ? 'Cupón activado' : 'Cupón desactivado');
				await this.loadCoupons();
			} catch (error) {
				const message = error?.response?.data?.error?.message || 'No se pudo cambiar el estado';
				this.$snotify.error(message);
			}
		},
	},
};
</script>

<style scoped>
.aio-admin-coupons__dates {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.75rem;
	margin-top: 0.5rem;
}

@media (max-width: 600px) {
	.aio-admin-coupons__dates {
		grid-template-columns: 1fr;
	}
}
</style>
