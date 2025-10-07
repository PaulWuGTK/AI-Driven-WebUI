<script setup lang="ts">
import type { LogEntry } from '../../types/log';

interface Props {
  entries: LogEntry[];
  loading?: boolean;
  showCount?: number;
  totalCount?: number;
  hasMore?: boolean;
  serverTime?: string;
}

defineProps<Props>();

const getSeverityClass = (severity: string): string => {
  const severityLower = severity.toLowerCase();
  if (severityLower.includes('error')) return 'severity-error';
  if (severityLower.includes('warning') || severityLower.includes('warn')) return 'severity-warning';
  if (severityLower.includes('info')) return 'severity-info';
  return 'severity-default';
};

const formatTimestamp = (ts: string): string => {
  return ts.replace(/^\d{4}\s+/, '');
};
</script>

<template>
  <div class="log-viewer">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading logs...</span>
    </div>

    <div v-else-if="entries.length === 0" class="empty-state">
      No log entries found
    </div>

    <div v-else class="log-container">
      <div class="log-header">
        <div class="log-title">
          Log Entries <span class="log-count">({{ showCount }})</span>
        </div>
        <div class="log-info">
          <span v-if="hasMore" class="more-indicator">More entries available</span>
          <span v-if="serverTime" class="server-time">Server Time: {{ serverTime }}</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="log-table">
          <thead>
            <tr>
              <th class="col-timestamp">Timestamp</th>
              <th class="col-severity">Severity</th>
              <th class="col-module">Module</th>
              <th class="col-process">Process</th>
              <th class="col-message">Message</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in entries"
              :key="index"
              class="log-row"
            >
              <td class="col-timestamp">{{ formatTimestamp(entry.ts) }}</td>
              <td class="col-severity">
                <span class="severity-badge" :class="getSeverityClass(entry.severity)">
                  {{ entry.severity }}
                </span>
              </td>
              <td class="col-module">{{ entry.module || '-' }}</td>
              <td class="col-process">{{ entry.program }}</td>
              <td class="col-message">{{ entry.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-viewer {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #6c757d;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0070bb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.log-container {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #e9ecef;
  background: #f8f9fa;
}

.log-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.log-count {
  color: #6c757d;
  font-weight: 400;
}

.log-info {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 0.875rem;
}

.more-indicator {
  color: #ff8c00;
  font-weight: 500;
}

.server-time {
  color: #6c757d;
}

.table-wrapper {
  overflow-x: auto;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.log-table thead {
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.log-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
}

.log-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.15s;
}

.log-table tbody tr:hover {
  background-color: #f8f9fa;
}

.log-table td {
  padding: 0.75rem 1rem;
  vertical-align: top;
}

.col-timestamp {
  width: 140px;
  white-space: nowrap;
  color: #6c757d;
  font-family: 'Courier New', monospace;
}

.col-severity {
  width: 100px;
}

.col-module {
  width: 120px;
  color: #495057;
}

.col-process {
  width: 150px;
  color: #495057;
  font-family: 'Courier New', monospace;
}

.col-message {
  min-width: 300px;
  color: #212529;
  word-break: break-word;
}

.severity-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.severity-error {
  background-color: #dc3545;
  color: white;
}

.severity-warning {
  background-color: #ffc107;
  color: #212529;
}

.severity-info {
  background-color: #17a2b8;
  color: white;
}

.severity-debug {
  background-color: #6c757d;
  color: white;
}

.severity-default {
  background-color: #e9ecef;
  color: #495057;
}

@media (max-width: 1200px) {
  .log-table {
    font-size: 0.8rem;
  }

  .col-timestamp {
    width: 120px;
  }

  .col-severity {
    width: 90px;
  }

  .col-module {
    width: 100px;
  }

  .col-process {
    width: 130px;
  }
}

@media (max-width: 768px) {
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .log-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .log-table {
    display: block;
  }

  .log-table thead {
    display: none;
  }

  .log-table tbody,
  .log-table tr,
  .log-table td {
    display: block;
    width: 100%;
  }

  .log-table tr {
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 0.5rem;
  }

  .log-table td {
    padding: 0.5rem;
    border: none;
  }

  .log-table td::before {
    content: attr(data-label);
    font-weight: 600;
    display: inline-block;
    margin-right: 0.5rem;
    color: #6c757d;
  }

  .col-timestamp::before {
    content: 'Time: ';
  }

  .col-severity::before {
    content: 'Severity: ';
  }

  .col-module::before {
    content: 'Module: ';
  }

  .col-process::before {
    content: 'Process: ';
  }

  .col-message::before {
    content: 'Message: ';
    display: block;
    margin-bottom: 0.25rem;
  }
}
</style>
