export interface ExecEnvItem {
  Name: string;
  Status: string;
  Enable: boolean;
  AllocatedCpu: number;
  AllocatedMem: number;
  AllocatedDisk: number;
}

export interface LcmExecEnvConfig {
  MaxMem: number;
  MaxDisk: number;
  ExecEnvList: ExecEnvItem[];
}

export interface LcmExecEnvResponse {
  AdvancedLcmExecEnv: LcmExecEnvConfig;
}

export interface LcmExecEnvRequest {
  AdvancedLcmExecEnv: {
    Action: 'Add' | 'Update' | 'Delete';
    Name: string;
    Enable?: boolean;
    AllocatedCpu?: number;
    AllocatedMem?: number;
    AllocatedDisk?: number;
  };
}
