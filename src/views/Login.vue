<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../services/auth';

const router = useRouter();

onMounted(() => {
  // Since we're not requiring login, just redirect to dashboard
  router.push('/dashboard');
});
</script>

<template>
  <div class="login-container">
    <div class="loading-spinner"></div>
    <p>Redirecting to dashboard...</p>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #006BC4 0%, #45B1E4 100%);
  color: white;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>