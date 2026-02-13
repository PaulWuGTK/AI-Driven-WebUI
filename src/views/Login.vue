<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { AuthService } from '../services/auth';
import { useQA } from '../utils/qa';
import { getMockCaptcha } from '../services/mockData/authMockData';

const { isQAMode, qa, slug } = useQA();
const isDevelopment = import.meta.env.DEV;
const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const username = ref('');
const password = ref('');
const captcha = ref('');
const captchaId = ref('');
const captchaImage = ref('');
const error = ref('');
const loading = ref(false);
const captchaLoading = ref(false);
const isLocked = ref(false);
const lockRetryAfter = ref(0);
const captchaTimeout = ref<number | null>(null);
const lockCountdown = ref<number | null>(null);
const logoutMessage = ref('');

const resetCaptchaTimer = () => {
  if (captchaTimeout.value) {
    clearTimeout(captchaTimeout.value);
  }
  captchaTimeout.value = window.setTimeout(() => {
    captcha.value = '';
    fetchCaptcha(true);
  }, 60000); // 1 minute timeout
};

const fetchCaptcha = async (clearError = false) => {
  captchaLoading.value = true;
  if (clearError) {
    error.value = '';
  }

  try {
    let data;

    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 300));
      data = getMockCaptcha();
    } else {
      const response = await fetch('/API/info?list=LoginCaptcha');
      if (!response.ok) {
        throw new Error(`Failed to fetch captcha: ${response.status}`);
      }
      data = await response.json();
    }

    if (data.LoginCaptcha) {
      captchaId.value = data.LoginCaptcha.captchaId;
      const mimeType = isDevelopment ? 'image/svg+xml' : 'image/png';
      captchaImage.value = `data:${mimeType};base64,${data.LoginCaptcha.imageBase64}`;
      captcha.value = '';
      resetCaptchaTimer();
    } else {
      throw new Error('Invalid captcha response');
    }
  } catch (err: any) {
    console.error('Failed to fetch captcha:', err);
    error.value = t('login.captchaLoadFailed');
  } finally {
    captchaLoading.value = false;
  }
};

const startLockCountdown = (retryAfter: number) => {
  isLocked.value = true;
  lockRetryAfter.value = retryAfter;

  if (lockCountdown.value) {
    clearInterval(lockCountdown.value);
  }

  lockCountdown.value = window.setInterval(() => {
    lockRetryAfter.value--;
    if (lockRetryAfter.value <= 0) {
      isLocked.value = false;
      if (lockCountdown.value) {
        clearInterval(lockCountdown.value);
        lockCountdown.value = null;
      }
      error.value = '';
      fetchCaptcha(true);
    }
  }, 1000);
};

const lockMessage = computed(() => {
  if (lockRetryAfter.value >= 60) {
    const minutes = Math.ceil(lockRetryAfter.value / 60);
    return t('login.accountLocked', { minutes });
  }
  return t('login.accountLockedSeconds', { seconds: lockRetryAfter.value });
});

const handleLogin = async () => {
  if (loading.value || isLocked.value) return;

  if (!captcha.value.trim()) {
    error.value = t('login.pleaseEnterCaptcha');
    return;
  }

  loading.value = true;
  error.value = '';

  if (captchaTimeout.value) {
    clearTimeout(captchaTimeout.value);
    captchaTimeout.value = null;
  }

  try {
    const auth = AuthService.getInstance();
    const success = await auth.login(
      username.value,
      password.value,
      captchaId.value,
      captcha.value
    );

    if (success) {
      if (auth.needsWizard()) {
        await router.push('/wizard');
      } else {
        await router.push('/dashboard');
      }
    } else {
      error.value = t('login.error');
      await fetchCaptcha(false);
    }
  } catch (err: any) {
    // Handle locked account
    if (err.status === 'locked') {
      const retrySeconds = err.retryAfter || 180;
      startLockCountdown(retrySeconds);
      if (retrySeconds >= 60) {
        const minutes = Math.ceil(retrySeconds / 60);
        error.value = t('login.accountLocked', { minutes });
      } else {
        error.value = t('login.accountLockedSeconds', { seconds: retrySeconds });
      }
      return; // Don't fetch new captcha when locked
    }

    // Handle invalid captcha
    if (err.status === 'captcha_invalid') {
      error.value = t('login.captchaInvalid');
      await fetchCaptcha(false); // Keep error message
      return;
    }

    // Handle expired captcha
    if (err.status === 'captcha_expired') {
      error.value = t('login.captchaTimeout');
      await fetchCaptcha(false); // Keep error message
      return;
    }

    // Handle session login failure (invalid username/password)
    if (err.message && err.message.includes('Session login failed')) {
      error.value = t('login.sessionFailed');
      await fetchCaptcha(false); // Keep error message
      return;
    }

    // Handle network errors
    if (err.message && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch'))) {
      error.value = t('login.networkError');
      await fetchCaptcha(false); // Keep error message
      return;
    }

    // Default error handling - show user-friendly message
    if (err.message && err.message.length > 100) {
      // If error message is too long, show generic error
      error.value = t('login.unknownError');
    } else {
      error.value = err.message || t('login.error');
    }
    await fetchCaptcha(false); // Keep error message
  } finally {
    loading.value = false;
  }
};

const submitButtonText = computed(() => {
  if (loading.value) return t('login.loggingIn');
  if (isLocked.value) return t('login.lockedWithSeconds', { seconds: lockRetryAfter.value });
  return t('login.submit');
});

onMounted(() => {
  // Check if user was logged out due to inactivity
  if (route.query.reason === 'timeout') {
    logoutMessage.value = t('login.sessionExpired');
    // Clear the query parameter
    router.replace({ path: '/login' });
  }

  fetchCaptcha(true);
});

onUnmounted(() => {
  if (captchaTimeout.value) {
    clearTimeout(captchaTimeout.value);
  }
  if (lockCountdown.value) {
    clearInterval(lockCountdown.value);
  }
});
</script>

<template>
  <div class="login-container" :data-testid="qa('login-container')">
    <div class="login-box" :data-testid="qa('login-box')">
      <div class="logo" :data-testid="qa('login-logo')">Gemtek</div>
      <form @submit.prevent="handleLogin" class="login-form" :data-testid="qa('login-form')">
        <div class="form-group">
          <label for="username" :data-testid="qa('login-username-label')">{{ t('login.username') }}</label>
          <input
            id="username"
            :data-testid="qa('login-username-input')"
            v-model="username"
            type="text"
            required
            :placeholder="t('login.usernamePlaceholder')"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password" :data-testid="qa('login-password-label')">{{ t('login.password') }}</label>
          <input
            id="password"
            :data-testid="qa('login-password-input')"
            v-model="password"
            type="password"
            required
            :placeholder="t('login.passwordPlaceholder')"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="captcha" :data-testid="qa('login-captcha-label')">{{ t('login.captcha') }}</label>
          <div class="captcha-container">
            <div class="captcha-image-wrapper">
              <img
                v-if="captchaImage"
                :src="captchaImage"
                :alt="t('login.captchaAlt')"
                class="captcha-image"
                :data-testid="qa('login-captcha-image')"
              />
              <div v-else class="captcha-loading">{{ t('common.loading') }}</div>
            </div>
            <button
              type="button"
              @click="() => fetchCaptcha(true)"
              :disabled="captchaLoading || loading"
              class="captcha-refresh-button"
              :data-testid="qa('login-captcha-refresh')"
              :title="t('login.refreshCaptcha')"
            >
              ↻
            </button>
          </div>
          <input
            id="captcha"
            :data-testid="qa('login-captcha-input')"
            v-model="captcha"
            type="text"
            required
            :placeholder="t('login.captchaPlaceholder')"
            :disabled="loading || captchaLoading"
            maxlength="6"
          />
        </div>
        <div v-if="logoutMessage" class="info-message" :data-testid="qa('login-logout-message')">
          {{ logoutMessage }}
        </div>
        <div v-if="error" class="error-message" :data-testid="qa('login-error-message')">
          {{ isLocked ? lockMessage : error }}
        </div>
        <button type="submit" class="login-button" :disabled="loading || captchaLoading || isLocked" :data-testid="qa('login-submit-button')">
          {{ submitButtonText }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #006BC4 0%, #45B1E4 100%);
}

.login-box {
  background: white;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #0c78be;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #666;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #0c78be;
  box-shadow: 0 0 0 2px rgba(12, 120, 190, 0.1);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.login-button {
  background: #0c78be;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  background: #0a66a3;
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-message {
  color: #0c5460;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 4px;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.captcha-image-wrapper {
  flex: 1;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  overflow: hidden;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.captcha-loading {
  color: #999;
  font-size: 0.85rem;
}

.captcha-refresh-button {
  width: 50px;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #0c78be;
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.captcha-refresh-button:hover:not(:disabled) {
  background: #f0f8ff;
  border-color: #0c78be;
}

.captcha-refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.captcha-refresh-button:active:not(:disabled) {
  transform: rotate(180deg);
}
</style>