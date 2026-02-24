import { onUnmounted, ref } from 'vue';

export function useAutoDismiss(duration = 3000) {
  const visible = ref(false);
  let timer: number | null = null;

  const clearTimer = () => {
    if (timer === null) return;
    window.clearTimeout(timer);
    timer = null;
  };

  const show = () => {
    visible.value = true;
    clearTimer();
    if (duration > 0) {
      timer = window.setTimeout(() => {
        visible.value = false;
        timer = null;
      }, duration);
    }
  };

  const hide = () => {
    clearTimer();
    visible.value = false;
  };

  onUnmounted(clearTimer);

  return {
    visible,
    show,
    hide,
  };
}
