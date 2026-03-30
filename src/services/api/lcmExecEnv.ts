import type { LcmExecEnvResponse, LcmExecEnvRequest } from '../../types/lcmExecEnv';
import { callApi } from '../apiClient';
import { getLcmExecEnvMockData, updateLcmExecEnvMockData } from '../mockData/lcmExecEnvMockData';
import { toFlag01 } from '../flag01';

const isDevelopment = import.meta.env.DEV;

const normalizeResponse = (response: LcmExecEnvResponse): LcmExecEnvResponse => ({
  AdvancedLcmExecEnv: {
    ...response.AdvancedLcmExecEnv,
    ExecEnvList: response.AdvancedLcmExecEnv.ExecEnvList.map((item) => ({
      ...item,
      Enable: toFlag01(item.Enable)
    }))
  }
});

export const getLcmExecEnvConfig = async (): Promise<LcmExecEnvResponse> => {
  if (isDevelopment) {
    return normalizeResponse(getLcmExecEnvMockData());
  }
  const response = await callApi<LcmExecEnvResponse>('/API/info?list=AdvancedLcmExecEnv');
  return normalizeResponse(response);
};

export const updateLcmExecEnv = async (data: LcmExecEnvRequest): Promise<LcmExecEnvResponse> => {
  const normalizedData: LcmExecEnvRequest = {
    AdvancedLcmExecEnv: {
      ...data.AdvancedLcmExecEnv,
      Enable:
        data.AdvancedLcmExecEnv.Enable === undefined
          ? undefined
          : toFlag01(data.AdvancedLcmExecEnv.Enable)
    }
  };

  if (isDevelopment) {
    console.log('Update LCM ExecEnv:', normalizedData);
    return normalizeResponse(updateLcmExecEnvMockData(normalizedData));
  }

  return callApi<LcmExecEnvResponse>('/API/info?list=AdvancedLcmExecEnv', {
    method: 'POST',
    body: JSON.stringify(normalizedData),
  });
};
