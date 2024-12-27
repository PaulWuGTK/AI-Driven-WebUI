export interface DdnsProvider {
  Name: string;
  Username: string;
  Password: string;
  Domain: string;
  Status: string;
}

export interface DdnsResponse {
  Ddns: {
    Providers: DdnsProvider[];
  }
}

export interface DdnsUpdateRequest {
  Ddns: {
    Provider: string;
    Username: string;
    Password: string;
    Domain: string;
  }
}