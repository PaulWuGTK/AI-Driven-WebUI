export interface ThreadStats {
  'RX Dropped': number;
  'TX Bytes': number;
  'RX Errors': number;
  'RX Bytes': number;
  'TX Packets': number;
  'RX Packets': number;
  'TX Dropped': number;
  'TX Errors': number;
}

export interface ThreadLeaderData {
  DataVersion: number;
  LeaderRouterID: number;
  StableDataVersion: number;
  PartitionID: number;
  Weighting: number;
}

export interface ThreadPAN {
  ExtendedMAC: string;
  Channel: number;
  RSSI: number;
  LQI: number;
  PanId: string;
}

export interface ThreadDataset {
  Channel?: number;
  ChannelMask?: number[] | number;
  ExtendedPanId?: string;
  MeshLocalPrefix?: string;
  NetworkKey?: string;
  NetworkName?: string;
  PSKc?: string;
  PanId?: string;
  TimeStamp?: string;
  SecurityPolicy?: string;
  'Hex-encoded': string;
}

export interface ThreadMLE {
  Stats: ThreadStats;
  LeaderData: ThreadLeaderData;
  Rloc16: string;
  Role: string;
  FirmwareVersion: string;
  Dataset: ThreadDataset;
  ExtendedMAC: string;
  Interface: string;
}

export interface ThreadBorderRouter {
  Status: string;
  BorderAgentID: string;
  MLE: ThreadMLE;
}

export interface ThreadStatusResponse {
  ThreadStatus: {
    'Border Router': ThreadBorderRouter;
  };
}

export interface ThreadScanPAN {
  PanId: string;
  ExtendedMAC: string;
  Channel: number;
  RSSI: number;
  LQI: number;
}

export interface ThreadScanResponse {
  ThreadScan: {
    PANs: ThreadScanPAN[];
  };
}

export interface ThreadSecurityPolicy {
  AutonomousEnrollment: boolean;
  CommercialCommissioning: boolean;
  ExternalCommissioning: boolean;
  NativeCommissioning: boolean;
  NetworkKeyProvisioning: boolean;
  NonCcmRouters: boolean;
  ObtainNetworkKey: boolean;
  RotationTime: number;
  Routers: boolean;
  TobleLink: boolean;
}

export interface ThreadDatasetConfig {
  'Active Timestamp'?: number;
  'Pending Timestamp'?: number;
  Delay?: number;
  NetworkName: string;
  NetworkKey: string;
  Channel: number;
  ChannelMask: number;
  PanId: string;
  ExtPanId: string;
  MeshLocalPrefix: string;
  PSKc: string;
  SecurityPolicy: ThreadSecurityPolicy;
}

export interface ThreadConfiguration {
  Enable: boolean;
  ActiveDataset: ThreadDatasetConfig;
  PendingDataset: ThreadDatasetConfig;
}

export interface ThreadConfigurationResponse {
  ThreadConfiguration: ThreadConfiguration;
}

export interface ThreadConfigurationUpdateRequest {
  ThreadConfiguration: {
    Enable: boolean;
    Type: 'Active' | 'Pending';
    Mode: 'Auto' | 'Manual';
    Dataset: ThreadDatasetConfig;
  };
}

export interface ThreadJoinNetworkRequest {
  ThreadJoinNetwork: {
    'Credential Type': 'NetworkKey' | 'PSKd';
    'Credential Value': string;
  };
}

export interface ThreadJoinNetworkResponse {
  ThreadJoinNetwork: {
    Status: string;
  };
}

export interface ThreadJoiner {
  JoinerId: string;
  Pskd: string;
  Timeout: number;
}

export interface ThreadCommissionerResponse {
  ThreadCommissioner: {
    Enable: boolean;
    Joiners: ThreadJoiner[];
  };
}

export interface ThreadCommissionerUpdateRequest {
  ThreadCommissioner: {
    Enable: boolean;
    Operation: 'Add' | 'Delete';
    JoinerId: string;
    Pskd: string;
    Timeout: number;
  };
}

export interface ThreadLinkQuality {
  LinkQualityIn: number;
  LinkQualityOut: number;
  RouteCost: number;
}

export interface ThreadLink {
  Quality: ThreadLinkQuality;
  Type: string;
}

export interface ThreadNodeMode {
  FullNetworkData: boolean;
  FullThreadDevice: boolean;
  RxOnWhenIdle: boolean;
}

export interface ThreadNode {
  ClientId: number;
  IPv6AddressList: string[];
  Mode: ThreadNodeMode;
  Rloc16: string;
  Role: string;
  RouterId: number;
}

export interface ThreadTopologyResponse {
  ThreadTopology: {
    Links: Record<string, ThreadLink>;
    Nodes: Record<string, ThreadNode>;
  };
}