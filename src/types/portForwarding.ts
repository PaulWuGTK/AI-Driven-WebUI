export interface PortForwardRule {
  No: number;
  Enable: boolean;
  Description: string;
  Protocol: string;
  Interface: string;
  ExternalPortRange: string;
  InternalPort: string;
  InternalIPAdress: string;
}

export interface PortForwardingConfig {
  WanList: string[];
  ProtoList: string[];
  PortForwardList: PortForwardRule[];
}

export interface PortForwardingResponse {
  PortForwarding: PortForwardingConfig;
}

export interface PortForwardingUpdateRequest {
  PortForwarding: {
    PortForwardList: PortForwardRule[];
  };
}

export interface PortForwardingApiResponse {
  OK?: string;
  NOK?: string;
}
