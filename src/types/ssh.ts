export interface SshServer {
  ID: string;
  Interface: string;
  Status: string;
  AllowAllIPv4: number;
  AllowAllIPv6: number;
  AllowPasswordLogin: number;
  AllowRootLogin: number;
  AllowRootPasswordLogin: number;
  AutoDisableDuration: number;
  Enable: number;
  IPv4AllowedSourcePrefix: string;
  IPv6AllowedSourcePrefix: string;
  IdleTimeout: number;
  KeepAlive: number;
  MaxAuthTries: number;
  Port: number;
}

export interface SshServerResponse {
  SshServer: {
    Interfaces: string[];
    SshServers: SshServer[];
  }
}

export interface SshAuthorizedKey {
  Key: string;
  Comment: string;
}

export interface SshAuthorizedKeyResponse {
  SshAuthorizedKey: SshAuthorizedKey[];
}

export interface SshSession {
  User: string;
  ClientIP: string;
  ClientPort: number;
  ServerID: string;
  ServerPort: number;
}

export interface SshSessionResponse {
  SshSession: SshSession[];
}