import type { LcmExecEnvRequest, LcmExecEnvResponse } from '../../types/lcmExecEnv';

const mockLcmExecEnvData: LcmExecEnvResponse = {
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

export const getLcmExecEnvMockData = (): LcmExecEnvResponse => mockLcmExecEnvData;

export const updateLcmExecEnvMockData = (data: LcmExecEnvRequest): LcmExecEnvResponse => {
  const action = data.AdvancedLcmExecEnv.Action;
  const name = data.AdvancedLcmExecEnv.Name;

  if (action === 'Add') {
    mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList.push({
      Name: name,
      Status: 'Up',
      Enable: true,
      AllocatedCpu: data.AdvancedLcmExecEnv.AllocatedCpu || 100,
      AllocatedMem: data.AdvancedLcmExecEnv.AllocatedMem || 1,
      AllocatedDisk: data.AdvancedLcmExecEnv.AllocatedDisk || 1
    });
  } else if (action === 'Update') {
    const index = mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList.findIndex(
      (item) => item.Name === name
    );
    if (index !== -1) {
      mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList[index] = {
        ...mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList[index],
        Enable:
          data.AdvancedLcmExecEnv.Enable ??
          mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList[index].Enable,
        AllocatedCpu:
          data.AdvancedLcmExecEnv.AllocatedCpu ??
          mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList[index].AllocatedCpu,
        AllocatedMem:
          data.AdvancedLcmExecEnv.AllocatedMem ??
          mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList[index].AllocatedMem,
        AllocatedDisk:
          data.AdvancedLcmExecEnv.AllocatedDisk ??
          mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList[index].AllocatedDisk
      };
    }
  } else if (action === 'Delete') {
    mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList =
      mockLcmExecEnvData.AdvancedLcmExecEnv.ExecEnvList.filter((item) => item.Name !== name);
  }

  return mockLcmExecEnvData;
};
