// Common types
export interface Interface {
  Name: string;
  IPv4Enable: boolean;
  IPv6Enable: boolean;
  Interface: string;
}

// Ping types
export interface IPPingConfig {
  AverageResponseTimeDetailed: string;
  DataBlockSize: string;
  DiagnosticsState: string;
  FailureCount: string;
  Host: string;
  Interface: string;
  MaximumResponseTimeDetailed: string;
  MinimumResponseTimeDetailed: string;
  NumberOfRepetitions: string;
  ProtocolVersion: string;
  SuccessCount: string;
  Timeout: string;
}

// Trace Route types
export interface RouteHop {
  HostAddress: string;
  RTTimes: string;
  Host: string;
  ErrorCode: string;
}

export interface TraceRouteConfig {
  DataBlockSize: string;
  DiagnosticsState: string;
  Host: string;
  IPAddressUsed: string;
  Interface: string;
  MaxHopCount: string;
  NumberOfTries: string;
  ProtocolVersion: string;
  RouteHopsNumberOfEntries: string;
  Timeout: string;
  RouteHops: RouteHop[];
}

// DNS Lookup types
export interface DNSResult {
  Status: string;
  AnswerType: string;
  IPAddresses: string;
  HostNameReturned: string;
  ResponseTime: string;
  DNSServerIP: string;
}

export interface DNSLookupConfig {
  DNSServer: string;
  DiagnosticsState: string;
  HostName: string;
  Interface: string;
  NumberOfRepetitions: string;
  ResultNumberOfEntries: string;
  SuccessCount: string;
  Timeout: string;
  Result: DNSResult[];
}

export interface DiagnosticsResponse {
  ManagementDiagnostic: {
    IPPing: IPPingConfig;
    TraceRoute: TraceRouteConfig;
    DNSLookup: DNSLookupConfig;
    Interfaces: Interface[];
  }
}

// Request types
export interface PingRequest {
  SetNSubscribe: {
    DM: string;
    filter: string;
    Parameters: {
      DiagnosticsState: string;
      Interface: string;
      ProtocolVersion: string;
      NumberOfRepetitions: number;
      Host: string;
      Timeout: number;
      DataBlockSize: number;
    };
  };
}

export interface TraceRouteRequest {
  ManagementDiagnostic: {
    DM: string;
    filter: string;
    Parameters: {
      DiagnosticsState: string;
      Interface: string;
      ProtocolVersion: string;
      Host: string;
      Timeout: number;
      MaxHopCount: number;
      DataBlockSize: number;
      NumberOfTries: number;
    };
  };
}

export interface DNSLookupRequest {
  SetNSubscribe: {
    DM: string;
    filter: string;
    Parameters: {
      DiagnosticsState: string;
      Interface: string;
      HostName: string;
      DNSServer: string;
      Timeout: number;
      NumberOfRepetitions: number;
    };
  };
}