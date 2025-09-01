<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DdnsService } from '../../types/ddns';
import { useQA } from '../../utils/qa';
const { isQAMode, qa, slug } = useQA();

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
  <div class="table-container" :data-testid="qa('ddns-table-container')">
    <table :data-testid="qa('ddns-table')">
      <thead>
        <tr>
          <th :data-testid="qa('ddns-table-header-no')">{{ t('ddns.no') }}</th>
          <th :data-testid="qa('ddns-table-header-provider')">{{ t('ddns.provider') }}</th>
          <th :data-testid="qa('ddns-table-header-domain')">{{ t('ddns.domain') }}</th>
          <th :data-testid="qa('ddns-table-header-status')">{{ t('ddns.status') }}</th>
          <th :data-testid="qa('ddns-table-header-last-update')">{{ t('ddns.lastUpdate') }}</th>
          <th :data-testid="qa('ddns-table-header-action')">{{ t('ddns.action') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(service, index) in services" :key="service.ID" :data-testid="qa(`ddns-table-row-${index}`)">
          <td :data-testid="qa(`ddns-table-no-${index}`)">{{ index + 1 }}</td>
          <td :data-testid="qa(`ddns-table-provider-${index}`)">{{ service.ServProv }}</td>
          <td :data-testid="qa(`ddns-table-domain-${index}`)">{{ service.DomainName }}</td>
          <td :data-testid="qa(`ddns-table-status-${index}`)">{{ service.Status }}</td>
          <td :data-testid="qa(`ddns-table-last-update-${index}`)">{{ service.LastUpdate }}</td>
          <td>
            <div class="action-buttons" :data-testid="qa(`ddns-table-actions-${index}`)">
              <button class="btn btn-edit" :data-testid="qa(`ddns-table-edit-${index}`)" @click="$emit('edit', service)" :title="t('common.edit')">
                {{ t('common.edit') }}
              </button>
              <button class="btn btn-delete" :data-testid="qa(`ddns-table-delete-${index}`)" @click="$emit('delete', service.ID)" :title="t('common.delete')">
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