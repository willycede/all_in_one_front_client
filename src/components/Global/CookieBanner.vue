<template>
    <transition name="slide-up">
        <div v-if="visible" class="cookie-banner">
            <div class="cookie-banner__content">
                <p class="cookie-banner__text">
                    Usamos cookies para mantener tu sesión, recordar tu carrito y mejorar tu experiencia.
                    Puedes consultar nuestra
                    <a :href="policyUrl" target="_blank" rel="noopener">política de tratamiento de datos</a>
                    para más detalle.
                </p>
                <div class="cookie-banner__actions">
                    <v-btn small text class="white--text" @click="reject">Rechazar</v-btn>
                    <v-btn small color="accent" class="white--text" @click="accept">Aceptar</v-btn>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import AppConfig from 'Constants/AppConfig';

const STORAGE_KEY = 'cookie_consent';
const CURRENT_VERSION = 'v1';

export default {
    name: 'CookieBanner',
    data() {
        return {
            visible: false,
            policyUrl: `${AppConfig.apiUrl.replace(/\/$/, '')}/legal/v1/politica-tratamiento-datos.pdf`,
        };
    },
    mounted() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            this.visible = true;
            return;
        }
        try {
            const stored = JSON.parse(raw);
            if (stored.version !== CURRENT_VERSION) {
                this.visible = true;
            }
        } catch (e) {
            this.visible = true;
        }
    },
    methods: {
        persist(status) {
            const payload = {
                version: CURRENT_VERSION,
                status,
                accepted_at: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            this.visible = false;
        },
        accept() {
            this.persist('accepted');
        },
        reject() {
            this.persist('rejected');
        },
    },
};
</script>

<style scoped>
.cookie-banner {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: rgba(0, 0, 107, 0.95);
    color: #fff;
    padding: 16px 24px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
}
.cookie-banner__content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.cookie-banner__text {
    margin: 0;
    flex: 1 1 300px;
    font-size: 14px;
    line-height: 1.4;
}
.cookie-banner__text a {
    color: #fff;
    text-decoration: underline;
}
.cookie-banner__actions {
    display: flex;
    gap: 8px;
}
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-up-enter,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>
