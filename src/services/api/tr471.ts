import type { TR471Response, TR471Config } from '../../types/tr471';
import { callApi } from '../apiClient';
import { getTR471MockConfig, runTR471MockTest } from '../mockData/tr471MockData';
import { isOpenWrtWifiLogoMode } from '../../config/runtimeMode';

const isDevelopment = import.meta.env.DEV || isOpenWrtWifiLogoMode;

export const getTR471Config = async (): Promise<TR471Response> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return getTR471MockConfig();
  }

  return callApi<TR471Response>('/API/info?list=TR471', { method: 'GET' });
};

export const runTR471Test = async (config: Partial<TR471Config>): Promise<TR471Response> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return runTR471MockTest(config);
  }

  return callApi<TR471Response>('/API/info?list=TR471', {
    method: 'POST',
    body: JSON.stringify({ TR471: config })
  });
};
