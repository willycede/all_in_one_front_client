<template>
	<div class="aio-account-panel profile-wrapper">
		<div v-if="isLoading" class="aio-account-panel__loading">
			<v-progress-circular indeterminate color="#A96DFA" size="36" width="3"></v-progress-circular>
			<p>Cargando tu perfil...</p>
		</div>

		<template v-else>
			<div class="aio-account-panel__header">
				<div>
					<h2 class="aio-account-panel__title">Información del usuario</h2>
					<p class="aio-account-panel__subtitle">Datos usados para facturación y contacto</p>
				</div>
				<router-link
					:to="{ name: 'EditProfileInfo', query: { type: 'info' } }"
					class="aio-account-panel__edit-btn"
				>
					<v-icon size="18">edit</v-icon>
					Editar
				</router-link>
			</div>

			<div class="aio-account-panel__notice">
				<v-icon size="20">info</v-icon>
				<p>
					Esta información se utiliza para generar tu factura tras el pago.
					Si algún dato es incorrecto, actualízalo antes de comprar.
				</p>
			</div>

			<div class="aio-account-panel__grid">
				<div
					v-for="field in profileFields"
					:key="field.key"
					class="aio-account-panel__field proflie-field"
					:class="{ 'aio-account-panel__field--full': field.full }"
				>
					<span class="aio-account-panel__field-icon">
						<v-icon size="18">{{ field.icon }}</v-icon>
					</span>
					<div class="aio-account-panel__field-body">
						<label>{{ field.label }}</label>
						<span>{{ field.value || '—' }}</span>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import api from 'Api';

export default {
	data() {
		return {
			isLoading: true,
			user: null,
		};
	},
	computed: {
		profileFields() {
			if (!this.user) return [];
			return [
				{
					key: 'name',
					label: 'Nombres',
					value: this.user.name_user || localStorage.getItem('name_user'),
					icon: 'person_outline',
				},
				{
					key: 'last',
					label: 'Apellidos',
					value: this.user.last_name_user || localStorage.getItem('last_name_user'),
					icon: 'person_outline',
				},
				{
					key: 'email',
					label: 'Email',
					value: this.user.email || localStorage.getItem('email'),
					icon: 'email',
				},
				{
					key: 'id',
					label: 'Cédula / RUC',
					value: this.user.identification_number || localStorage.getItem('identification_number'),
					icon: 'badge',
				},
				{
					key: 'address',
					label: 'Dirección',
					value: this.user.address,
					icon: 'location_on',
					full: true,
				},
			];
		},
	},
	mounted() {
		this.loadProfile();
	},
	methods: {
		async loadProfile() {
			this.isLoading = true;
			try {
				const response = await api.get(`/api/users/${localStorage.id_users}`);
				if (response?.data?.data) {
					this.user = response.data.data;
				}
			} finally {
				this.isLoading = false;
			}
		},
	},
};
</script>
