export interface InterfaceOption {
  value: string;
  label: string;
}

export interface PortMapping {
  Path: string;
  Description: string;
  ExternalPort: number;
  Id: number;
  Origin: string;
  InternalPort: number;
  RemainingLeaseTime: number;
  LeaseDuration: number;
  RemoteHost: string;
  Enable: 0 | 1;
  Interface: string;
  Status: string;
  InternalClient: string;
  Protocol: string;
  ExternalPortEnd: number;
}

export interface PortMappingStats {
  total: number;
}

export interface ApplicationUpnp {
  Enable: 0 | 1;
  InterfaceOptions?: InterfaceOption[];
  Interface: string;
  PortMappings?: PortMapping[];
  PortMappingStats?: PortMappingStats;
}

export interface UpnpResponse {
  ApplicationUpnp: ApplicationUpnp;
}

export interface UpnpUpdateRequest {
  ApplicationUpnp: {
    Enable: 0 | 1;
    Interface: string;
  };
}

export interface UpnpUpdateResponse {
  ApplicationUpnp: {
    status: 'success' | 'invalid_payload';
  };
}
