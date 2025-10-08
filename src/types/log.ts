export interface LogEntry {
  host: string;
  ts: string;
  program: string;
  severity: string;
  raw: string;
  message: string;
  module: string;
}

export interface LogResponse {
  StatusLog: {
    categories?: Record<string, {
      alias: string;
      pattern: string;
    }>;
    matchCount: number;
    source: string;
    count: number;
    more: boolean;
    serverTime: string;
    entries: LogEntry[];
    limitDefault?: number;
    limitMax?: number;
    url?: string;
    filename?: string;
    size?: number;
  };
}

export interface LogRequest {
  StatusLog: {
    limit?: number;
    categories?: Record<string, number>;
    contains?: string;
    export?: string;
  };
}

export type LogSeverity = 'All' | 'Error' | 'Warning' | 'Info';

export type LogCategory =
  | 'all'
  | 'dhcp'
  | 'lcm'
  | 'wifi'
  | 'firewall';
