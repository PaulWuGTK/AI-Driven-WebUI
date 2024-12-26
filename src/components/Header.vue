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

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh_TW', label: '繁體中文' },
  { code: 'zh_CN', label: '简体中文' },
  { code: 'ko', label: '한국어' }
];

const username = localStorage.getItem('username') || 'admin';
</script>

<template>
  <header class="header">
    <div class="header-controls">
      <select 
        class="language-select" 
        :value="locale" 
        @change="locale = ($event.target as HTMLSelectElement).value"
      >
        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
          {{ lang.label }}
        </option>
      </select>
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
  align-items: center;
}

.language-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #666;
  cursor: pointer;
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