<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t, locale } = useI18n();

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('username');
  router.push('/login');
};

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'ja' : 'en';
};

const username = localStorage.getItem('username') || 'admin';
</script>

<template>
  <header class="header">
    <div class="header-controls">
      <button class="header-btn" @click="toggleLanguage">
        {{ locale === 'en' ? '日本語' : 'English' }}
      </button>
      <button class="header-btn">{{ username }}</button>
      <button class="header-btn" @click="handleLogout">{{ t('header.logout') }}</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.header-controls {
  display: flex;
  gap: 1rem;
}

.header-btn {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.header-btn:hover {
  color: #333;
}
</style>