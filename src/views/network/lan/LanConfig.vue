<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import IPv4Configuration from './IPv4Config.vue';
import DeviceConnected from './DeviceList.vue';
import DHCPACL from './DHCPACL.vue';
import { useMenuVisibilityContext } from '../../../composables/useMenuVisibilityContext';
import { useQA } from '../../../utils/qa';
const { isQAMode, qa, slug } = useQA();

const { t } = useI18n();
const activeTab = ref('ipv4');
const { fetchMenuContext, canShowMenu } = useMenuVisibilityContext('super');

type Tab = {
  id: string;
  label: string;
  menuKey: string;
};

const tabs = computed<Tab[]>(() =>
  [
    { id: 'ipv4', label: t('lanBasic.ipv4Configuration'), menuKey: 'basicSetup.lan.ipv4' },
    { id: 'devices', label: t('lanBasic.deviceConnected'), menuKey: 'basicSetup.lan.deviceConnected' },
    { id: 'dhcp-acl', label: t('lanBasic.dhcpAcl'), menuKey: 'basicSetup.lan.dhcpAcl' }
  ].filter(tab => canShowMenu(tab.menuKey))
);

watch(
  tabs,
  (nextTabs) => {
    if (!nextTabs.some(tab => tab.id === activeTab.value)) {
      activeTab.value = nextTabs[0]?.id || '';
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await fetchMenuContext();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('lan-settings-title')">{{ t('lanBasic.title') }}</h1>

    <div class="status-content" :data-testid="qa('lan-settings-content')">
      <div class="panel-section" :data-testid="qa('lan-settings-panel')">
        <div class="tab-navigation" :data-testid="qa('lan-settings-tabs')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`lan-settings-tab-${tab.id}`)"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content" :data-testid="qa('lan-settings-tab-content')">
          <IPv4Configuration v-if="activeTab === 'ipv4'" :data-testid="qa('lan-ipv4-config')" />
          <DeviceConnected v-if="activeTab === 'devices'" :data-testid="qa('lan-device-connected')" />
          <DHCPACL v-if="activeTab === 'dhcp-acl'" :data-testid="qa('lan-dhcp-acl')" />
        </div>
      </div>
    </div>
  </div>
</template>
