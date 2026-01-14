<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../services/auth';
import { useQA } from '../utils/qa';
import { getMockCaptcha } from '../services/mockData/authMockData';

const { isQAMode, qa, slug } = useQA();
const isDevelopment = import.meta.env.DEV;

const router = useRouter();
const username = ref('');
const password = ref('');
const captcha = ref('');
const captchaId = ref('');
const captchaImage = ref('');
const error = ref('');
const loading = ref(false);
const captchaLoading = ref(false);

const fetchCaptcha = async () => {
  captchaLoading.value = true;
  error.value = '';

  try {
    let data;

    if (isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, 300));
      data = getMockCaptcha();
    } else {
      const response = await fetch('/API/info?list=LoginCaptcha');
      data = await response.json();
    }

    if (data.LoginCaptcha) {
      captchaId.value = data.LoginCaptcha.captchaId;
      const mimeType = isDevelopment ? 'image/svg+xml' : 'image/png';
      captchaImage.value = `data:${mimeType};base64,${data.LoginCaptcha.imageBase64}`;
      captcha.value = '';
    }
  } catch (err) {
    console.error('Failed to fetch captcha:', err);
    error.value = 'Failed to load captcha';
  } finally {
    captchaLoading.value = false;
  }
};

const handleLogin = async () => {
  if (loading.value) return;

  if (!captcha.value.trim()) {
    error.value = 'Please enter the captcha code';
    return;
  }

  loading.value = true;
  error.value = '';

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
      error.value = 'Invalid username or password';
      await fetchCaptcha();
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = err instanceof Error ? err.message : 'Login failed. Please try again.';
    await fetchCaptcha();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCaptcha();
});
</script>

<template>
  <div class="login-container" :data-testid="qa('login-container')">
    <div class="login-box" :data-testid="qa('login-box')">
      <div class="logo" :data-testid="qa('login-logo')">Gemtek</div>
      <form @submit.prevent="handleLogin" class="login-form" :data-testid="qa('login-form')">
        <div class="form-group">
          <label for="username" :data-testid="qa('login-username-label')">Username</label>
          <input
            id="username"
            :data-testid="qa('login-username-input')"
            v-model="username"
            type="text"
            required
            placeholder="Enter username"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="password" :data-testid="qa('login-password-label')">Password</label>
          <input
            id="password"
            :data-testid="qa('login-password-input')"
            v-model="password"
            type="password"
            required
            placeholder="Enter password"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="captcha" :data-testid="qa('login-captcha-label')">Verification Code</label>
          <div class="captcha-container">
            <div class="captcha-image-wrapper">
              <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="Captcha"
                class="captcha-image"
                :data-testid="qa('login-captcha-image')"
              />
              <div v-else class="captcha-loading">Loading...</div>
            </div>
            <button
              type="button"
              @click="fetchCaptcha"
              :disabled="captchaLoading || loading"
              class="captcha-refresh-button"
              :data-testid="qa('login-captcha-refresh')"
              title="Refresh captcha"
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
            placeholder="Enter verification code"
            :disabled="loading || captchaLoading"
            maxlength="6"
          />
        </div>
        <div v-if="error" class="error-message" :data-testid="qa('login-error-message')">{{ error }}</div>
        <button type="submit" class="login-button" :disabled="loading || captchaLoading" :data-testid="qa('login-submit-button')">
          {{ loading ? 'Logging in...' : 'Login' }}
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
  margin-top: -0.75rem;
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