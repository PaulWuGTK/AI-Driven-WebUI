<template>
  <div :class="tabsClasses">
    <div :class="navigationClasses">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.key || index"
        :class="getTabButtonClass(index)"
        :disabled="tab.disabled"
        @click="selectTab(index)"
      >
        <span v-if="tab.icon" class="tab-button-icon">
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </span>
        <span v-else>{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="tab-content">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.key || index"
        :class="['tab-pane', { active: activeTab === index }]"
      >
        <slot :name="`tab-${index}`" :tab="tab" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Tab {
  key?: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

interface Props {
  tabs: Tab[];
  modelValue?: number;
  variant?: 'default' | 'pills' | 'boxed';
  vertical?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  variant: 'default',
  vertical: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
  'tab-change': [index: number, tab: Tab];
}>();

const activeTab = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  activeTab.value = newValue;
});

const tabsClasses = computed(() => {
  const classes = ['tabs'];
  if (props.vertical) {
    classes.push('tabs-vertical');
  }
  return classes;
});

const navigationClasses = computed(() => {
  const classes = ['tab-navigation'];

  if (props.variant === 'pills') {
    classes.push('tabs-pills');
  } else if (props.variant === 'boxed') {
    classes.push('tabs-boxed');
  }

  return classes;
});

const getTabButtonClass = (index: number) => {
  return ['tab-button', { active: activeTab.value === index }];
};

const selectTab = (index: number) => {
  if (props.tabs[index].disabled) return;

  activeTab.value = index;
  emit('update:modelValue', index);
  emit('tab-change', index, props.tabs[index]);
};
</script>
