<template>
    <transition name="aio-consent-slide">
        <div v-if="visible" class="aio-consent">
            <div class="aio-consent__inner">
                <div class="aio-consent__icon-wrap">
                    <v-icon color="white" size="22">cookie</v-icon>
                </div>
                <p class="aio-consent__text">
                    {{ $t('cookies.message') }}
                    <a :href="policyUrl" target="_blank" rel="noopener">{{ $t('cookies.policyLink') }}</a>.
                </p>
                <div class="aio-consent__actions">
                    <button type="button" class="aio-consent__btn aio-consent__btn--ghost" @click="reject">
                        {{ $t('cookies.reject') }}
                    </button>
                    <button type="button" class="aio-consent__btn aio-consent__btn--primary" @click="accept">
                        {{ $t('cookies.accept') }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { buildLegalDocumentUrl } from 'Helpers/apiUrls';
import { isUserLoggedIn } from 'Helpers/auth';

const STORAGE_KEY = 'cookie_consent';
const CURRENT_VERSION = 'v1';
const HIDDEN_ROUTES = ['/client/login', '/client/register', '/client/admin-login'];

export default {
    name: 'CookieBanner',
    data() {
        return {
            visible: false,
            policyUrl: buildLegalDocumentUrl('data_treatment_policy'),
        };
    },
    watch: {
        $route() {
            this.evaluateVisibility();
        },
    },
    mounted() {
        this.evaluateVisibility();
    },
    methods: {
        hasPendingConsent() {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return true;
            }
            try {
                const stored = JSON.parse(raw);
                return stored.version !== CURRENT_VERSION;
            } catch (e) {
                return true;
            }
        },
        isHiddenRoute() {
            return HIDDEN_ROUTES.includes(this.$route.path);
        },
        evaluateVisibility() {
            if (!isUserLoggedIn() || this.isHiddenRoute()) {
                this.visible = false;
                return;
            }
            this.visible = this.hasPendingConsent();
        },
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
.aio-consent {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 1.25rem;
    z-index: 1000;
    padding: 0 1.25rem;
    pointer-events: none;
}

.aio-consent__inner {
    pointer-events: auto;
    max-width: 920px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(8, 8, 12, 0.96) 0%, rgba(26, 10, 40, 0.96) 100%);
    border: 1px solid rgba(169, 109, 250, 0.35);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(202, 29, 255, 0.08);
    backdrop-filter: blur(16px);
}

.aio-consent__icon-wrap {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #A96DFA, #CA1DFF);
}

.aio-consent__text {
    margin: 0;
    flex: 1;
    font-size: 0.875rem;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.88);
}

.aio-consent__text a {
    color: #CA1DFF;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid rgba(202, 29, 255, 0.4);
    transition: color 0.2s;
}

.aio-consent__text a:hover {
    color: #A96DFA;
}

.aio-consent__actions {
    display: flex;
    gap: 0.625rem;
    flex-shrink: 0;
}

.aio-consent__btn {
    border: none;
    border-radius: 999px;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
}

.aio-consent__btn:hover {
    transform: translateY(-1px);
}

.aio-consent__btn--ghost {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.aio-consent__btn--primary {
    background: linear-gradient(135deg, #A96DFA, #CA1DFF);
    color: #fff;
    box-shadow: 0 4px 16px rgba(202, 29, 255, 0.35);
}

.aio-consent-slide-enter-active,
.aio-consent-slide-leave-active {
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
}

.aio-consent-slide-enter,
.aio-consent-slide-leave-to {
    transform: translateY(calc(100% + 2rem));
    opacity: 0;
}

@media (max-width: 767px) {
    .aio-consent {
        bottom: 0.75rem;
        padding: 0 0.75rem;
    }

    .aio-consent__inner {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
    }

    .aio-consent__icon-wrap {
        margin: 0 auto;
    }

    .aio-consent__actions {
        justify-content: center;
    }
}
</style>
