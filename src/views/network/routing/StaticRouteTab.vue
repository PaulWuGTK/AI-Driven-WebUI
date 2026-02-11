<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StaticRouteIPv4, StaticRouteIPv6 } from '../../../types/staticRoute';
import { getStaticRoute, updateStaticRoute } from '../../../services/api/staticRoute';
import StaticRouteForm from '../../../components/routing/StaticRouteForm.vue';
import { useQA } from '../../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const error = ref<string | null>(null);
const ipv4Routes = ref<StaticRouteIPv4[]>([]);
const ipv6Routes = ref<StaticRouteIPv6[]>([]);
const wanIfList = ref<string[]>([]);
const showModal = ref(false);
const editingItem = ref<{ type: 'IPv4' | 'IPv6'; index: number; data: StaticRouteIPv4 | StaticRouteIPv6 } | null>(null);
const showSuccess = ref(false);

const fetchRoutes = async (silent = false) => {
  if (!silent) loading.value = true;
  error.value = null;
  try {
    const response = await getStaticRoute();
    ipv4Routes.value = response.StaticRoute.IPv4 || [];
    ipv6Routes.value = response.StaticRoute.IPv6 || [];
    wanIfList.value = response.StaticRoute.WanIfList || [];
  } catch (err) {
    console.error('Error fetching static routes:', err);
    error.value = 'Failed to fetch static routes';
  } finally {
    if (!silent) loading.value = false;
  }
};

const openAddModal = () => {
  editingItem.value = null;
  showModal.value = true;
};

const openEditModal = (type: 'IPv4' | 'IPv6', index: number) => {
  const data = type === 'IPv4' ? ipv4Routes.value[index] : ipv6Routes.value[index];
  editingItem.value = { type, index, data: { ...data } };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const handleSave = async (data: StaticRouteIPv4 | StaticRouteIPv6, ipType: 'IPv4' | 'IPv6') => {
  loading.value = true;
  try {
    let updatedIPv4 = [...ipv4Routes.value];
    let updatedIPv6 = [...ipv6Routes.value];

    if (editingItem.value) {
      if (editingItem.value.type === 'IPv4') {
        updatedIPv4[editingItem.value.index] = data as StaticRouteIPv4;
      } else {
        updatedIPv6[editingItem.value.index] = data as StaticRouteIPv6;
      }
    } else {
      if (ipType === 'IPv4') {
        updatedIPv4.push(data as StaticRouteIPv4);
      } else {
        updatedIPv6.push(data as StaticRouteIPv6);
      }
    }

    const payload = {
      StaticRoute: {
        IPv4: updatedIPv4,
        IPv6: updatedIPv6
      }
    };

    await updateStaticRoute(payload);
    await fetchRoutes();
    showSuccessMessage();
    closeModal();
  } catch (err) {
    console.error('Error saving static route:', err);
    error.value = 'Failed to save static route';
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (type: 'IPv4' | 'IPv6', index: number) => {
  if (!confirm(t('routing.confirmDelete'))) return;

  loading.value = true;
  try {
    const updatedIPv4 = [...ipv4Routes.value];
    const updatedIPv6 = [...ipv6Routes.value];

    if (type === 'IPv4') {
      updatedIPv4.splice(index, 1);
    } else {
      updatedIPv6.splice(index, 1);
    }

    const payload = {
      StaticRoute: {
        IPv4: updatedIPv4,
        IPv6: updatedIPv6
      }
    };

    await updateStaticRoute(payload);
    await fetchRoutes();
    showSuccessMessage();
  } catch (err) {
    console.error('Error deleting static route:', err);
    error.value = 'Failed to delete static route';
  } finally {
    loading.value = false;
  }
};

const showSuccessMessage = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 3000);
};

onMounted(fetchRoutes);
</script>

<template>
  <div class="static-route-tab" :data-testid="qa('static-route-tab')">
    <div v-if="loading" class="loading-state" :data-testid="qa('static-route-loading')">
      <div class="loading-spinner"></div>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="error-state" :data-testid="qa('static-route-error')">
      {{ error }}
    </div>

    <template v-else>
      <div class="panel-section" :data-testid="qa('static-route-section')">
        <div class="header-row">
          <div class="section-title-sp" :data-testid="qa('static-route-title')">
            {{ t('routing.staticRoute') }}
          </div>
          <button
            class="btn btn-primary"
            :data-testid="qa('static-route-add-button')"
            @click="openAddModal"
          >
            <span class="material-icons">add</span>
            {{ t('routing.addStaticRoute') }}
          </button>
        </div>

        <div class="card-content">
          <div class="table-container" :data-testid="qa('static-route-table')">
            <table>
              <thead>
                <tr>
                  <th :data-testid="qa('static-route-header-no')">#</th>
                  <th :data-testid="qa('static-route-header-status')">{{ t('routing.status') }}</th>
                  <th :data-testid="qa('static-route-header-name')">{{ t('routing.name') }}</th>
                  <th :data-testid="qa('static-route-header-destination-ip')">{{ t('routing.destinationIp') }}</th>
                  <th :data-testid="qa('static-route-header-subnet-mask')">{{ t('routing.subnetMaskPrefixLength') }}</th>
                  <th :data-testid="qa('static-route-header-gateway')">{{ t('routing.gateway') }}</th>
                  <th :data-testid="qa('static-route-header-interface')">{{ t('routing.interface') }}</th>
                  <th :data-testid="qa('static-route-header-action')">{{ t('routing.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(route, index) in ipv4Routes"
                  :key="`ipv4-${index}`"
                  :data-testid="qa(`static-route-ipv4-row-${index}`)"
                >
                  <td :data-testid="qa(`static-route-ipv4-no-${index}`)">{{ index + 1 }}</td>
                  <td :data-testid="qa(`static-route-ipv4-status-${index}`)">
                    <span class="material-icons status-icon" :class="{ enabled: route.Enable, disabled: !route.Enable }">
                      {{ route.Enable ? 'check_circle' : 'cancel' }}
                    </span>
                  </td>
                  <td :data-testid="qa(`static-route-ipv4-name-${index}`)">{{ route.Alias }}</td>
                  <td :data-testid="qa(`static-route-ipv4-destination-ip-${index}`)">{{ route.DestIp }}</td>
                  <td :data-testid="qa(`static-route-ipv4-subnet-mask-${index}`)">{{ route.DestMask }}</td>
                  <td :data-testid="qa(`static-route-ipv4-gateway-${index}`)">{{ route.GatewayIp || '-' }}</td>
                  <td :data-testid="qa(`static-route-ipv4-interface-${index}`)">{{ route.WanIf }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-action"
                        :data-testid="qa(`static-route-ipv4-edit-${index}`)"
                        @click="openEditModal('IPv4', index)"
                        :title="t('common.edit')"
                      >
                        <span class="material-icons">edit</span>
                      </button>
                      <button
                        class="btn-action"
                        :data-testid="qa(`static-route-ipv4-delete-${index}`)"
                        @click="handleDelete('IPv4', index)"
                        :title="t('common.delete')"
                      >
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="(route, index) in ipv6Routes"
                  :key="`ipv6-${index}`"
                  :data-testid="qa(`static-route-ipv6-row-${index}`)"
                >
                  <td :data-testid="qa(`static-route-ipv6-no-${index}`)">{{ ipv4Routes.length + index + 1 }}</td>
                  <td :data-testid="qa(`static-route-ipv6-status-${index}`)">
                    <span class="material-icons status-icon" :class="{ enabled: route.Enable, disabled: !route.Enable }">
                      {{ route.Enable ? 'check_circle' : 'cancel' }}
                    </span>
                  </td>
                  <td :data-testid="qa(`static-route-ipv6-name-${index}`)">{{ route.Alias }}</td>
                  <td :data-testid="qa(`static-route-ipv6-destination-ip-${index}`)">{{ route.DestIp }}</td>
                  <td :data-testid="qa(`static-route-ipv6-subnet-mask-${index}`)">{{ route.DestMask }}</td>
                  <td :data-testid="qa(`static-route-ipv6-gateway-${index}`)">{{ route.GatewayIp || '-' }}</td>
                  <td :data-testid="qa(`static-route-ipv6-interface-${index}`)">{{ route.WanIf }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-action"
                        :data-testid="qa(`static-route-ipv6-edit-${index}`)"
                        @click="openEditModal('IPv6', index)"
                        :title="t('common.edit')"
                      >
                        <span class="material-icons">edit</span>
                      </button>
                      <button
                        class="btn-action"
                        :data-testid="qa(`static-route-ipv6-delete-${index}`)"
                        @click="handleDelete('IPv6', index)"
                        :title="t('common.delete')"
                      >
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="ipv4Routes.length === 0 && ipv6Routes.length === 0">
                  <td colspan="8" class="no-data" :data-testid="qa('static-route-no-data')">
                    {{ t('routing.noStaticRoutes') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" :data-testid="qa('static-route-mobile')">
            <div
              class="table-card"
              v-for="(route, index) in ipv4Routes"
              :key="`mobile-ipv4-${index}`"
              :data-testid="qa(`static-route-ipv4-card-${index}`)"
            >
              <div class="card-row">
                <span class="card-label">{{ t('routing.status') }}</span>
                <span class="card-value">
                  <span class="material-icons status-icon" :class="{ enabled: route.Enable, disabled: !route.Enable }">
                    {{ route.Enable ? 'check_circle' : 'cancel' }}
                  </span>
                </span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.name') }}</span>
                <span class="card-value">{{ route.Alias }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.destinationIp') }}</span>
                <span class="card-value">{{ route.DestIp }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.subnetMaskPrefixLength') }}</span>
                <span class="card-value">{{ route.DestMask }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.gateway') }}</span>
                <span class="card-value">{{ route.GatewayIp || '-' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.interface') }}</span>
                <span class="card-value">{{ route.WanIf }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" @click="openEditModal('IPv4', index)" :title="t('common.edit')">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-action" @click="handleDelete('IPv4', index)" :title="t('common.delete')">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
            <div
              class="table-card"
              v-for="(route, index) in ipv6Routes"
              :key="`mobile-ipv6-${index}`"
              :data-testid="qa(`static-route-ipv6-card-${index}`)"
            >
              <div class="card-row">
                <span class="card-label">{{ t('routing.status') }}</span>
                <span class="card-value">
                  <span class="material-icons status-icon" :class="{ enabled: route.Enable, disabled: !route.Enable }">
                    {{ route.Enable ? 'check_circle' : 'cancel' }}
                  </span>
                </span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.name') }}</span>
                <span class="card-value">{{ route.Alias }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.destinationIp') }}</span>
                <span class="card-value">{{ route.DestIp }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.subnetMaskPrefixLength') }}</span>
                <span class="card-value">{{ route.DestMask }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.gateway') }}</span>
                <span class="card-value">{{ route.GatewayIp || '-' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('routing.interface') }}</span>
                <span class="card-value">{{ route.WanIf }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" @click="openEditModal('IPv6', index)" :title="t('common.edit')">
                  <span class="material-icons">edit</span>
                </button>
                <button class="btn-action" @click="handleDelete('IPv6', index)" :title="t('common.delete')">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <StaticRouteForm
      v-if="showModal"
      :editing-item="editingItem"
      :wan-if-list="wanIfList"
      @save="handleSave"
      @close="closeModal"
    />

    <div
      v-if="showSuccess"
      class="success-message"
      :data-testid="qa('static-route-success-message')"
    >
      {{ t('common.operationSuccessful') }}
    </div>
  </div>
</template>

<style scoped>
.static-route-tab {
  padding: 0;
}

.info-message {
  background-color: var(--bg-info);
  border-left: 4px solid var(--info-color);
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  font-size: 1.25rem;
  vertical-align: middle;
}

.status-icon.enabled {
  color: #4caf50;
}

.status-icon.disabled {
  color: #9e9e9e;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
}

.btn-action:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-secondary);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
}

.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: fadeInOut 3s ease-in-out;
  z-index: 2000;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
