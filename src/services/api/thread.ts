import type { 
  ThreadStatusResponse, 
  ThreadConfigurationResponse, 
  ThreadConfigurationUpdateRequest,
  ThreadJoinNetworkRequest,
  ThreadJoinNetworkResponse,
  ThreadCommissionerResponse,
  ThreadCommissionerUpdateRequest,
  ThreadTopologyResponse,
  ThreadScanResponse
} from '../../types/thread';
import { callApi } from '../apiClient';
import {
  getThreadCommissionerMockData,
  getThreadConfigurationMockData,
  getThreadScanMockData,
  getThreadStatusMockData,
  getThreadTopologyMockData,
  joinThreadNetworkMockData,
  updateThreadCommissionerMockData,
  updateThreadConfigurationMockData
} from '../mockData/threadMockData';

const API_URL = '/API/info';
const isDevelopment = import.meta.env.DEV;

// Thread Status API
export const getThreadStatus = async (): Promise<ThreadStatusResponse> => {
  if (isDevelopment) {
    return getThreadStatusMockData();
  }
  return callApi<ThreadStatusResponse>(`${API_URL}?list=ThreadStatus`);
};

// Thread Scan API
export const scanThreadNetworks = async (): Promise<ThreadScanResponse> => {
  if (isDevelopment) {
    return getThreadScanMockData();
  }
  return callApi<ThreadScanResponse>(`${API_URL}?list=ThreadScan`);
};

// Thread Configuration API
export const getThreadConfiguration = async (): Promise<ThreadConfigurationResponse> => {
  if (isDevelopment) {
    return getThreadConfigurationMockData();
  }
  return callApi<ThreadConfigurationResponse>(`${API_URL}?list=ThreadConfiguration`);
};

export const updateThreadConfiguration = async (data: ThreadConfigurationUpdateRequest): Promise<ThreadConfigurationResponse> => {
  if (isDevelopment) {
    console.log('Update Thread Configuration:', data);
    return updateThreadConfigurationMockData(data);
  }

  return callApi<ThreadConfigurationResponse>(`${API_URL}?list=ThreadConfiguration`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Thread Join Network API
export const joinThreadNetwork = async (data: ThreadJoinNetworkRequest): Promise<ThreadJoinNetworkResponse> => {
  if (isDevelopment) {
    console.log('Join Thread Network:', data);
    return joinThreadNetworkMockData(data);
  }

  return callApi<ThreadJoinNetworkResponse>(`${API_URL}?list=ThreadJoinNetwork`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Thread Commissioner API
export const getThreadCommissioner = async (): Promise<ThreadCommissionerResponse> => {
  if (isDevelopment) {
    return getThreadCommissionerMockData();
  }
  return callApi<ThreadCommissionerResponse>(`${API_URL}?list=ThreadCommissioner`);
  
};

export const updateThreadCommissioner = async (data: ThreadCommissionerUpdateRequest): Promise<ThreadCommissionerResponse> => {
  if (isDevelopment) {
    console.log('Update Thread Commissioner:', data);
    return updateThreadCommissionerMockData(data);
  }

  return callApi<ThreadCommissionerResponse>(`${API_URL}?list=ThreadCommissioner`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Thread Topology API
export const getThreadTopology = async (): Promise<ThreadTopologyResponse> => {
  if (isDevelopment) {
    return getThreadTopologyMockData();
  }
  return callApi<ThreadTopologyResponse>(`${API_URL}?list=ThreadTopology`);
};
