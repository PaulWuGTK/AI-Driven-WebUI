<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { backupConfiguration, restoreConfiguration } from '../../../services/api/backup';
import { SectionCard } from '../../../components/common';
import { AuthService } from '../../../services/auth';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const selectedFile = ref<File | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const showRestoreCountdown = ref(false);
const restoreCountdown = ref(5);
const restoreCountdownTimer = ref<number | null>(null);

const redirectToLogin = () => {
  const auth = AuthService.getInstance();
  auth.clearSession();
  window.location.href = `/login?t=${Date.now()}`;
};

const startRestoreCountdown = () => {
  showRestoreCountdown.value = true;
  restoreCountdown.value = 5;

  if (restoreCountdownTimer.value) {
    clearInterval(restoreCountdownTimer.value);
  }

  restoreCountdownTimer.value = window.setInterval(() => {
    restoreCountdown.value--;
    if (restoreCountdown.value <= 0) {
      if (restoreCountdownTimer.value) {
        clearInterval(restoreCountdownTimer.value);
      }
      redirectToLogin();
    }
  }, 1000);
};

const handleBackup = async () => {
  loading.value = true;
  error.value = null;
  try {
    await backupConfiguration();
  } catch (err) {
    console.error('Error backing up configuration:', err);
    error.value = err instanceof Error ? err.message : 'Failed to backup configuration';
  } finally {
    loading.value = false;
  }
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  if (event.dataTransfer?.files.length) {
    selectedFile.value = event.dataTransfer.files[0];
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
};

const handleRestore = async () => {
  if (!selectedFile.value) return;
  
  loading.value = true;
  error.value = null;
  try {
    await restoreConfiguration(selectedFile.value);
    selectedFile.value = null;
    startRestoreCountdown();
  } catch (err) {
    console.error('Error restoring configuration:', err);
    error.value = err instanceof Error ? err.message : 'Failed to restore configuration';
  } finally {
    loading.value = false;
  }
};

onUnmounted(() => {
  if (restoreCountdownTimer.value) {
    clearInterval(restoreCountdownTimer.value);
  }
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('backup-title')">{{ t('backup.title') }}</h1>

    <div class="status-content" :data-testid="qa('backup-content')">
      <!-- Backup Section -->
      <SectionCard
        :data-testid="qa('backup-section')"
        :title="t('backup.backupTitle')"
        :title-data-testid="qa('backup-section-title')"
      >
        <div class="description" :data-testid="qa('backup-description')">
          {{ t('backup.backupDescription') }}
        </div>
        <div class="button-container">
          <button 
            class="btn btn-primary"
            :data-testid="qa('backup-button')"
            @click="handleBackup"
            :disabled="loading"
          >
            <span class="material-icons" v-if="loading">sync</span>
            {{ t('backup.backupButton') }}
          </button>
        </div>
      </SectionCard>

      <!-- Restore Section -->
      <SectionCard
        :data-testid="qa('restore-section')"
        :title="t('backup.restoreTitle')"
        :title-data-testid="qa('restore-section-title')"
      >
        <div class="description" :data-testid="qa('restore-description')">
          {{ t('backup.restoreDescription') }}
        </div>

        <div 
          class="drop-zone"
          :class="{ dragging: isDragging }"
          :data-testid="qa('restore-drop-zone')"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <div class="drop-zone-content">
            <span class="material-icons">cloud_upload</span>
            <p class="drop-text" :data-testid="qa('restore-drop-text')">{{ t('backup.dragAndDrop') }}</p>
            <p class="separator" :data-testid="qa('restore-separator-text')">{{ t('backup.selectFromComputer') }}</p>
            <button 
              class="btn btn-secondary"
              :data-testid="qa('restore-choose-file-button')"
              @click="() => fileInput?.click()"
            >
              {{ t('backup.chooseFile') }}
            </button>
          </div>
        </div>

        <div v-if="selectedFile" class="selected-file" :data-testid="qa('restore-selected-file')">
          <span class="material-icons">description</span>
          <span class="file-name" :data-testid="qa('restore-selected-file-name')">{{ selectedFile.name }}</span>
          <button 
            class="btn-clear"
            :data-testid="qa('restore-clear-file-button')"
            @click="selectedFile = null"
          >
            <span class="material-icons">close</span>
          </button>
        </div>

        <input 
          type="file" 
          ref="fileInput"
          :data-testid="qa('restore-file-input')"
          @change="handleFileSelect"
          style="display: none"
          accept=".bin"
        >

        <div v-if="error" class="error-message" :data-testid="qa('restore-error-message')">
          {{ error }}
        </div>

        <div class="button-container">
          <button 
            class="btn btn-primary"
            :data-testid="qa('restore-button')"
            @click="handleRestore"
            :disabled="!selectedFile || loading"
          >
            <span class="material-icons" v-if="loading">sync</span>
            {{ loading ? t('backup.processing') : t('backup.restoreButton') }}
          </button>
        </div>
      </SectionCard>
    </div>

    <div v-if="showRestoreCountdown" class="countdown-overlay" :data-testid="qa('restore-countdown-overlay')">
      <div class="countdown-content" :data-testid="qa('restore-countdown-content')">
        <div class="spinner"></div>
        <p :data-testid="qa('restore-countdown-processing')">{{ t('backup.processing') }}</p>
        <p :data-testid="qa('restore-countdown-text')">{{ t('reset.countdown', { seconds: restoreCountdown }) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.button-container {
  display: flex;
  justify-content: center;
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
  background-color: var(--bg-secondary);
  margin-bottom: 1.5rem;
}

.drop-zone.dragging {
  border-color: var(--primary-color);
  background-color: rgba(0, 112, 187, 0.05);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.drop-zone .material-icons {
  font-size: 3rem;
  color: var(--primary-color);
}

.drop-text {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0;
}

.separator {
  color: var(--text-secondary);
  margin: 0;
  position: relative;
  width: 100%;
  text-align: center;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.selected-file .material-icons {
  color: var(--primary-color);
}

.file-name {
  flex: 1;
  color: var(--text-primary);
}

.btn-clear {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-clear:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.error-message {
  color: #dc3545;
  margin: 1rem 0;
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  text-align: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.countdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.countdown-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .drop-zone {
    padding: 1.5rem 1rem;
  }

  .drop-zone .material-icons {
    font-size: 2.5rem;
  }

  .drop-text {
    font-size: 1rem;
  }

  .selected-file {
    flex-wrap: wrap;
  }

  .file-name {
    width: 100%;
    order: 3;
  }

  .button-container .btn {
    width: 100%;
  }
}
</style>
