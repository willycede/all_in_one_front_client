<template>
	<div class="aio-admin-settings">
		<p class="aio-admin-settings__lead">
			Administra preferencias de tu cuenta de administrador, notificaciones y opciones de seguridad.
		</p>

		<section class="aio-admin-card aio-admin-product-form__section">
			<header class="aio-admin-product-form__section-head">
				<span class="aio-admin-product-form__section-icon">
					<v-icon size="20">photo_camera</v-icon>
				</span>
				<div>
					<h3>Foto de perfil</h3>
					<p>Personaliza cómo te identifican otros administradores en el panel.</p>
				</div>
			</header>

			<div class="aio-admin-settings__avatar-row">
				<div class="aio-admin-settings__avatar-preview">
					<span>{{ userInitials }}</span>
				</div>
				<div class="aio-admin-settings__avatar-actions">
					<v-btn outlined color="primary" small disabled>
						<v-icon left small>upload</v-icon>
						Subir imagen
					</v-btn>
					<p class="aio-admin-settings__hint">Próximamente: carga de avatar desde el panel.</p>
				</div>
			</div>
		</section>

		<section class="aio-admin-card aio-admin-product-form__section">
			<header class="aio-admin-product-form__section-head">
				<span class="aio-admin-product-form__section-icon">
					<v-icon size="20">notifications</v-icon>
				</span>
				<div>
					<h3>Notificaciones</h3>
					<p>Elige qué alertas quieres recibir mientras administras la plataforma.</p>
				</div>
			</header>

			<div class="aio-admin-settings__toggles">
				<div
					v-for="item in notificationOptions"
					:key="item.key"
					class="aio-admin-settings__toggle-row"
				>
					<div class="aio-admin-settings__toggle-copy">
						<p class="aio-admin-settings__toggle-title">{{ item.title }}</p>
						<p class="aio-admin-settings__toggle-desc">{{ item.description }}</p>
					</div>
					<v-switch
						v-model="notifications[item.key]"
						color="primary"
						hide-details
						class="mt-0 pt-0"
					></v-switch>
				</div>
			</div>

			<div class="aio-admin-settings__section-actions">
				<v-btn color="primary" depressed :loading="savingNotifications" @click="saveNotifications">
					Guardar preferencias
				</v-btn>
			</div>
		</section>

		<section class="aio-admin-card aio-admin-product-form__section aio-admin-settings__danger">
			<header class="aio-admin-product-form__section-head">
				<span class="aio-admin-product-form__section-icon aio-admin-product-form__section-icon--danger">
					<v-icon size="20">warning_amber</v-icon>
				</span>
				<div>
					<h3>Zona de peligro</h3>
					<p>Desactiva tu cuenta de administrador. Esta acción requiere confirmación.</p>
				</div>
			</header>

			<p class="aio-admin-settings__danger-label">Motivo de la baja (opcional)</p>
			<v-radio-group v-model="deactivateReason" hide-details class="aio-admin-settings__radios">
				<v-radio
					label="Es temporal, volveré más adelante"
					value="temporary"
				></v-radio>
				<v-radio
					label="Tuve un problema de seguridad"
					value="security"
				></v-radio>
				<v-radio
					label="Preocupación de privacidad"
					value="privacy"
				></v-radio>
				<v-radio
					label="Otro motivo"
					value="other"
				></v-radio>
			</v-radio-group>

			<v-textarea
				v-if="deactivateReason === 'other'"
				v-model="deactivateNotes"
				label="Cuéntanos un poco más"
				outlined
				dense
				rows="3"
				hide-details="auto"
				class="mt-4"
			></v-textarea>

			<div class="aio-admin-settings__section-actions aio-admin-settings__section-actions--danger">
				<v-btn color="error" depressed @click="openDeactivateDialog">
					<v-icon left>person_off</v-icon>
					Desactivar cuenta
				</v-btn>
			</div>
		</section>

		<emb-delete-confirmation-2
			ref="deleteConfirmationDialog"
			messageTitle="¿Desactivar tu cuenta de administrador?"
			messageDescription="Perderás acceso al panel hasta que un superadmin reactive tu usuario. ¿Deseas continuar?"
			btn1="Cancelar"
			btn2="Sí, desactivar"
			@onConfirm="onDeactivateAccount"
		></emb-delete-confirmation-2>
	</div>
</template>

<script>
import { getUserDisplayName } from 'Helpers/auth';

const STORAGE_KEY = 'aio_admin_notification_prefs';

const DEFAULT_NOTIFICATIONS = {
	enabled: true,
	desktop: false,
	ownActivityEmail: true,
	requestsEmail: true,
};

export default {
	data() {
		return {
			notifications: { ...DEFAULT_NOTIFICATIONS },
			savingNotifications: false,
			deactivateReason: 'temporary',
			deactivateNotes: '',
			notificationOptions: [
				{
					key: 'enabled',
					title: 'Activar notificaciones',
					description: 'Recibe avisos generales del panel de administración.',
				},
				{
					key: 'desktop',
					title: 'Notificaciones de escritorio',
					description: 'Muestra alertas en el navegador cuando la pestaña está abierta.',
				},
				{
					key: 'ownActivityEmail',
					title: 'Correo por mi actividad',
					description: 'Envía un resumen cuando realizas cambios importantes (productos, cupones, etc.).',
				},
				{
					key: 'requestsEmail',
					title: 'Correo por solicitudes y revisiones',
					description: 'Avisos cuando hay documentos pendientes o acciones que requieren tu atención.',
				},
			],
		};
	},
	computed: {
		userDisplayName() {
			return getUserDisplayName();
		},
		userInitials() {
			const name = this.userDisplayName.trim();
			if (!name) return 'A';
			const parts = name.split(/\s+/).filter(Boolean);
			if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
			return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
		},
	},
	mounted() {
		this.loadNotificationPrefs();
	},
	methods: {
		loadNotificationPrefs() {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (!raw) return;
				const parsed = JSON.parse(raw);
				this.notifications = { ...DEFAULT_NOTIFICATIONS, ...parsed };
			} catch (e) {
				this.notifications = { ...DEFAULT_NOTIFICATIONS };
			}
		},
		saveNotifications() {
			this.savingNotifications = true;
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
				this.$snotify.success('Preferencias de notificación guardadas', { timeout: 2500 });
			} catch (e) {
				this.$snotify.error('No se pudieron guardar las preferencias', { timeout: 3000 });
			} finally {
				this.savingNotifications = false;
			}
		},
		openDeactivateDialog() {
			this.$refs.deleteConfirmationDialog.openDialog();
		},
		onDeactivateAccount() {
			this.$refs.deleteConfirmationDialog.close();
			this.$snotify.info(
				'La desactivación de cuenta admin estará disponible cuando se conecte con la API de usuarios.',
				{ timeout: 4500 }
			);
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
	max-width: 640px;
}

.aio-admin-product-form__section {
	padding: 1.25rem 1.5rem;
	margin-bottom: 1rem;
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
	line-height: 1.5;
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

.aio-admin-product-form__section-icon--danger {
	background: rgba(220, 38, 38, 0.1);
}

.aio-admin-product-form__section-icon--danger .v-icon {
	color: #dc2626 !important;
}

.aio-admin-settings__avatar-row {
	display: flex;
	align-items: center;
	gap: 1.25rem;
	flex-wrap: wrap;
}

.aio-admin-settings__avatar-preview {
	width: 72px;
	height: 72px;
	border-radius: 16px;
	background: linear-gradient(135deg, #A96DFA 0%, #CA1DFF 100%);
	color: #fff;
	font-size: 1.5rem;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
}

.aio-admin-settings__avatar-actions {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.aio-admin-settings__hint {
	margin: 0;
	font-size: 0.75rem;
	color: #9ca3af;
}

.aio-admin-settings__section-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 1.25rem;
	padding-top: 1rem;
	border-top: 1px solid rgba(169, 109, 250, 0.08);
}

.aio-admin-settings__section-actions--danger {
	border-top-color: rgba(220, 38, 38, 0.12);
	justify-content: flex-start;
}

.aio-admin-settings__danger-label {
	margin: 0 0 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
}

.aio-admin-settings__radios >>> .v-label {
	font-size: 0.875rem;
}
</style>
