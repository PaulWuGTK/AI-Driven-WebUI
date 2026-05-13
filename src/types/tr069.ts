export interface TR069Config {
  URL: string;
  EnableCWMP: number;
  ConnectionRequestUsername: string;
  Password: string;
  ConnectionRequestPassword: string;
  PeriodicInformEnable: number;
  PeriodicInformInterval: number;
  Username: string;
  ConnectionRequestURL: string;
  SessionStatus: string;
  PrimaryURL: string;
  PrimaryUsername: string;
  PrimaryPassword: string;
  BackupURL: string;
  BackupUsername: string;
  BackupPassword: string;
}

export interface ManagementServerLogEntry {
  timestamp: string;
  eventType: string;
  detail: string;
}

export interface ManagementServerLogData {
  count: number;
  maxEntries: number;
  serverTime: string;
  entries: ManagementServerLogEntry[];
}
