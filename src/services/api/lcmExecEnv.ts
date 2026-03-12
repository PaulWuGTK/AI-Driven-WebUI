import type { LcmExecEnvResponse, LcmExecEnvRequest } from '../../types/lcmExecEnv';
import { handleApiResponse } from '../../utils/apiUtils';
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

  const response = await fetch('/API/info?list=AdvancedLcmExecEnv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse<LcmExecEnvResponse>(response);
};
