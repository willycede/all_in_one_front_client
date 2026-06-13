<template>
	<div class="aio-admin-profile">
		<AdminPageHeader />

		<p class="aio-admin-settings__lead">
			Consulta y edita la información básica asociada a tu cuenta de administrador.
		</p>

		<div class="aio-admin-card aio-admin-product-form__section">
			<header class="aio-admin-product-form__section-head">
				<span class="aio-admin-product-form__section-icon">
					<v-icon size="20">badge</v-icon>
				</span>
				<div>
					<h3>Datos personales</h3>
					<p>Información visible en el panel y comunicaciones internas.</p>
				</div>
			</header>

			<dl class="aio-admin-profile__list">
				<div v-for="(info, key) in profileData" :key="key" class="aio-admin-profile__row">
					<dt>{{ info.key }}</dt>
					<dd>{{ info.value }}</dd>
				</div>
			</dl>

			<div class="aio-admin-settings__section-actions">
				<v-btn
					color="primary"
					depressed
					:to="{
						name: 'AdminEditProfileInfo',
						params: { title: 'edit' },
						query: { type: 'info' },
					}"
				>
					<v-icon left>edit</v-icon>
					Editar perfil
				</v-btn>
			</div>
		</div>
	</div>
</template>

<script>
import { getUserDisplayName } from 'Helpers/auth';

export default {
	computed: {
		profileData() {
			const fullName = getUserDisplayName();
			const parts = fullName.split(/\s+/).filter(Boolean);
			const firstName = parts[0] || '—';
			const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '—';

			return [
				{ key: 'Nombre', value: firstName },
				{ key: 'Apellido', value: lastName },
				{ key: 'Correo electrónico', value: localStorage.getItem('email') || '—' },
				{ key: 'Identificación', value: localStorage.getItem('identification_number') || '—' },
				{ key: 'Rol', value: localStorage.getItem('id_rol') === '1' ? 'Administrador' : 'Usuario' },
			];
		},
	},
};
</script>

<style scoped>
.aio-admin-settings__lead {
	margin: 0 0 1.25rem;
	font-size: 0.9375rem;
	color: #6b7280;
	line-height: 1.55;
}

.aio-admin-product-form__section {
	padding: 1.25rem 1.5rem;
}

.aio-admin-product-form__section-head {
	display: flex;
	gap: 1rem;
	margin-bottom: 1.25rem;
}

.aio-admin-product-form__section-head h3 {
	margin: 0 0 0.25rem;
	font-size: 1.0625rem;
	font-weight: 700;
	color: #111827;
}

.aio-admin-product-form__section-head p {
	margin: 0;
	font-size: 0.8125rem;
	color: #6b7280;
}

.aio-admin-product-form__section-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 10px;
	background: rgba(169, 109, 250, 0.12);
	flex-shrink: 0;
}

.aio-admin-product-form__section-icon .v-icon {
	color: #A96DFA !important;
}

.aio-admin-profile__list {
	margin: 0;
}

.aio-admin-profile__row {
	display: grid;
	grid-template-columns: 180px 1fr;
	gap: 1rem;
	padding: 0.75rem 0;
	border-bottom: 1px solid rgba(169, 109, 250, 0.08);
}

.aio-admin-profile__row:last-child {
	border-bottom: none;
}

.aio-admin-profile__row dt {
	margin: 0;
	font-size: 0.8125rem;
	font-weight: 600;
	color: #6b7280;
}

.aio-admin-profile__row dd {
	margin: 0;
	font-size: 0.9375rem;
	color: #111827;
}

.aio-admin-settings__section-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 1.25rem;
	padding-top: 1rem;
	border-top: 1px solid rgba(169, 109, 250, 0.08);
}

@media (max-width: 599px) {
	.aio-admin-profile__row {
		grid-template-columns: 1fr;
		gap: 0.25rem;
	}
}
</style>
