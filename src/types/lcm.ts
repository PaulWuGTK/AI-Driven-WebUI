export interface SoftwareModuleParameters {
  ExecEnvNumberOfEntries: number;
  ExecutionUnitNumberOfEntries: number;
  DeploymentUnitNumberOfEntries: number;
}

export interface DeploymentUnit {
  URL: string;
  Status: string;
  Vendor: string;
  UUID: string;
  Name: string;
  Version: string;
}

export interface LcmResponse {
  parameters: SoftwareModuleParameters;
  path: string;
}

export interface DeploymentUnitResponse {
  parameters: DeploymentUnit;
  path: string;
}

export type LcmApiResponse = (LcmResponse | DeploymentUnitResponse)[];