export interface QosPriorityConfig {
  Min: number;
  Max: number;
}

export interface QosBandwidthPriority {
  High: QosPriorityConfig;
  Medium: QosPriorityConfig;
  Low: QosPriorityConfig;
  'Low-latency': QosPriorityConfig;
}

export interface QosBandwidthData {
  Download: number;
  Upload: number;
  Priority: QosBandwidthPriority;
}

export interface QosBandwidthConfig {
  Enable: 0 | 1;
  Bandwidth: QosBandwidthData;
}

export interface QosBandwidthResponse {
  QosBandwidth: QosBandwidthConfig;
}

export interface QosApplicationType {
  ApplicationType: string;
  Port: string;
  Protocol: string;
}

export interface QosDevice {
  DeviceName: string;
  MACAddress: string;
}

export interface QosRule {
  Order: number;
  Type: 'Application' | 'Device';
  ApplicationName: string;
  DeviceName: string;
  MACAddress: string;
  Port: string;
  Protocol: string;
  Priority: string;
}

export interface QosRuleData {
  ApplicationTypeList: QosApplicationType[];
  DeviceList: QosDevice[];
  ProtocolList: string[];
  PriorityList: string[];
  RuleList: QosRule[];
}

export interface QosRuleResponse {
  QosRule: QosRuleData;
}

export interface QosRuleRequest {
  QosRule: {
    RuleList: QosRule[];
  };
}
