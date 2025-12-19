import type { BackupWANResponse } from '../../types/backupWan';

export const mockBackupWANData: BackupWANResponse = {
  BackupWAN: {
    PhysicalInterface: 'lan1',
    SupportedEthernetInterface: ['lan1','eth0'],
    SupportedCellularInterface: ['eth1'],
    Enable: 1,
    WHCEnable: 0,
    PhysicalType: 'Ethernet',
    WANHealthCheck: [
      {
        CheckMethod: 'Ping',
        Alias: 'primary_wan',
        CheckPeriod: 3,
        Name: 'eth0',
        DNSAddress: 'www.google.com',
        Status: 'Disabled',
        PingAddress: '8.8.8.8',
        CheckCount: 3
      },
      {
        CheckMethod: 'Ping',
        Alias: 'backup_wan',
        CheckPeriod: 3,
        Name: 'lan1',
        DNSAddress: 'www.google.com',
        Status: 'Disabled',
        PingAddress: '8.8.8.8',
        CheckCount: 3
      }
    ]
  }
};
