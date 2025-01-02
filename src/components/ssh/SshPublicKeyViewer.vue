<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  publicKey: {
    Key: string;
  };
  onClose: () => void;
}>();

// Extract algorithm from the key
const getAlgorithm = (key: string): string => {
  const parts = key.split(' ');
  return parts[0] || '';
};

// Extract algorithm from the key
const getPublicKey = (key: string): string => {
  const parts = key.split(' ');
  return parts[1] || '';
};

// Extract comment from the key
const getComment = (key: string): string => {
  const parts = key.trim().split(' ');
  return parts.length >= 3 ? parts[parts.length - 1] : '';
};
</script>

<template>
  <div class="key-viewer-overlay">
    <div class="key-viewer">
      <h3 class="viewer-title">{{ t('ssh.publicKey') }}</h3>
      
      <div class="key-content">
        <div class="info-row">
          <label>Algorithm</label>
          <div class="value">{{ getAlgorithm(publicKey.Key) }}</div>
        </div>

        <div class="info-row">
          <label>{{ t('ssh.publicKey') }}</label>
          <div class="value key-text">{{ getPublicKey(publicKey.Key) }}</div>
        </div>

        <div class="info-row">
          <label>{{ t('ssh.comment') }}</label>
          <div class="value">{{ getComment(publicKey.Key) }}</div>
        </div>
      </div>

      <div class="button-row">
        <button class="btn btn-primary" @click="onClose">
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.key-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.key-viewer {
  background-color: white;
  border-radius: 4px;
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
}

.viewer-title {
  margin: 0;
  padding: 1rem;
  font-size: 1.1rem;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

.key-content {
  padding: 1.5rem;
}

.info-row {
  margin-bottom: 1rem;
}

.info-row label {
  display: block;
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-row .value {
  padding: 0.75rem;
  background-color: #f8f8f8;
  border-radius: 4px;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  color: #333;
}

.key-text {
  white-space: pre-wrap;
}

.button-row {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0070BB;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}
</style>