<template>
  <div class="table-wrapper">
    <div v-if="$slots.header || title" class="table-header-actions">
      <slot name="header">
        <h3 v-if="title" class="table-header-title">{{ title }}</h3>
      </slot>
      <div class="table-header-controls">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <div class="table-container" :data-testid="tableDataTestid || undefined">
      <table :class="tableClasses">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="getColumnClass(column)"
              :data-testid="column.headerDataTestid || undefined"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              {{ column.label }}
              <span v-if="column.sortable" class="table-sort-icon">
                {{ sortKey === column.key ? (sortOrder === 'asc' ? '↑' : '↓') : '-' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="sortedData.length === 0">
            <td :colspan="columns.length" class="table-empty">
              <slot name="empty" :mobile="false">
                {{ emptyText }}
              </slot>
            </td>
          </tr>
          <tr
            v-for="(row, index) in sortedData"
            :key="getRowKey(row, index)"
            :data-testid="resolveRowDataTestid(row, index, false) || undefined"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="getColumnClass(column)"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :column="column"
                :index="index"
                :mobile="false"
              >
                {{ getCellValue(row, column.key) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="responsive" class="mobile-cards" :data-testid="mobileDataTestid || undefined">
      <div v-if="sortedData.length === 0" class="table-empty">
        <slot name="empty" :mobile="true">{{ emptyText }}</slot>
      </div>
      <div
        v-else
        v-for="(row, index) in sortedData"
        :key="getRowKey(row, index)"
        class="table-card"
        :data-testid="resolveRowDataTestid(row, index, true) || undefined"
      >
        <div v-for="column in columns" :key="column.key" class="card-row">
          <span class="card-label">
            <slot
              :name="`label-${column.key}`"
              :row="row"
              :column="column"
              :index="index"
              :mobile="true"
            >
              {{ column.label }}
            </slot>
          </span>
          <span class="card-value">
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :column="column"
              :index="index"
              :mobile="true"
            >
              {{ getCellValue(row, column.key) }}
            </slot>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  headerDataTestid?: string;
  sortFn?: (a: any, b: any, order: 'asc' | 'desc') => number;
}

interface Props {
  columns: Column[];
  data: any[];
  title?: string;
  hover?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  responsive?: boolean;
  emptyText?: string;
  rowKey?: string;
  tableDataTestid?: string;
  mobileDataTestid?: string;
  initialSortKey?: string;
  initialSortOrder?: 'asc' | 'desc';
  rowDataTestid?: (row: any, index: number, mobile: boolean) => string;
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
  striped: false,
  bordered: false,
  compact: false,
  responsive: true,
  emptyText: 'No data available',
  rowKey: 'id',
  tableDataTestid: '',
  mobileDataTestid: '',
  initialSortKey: '',
  initialSortOrder: 'asc',
});

const sortKey = ref<string>(props.initialSortKey);
const sortOrder = ref<'asc' | 'desc'>(props.initialSortOrder);

const tableClasses = computed(() => {
  const classes = ['table'];

  if (props.hover) classes.push('table-hover');
  if (props.striped) classes.push('table-striped');
  if (props.bordered) classes.push('table-bordered');
  if (props.compact) classes.push('table-compact');
  if (sortKey.value) classes.push('table-sortable');

  return classes;
});

const sortedData = computed(() => {
  if (!sortKey.value) {
    return props.data;
  }

  const activeColumn = props.columns.find((column) => column.key === sortKey.value);

  return [...props.data].sort((a, b) => {
    if (activeColumn?.sortFn) {
      return activeColumn.sortFn(a, b, sortOrder.value);
    }

    const aVal = getCellValue(a, sortKey.value);
    const bVal = getCellValue(b, sortKey.value);

    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    if (aVal < bVal) comparison = -1;

    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
});

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const getCellValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row) ?? '';
};

const getColumnClass = (column: Column) => {
  const classes: string[] = [];

  if (column.align) {
    classes.push(`text-${column.align}`);
  }

  if (column.sortable) {
    classes.push('cursor-pointer');
  }

  if (sortKey.value === column.key) {
    classes.push('sorted');
  }

  return classes;
};

const getRowKey = (row: any, index: number) => {
  return row[props.rowKey] ?? index;
};

const resolveRowDataTestid = (row: any, index: number, mobile: boolean) => {
  return props.rowDataTestid?.(row, index, mobile) ?? '';
};
</script>

<style scoped>
.table-wrapper {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.table-sort-icon {
  display: inline-block;
  margin-left: var(--space-2);
  opacity: 0.3;
  font-size: var(--font-size-xs);
}

.table-sortable th.sorted .table-sort-icon,
.table-sortable th:hover .table-sort-icon {
  opacity: 1;
}

@media (max-width: 768px) {
  .table-container {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}

@media (min-width: 769px) {
  .mobile-cards {
    display: none;
  }
}
</style>
