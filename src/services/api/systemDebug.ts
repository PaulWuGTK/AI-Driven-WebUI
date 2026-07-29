/**
 * System Debug API Service
 * API for fetching system debug information
 */

import { callApi } from '../apiClient';
import type { SystemDebugRequest, SystemDebugResponse } from '../../types/systemDebug';

const API_BASE_URL = '/API';

/**
 * Fetch system debug information via POST
 * @param request - Request payload
 * @returns System debug response with data
 */
export async function postSystemDebugInfo(
  request: SystemDebugRequest
): Promise<SystemDebugResponse> {
  // POST to /API/info with SystemDebug wrapper (runtime.exeparam format)
  const response = await callApi<{ SystemDebug: SystemDebugResponse }>(
    `${API_BASE_URL}/info`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        SystemDebug: {
          category: request.category,
          action: request.action
        }
      })
    }
  );
  // Extract SystemDebug from response wrapper
  return response.SystemDebug;
}
