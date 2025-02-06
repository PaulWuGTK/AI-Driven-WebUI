export interface LcmDeploymentUnit {
  Name: string;
  URL: string;
  Status: string;
  Version: string;
  Vendor: string;
  UUID: string;
  Alias: string;
  Resolved: number;
}

export interface StatusLcmResponse {
  StatusLcm: {
    ExecutionUnitNumberOfEntries: number;
    ExecEnvNumberOfEntries: number;
    DeploymentUnitNumberOfEntries: number;
    DeploymentUnits: LcmDeploymentUnit[];
  }
}