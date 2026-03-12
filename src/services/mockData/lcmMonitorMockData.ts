import type { LcmMonitorResponse } from '../../types/lcmMonitor';

const mockLcmMonitorData: LcmMonitorResponse = {
  AdvancedLcmMonitor: [
    {
      EEName: 'generic',
      AvailableMemory: 10,
      AvailableDiskSpace: 1,
      EUList: [
        {
          EUName: 'arm64v8/sys-monitor',
          State: 'Running',
          PID: 2628,
          IPAddress: ['192.168.3.102'],
          UID: 999
        },
        {
          EUName: 'arm64v8/lcm-netdata',
          State: 'Running',
          PID: 2645,
          IPAddress: ['192.168.1.1'],
          UID: 0
        },
        {
          EUName: 'arm64v8/lcm-webui-generic',
          State: 'Stopped',
          PID: 0,
          IPAddress: [],
          UID: 0
        }
      ]
    },
    {
      EEName: 'test-1',
      AvailableMemory: 10,
      AvailableDiskSpace: 1,
      EUList: [
        {
          EUName: 'arm64v8/sys-monitor',
          State: 'Running',
          PID: 2628,
          IPAddress: ['192.168.3.102'],
          UID: 999
        },
        {
          EUName: 'arm64v8/lcm-netdata',
          State: 'Running',
          PID: 2645,
          IPAddress: ['192.168.1.1'],
          UID: 0
        },
        {
          EUName: 'arm64v8/lcm-webui-generic',
          State: 'Running',
          PID: 2780,
          IPAddress: ['192.168.1.2'],
          UID: 1000
        }
      ]
    }
  ]
};

export const getLcmMonitorMockData = (): LcmMonitorResponse => mockLcmMonitorData;
