export interface PortForwarding {
  Protocol: string;
  ExternalPort: number;
  Interface: string;
  InternalPort: number;
}

export interface NetworkConfig {
  ShareParentNetwork: 0 | 1;
  AccessInterfaces: string[];
  PortForwarding: PortForwarding[];
}

export interface HostObject {
  Source: string;
  Destination: string;
  Type: string;
}

export interface AutoRestart {
  Enable: 0 | 1;
  MaxRetryCount: number;
}

export interface DeploymentUnitItem {
  Name: string;
  UUID: string;
  DUID: string;
  Version: string;
  Status: string;
  Description: string;
  InstalledEE: string;
  URL: string;
  Privileged: 0 | 1;
  NetworkConfig: NetworkConfig;
  HostObject: HostObject[];
  AutoRestart: AutoRestart;
}

export interface ExecEnvOption {
  Name: string;
}

export interface LcmDeploymentUnitConfig {
  DUList: DeploymentUnitItem[];
  ExecEnvList: ExecEnvOption[];
  InterfaceList: string[];
  ProtocolList: string[];
  HostObjectMountType: string[];
}

export interface LcmDeploymentUnitResponse {
  AdvancedLcmDeploymentUnit: LcmDeploymentUnitConfig;
}

export interface LcmDeploymentUnitInstallRequest {
  AdvancedLcmDeploymentUnit: {
    Action: 'Install';
    URL: string;
    UUID: string;
    Username: string;
    Password: string;
    InstalledEE: string;
    Privileged: 0 | 1;
    NetworkConfig: NetworkConfig;
    HostObject: HostObject[];
    AutoRestart: AutoRestart;
  };
}

export interface LcmDeploymentUnitUpdateRequest {
  AdvancedLcmDeploymentUnit: {
    Action: 'Update';
    URL: string;
    UUID: string;
    DUID: string;
    Username: string;
    Password: string;
    InstalledEE: string;
    Privileged: 0 | 1;
    NetworkConfig: NetworkConfig;
    HostObject: HostObject[];
    AutoRestart: AutoRestart;
  };
}

export interface LcmDeploymentUnitUninstallRequest {
  AdvancedLcmDeploymentUnit: {
    Action: 'Uninstall';
    DUID: string;
  };
}

export type LcmDeploymentUnitRequest =
  | LcmDeploymentUnitInstallRequest
  | LcmDeploymentUnitUpdateRequest
  | LcmDeploymentUnitUninstallRequest;
