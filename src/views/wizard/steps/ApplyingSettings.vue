<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQA } from '../../../utils/qa';
import BlockingOverlay from '../../../components/BlockingOverlay.vue';

interface Props {
  etaSeconds: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['complete']);
const { t } = useI18n();
const { qa } = useQA();

const remainingTime = ref(props.etaSeconds);
const totalDuration = computed(() => Math.max(1, props.etaSeconds));
const progressPercent = computed(() =>
  Math.min(100, Math.max(0, ((totalDuration.value - remainingTime.value) / totalDuration.value) * 100))
);

let timer: number | null = null;

onMounted(() => {
  timer = window.setInterval(() => {
    remainingTime.value--;
    if (remainingTime.value <= 0) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      emit('complete');
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<template>
  <div class="applying-container" :data-testid="qa('wizard-applying-container')">
    <BlockingOverlay
      :is-visible="true"
      :message="t('wizard.applyingTitle')"
      :description1="t('wizard.applyingMessage')"
      :description2="t('wizard.applyingWarning')"
      :auto-complete="false"
      :show-countdown="true"
      :show-progress="true"
      :countdown-value="remainingTime"
      :progress-value="progressPercent"
      :data-testid="qa('wizard-applying-overlay')"
    />
  </div>
</template>

<style scoped>
.applying-container {
  min-height: 360px;
}
</style>
