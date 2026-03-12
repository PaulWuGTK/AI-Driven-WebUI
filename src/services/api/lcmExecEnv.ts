import type { LcmExecEnvResponse, LcmExecEnvRequest } from '../../types/lcmExecEnv';
import { callApi } from '../apiClient';
import { getLcmExecEnvMockData, updateLcmExecEnvMockData } from '../mockData/lcmExecEnvMockData';

const isDevelopment = import.meta.env.DEV;

export const getLcmExecEnvConfig = async (): Promise<LcmExecEnvResponse> => {
  if (isDevelopment) {
    return getLcmExecEnvMockData();
  }
  return callApi<LcmExecEnvResponse>('/API/info?list=AdvancedLcmExecEnv');
};

export const updateLcmExecEnv = async (data: LcmExecEnvRequest): Promise<LcmExecEnvResponse> => {
  if (isDevelopment) {
    console.log('Update LCM ExecEnv:', data);
    return updateLcmExecEnvMockData(data);
  }

  return callApi<LcmExecEnvResponse>('/API/info?list=AdvancedLcmExecEnv', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
