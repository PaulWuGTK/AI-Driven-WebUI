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
              <button class="icon-btn" @click="$emit('edit', service)" title="Edit">
                <span class="material-icons">edit</span>
              </button>
              <button class="icon-btn" @click="$emit('delete', service.ID)" title="Delete">
                <span class="material-icons">delete</span>
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

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f8f8f8;
  font-weight: normal;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
}

.icon-btn:hover {
  color: #333;
}
</style>