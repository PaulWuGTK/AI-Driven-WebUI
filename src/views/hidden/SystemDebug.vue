<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('system-debug-title')">{{ t('systemDebug.title') }}</h1>

    <div class="status-content" :data-testid="qa('system-debug-content')">
      <p class="page-description">{{ t('systemDebug.downloadDescription') }}</p>

      <!-- Download Debug Info Section -->
      <SectionCard :title="t('systemDebug.downloadTitle')">
        <BaseSelect
          v-model="selectedDownloadCategory"
          :label="t('systemDebug.downloadCategory')"
          :options="downloadCategoryOptions"
          :help-text="currentDownloadCategoryDescription"
          :data-testid="qa('download-category-select')"
        />

        <div class="button-group">
          <BaseButton
            variant="primary"
            :disabled="downloading"
            :data-testid="qa('download-btn')"
            @click="handleDownload"
          >
            <span v-if="!downloading">{{ t('systemDebug.downloadBtn') }}</span>
            <span v-else>{{ t('systemDebug.downloading') }}</span>
          </BaseButton>
        </div>

        <!-- Download Error -->
        <div v-if="downloadError" class="alert alert-error" :data-testid="qa('download-error')">
          <strong>{{ t('systemDebug.downloadFailed') }}:</strong> {{ downloadError }}
        </div>

        <!-- Download Success -->
        <div v-if="downloadSuccess" class="alert alert-success" :data-testid="qa('download-success')">
          {{ downloadSuccess }}
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../utils/qa';
import type {
  DebugDownloadCategory,
  DebugCategoryInfo,
  DownloadCategoryOption
} from '../../types/systemDebug';
import { getDebugCategories, downloadDebugInfo } from '../../services/api/systemDebug';
import { AuthService } from '../../services/auth';
import SectionCard from '../../components/common/SectionCard.vue';
import BaseSelect from '../../components/common/BaseSelect.vue';
import BaseButton from '../../components/common/BaseButton.vue';

const { qa } = useQA();

const { t, te } = useI18n();

// Categories fetched from backend
const categories = ref<DebugCategoryInfo[]>([]);

// Download State
const selectedDownloadCategory = ref<DebugDownloadCategory>('all');
const downloading = ref(false);
const downloadError = ref<string>('');
const downloadSuccess = ref<string>('');

// Resolve label: use i18n if available, fall back to backend label
function getCategoryLabel(cat: DebugCategoryInfo): string {
  const i18nKey = `systemDebug.downloadCategories.${cat.value}`;
  return te(i18nKey) ? t(i18nKey) : cat.label;
}

// Resolve description: use i18n if available, otherwise empty
function getCategoryDescription(cat: DebugCategoryInfo): string {
  const i18nKey = `systemDebug.downloadCategoryDesc.${cat.value}`;
  return te(i18nKey) ? t(i18nKey) : '';
}

// Build dropdown options from backend categories
const downloadCategoryOptions = computed<DownloadCategoryOption[]>(() =>
  categories.value.map(cat => ({
    value: cat.value,
    label: getCategoryLabel(cat),
    description: getCategoryDescription(cat)
  }))
);

const currentDownloadCategoryDescription = computed(() => {
  const option = downloadCategoryOptions.value.find(opt => opt.value === selectedDownloadCategory.value);
  return option?.description || '';
});

// Fetch categories from backend on mount
onMounted(async () => {
  try {
    const resp = await getDebugCategories();
    categories.value = resp.categories;
  } catch {
    // Fallback: should not happen since getDebugCategories has its own fallback
    categories.value = [];
  }
});

// Download debug info
const handleDownload = async () => {
  downloading.value = true;
  downloadError.value = '';
  downloadSuccess.value = '';

  try {
    const response = await downloadDebugInfo(selectedDownloadCategory.value);

    if (!response.success) {
      downloadError.value = response.error || t('systemDebug.downloadFailed');
      return;
    }

    if (!response.url) {
      downloadError.value = t('systemDebug.downloadFailed');
      return;
    }

    const auth = AuthService.getInstance();
    const sessionId = auth.getSessionId();

    const downloadResponse = await fetch(response.url, {
      headers: sessionId ? { Authorization: `bearer ${sessionId}` } : {}
    });

    if (!downloadResponse.ok) {
      throw new Error(`Download failed: ${downloadResponse.status}`);
    }

    const blob = await downloadResponse.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = response.filename || 'debug-info.tar.gz';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    const sizeKB = Math.round((response.size || 0) / 1024);
    downloadSuccess.value = t('systemDebug.downloadComplete', {
      filename: response.filename,
      size: sizeKB
    });
  } catch (err) {
    downloadError.value = err instanceof Error ? err.message : t('systemDebug.downloadFailed');
  } finally {
    downloading.value = false;
  }
};
</script>

<style scoped>
.button-group {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  flex-wrap: wrap;
}

.alert {
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin-top: var(--spacing-md);
}

.alert-error {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
}

.alert-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}
</style>
