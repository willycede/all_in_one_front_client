<template>
	<div class="aio-cart-coupon">
		<label class="aio-cart-coupon__label" for="cart-coupon-input">Código promocional</label>
		<div class="aio-cart-coupon__row">
			<input
						id="cart-coupon-input"
				v-model="localCode"
				type="text"
				class="aio-cart-coupon__input"
				placeholder="Ej. ALLINONE10"
				:disabled="loading || !!appliedCode"
				@keyup.enter="applyCoupon"
			>
			<button
				v-if="!appliedCode"
				type="button"
				class="aio-cart-coupon__btn"
				:disabled="loading || !localCode.trim()"
				@click="applyCoupon"
			>
				{{ loading ? '...' : 'Aplicar' }}
			</button>
			<button
				v-else
				type="button"
				class="aio-cart-coupon__btn aio-cart-coupon__btn--ghost"
				:disabled="loading"
				@click="removeCoupon"
			>
				Quitar
			</button>
		</div>
		<p v-if="appliedCode" class="aio-cart-coupon__applied">
			<v-icon size="14" color="#2e7d32">check_circle</v-icon>
			<strong>{{ appliedCode }}</strong>
			<span v-if="description"> — {{ description }}</span>
		</p>
		<p v-if="errorMessage" class="aio-cart-coupon__error">{{ errorMessage }}</p>
	</div>
</template>

<script>
import api from 'Api';

export default {
	props: {
		cartId: {
			type: [Number, String],
			required: true,
		},
		appliedCode: {
			type: String,
			default: '',
		},
		description: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			localCode: this.appliedCode || '',
			loading: false,
			errorMessage: '',
		};
	},
	watch: {
		appliedCode(value) {
			this.localCode = value || '';
		},
	},
	methods: {
		async applyCoupon() {
			const code = this.localCode.trim();
			if (!code || !this.cartId) return;

			this.loading = true;
			this.errorMessage = '';

			try {
				const response = await api.post('/api/coupons/apply', {
					code,
					id_shopping_car: this.cartId,
				});
				const payload = response?.data?.data;
				this.$emit('applied', payload);
				this.$snotify.success('Cupón aplicado');
			} catch (error) {
				this.errorMessage = error?.response?.data?.error?.message || 'No se pudo aplicar el cupón';
			} finally {
				this.loading = false;
			}
		},
		async removeCoupon() {
			if (!this.cartId) return;

			this.loading = true;
			this.errorMessage = '';

			try {
				await api.delete(`/api/coupons/remove/${this.cartId}`);
				this.localCode = '';
				this.$emit('removed');
				this.$snotify.info('Cupón eliminado');
			} catch (error) {
				this.errorMessage = error?.response?.data?.error?.message || 'No se pudo quitar el cupón';
			} finally {
				this.loading = false;
			}
		},
	},
};
</script>
