<template>
	<div class="aio-admin-modifiers">
		<header class="aio-admin-product-form__section-head">
			<span class="aio-admin-product-form__section-icon">
				<v-icon size="20">palette</v-icon>
			</span>
			<div>
				<h3>{{ $t('adminProducts.sectionModifiersTitle') }}</h3>
				<p>{{ $t('adminProducts.sectionModifiersHint') }}</p>
			</div>
		</header>

		<div v-if="modifiers.length === 0" class="aio-admin-modifiers__empty">
			{{ $t('adminProducts.noModifiers') }}
		</div>

		<div
			v-for="(modifier, index) in modifiers"
			:key="index"
			class="aio-admin-modifiers__row"
		>
			<v-text-field
				v-model="modifier.name"
				:label="$t('adminProducts.modifierNameLabel')"
				:placeholder="$t('adminProducts.modifierNamePlaceholder')"
				outlined
				dense
				hide-details
				@input="emitChange"
			></v-text-field>

			<v-text-field
				v-model="modifier.price_delta"
				:label="$t('adminProducts.modifierPriceLabel')"
				type="number"
				min="0"
				step="0.01"
				prefix="+$"
				outlined
				dense
				hide-details
				@input="emitChange"
			></v-text-field>

			<v-btn
				icon
				small
				color="error"
				:aria-label="$t('adminProducts.removeModifier')"
				@click="removeModifier(index)"
			>
				<v-icon size="20">delete_outline</v-icon>
			</v-btn>
		</div>

		<v-btn
			type="button"
			text
			color="primary"
			class="aio-admin-modifiers__add"
			@click="addModifier"
		>
			<v-icon left size="18">add</v-icon>
			{{ $t('adminProducts.addModifier') }}
		</v-btn>
	</div>
</template>

<script>
export default {
	props: {
		value: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			modifiers: this.cloneValue(this.value),
		};
	},
	watch: {
		value(newValue) {
			// Solo re-sincroniza cuando el padre reemplaza la lista (ej. carga inicial)
			if (JSON.stringify(newValue) !== JSON.stringify(this.modifiers)) {
				this.modifiers = this.cloneValue(newValue);
			}
		},
	},
	methods: {
		cloneValue(value) {
			return (Array.isArray(value) ? value : []).map((modifier) => ({
				id_modifier: modifier.id_modifier || null,
				type: modifier.type || 'color',
				name: modifier.name || '',
				price_delta: modifier.price_delta !== undefined && modifier.price_delta !== null
					? String(modifier.price_delta)
					: '',
			}));
		},
		addModifier() {
			this.modifiers.push({
				id_modifier: null,
				type: 'color',
				name: '',
				price_delta: '',
			});
			this.emitChange();
		},
		removeModifier(index) {
			this.modifiers.splice(index, 1);
			this.emitChange();
		},
		emitChange() {
			this.$emit('input', this.modifiers);
		},
	},
};
</script>

<style scoped>
.aio-admin-modifiers__row {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 160px 40px;
	gap: 0.75rem;
	align-items: center;
	margin-bottom: 0.75rem;
}

.aio-admin-modifiers__empty {
	margin-bottom: 0.75rem;
	font-size: 0.8125rem;
	color: #9ca3af;
}

.aio-admin-modifiers__add {
	margin-top: 0.25rem;
}

@media (max-width: 700px) {
	.aio-admin-modifiers__row {
		grid-template-columns: 1fr;
	}
}
</style>
