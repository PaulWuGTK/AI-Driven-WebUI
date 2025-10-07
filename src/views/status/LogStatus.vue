<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LogEntry, LogCategory, LogSeverity } from '../../types/log';
import { getSystemLog } from '../../services/api/log';
import LogViewer from '../../components/log/LogViewer.vue';
import { useQA } from '../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const loading = ref(false);
const error = ref<string | null>(null);
const logEntries = ref<LogEntry[]>([]);
const matchCount = ref(0);
const hasMore = ref(false);
const serverTime = ref('');
const logSource = ref('');

const selectedCategories = ref<Set<LogCategory>>(new Set(['all']));
const selectedSeverity = ref<LogSeverity>('All');
const searchKeyword = ref('');
const limitValue = ref(100);

const availableCategories: LogCategory[] = [
  'all',
  'dhcp',
  'lcm',
  'wifi',
  'firewall'
];

const availableSeverities: LogSeverity[] = ['All', 'Error', 'Warning', 'Info'];

const toggleCategory = (category: LogCategory) => {
  if (category === 'all') {
    selectedCategories.value.clear();
    selectedCategories.value.add('all');
  } else {
    selectedCategories.value.delete('all');
    if (selectedCategories.value.has(category)) {
      selectedCategories.value.delete(category);
    } else {
      selectedCategories.value.add(category);
    }
    if (selectedCategories.value.size === 0) {
      selectedCategories.value.add('all');
    }
  }
};

const filteredEntries = computed(() => {
  let filtered = [...logEntries.value];

  if (selectedSeverity.value !== 'All') {
    filtered = filtered.filter(
      entry => entry.severity.toLowerCase() === selectedSeverity.value.toLowerCase()
    );
  }

  return filtered;
});

const fetchLogs = async () => {
  loading.value = true;
  error.value = null;

  try {
    const categories: Record<string, number> = {};

    if (!selectedCategories.value.has('all')) {
      selectedCategories.value.forEach(cat => {
        if (cat !== 'all') {
          categories[cat] = 1;
        }
      });
    }

    const hasCategories = Object.keys(categories).length > 0;
    const hasKeyword = searchKeyword.value.trim() !== '';

      const requestBody: any = {
        StatusLog: {
          limit: limitValue.value
        }
      };

      if (hasCategories) {
        requestBody.StatusLog.categories = categories;
      }

      if (hasKeyword) {
        requestBody.StatusLog.contains = searchKeyword.value.trim();
      }

    const response = await getSystemLog(requestBody);

    logEntries.value = response.StatusLog.entries;
    matchCount.value = response.StatusLog.matchCount;
    hasMore.value = response.StatusLog.more;
    serverTime.value = response.StatusLog.serverTime;
    logSource.value = response.StatusLog.source;
  } catch (e) {
    console.error('Failed to fetch logs:', e);
    error.value = 'Failed to fetch system logs';
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchLogs();
};

const handleClear = () => {
  searchKeyword.value = '';
  selectedCategories.value.clear();
  selectedCategories.value.add('all');
  selectedSeverity.value = 'All';
  limitValue.value = 100;
  fetchLogs();
};

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('log-status-title')">{{ t('logStatus.title') }}</h1>

    <div class="status-content" :data-testid="qa('log-status-content')">
      <div class="panel-section" :data-testid="qa('log-status-panel')">

        <div class="filter-section">
          <div class="filter-group">
            <label class="filter-label">{{ t('logStatus.categories') }}</label>
            <div class="category-filters">
              <button
                v-for="category in availableCategories"
                :key="category"
                class="category-btn"
                :class="{ active: selectedCategories.has(category) }"
                :data-testid="qa(`log-category-${category}`)"
                @click="toggleCategory(category)"
              >
                {{ t(`logStatus.${category}`) }}
              </button>
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-group">
              <label class="filter-label">{{ t('logStatus.severity') }}</label>
              <select
                v-model="selectedSeverity"
                class="filter-select"
                :data-testid="qa('log-severity-select')"
              >
                <option v-for="severity in availableSeverities" :key="severity" :value="severity">
                  {{ severity }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">{{ t('logStatus.limit') }}</label>
              <input
                v-model.number="limitValue"
                type="number"
                min="1"
                max="1000"
                class="filter-input"
                :data-testid="qa('log-limit-input')"
              />
            </div>
          </div>

          <div class="search-group">
            <label class="filter-label">{{ t('logStatus.search') }}</label>
            <div class="search-row">
              <input
                v-model="searchKeyword"
                type="text"
                :placeholder="t('logStatus.searchPlaceholder')"
                class="search-input"
                :data-testid="qa('log-search-input')"
                @keyup.enter="handleSearch"
              />
              <button
                class="btn btn-primary"
                :data-testid="qa('log-search-btn')"
                @click="handleSearch"
              >
                {{ t('logStatus.searchBtn') }}
              </button>
              <button
                class="btn btn-secondary"
                :data-testid="qa('log-clear-btn')"
                @click="handleClear"
              >
                {{ t('logStatus.clearBtn') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message" :data-testid="qa('log-error')">
          {{ error }}
        </div>

        <LogViewer
          :entries="filteredEntries"
          :loading="loading"
          :show-count="filteredEntries.length"
          :total-count="matchCount"
          :has-more="hasMore"
          :server-time="serverTime"
          :data-testid="qa('log-viewer')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: #0070bb;
  color: #0070bb;
}

.category-btn.active {
  background: #0070bb;
  border-color: #0070bb;
  color: white;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #0070bb;
  box-shadow: 0 0 0 3px rgba(0, 112, 187, 0.1);
}

.search-group {
  margin-top: 1rem;
}

.search-row {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #0070bb;
  box-shadow: 0 0 0 3px rgba(0, 112, 187, 0.1);
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: #0070bb;
  color: white;
}

.btn-primary:hover {
  background: #005a94;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.error-message {
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .filter-section {
    padding: 1rem;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .search-row {
    flex-direction: column;
  }

  .log-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .category-filters {
    gap: 0.375rem;
  }

  .category-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
