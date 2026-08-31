/**
 * System Debug API Service
 * API for downloading debug bundles
 */

import { callApi } from '../apiClient';
import type {
  DebugDownloadCategory,
  DebugDownloadResponse,
  DebugCategoriesResponse
} from '../../types/systemDebug';

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = '/API';

// Fallback categories used in dev mode or when backend GET fails
const FALLBACK_CATEGORIES: DebugCategoriesResponse = {
  categories: [
    { value: 'all', label: 'All (tar.gz)' },
    { value: 'network', label: 'Network' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'process', label: 'Process' },
    { value: 'memory', label: 'Memory' },
    { value: 'log', label: 'Log' },
    { value: 'apps', label: 'LCM Containers' },
    { value: 'service', label: 'Service' }
  ]
};

/**
 * Fetch available download categories from backend
 * GET /API/info?list=SystemDebug → { categories: [...] }
 */
export async function getDebugCategories(): Promise<DebugCategoriesResponse> {
  if (isDevelopment) {
    return FALLBACK_CATEGORIES;
  }
  try {
    return await callApi<DebugCategoriesResponse>(
      `${API_BASE_URL}/info?list=SystemDebug`
    );
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

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
