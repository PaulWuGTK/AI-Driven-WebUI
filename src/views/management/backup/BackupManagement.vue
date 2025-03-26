<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { backupConfiguration, restoreConfiguration } from '../../../services/api/backup';

const { t } = useI18n();
const router = useRouter();
const selectedFile = ref<File | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

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
  } catch (err) {
    console.error('Error restoring configuration:', err);
    error.value = err instanceof Error ? err.message : 'Failed to restore configuration';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('backup.title') }}</h1>

    <div class="status-content">
      <!-- Backup Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('backup.backupTitle') }}</div>
        
        <div class="card-content">
          <div class="description">
            {{ t('backup.backupDescription') }}
          </div>
          <div class="button-container">
            <button 
              class="btn btn-primary"
              @click="handleBackup"
              :disabled="loading"
            >
              <span class="material-icons" v-if="loading">sync</span>
              {{ t('backup.backupButton') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Restore Section -->
      <div class="panel-section">
        <div class="section-title">{{ t('backup.restoreTitle') }}</div>
        
        <div class="card-content">
          <div class="description">
            {{ t('backup.restoreDescription') }}
          </div>

          <div 
            class="drop-zone"
            :class="{ dragging: isDragging }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            <div class="drop-zone-content">
              <span class="material-icons">cloud_upload</span>
              <p class="drop-text">{{ t('backup.dragAndDrop') }}</p>
              <p class="separator">{{ t('backup.selectFromComputer') }}</p>
              <button 
                class="btn btn-secondary"
                @click="() => fileInput?.click()"
              >
                {{ t('backup.chooseFile') }}
              </button>
            </div>
          </div>

          <div v-if="selectedFile" class="selected-file">
            <span class="material-icons">description</span>
            <span class="file-name">{{ selectedFile.name }}</span>
            <button 
              class="btn-clear"
              @click="selectedFile = null"
            >
              <span class="material-icons">close</span>
            </button>
          </div>

          <input 
            type="file" 
            ref="fileInput"
            @change="handleFileSelect"
            style="display: none"
            accept=".bin"
          >

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="button-container">
            <button 
              class="btn btn-primary"
              @click="handleRestore"
              :disabled="!selectedFile || loading"
            >
              <span class="material-icons" v-if="loading">sync</span>
              {{ loading ? t('backup.processing') : t('backup.restoreButton') }}
            </button>
          </div>
        </div>
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