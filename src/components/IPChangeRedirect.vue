<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useQA } from '../utils/qa';
import BlockingOverlay from './BlockingOverlay.vue';

interface Props {
  isVisible: boolean;
  newIP: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 15
});
const { qa } = useQA();

const emit = defineEmits<{
  redirect: [];
}>();

const countdown = ref(props.duration);
let intervalId: number | null = null;

const progressPercent = computed(() => {
  const total = Math.max(1, props.duration);
  return Math.min(100, Math.max(0, ((total - countdown.value) / total) * 100));
});

const startCountdown = () => {
  countdown.value = props.duration;

  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = window.setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      emit('redirect');
    }
  }, 1000);
};

const redirectNow = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  emit('redirect');
};

watch(() => props.isVisible, (visible) => {
  if (visible) {
    startCountdown();
  } else {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <BlockingOverlay
    :is-visible="isVisible"
    icon-type="success"
    :message="$t('lanBasic.ipChangeSuccess')"
    :description1="$t('lanBasic.ipChangeMessage', { newIP })"
    :description2="$t('lanBasic.redirectingIn')"
    :auto-complete="false"
    :show-countdown="true"
    :show-progress="true"
    :countdown-value="countdown"
    :progress-value="progressPercent"
    :data-testid="qa('ip-change-redirect-overlay')"
  >
    <template #actions>
      <button class="btn btn-primary redirect-now-btn" :data-testid="qa('ip-change-redirect-now-button')" @click="redirectNow">
        {{ $t('lanBasic.redirectNow') }}
      </button>
    </template>
  </BlockingOverlay>
</template>

<style scoped>
.redirect-now-btn {
  width: 180px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
}
</style>
