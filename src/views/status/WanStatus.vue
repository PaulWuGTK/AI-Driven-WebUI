<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WanStatusResponse } from '../../types/wan';
import { getWanStatus } from '../../services/api';
import WanStatusSummary from '../../components/status/wan/WanStatusSummary.vue';
import WanModeConfig from '../../components/status/wan/WanModeConfig.vue';
import WanInterface from '../../components/status/wan/WanInterface.vue';

const { t } = useI18n();
const wanData = ref<WanStatusResponse | null>(null);

const fetchWanStatus = async () => {
  try {
    wanData.value = await getWanStatus();
  } catch (error) {
    console.error('Error fetching WAN status:', error);
  }
};

onMounted(() => {
  fetchWanStatus();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ t('wan.title') }}</h1>

    <div class="status-content" v-if="wanData?.StatusWan">
      <div class="panel-section">
        <WanStatusSummary :status="wanData.StatusWan" />
      </div>
      
      <div class="panel-section">
        <WanModeConfig :config="wanData.StatusWan.WANModeConfig" />
      </div>
      
      <div class="panel-section" v-for="iface in wanData.StatusWan.WANModeConfig.Interfaces" :key="iface.Name">
        <WanInterface :interface="iface" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>