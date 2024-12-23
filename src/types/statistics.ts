export interface StatisticsEntry {
  Port: string;
  RxBytes: string;
  RxPackets: string;
  RxError: string;
  RxDiscard: string;
  TxBytes: string;
  TxPackets: string;
  TxError: string;
  TxDiscard: string;
}

export interface StatisticsResponse {
  Statistics: {
    Ethernet: StatisticsEntry[];
    Wlan: StatisticsEntry[];
  }
}