export interface ThroughputData {
  Receive: string;
  Sent: string;
  interface?: string;
}

export interface SystemStatsResponse {
  StatusSystemStat: {
    LAN: ThroughputData[];
    WAN: ThroughputData[];
    WiFi: {
      wifi2g: ThroughputData;
      wifi5g: ThroughputData;
      wifi6g: ThroughputData;
    };
  };
}

export interface ChartDataPoint {
  time: string;
  rx: number;
  tx: number;
}

export interface FormattedThroughputData {
  rx: number;
  tx: number;
  timestamp: number;
  interface: string;
}

export interface ChartDataSeries {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
  }[];
}

export type ThroughputType = 'WAN' | 'LAN' | 'WiFi';
export type WifiBand = '2.4G' | '5G' | '6G';