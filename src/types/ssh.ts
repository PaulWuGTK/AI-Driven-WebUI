export interface SshConfig {
  Enable: number;
  Port: string;
  RootLogin: number;
  PasswordAuth: number;
}

export interface SshResponse {
  Ssh: SshConfig;
}

export interface SshUpdateRequest {
  Ssh: SshConfig;
}