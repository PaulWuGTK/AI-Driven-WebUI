export interface DdnsService {
  ID: string;
  ServProv: string;
  ServUsername: string;
  ServPassword: string;
  DomainName: string;
  UpdatedIP: string;
  Status?: string;
  LastUpdate?: string;
  HostEnable: number;
}

export interface DdnsResponse {
  Ddns: {
    ServNum: number;
    SupServProv: string[];
    Interfaces: string[];
    Service: DdnsService[];
  }
}

export interface DdnsUpdateRequest {
  Ddns: {
    Service: DdnsService[];
  }
}