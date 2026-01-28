export interface ExecutionUnitInfo {
  EUName: string;
  State: string;
  PID: number;
  IPAddress: string[];
  UID: number;
}

export interface ExecEnvMonitorInfo {
  EEName: string;
  AvailableMemory: number;
  AvailableDiskSpace: number;
  EUList: ExecutionUnitInfo[];
}

export interface LcmMonitorResponse {
  AdvancedLcmMonitor: ExecEnvMonitorInfo[];
}
