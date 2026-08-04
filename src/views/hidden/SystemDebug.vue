<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('system-debug-title')">{{ t('systemDebug.title') }}</h1>

    <div class="status-content" :data-testid="qa('system-debug-content')">
      <p class="page-description">{{ t('systemDebug.description') }}</p>

      <SectionCard :title="t('systemDebug.fetchInfo')">
      <BaseSelect
        v-model="selectedCategory"
        :label="t('systemDebug.category')"
        :options="categoryOptions"
        :help-text="currentCategoryDescription"
        :data-testid="qa('category-select')"
      />

      <div class="button-group">
        <BaseButton
          variant="primary"
          :disabled="loading"
          :data-testid="qa('fetch-info-btn')"
          @click="fetchSystemInfo"
        >
          <span v-if="!loading">{{ t('systemDebug.fetchInfo') }}</span>
          <span v-else>{{ t('systemDebug.loading') }}</span>
        </BaseButton>

        <BaseButton
          variant="secondary"
          :disabled="!responseData"
          :data-testid="qa('clear-btn')"
          @click="clearResponse"
        >
          {{ t('systemDebug.clear') }}
        </BaseButton>

        <BaseButton
          variant="secondary"
          :disabled="!responseData"
          :data-testid="qa('copy-btn')"
          @click="copyToClipboard"
        >
          {{ t('systemDebug.copy') }}
        </BaseButton>
      </div>
      </SectionCard>

      <!-- Download Debug Info Section -->
      <SectionCard :title="t('systemDebug.downloadTitle')">
        <p class="section-description">{{ t('systemDebug.downloadDescription') }}</p>

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
          <strong>{{ t('systemDebug.error') }}:</strong> {{ downloadError }}
        </div>

        <!-- Download Success -->
        <div v-if="downloadSuccess" class="alert alert-success" :data-testid="qa('download-success')">
          {{ downloadSuccess }}
        </div>
      </SectionCard>

      <!-- Response Display -->
      <SectionCard v-if="responseData || error" :title="t('systemDebug.response')">
      <template #title-right>
        <span v-if="responseData" class="timestamp-badge">
          {{ t('systemDebug.timestamp') }}: {{ responseData.timestamp }}
        </span>
      </template>

      <!-- Error Display -->
      <div v-if="error" class="alert alert-error" :data-testid="qa('error-message')">
        <strong>{{ t('systemDebug.error') }}:</strong> {{ error }}
      </div>

      <!-- Success Display -->
      <div v-if="responseData && !error" class="response-content">
        <div class="response-meta">
          <span class="badge" :class="responseData.success ? 'badge-success' : 'badge-error'">
            {{ responseData.success ? t('systemDebug.success') : t('systemDebug.failed') }}
          </span>
          <span class="category-badge">{{ responseData.category }}</span>
        </div>

        <h3>{{ t('systemDebug.dataTitle') }}</h3>
        <pre class="json-output" :data-testid="qa('response-data')">{{ formattedJson }}</pre>
      </div>
      </SectionCard>

      <!-- Placeholder when no data -->
      <SectionCard v-if="!responseData && !error" class="placeholder-card">
        <div class="placeholder-content">
          <span class="material-icons placeholder-icon">info</span>
          <p>{{ t('systemDebug.placeholder') }}</p>
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
  SystemCategory,
  CategoryOption,
  SystemDebugResponse,
  DebugDownloadCategory,
  DownloadCategoryOption
} from '../../types/systemDebug';
import { postSystemDebugInfo, downloadDebugInfo } from '../../services/api/systemDebug';
import { AuthService } from '../../services/auth';
import SectionCard from '../../components/common/SectionCard.vue';
import BaseSelect from '../../components/common/BaseSelect.vue';
import BaseButton from '../../components/common/BaseButton.vue';

const { qa } = useQA();

const { t } = useI18n();

// Fetch State
const selectedCategory = ref<SystemCategory>('System');
const loading = ref(false);
const responseData = ref<SystemDebugResponse | null>(null);
const error = ref<string>('');

// Download State
const selectedDownloadCategory = ref<DebugDownloadCategory>('all');
const downloading = ref(false);
const downloadError = ref<string>('');
const downloadSuccess = ref<string>('');

// Fetch category options
const categoryOptions = computed<CategoryOption[]>(() => [
  {
    value: 'System',
    label: t('systemDebug.categories.system'),
    description: t('systemDebug.categoryDesc.system')
  },
  {
    value: 'WAN',
    label: t('systemDebug.categories.wan'),
    description: t('systemDebug.categoryDesc.wan')
  },
  {
    value: 'LAN',
    label: t('systemDebug.categories.lan'),
    description: t('systemDebug.categoryDesc.lan')
  },
  {
    value: 'WLAN',
    label: t('systemDebug.categories.wlan'),
    description: t('systemDebug.categoryDesc.wlan')
  },
  {
    value: 'Mesh',
    label: t('systemDebug.categories.mesh'),
    description: t('systemDebug.categoryDesc.mesh')
  },
  {
    value: 'Firewall',
    label: t('systemDebug.categories.firewall'),
    description: t('systemDebug.categoryDesc.firewall')
  },
  {
    value: 'Routing',
    label: t('systemDebug.categories.routing'),
    description: t('systemDebug.categoryDesc.routing')
  }
]);

const currentCategoryDescription = computed(() => {
  const option = categoryOptions.value.find(opt => opt.value === selectedCategory.value);
  return option?.description || '';
});

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

const formattedJson = computed(() => {
  if (!responseData.value?.data) return '';
  return JSON.stringify(responseData.value.data, null, 2);
});

// Fetch system information
const fetchSystemInfo = async () => {
  loading.value = true;
  error.value = '';
  responseData.value = null;

  try {
    const response = await postSystemDebugInfo({
      category: selectedCategory.value
    });
    responseData.value = response;
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('systemDebug.fetchError');
  } finally {
    loading.value = false;
  }
};

// Clear response
const clearResponse = () => {
  responseData.value = null;
  error.value = '';
};

// Copy to clipboard
const copyToClipboard = async () => {
  if (!responseData.value) return;

  try {
    const textToCopy = JSON.stringify(responseData.value, null, 2);
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

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

.section-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  font-size: 14px;
}

.timestamp-badge {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: normal;
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

.response-content {
  margin-top: var(--spacing-md);
}

.response-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--border-radius);
  font-size: 13px;
  font-weight: 500;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-error {
  background: #f8d7da;
  color: #721c24;
}

.category-badge {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  padding: 4px 12px;
  border-radius: var(--border-radius);
  font-size: 13px;
  font-weight: 500;
}

.json-output {
  background: #f5f5f5;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  max-height: 600px;
  overflow-y: auto;
}

.placeholder-card {
  min-height: 200px;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  text-align: center;
}

.placeholder-icon {
  font-size: 64px;
  color: var(--color-border);
  margin-bottom: var(--spacing-md);
}
</style>
