<template>
  <section class="panel-section">
    <div
      v-if="hasHeader"
      :class="resolvedHeaderClass"
      :data-testid="headerDataTestid || undefined"
    >
      <slot name="header">
        <component
          :is="titleTag"
          :class="resolvedTitleClass"
          :data-testid="titleDataTestid || undefined"
        >
          {{ title }}
        </component>
        <div v-if="$slots.actions" class="header-actions">
          <slot name="actions"></slot>
        </div>
      </slot>
    </div>

    <div class="card-content" :data-testid="contentDataTestid || undefined">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  title?: string;
  headerMode?: 'title' | 'row';
  titleTag?: string;
  headerDataTestid?: string;
  titleDataTestid?: string;
  contentDataTestid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  headerMode: 'title',
  titleTag: 'div',
  headerDataTestid: '',
  titleDataTestid: '',
  contentDataTestid: '',
});

const slots = useSlots();

const hasHeader = computed(() => Boolean(props.title || slots.header || slots.actions));
const resolvedHeaderClass = computed(() => props.headerMode === 'row' ? 'header-row' : 'section-title');
const resolvedTitleClass = computed(() => props.headerMode === 'row' ? 'section-title-sp' : undefined);
</script>
