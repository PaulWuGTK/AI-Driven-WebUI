import type { LcmExecEnvResponse, LcmExecEnvRequest } from '../../types/lcmExecEnv';
import { handleApiResponse } from '../../utils/apiUtils';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;

const mockData: LcmExecEnvResponse = {
  AdvancedLcmExecEnv: {
    MaxMem: 1024,
    MaxDisk: 4096,
    ExecEnvList: [
      {
        Name: 'generic',
        Status: 'Up',
        Enable: true,
        AllocatedCpu: 100,
        AllocatedMem: 1,
        AllocatedDisk: 1
      },
      {
        Name: 'test-1',
        Status: 'Error',
        Enable: true,
        AllocatedCpu: 50,
        AllocatedMem: 10,
        AllocatedDisk: 2
      },
      {
        Name: 'test-2',
        Status: 'Restarting',
        Enable: true,
        AllocatedCpu: 75,
        AllocatedMem: 512,
        AllocatedDisk: 100
      },
      {
        Name: 'test-3',
        Status: 'Disabled',
        Enable: false,
        AllocatedCpu: 60,
        AllocatedMem: 256,
        AllocatedDisk: 50
      }
    ]
  }
};

export const getLcmExecEnvConfig = async (): Promise<LcmExecEnvResponse> => {
  if (isDevelopment) {
    return mockData;
  }
  return callApi<LcmExecEnvResponse>('/API/info?list=AdvancedLcmExecEnv');
};

export const updateLcmExecEnv = async (data: LcmExecEnvRequest): Promise<LcmExecEnvResponse> => {
  if (isDevelopment) {
    console.log('Update LCM ExecEnv:', data);
    const action = data.AdvancedLcmExecEnv.Action;
    const name = data.AdvancedLcmExecEnv.Name;

    if (action === 'Add') {
      mockData.AdvancedLcmExecEnv.ExecEnvList.push({
        Name: name,
        Status: 'Up',
        Enable: true,
        AllocatedCpu: data.AdvancedLcmExecEnv.AllocatedCpu || 100,
        AllocatedMem: data.AdvancedLcmExecEnv.AllocatedMem || 1,
        AllocatedDisk: data.AdvancedLcmExecEnv.AllocatedDisk || 1
      });
    } else if (action === 'Update') {
      const index = mockData.AdvancedLcmExecEnv.ExecEnvList.findIndex(item => item.Name === name);
      if (index !== -1) {
        mockData.AdvancedLcmExecEnv.ExecEnvList[index] = {
          ...mockData.AdvancedLcmExecEnv.ExecEnvList[index],
          Enable: data.AdvancedLcmExecEnv.Enable ?? mockData.AdvancedLcmExecEnv.ExecEnvList[index].Enable,
          AllocatedCpu: data.AdvancedLcmExecEnv.AllocatedCpu ?? mockData.AdvancedLcmExecEnv.ExecEnvList[index].AllocatedCpu,
          AllocatedMem: data.AdvancedLcmExecEnv.AllocatedMem ?? mockData.AdvancedLcmExecEnv.ExecEnvList[index].AllocatedMem,
          AllocatedDisk: data.AdvancedLcmExecEnv.AllocatedDisk ?? mockData.AdvancedLcmExecEnv.ExecEnvList[index].AllocatedDisk
        };
      }
    } else if (action === 'Delete') {
      mockData.AdvancedLcmExecEnv.ExecEnvList = mockData.AdvancedLcmExecEnv.ExecEnvList.filter(item => item.Name !== name);
    }

    return mockData;
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
