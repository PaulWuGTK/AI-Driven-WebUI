<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsService } from '../../types/ddns';

const { t } = useI18n();

defineProps<{
  services: DdnsService[];
}>();

defineEmits<{
  (e: 'edit', service: DdnsService): void;
  (e: 'delete', serviceId: string): void;
}>();
</script>

<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>{{ t('ddns.no') }}</th>
          <th>{{ t('ddns.provider') }}</th>
          <th>{{ t('ddns.domain') }}</th>
          <th>{{ t('ddns.status') }}</th>
          <th>{{ t('ddns.lastUpdate') }}</th>
          <th>{{ t('ddns.action') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(service, index) in services" :key="service.ID">
          <td>{{ index + 1 }}</td>
          <td>{{ service.ServProv }}</td>
          <td>{{ service.DomainName }}</td>
          <td>{{ service.Status }}</td>
          <td>{{ service.LastUpdate }}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-edit" @click="$emit('edit', service)" :title="t('common.edit')">
                {{ t('common.edit') }}
              </button>
              <button class="btn btn-delete" @click="$emit('delete', service.ID)" :title="t('common.delete')">
                {{ t('common.delete') }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: white;
}

.btn-edit {
  background-color: #0070BB;
}

.btn-delete {
  background-color: #dc3545;
}

.btn:hover {
  opacity: 0.9;
}
</style>