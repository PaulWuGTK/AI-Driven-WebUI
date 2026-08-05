/**
 * System Debug API Service
 * API for downloading debug bundles
 */

import { callApi } from '../apiClient';
import type {
  DebugDownloadCategory,
  DebugDownloadResponse
} from '../../types/systemDebug';

const API_BASE_URL = '/API';

/**
 * Request debug info file generation and return download metadata
 * @param category - Download category (all, network, wifi, etc.)
 * @returns Download response with URL, filename, and size
 */
export async function downloadDebugInfo(
  category: DebugDownloadCategory
): Promise<DebugDownloadResponse> {
  // POST to /API/info?list=SystemDebug so fcgi_control recognizes it as public API
  const response = await callApi<{ SystemDebug: DebugDownloadResponse }>(
    `${API_BASE_URL}/info?list=SystemDebug`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        SystemDebug: {
          action: 'download',
          downloadCategory: category
        }
      })
    }
  );
  return response.SystemDebug;
}
