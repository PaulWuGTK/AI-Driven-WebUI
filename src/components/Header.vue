<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t, locale } = useI18n();

const languageMap: Record<string, string> = {
  'zh-TW': 'zh_TW',
  'zh-CN': 'zh_CN',
  'en': 'en',
  'fr': 'fr',
  'ja': 'ja',
  'de': 'de',
  'ko': 'ko'
};

const reverseLanguageMap: Record<string, string> = Object.fromEntries(
  Object.entries(languageMap).map(([k, v]) => [v, k])
);

const availableLanguages = ref([
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh_TW', label: '繁體中文' },
  { code: 'zh_CN', label: '简体中文' },
  { code: 'ko', label: '한국어' }
]);

const handleLanguageChange = async (event: Event) => {
  const newLocale = (event.target as HTMLSelectElement).value;
  locale.value = newLocale;
};
</script>

<template>
  <header class="header">
    <div class="header-controls">
      <div class="language-select-container">
        <span class="material-icons">language</span>
        <select 
          class="language-select" 
          :value="locale" 
          @change="handleLanguageChange"
        >
          <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
            {{ lang.label }}
          </option>
        </select>
      </div>
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

.language-select-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.language-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #666;
  cursor: pointer;
}

.material-icons {
  font-size: 20px;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .header-controls {
    gap: 0.5rem;
  }
}
</style>