<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { StatusWanChtResponse } from '../../types/statusWanCht';
import { getStatusWanCht } from '../../services/api/statusWanCht';
import { ActionButtons } from '../../components/common';
import { useQA } from '../../utils/qa';

const { qa, slug } = useQA();
const { t } = useI18n();

const wanData = ref<StatusWanChtResponse | null>(null);
const loading = ref(false);
const selectedInterface = ref<'PPPoE' | 'IPoE' | 'Bridge' | null>(null);

const fetchStatusWanCht = async () => {
  loading.value = true;
  try {
    wanData.value = await getStatusWanCht();
  } catch (error) {
    console.error('Error fetching WAN CHT status:', error);
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async () => {
  await fetchStatusWanCht();
};

const showDetails = (interfaceType: 'PPPoE' | 'IPoE' | 'Bridge') => {
  selectedInterface.value = interfaceType;
};

const closeDetails = () => {
  selectedInterface.value = null;
};

const getDisplayValue = (value?: string) => {
  return value && value !== '' ? value : '-';
};

onMounted(() => {
  fetchStatusWanCht();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('wan-cht-title')">{{ t('wanCht.title') }}</h1>

    <div v-if="loading" class="loading-state">{{ t('common.loading') }}</div>

    <div v-else-if="wanData?.StatusWanCht" class="status-content" :data-testid="qa('wan-cht-content')">
      <div v-if="selectedInterface === 'PPPoE' && wanData.StatusWanCht.PPPoE" class="panel-section" :data-testid="qa('wan-cht-pppoe-panel')">
        <div class="header-row">
          <h2 class="section-title-sp">{{ t('wanCht.pppoeTitle') }}</h2>
          <ActionButtons
            :show-apply="false"
            :cancel-text="t('common.back')"
            :cancel-data-testid="qa('wan-cht-back-button')"
            @cancel="closeDetails"
          />
        </div>
        <div class="card-content">
          <div class="detail-grid">
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-interface-label')">{{ t('wanCht.interface') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-interface-value')">{{ wanData.StatusWanCht.PPPoE.Interface }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv6-primary-label')">{{ t('wanCht.ipv6PrimaryDNS') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv6-primary-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv6PrimaryDNS) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-protocol-label')">{{ t('wanCht.protocol') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-protocol-value')">{{ wanData.StatusWanCht.PPPoE.Protocol }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv6-secondary-label')">{{ t('wanCht.ipv6SecondaryDNS') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv6-secondary-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv6SecondaryDNS) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-status-label')">{{ t('wanCht.status') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-status-value')">{{ wanData.StatusWanCht.PPPoE.Status }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv4-address-label')">{{ t('wanCht.ipv4Address') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv4-address-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4Address) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv4-gateway-label')">{{ t('wanCht.ipv4Gateway') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv4-gateway-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4Gateway) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-subnet-mask-label')">{{ t('wanCht.subnetMask') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-subnet-mask-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.SubnetMask) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv4-primary-label')">{{ t('wanCht.ipv4PrimaryDNS') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv4-primary-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4PrimaryDNS) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv4-secondary-label')">{{ t('wanCht.ipv4SecondaryDNS') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv4-secondary-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4SecondaryDNS) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-mac-address-label')">{{ t('wanCht.macAddress') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-mac-address-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.MACAddress) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv6-address-label')">{{ t('wanCht.ipv6Address') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv6-address-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv6Address) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv6-gateway-label')">{{ t('wanCht.ipv6Gateway') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv6-gateway-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv6Gateway) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-pppoe-ipv6-prefix-label')">{{ t('wanCht.ipv6Prefix') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-pppoe-ipv6-prefix-value')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv6Prefix) }}</span>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div v-else-if="selectedInterface === 'IPoE' && wanData.StatusWanCht.IPoE" class="panel-section" :data-testid="qa('wan-cht-ipoe-panel')">
        <div class="header-row">
          <h2 class="section-title-sp">{{ t('wanCht.ipoeTitle', { protocol: wanData.StatusWanCht.IPoE.Protocol }) }}</h2>
          <ActionButtons
            :show-apply="false"
            :cancel-text="t('common.back')"
            :cancel-data-testid="qa('wan-cht-back-button')"
            @cancel="closeDetails"
          />
        </div>
        <div class="card-content">
          <div class="detail-grid">
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-interface-label')">{{ t('wanCht.interface') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-interface-value')">{{ wanData.StatusWanCht.IPoE.Interface }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv6-primary-label')">{{ t('wanCht.ipv6PrimaryDNS') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv6-primary-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv6PrimaryDNS) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-protocol-label')">{{ t('wanCht.protocol') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-protocol-value')">{{ wanData.StatusWanCht.IPoE.Protocol }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv6-secondary-label')">{{ t('wanCht.ipv6SecondaryDNS') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv6-secondary-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv6SecondaryDNS) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-status-label')">{{ t('wanCht.status') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-status-value')">{{ wanData.StatusWanCht.IPoE.Status }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv4-address-label')">{{ t('wanCht.ipv4Address') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv4-address-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4Address) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv4-gateway-label')">{{ t('wanCht.ipv4Gateway') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv4-gateway-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4Gateway) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-subnet-mask-label')">{{ t('wanCht.subnetMask') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-subnet-mask-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.SubnetMask) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv4-primary-label')">{{ t('wanCht.ipv4PrimaryDNS') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv4-primary-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4PrimaryDNS) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv4-secondary-label')">{{ t('wanCht.ipv4SecondaryDNS') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv4-secondary-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4SecondaryDNS) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-mac-address-label')">{{ t('wanCht.macAddress') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-mac-address-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.MACAddress) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv6-address-label')">{{ t('wanCht.ipv6Address') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv6-address-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv6Address) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv6-gateway-label')">{{ t('wanCht.ipv6Gateway') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv6-gateway-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv6Gateway) }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-ipoe-ipv6-prefix-label')">{{ t('wanCht.ipv6Prefix') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-ipoe-ipv6-prefix-value')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv6Prefix) }}</span>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div v-else-if="selectedInterface === 'Bridge' && wanData.StatusWanCht.Bridge" class="panel-section" :data-testid="qa('wan-cht-bridge-panel')">
        <div class="header-row">
          <h2 class="section-title-sp">{{ t('wanCht.bridgeTitle') }}</h2>
          <ActionButtons
            :show-apply="false"
            :cancel-text="t('common.back')"
            :cancel-data-testid="qa('wan-cht-back-button')"
            @cancel="closeDetails"
          />
        </div>
        <div class="card-content">
          <div class="detail-grid">
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-bridge-interface-label')">{{ t('wanCht.interface') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-bridge-interface-value')">{{ wanData.StatusWanCht.Bridge.Interface }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-bridge-protocol-label')">{{ t('wanCht.protocol') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-bridge-protocol-value')">{{ wanData.StatusWanCht.Bridge.Protocol }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="detail-label" :data-testid="qa('wan-cht-bridge-status-label')">{{ t('wanCht.status') }}</span>
              <span class="detail-value" :data-testid="qa('wan-cht-bridge-status-value')">{{ wanData.StatusWanCht.Bridge.Status }}</span>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div v-else class="panel-section" :data-testid="qa('wan-cht-ipv4-status-panel')">
        <div class="header-row">
          <h2 class="section-title-sp">{{ t('wanCht.ipv4ConnectionStatus') }}</h2>
          <ActionButtons
            :show-cancel="false"
            :apply-text="t('common.update')"
            :apply-data-testid="qa('wan-cht-update-button')"
            @apply="handleUpdate"
          />
        </div>
        <div class="card-content">
          <div class="table-container">
            <table :data-testid="qa('wan-cht-ipv4-status-table')">
              <thead>
                <tr>
                  <th :data-testid="qa('wan-cht-table-interface-header')">{{ t('wanCht.interface') }}</th>
                  <th :data-testid="qa('wan-cht-table-connection-type-header')">{{ t('wanCht.connectionType') }}</th>
                  <th :data-testid="qa('wan-cht-table-ip-address-header')">{{ t('wanCht.ipAddress') }}</th>
                  <th :data-testid="qa('wan-cht-table-subnet-mask-header')">{{ t('wanCht.subnetMask') }}</th>
                  <th :data-testid="qa('wan-cht-table-gateway-header')">{{ t('wanCht.gateway') }}</th>
                  <th :data-testid="qa('wan-cht-table-primary-dns-header')">{{ t('wanCht.primaryDNS') }}</th>
                  <th :data-testid="qa('wan-cht-table-status-header')">{{ t('wanCht.status') }}</th>
                  <th :data-testid="qa('wan-cht-table-actions-header')">{{ t('wanCht.action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="wanData.StatusWanCht.PPPoE" :data-testid="qa('wan-cht-table-pppoe-row')">
                  <td :data-testid="qa('wan-cht-table-pppoe-interface')">{{ wanData.StatusWanCht.PPPoE.Interface }}</td>
                  <td :data-testid="qa('wan-cht-table-pppoe-protocol')">{{ wanData.StatusWanCht.PPPoE.Protocol }}</td>
                  <td :data-testid="qa('wan-cht-table-pppoe-ip')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4Address) }}</td>
                  <td :data-testid="qa('wan-cht-table-pppoe-mask')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.SubnetMask) }}</td>
                  <td :data-testid="qa('wan-cht-table-pppoe-gateway')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4Gateway) }}</td>
                  <td :data-testid="qa('wan-cht-table-pppoe-dns')">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4PrimaryDNS) }}</td>
                  <td :data-testid="qa('wan-cht-table-pppoe-status')">{{ wanData.StatusWanCht.PPPoE.Status }}</td>
                  <td :data-testid="qa('wan-cht-table-pppoe-actions')">
                    <button class="btn-action" @click="showDetails('PPPoE')" :data-testid="qa('wan-cht-table-pppoe-details')" title="Details">
                      <span class="material-icons">info</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="wanData.StatusWanCht.IPoE" :data-testid="qa('wan-cht-table-ipoe-row')">
                  <td :data-testid="qa('wan-cht-table-ipoe-interface')">{{ wanData.StatusWanCht.IPoE.Interface }}</td>
                  <td :data-testid="qa('wan-cht-table-ipoe-protocol')">{{ wanData.StatusWanCht.IPoE.Protocol }}</td>
                  <td :data-testid="qa('wan-cht-table-ipoe-ip')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4Address) }}</td>
                  <td :data-testid="qa('wan-cht-table-ipoe-mask')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.SubnetMask) }}</td>
                  <td :data-testid="qa('wan-cht-table-ipoe-gateway')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4Gateway) }}</td>
                  <td :data-testid="qa('wan-cht-table-ipoe-dns')">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4PrimaryDNS) }}</td>
                  <td :data-testid="qa('wan-cht-table-ipoe-status')">{{ wanData.StatusWanCht.IPoE.Status }}</td>
                  <td :data-testid="qa('wan-cht-table-ipoe-actions')">
                    <button class="btn-action" @click="showDetails('IPoE')" :data-testid="qa('wan-cht-table-ipoe-details')" title="Details">
                      <span class="material-icons">info</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="wanData.StatusWanCht.Bridge" :data-testid="qa('wan-cht-table-bridge-row')">
                  <td :data-testid="qa('wan-cht-table-bridge-interface')">{{ wanData.StatusWanCht.Bridge.Interface }}</td>
                  <td :data-testid="qa('wan-cht-table-bridge-protocol')">{{ wanData.StatusWanCht.Bridge.Protocol }}</td>
                  <td :data-testid="qa('wan-cht-table-bridge-ip')">-</td>
                  <td :data-testid="qa('wan-cht-table-bridge-mask')">-</td>
                  <td :data-testid="qa('wan-cht-table-bridge-gateway')">-</td>
                  <td :data-testid="qa('wan-cht-table-bridge-dns')">-</td>
                  <td :data-testid="qa('wan-cht-table-bridge-status')">{{ wanData.StatusWanCht.Bridge.Status }}</td>
                  <td :data-testid="qa('wan-cht-table-bridge-actions')">
                    <button class="btn-action" @click="showDetails('Bridge')" :data-testid="qa('wan-cht-table-bridge-details')" title="Details">
                      <span class="material-icons">info</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards" :data-testid="qa('wan-cht-mobile-cards')">
            <div class="table-card" v-if="wanData.StatusWanCht.PPPoE" :data-testid="qa('wan-cht-mobile-card-pppoe')">
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.interface') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.PPPoE.Interface }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.connectionType') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.PPPoE.Protocol }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.ipAddress') }}</span>
                <span class="card-value">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4Address) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.subnetMask') }}</span>
                <span class="card-value">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.SubnetMask) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.gateway') }}</span>
                <span class="card-value">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4Gateway) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.primaryDNS') }}</span>
                <span class="card-value">{{ getDisplayValue(wanData.StatusWanCht.PPPoE.IPv4PrimaryDNS) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.status') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.PPPoE.Status }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" @click="showDetails('PPPoE')" :data-testid="qa('wan-cht-mobile-card-pppoe-details')" title="Details">
                  <span class="material-icons">info</span>
                </button>
              </div>
            </div>

            <div class="table-card" v-if="wanData.StatusWanCht.IPoE" :data-testid="qa('wan-cht-mobile-card-ipoe')">
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.interface') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.IPoE.Interface }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.connectionType') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.IPoE.Protocol }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.ipAddress') }}</span>
                <span class="card-value">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4Address) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.subnetMask') }}</span>
                <span class="card-value">{{ getDisplayValue(wanData.StatusWanCht.IPoE.SubnetMask) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.gateway') }}</span>
                <span class="card-value">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4Gateway) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.primaryDNS') }}</span>
                <span class="card-value">{{ getDisplayValue(wanData.StatusWanCht.IPoE.IPv4PrimaryDNS) }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.status') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.IPoE.Status }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" @click="showDetails('IPoE')" :data-testid="qa('wan-cht-mobile-card-ipoe-details')" title="Details">
                  <span class="material-icons">info</span>
                </button>
              </div>
            </div>

            <div class="table-card" v-if="wanData.StatusWanCht.Bridge" :data-testid="qa('wan-cht-mobile-card-bridge')">
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.interface') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.Bridge.Interface }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.connectionType') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.Bridge.Protocol }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.ipAddress') }}</span>
                <span class="card-value">-</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.subnetMask') }}</span>
                <span class="card-value">-</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.gateway') }}</span>
                <span class="card-value">-</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.primaryDNS') }}</span>
                <span class="card-value">-</span>
              </div>
              <div class="card-row">
                <span class="card-label">{{ t('wanCht.status') }}</span>
                <span class="card-value">{{ wanData.StatusWanCht.Bridge.Status }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-action" @click="showDetails('Bridge')" :data-testid="qa('wan-cht-mobile-card-bridge-details')" title="Details">
                  <span class="material-icons">info</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-tertiary);
}

.section-title-sp {
  font-size: var(--font-size-base);
  font-weight: normal;
  color: var(--text-primary);
  padding: 0.5rem 0;
  margin: 0;
  background-color: var(--bg-tertiary);
}

.header-row :deep(.btn) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-grid {
  display: grid;
  gap: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}

.detail-label {
  flex: 0 0 auto;
  white-space: nowrap;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  flex: 1 1 auto;
  min-width: 0;
  text-align: right;
  overflow-wrap: anywhere; /* IPv6 這種長字串避免撐爆 */
}


.table-container {
  overflow-x: auto;
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

.mobile-cards {
  display: none;
}

.table-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.card-row:last-of-type {
  border-bottom: none;
}

.card-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.card-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  text-align: right;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-row :deep(.btn) {
    width: 100%;
    justify-content: center;
  }

  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}
</style>
