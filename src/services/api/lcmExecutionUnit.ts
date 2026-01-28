import type {
  ExecutionUnitResponse,
  ExecutionUnitActionRequest
} from '../../types/lcmExecutionUnit';
import { callApi } from '../apiClient';

const isDevelopment = import.meta.env.DEV;

const mockData: ExecutionUnitResponse = {
  AdvancedLcmExecutionUnit: [
    {
      Name: 'arm64v8/sys-monitor',
      EUID: '885a873a-79f8-59a2-ad4e-934a815e4652',
      AutoRestart: true,
      Status: 'Active',
      Uptime: 1131
    },
    {
      Name: 'arm64v8/sys-monitor',
      EUID: '917362a3-86e8-5332-bcfd-a4223f0e65e6',
      AutoRestart: false,
      Status: 'Idle',
      Uptime: 0
    },
    {
      Name: 'docker-app/webserver',
      EUID: 'a1b2c3d4-e5f6-7890-ab12-cd34ef567890',
      AutoRestart: true,
      Status: 'Active',
      Uptime: 3600
    },
    {
      Name: 'docker-app/database',
      EUID: 'f0e1d2c3-b4a5-9687-7654-321098fedcba',
      AutoRestart: true,
      Status: 'Idle',
      Uptime: 0
    }
  ]
};

export const getLcmExecutionUnitConfig = async (): Promise<ExecutionUnitResponse> => {
  if (isDevelopment) {
    return Promise.resolve(mockData);
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
    const action = request.AdvancedLcmExecutionUnit.Action;
    const euid = request.AdvancedLcmExecutionUnit.EUID;

    const unit = mockData.AdvancedLcmExecutionUnit.find(u => u.EUID === euid);
    if (unit) {
      if (action === 'Start') {
        unit.Status = 'Active';
        unit.Uptime = 1;
      } else if (action === 'Stop') {
        unit.Status = 'Idle';
        unit.Uptime = 0;
      }
    }

    return Promise.resolve();
  }

  return callApi<void>('/API/info?list=AdvancedLcmExecutionUnit', {
    method: 'POST',
    body: JSON.stringify(request)
  });
};
