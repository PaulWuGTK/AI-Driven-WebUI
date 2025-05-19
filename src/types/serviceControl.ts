export interface ServiceControlRule {
  DestPort: string;
  Protocol: string;
  Action: string;
  Enable: boolean;
  Service: string;
  Interface: string;
  IPVersion: number;
  SourceIPStart?: string;
  SourceIPEnd?: string;
}

export interface ProtocolOption {
  value: string;
  label: string;
}

export interface IPVersionOption {
  value: string;
  label: string;
}

export interface InterfaceOption {
  value: string;
  label: string;
}

export interface ServiceOption {
  value: string;
  port: string;
  protocol: string;
}

export interface ServiceControlOptions {
  Protocols: ProtocolOption[];
  IPVersions: IPVersionOption[];
  Interfaces: InterfaceOption[];
  Services: ServiceOption[];
}

export interface ServiceControlResponse {
  AdvancedServiceControl: {
    Rules: ServiceControlRule[];
    ACLAvailableOptions: ServiceControlOptions;
  };
}

export interface ServiceControlUpdateRequest {
  AdvancedServiceControl: {
    Rules: ServiceControlRule[];
  };
}