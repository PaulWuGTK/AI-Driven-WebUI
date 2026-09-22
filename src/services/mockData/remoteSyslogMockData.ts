import type { RemoteSyslogResponse } from '../../types/remoteSyslog';

/**
 * Mock data simulating all Device.Syslog.Action.* entries from the DUT.
 * Actions with LogFile.Enable=1 appear in the dropdown.
 * Actions with LogFile.Enable=0 are returned but not selectable.
 */
export const remoteSyslogMockData: RemoteSyslogResponse = {
  DeviceSyslogAction: {
    wifi: {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 1,
        Address: '192.168.1.100',
        Port: 515,
        Protocol: 'UDP',
        Status: 'Active',
      },
    },
    firewall: {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    dhcp: {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    lcm: {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    hostapd: {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    wpa_supplicant: {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    messages: {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    messages_remote: {
      LogFile: { Enable: 0 },
      LogRemote: {
        Enable: 1,
        Address: '192.168.1.100',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Active',
      },
    },
    'amxmon-procmon': {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    tr069: {
      LogFile: { Enable: 1 },
      LogRemote: {
        Enable: 0,
        Address: '',
        Port: 514,
        Protocol: 'UDP',
        Status: 'Disabled',
      },
    },
    'pcm-import': {
      LogFile: { Enable: 1 },
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
