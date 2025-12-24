export interface TR471IncrementalResult {
  Index: number;
  IPLayerCapacity: string;
  RTTRange: string;
  PDVRange: string;
  LossRatio: string;
}

export interface TR471Config {
  Server: string;
  Port: string;
  Role: string;
  MTU: string;
  DSCP: string;
  Interface: string;
  ProtocolVersion: string;
  RateAdjAlgorithm: string;
  JumboFramesPermitted: number;
  LocalInterfaceRateIncluded: number;
  IPDVEnable: number;
  FlowCount: string;
  MaximumFlows: string;
  EthernetPriority: string;
  UDPPayloadContent: string;
  MaximumTestBandwidth: string;
  StartSendingRate: string;
  StartSendingRateIndex: string;
  NumberTestSubIntervals: string;
  NumberFirstModeTestSubIntervals: string;
  TestSubInterval: string;
  StatusFeedbackInterval: string;
  RetryThresh: string;
  TestType: string;
  SeqErrThresh: string;
  ReordDupIgnoreEnable: number;
  LowerThresh: string;
  UpperThresh: string;
  SlowAdjThresh: string;
  HighSpeedDelta: string;
  AuthenticationEnabled: number;
  AuthenticationCode: string;
  DiagnosticsState?: string;
  MaxIPLayerCapacity?: string;
  LossRatioSummary?: string;
  RTTRangeSummary?: string;
  PDVRangeSummary?: string;
  ListUDPPayloadContent?: string[];
  ListTestType?: string[];
  ListProtocolVersion?: string[];
  ListInterface?: string[];
  ListRateAdjAlgorithm?: string[];
  IncrementalResult?: TR471IncrementalResult[];
}

export interface TR471Response {
  TR471: TR471Config;
}

export interface TR471TestResult {
  MaxIPLayerCapacity: string;
  LossRatioSummary: string;
  RTTRangeSummary: string;
  PDVRangeSummary: string;
  IncrementalResult: TR471IncrementalResult[];
}
