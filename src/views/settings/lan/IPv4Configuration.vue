<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LANBasicResponse, IPAddressReservation } from '../../../types/lanBasic';
import { getLanBasic, updateLanBasic } from '../../../services/api/lanBasic';

const { t } = useI18n();
const lanData = ref<LANBasicResponse | null>(null);
const loading = ref(false);
const showSuccess = ref(false);
const error = ref<string | null>(null);
const editingIndex = ref<number | null>(null);

// Local state for IP Address Reservation
const reservations = ref<IPAddressReservation[]>([]);
const tempReservation = ref<IPAddressReservation>({
  MACAddress: '',
  IPAddress: '',
  Enable: 1
});

const fetchLanBasic = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getLanBasic();
    lanData.value = response;
    reservations.value = [...response.LANBasic.IPAddressReservation];
  } catch (err) {
    console.error('Error fetching LAN basic:', err);
    error.value = 'Failed to fetch LAN settings';
  } finally {
    loading.value = false;
  }
};

const handleAddReservation = () => {
  reservations.value.push({
    MACAddress: '',
    IPAddress: '',
    Enable: 1
  });
  editingIndex.value = reservations.value.length - 1;
};

const handleConfirmReservation = (index: number) => {
  editingIndex.value = null;
};

const handleCancelReservation = (index: number) => {
  if (reservations.value[index].MACAddress === '' && reservations.value[index].IPAddress === '') {
    reservations.value.splice(index, 1);
  }
  editingIndex.value = null;
};

const handleEditReservation = (index: number) => {
  editingIndex.value = index;
  tempReservation.value = { ...reservations.value[index] };
};

const handleDeleteReservation = (index: number) => {
  reservations.value.splice(index, 1);
  editingIndex.value = null;
};

const handleApply = async () => {
  if (!lanData.value) return;
  
  loading.value = true;
  try {
    await updateLanBasic({
      LANBasic: {
        LANIPSetting: lanData.value.LANBasic.LANIPSetting,
        DHCPv4Setting: lanData.value.LANBasic.DHCPv4Setting,
        IPAddressReservation: reservations.value
      }
    });
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
    await fetchLanBasic();
  } catch (err) {
    console.error('Error updating LAN settings:', err);
    error.value = 'Failed to update LAN settings';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLanBasic);
</script>

<template>
  <div class="ipv4-configuration">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading...</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <template v-else-if="lanData">
      <!-- LAN IP Setting -->
      <div class="panel-section">
        <div class="section-title">{{ t('lanBasic.lanIpSetting') }}</div>
        <div class="card-content">
          <div class="form-group">
            <div class="switch-label">
              <span>{{ t('lanBasic.enable') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="lanData.LANBasic.LANIPSetting.Enable"
                  :true-value="1"
                  :false-value="0"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('lanBasic.ipAddress') }}</label>
            <input
              type="text"
              v-model="lanData.LANBasic.LANIPSetting.IPAddress"
              :disabled="!lanData.LANBasic.LANIPSetting.Enable"
            />
          </div>

          <div class="form-group">
            <label>{{ t('lanBasic.subnetMask') }}</label>
            <input
              type="text"
              v-model="lanData.LANBasic.LANIPSetting.SubnetMask"
              :disabled="!lanData.LANBasic.LANIPSetting.Enable"
            />
          </div>
        </div>
      </div>

      <!-- DHCPv4 Setting -->
      <div class="panel-section">
        <div class="section-title">{{ t('lanBasic.dhcpv4Setting') }}</div>
        <div class="card-content">
          <div class="form-group">
            <div class="switch-label">
              <span>{{ t('lanBasic.enableDhcpServer') }}</span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="lanData.LANBasic.DHCPv4Setting.Enable"
                  :true-value="1"
                  :false-value="0"
                >
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('lanBasic.dnsServer') }}</label>
            <input
              type="text"
              v-model="lanData.LANBasic.DHCPv4Setting.DNSServers"
              :disabled="!lanData.LANBasic.DHCPv4Setting.Enable"
            />
          </div>

          <div class="form-group">
            <label>{{ t('lanBasic.beginAddress') }}</label>
            <input
              type="text"
              v-model="lanData.LANBasic.DHCPv4Setting.BeginAddress"
              :disabled="!lanData.LANBasic.DHCPv4Setting.Enable"
            />
          </div>

          <div class="form-group">
            <label>{{ t('lanBasic.endAddress') }}</label>
            <input
              type="text"
              v-model="lanData.LANBasic.DHCPv4Setting.EndAddress"
              :disabled="!lanData.LANBasic.DHCPv4Setting.Enable"
            />
          </div>

          <div class="form-group">
            <label>{{ t('lanBasic.subnetMask') }}</label>
            <input
              type="text"
              v-model="lanData.LANBasic.DHCPv4Setting.SubnetMask"
              :disabled="!lanData.LANBasic.DHCPv4Setting.Enable"
            />
          </div>

          <div class="form-group">
            <label>{{ t('lanBasic.leaseTime') }}</label>
            <div class="input-with-unit">
              <input
                type="number"
                v-model="lanData.LANBasic.DHCPv4Setting.LeaseTime"
                :disabled="!lanData.LANBasic.DHCPv4Setting.Enable"
              />
              <span class="unit">{{ t('lanBasic.seconds') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- IP Address Reservation -->
      <div class="panel-section">
        <div class="header-row">
          <div class="section-title-sp">{{ t('lanBasic.ipAddressReservation') }}</div>
          <button class="btn btn-primary" @click="handleAddReservation">
            <span class="material-icons">add</span>
            {{ t('lanBasic.add') }}
          </button>
        </div>

        <div class="card-content">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>{{ t('lanBasic.macAddress') }}</th>
                  <th>{{ t('lanBasic.ipAddress') }}</th>
                  <th>{{ t('lanBasic.enable') }}</th>
                  <th>{{ t('lanBasic.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(reservation, index) in reservations" :key="index">
                  <td>
                    <input
                      v-if="editingIndex === index"
                      type="text"
                      v-model="reservation.MACAddress"
                    />
                    <span v-else>{{ reservation.MACAddress }}</span>
                  </td>
                  <td>
                    <input
                      v-if="editingIndex === index"
                      type="text"
                      v-model="reservation.IPAddress"
                    />
                    <span v-else>{{ reservation.IPAddress }}</span>
                  </td>
                  <td>
                    <div class="switch-label">
                      <label class="switch">
                        <input
                          type="checkbox"
                          v-model="reservation.Enable"
                          :true-value="1"
                          :false-value="0"
                        >
                        <span class="slider"></span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <template v-if="editingIndex === index">
                        <button class="btn-action" @click="handleConfirmReservation(index)">
                          <span class="material-icons">check</span>
                        </button>
                        <button class="btn-action" @click="handleCancelReservation(index)">
                          <span class="material-icons">close</span>
                        </button>
                      </template>
                      <template v-else>
                        <button class="btn-action" @click="handleEditReservation(index)">
                          <span class="material-icons">edit</span>
                        </button>
                        <button class="btn-action" @click="handleDeleteReservation(index)">
                          <span class="material-icons">delete</span>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards">
            <div 
              class="table-card" 
              v-for="(reservation, index) in reservations" 
              :key="index"
            >
              <div class="card-row">
                <span class="card-label">{{ t('lanBasic.macAddress') }}</span>
                <span class="card-value">
                  <input
                    v-if="editingIndex === index"
                    type="text"
                    v-model="reservation.MACAddress"
                  />
                  <span v-else>{{ reservation.MACAddress }}</span>
                </span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lanBasic.ipAddress') }}</span>
                <span class="card-value">
                  <input
                    v-if="editingIndex === index"
                    type="text"
                    v-model="reservation.IPAddress"
                  />
                  <span v-else>{{ reservation.IPAddress }}</span>
                </span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('lanBasic.enable') }}</span>
                <div class="switch-label">
                  <label class="switch">
                    <input
                      type="checkbox"
                      v-model="reservation.Enable"
                      :true-value="1"
                      :false-value="0"
                    >
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
              <div class="card-actions">
                <template v-if="editingIndex === index">
                  <button class="btn-action" @click="handleConfirmReservation(index)">
                    <span class="material-icons">check</span>
                  </button>
                  <button class="btn-action" @click="handleCancelReservation(index)">
                    <span class="material-icons">close</span>
                  </button>
                </template>
                <template v-else>
                  <button class="btn-action" @click="handleEditReservation(index)">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-action" @click="handleDeleteReservation(index)">
                    <span class="material-icons">delete</span>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button 
          class="btn btn-secondary" 
          @click="fetchLanBasic"
        >
          {{ t('lanBasic.cancel') }}
        </button>
        <button 
          class="btn btn-primary"
          @click="handleApply"
        >
          {{ t('lanBasic.apply') }}
        </button>
      </div>
    </template>

    <div v-if="showSuccess" class="success-message">
      {{ t('common.apply') }} successful
    </div>
  </div>
</template>

<style scoped>
.ipv4-configuration {
  padding: 1.5rem;
}

.panel-section {
  background-color: white;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

.section-title {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.section-title-sp {
  font-size: 1rem;
  color: var(--text-primary);
  padding: 0.5rem 0;
}

.card-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unit {
  color: var(--text-secondary);
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}

input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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
  z-index: 100;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .ipv4-configuration {
    padding: 1rem;
  }

  .header-row {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }
}
</style>