import type { TR069Config } from '../../types/device';
import type { ManagementServerLogData } from '../../types/tr069';

export const tr069MockData: TR069Config = {
  URL: "https://acs.example.com/",
  EnableCWMP: 1,
  ConnectionRequestUsername: "admin",
  Password: "cwmppassword",
  ConnectionRequestPassword: "secret",
  PeriodicInformEnable: 1,
  PeriodicInformInterval: 86400,
  Username: "device001",
  ConnectionRequestURL: "http://192.168.1.1:7547/",
  SessionStatus: "Idle",
  PrimaryURL: "https://acs.example.com/",
  PrimaryUsername: "device001",
  PrimaryPassword: "cwmppassword",
  BackupURL: "https://acs.example.com/",
  BackupUsername: "device001",
  BackupPassword: "cwmppassword"
};

export const managementServerLogMockData: ManagementServerLogData = {
  count: 2,
  maxEntries: 300,
  serverTime: "2026-05-11T06:56:51Z",
  entries: [
    {
      timestamp: "2026 May 11 06:55:31",
      eventType: "RPCSend",
      detail: "Sent SetParameterValuesResponse"
    },
    {
      timestamp: "2026 May 11 06:55:31",
      eventType: "RPCResponse",
      detail: "Received SetParameterValues"
    }
  ]
};
