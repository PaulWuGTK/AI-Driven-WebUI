export interface ExecutionUnitItem {
  Name: string;
  EUID: string;
  AutoRestart: boolean;
  Status: string;
  Uptime: number;
}

export interface ExecutionUnitResponse {
  AdvancedLcmExecutionUnit: ExecutionUnitItem[];
}

export interface ExecutionUnitActionRequest {
  AdvancedLcmExecutionUnit: {
    Action: 'Start' | 'Stop';
    EUID: string;
  };
}
