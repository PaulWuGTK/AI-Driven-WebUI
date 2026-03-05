import type {
  ExecutionUnitResponse,
  ExecutionUnitActionRequest
} from '../../types/lcmExecutionUnit';
import { callApi } from '../apiClient';
import {
  controlLcmExecutionUnitMockData,
  getLcmExecutionUnitMockData
} from '../mockData/lcmExecutionUnitMockData';

const isDevelopment = import.meta.env.DEV;

export const getLcmExecutionUnitConfig = async (): Promise<ExecutionUnitResponse> => {
  if (isDevelopment) {
    return Promise.resolve(getLcmExecutionUnitMockData());
  }
  return callApi<ExecutionUnitResponse>('/API/info?list=AdvancedLcmExecutionUnit', {
    method: 'GET'
  });
};

export const controlExecutionUnit = async (
  request: ExecutionUnitActionRequest
): Promise<void> => {
  if (isDevelopment) {
    console.log('Control Execution Unit:', request);
    controlLcmExecutionUnitMockData(request);
    return Promise.resolve();
  }

  return callApi<void>('/API/info?list=AdvancedLcmExecutionUnit', {
    method: 'POST',
    body: JSON.stringify(request)
  });
};
