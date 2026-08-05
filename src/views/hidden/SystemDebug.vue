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
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../utils/qa';
import type {
  DebugDownloadCategory,
  DownloadCategoryOption
} from '../../types/systemDebug';
import { downloadDebugInfo } from '../../services/api/systemDebug';
import { AuthService } from '../../services/auth';
import SectionCard from '../../components/common/SectionCard.vue';
import BaseSelect from '../../components/common/BaseSelect.vue';
import BaseButton from '../../components/common/BaseButton.vue';

const { qa } = useQA();

const { t } = useI18n();

// Download State
const selectedDownloadCategory = ref<DebugDownloadCategory>('all');
const downloading = ref(false);
const downloadError = ref<string>('');
const downloadSuccess = ref<string>('');

// Download category options
const downloadCategoryOptions = computed<DownloadCategoryOption[]>(() => [
  {
    value: 'all',
    label: t('systemDebug.downloadCategories.all'),
    description: t('systemDebug.downloadCategoryDesc.all')
  },
  {
    value: 'network',
    label: t('systemDebug.downloadCategories.network'),
    description: t('systemDebug.downloadCategoryDesc.network')
  },
  {
    value: 'wifi',
    label: t('systemDebug.downloadCategories.wifi'),
    description: t('systemDebug.downloadCategoryDesc.wifi')
  },
  {
    value: 'process',
    label: t('systemDebug.downloadCategories.process'),
    description: t('systemDebug.downloadCategoryDesc.process')
  },
  {
    value: 'memory',
    label: t('systemDebug.downloadCategories.memory'),
    description: t('systemDebug.downloadCategoryDesc.memory')
  },
  {
    value: 'log',
    label: t('systemDebug.downloadCategories.log'),
    description: t('systemDebug.downloadCategoryDesc.log')
  },
  {
    value: 'service',
    label: t('systemDebug.downloadCategories.service'),
    description: t('systemDebug.downloadCategoryDesc.service')
  }
]);

const currentDownloadCategoryDescription = computed(() => {
  const option = downloadCategoryOptions.value.find(opt => opt.value === selectedDownloadCategory.value);
  return option?.description || '';
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
