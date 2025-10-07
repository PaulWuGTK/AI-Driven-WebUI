import { callApi } from '../apiClient';
import type { LogResponse, LogRequest } from '../../types/log';

export async function getSystemLog(request?: LogRequest): Promise<LogResponse> {
  if (request) {
    return callApi<LogResponse>('/API/info?list=StatusLog', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  return callApi<LogResponse>('/API/info?list=StatusLog');
}
