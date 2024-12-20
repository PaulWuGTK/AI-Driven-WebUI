<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');

const handleLogin = () => {
  if (username.value === 'admin' && password.value === 'admin') {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('username', username.value);
    router.push('/status/wan');
  } else {
    error.value = 'Invalid username or password';
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">Gemtek</div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            placeholder="Enter username"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter password"
          />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" class="login-button">Login</button>
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
  background: linear-gradient(135deg, #0c78be 0%, #60ccf6 100%);
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
  gap: 1.5rem;
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

.login-button {
  background: #0c78be;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.login-button:hover {
  background: #0a66a3;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  text-align: center;
  margin-top: -0.5rem;
}
</style>