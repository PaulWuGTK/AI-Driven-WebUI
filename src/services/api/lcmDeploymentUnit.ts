import type {
  LcmDeploymentUnitResponse,
  LcmDeploymentUnitRequest
} from '../../types/lcmDeploymentUnit';
import { handleApiResponse } from '../../utils/apiUtils';
import { callApi } from '../apiClient';
import {
  getLcmDeploymentUnitMockData,
  updateLcmDeploymentUnitMockData
} from '../mockData/lcmDeploymentUnitMockData';

const isDevelopment = import.meta.env.DEV;

export const getLcmDeploymentUnitConfig = async (): Promise<LcmDeploymentUnitResponse> => {
  if (isDevelopment) {
    return getLcmDeploymentUnitMockData();
  }
  return callApi<LcmDeploymentUnitResponse>('/API/info?list=AdvancedLcmDeploymentUnit');
};

export const updateLcmDeploymentUnit = async (
  data: LcmDeploymentUnitRequest
): Promise<LcmDeploymentUnitResponse> => {
  if (isDevelopment) {
    console.log('Update LCM DeploymentUnit:', data);
    return updateLcmDeploymentUnitMockData(data);
  }

  const response = await fetch('/API/info?list=AdvancedLcmDeploymentUnit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return handleApiResponse<LcmDeploymentUnitResponse>(response);
};
