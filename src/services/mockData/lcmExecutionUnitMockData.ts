import type {
  ExecutionUnitActionRequest,
  ExecutionUnitResponse
} from '../../types/lcmExecutionUnit';

const mockLcmExecutionUnitData: ExecutionUnitResponse = {
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

export const getLcmExecutionUnitMockData = (): ExecutionUnitResponse => mockLcmExecutionUnitData;

export const controlLcmExecutionUnitMockData = (request: ExecutionUnitActionRequest): void => {
  const action = request.AdvancedLcmExecutionUnit.Action;
  const euid = request.AdvancedLcmExecutionUnit.EUID;

  const unit = mockLcmExecutionUnitData.AdvancedLcmExecutionUnit.find((item) => item.EUID === euid);
  if (!unit) {
    return;
  }

  if (action === 'Start') {
    unit.Status = 'Active';
    unit.Uptime = 1;
    return;
  }

  if (action === 'Stop') {
    unit.Status = 'Idle';
    unit.Uptime = 0;
  }
};
