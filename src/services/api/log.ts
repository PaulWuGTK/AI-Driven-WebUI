import { callApi } from '../apiClient';
import type { LogResponse, LogRequest } from '../../types/log';
import { generateMockLogs } from '../mockData/logMockData';

const isDevelopment = import.meta.env.DEV;

export async function getSystemLog(request?: LogRequest): Promise<LogResponse> {
  if (isDevelopment) {
    return generateMockLogs(request?.StatusLog);
  }

  if (request) {
    return callApi<LogResponse>('/API/info?list=StatusLog', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  return callApi<LogResponse>('/API/info?list=StatusLog');
}

export async function exportLogs(categories?: Record<string, number>): Promise<LogResponse> {
  if (isDevelopment) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `logs-${timestamp}.tgz`;

    return {
      StatusLog: {
        url: `/download/${filename}`,
        filename: filename,
        size: 123456,
        matchCount: 0,
        source: '',
        count: 0,
        more: false,
        serverTime: new Date().toISOString(),
        entries: []
      }
    };
  }

  const request: LogRequest = {
    StatusLog: {
      export: 'prepare'
    }
  };

  if (categories && Object.keys(categories).length > 0) {
    request.StatusLog.categories = categories;
  }

  return callApi<LogResponse>('/API/info?list=StatusLog', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}
