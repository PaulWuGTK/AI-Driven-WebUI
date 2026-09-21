import type { RemoteSyslogResponse } from '../../types/remoteSyslog';

export const remoteSyslogMockData: RemoteSyslogResponse = {
  DeviceSyslogAction: {
    messages_remote: {
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    wifi: {
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    hostapd: {
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
  },
};
