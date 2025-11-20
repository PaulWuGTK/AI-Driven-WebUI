export interface WizardWifiInfo {
  Enable: number;
  SSID: string;
  SecurityMode: string;
  SecurityModeAvailable: string;
  Password: string;
}

export interface WizardData {
  wizardCheck: boolean;
  WANMode: string;
  wifi: {
    CommonSSIDEnable: number;
    MLOEnable: number;
    MeshEnable: number;
    wifimlo: WizardWifiInfo;
    wifi2g: WizardWifiInfo;
    wifi5g: WizardWifiInfo;
    wifi6g: WizardWifiInfo;
  };
  MeshEnable: number;
  modeList: string[];
  WANModeList: string[];
}

export interface WizardConfig {
  mode: 'router' | 'agent';
  wan: {
    wanMode: string;
  };
  wifi: {
    smartConnect: boolean;
    mloEnable: boolean;
    common: {
      ssid: string;
      security: string;
      password: string;
      securityOptions: string[];
    };
    bands: {
      '2g': { enabled: boolean; ssid: string; security: string; password: string; securityOptions: string[] };
      '5g': { enabled: boolean; ssid: string; security: string; password: string; securityOptions: string[] };
      '6g': { enabled: boolean; ssid: string; security: string; password: string; securityOptions: string[] };
    };
  };
  mesh: {
    enable: boolean;
  };
  admin: {
    username: string;
    password: string;
  };
}

export interface WizardSubmitData {
  Wizard: {
    mode: string;
    wan: {
      wanMode: string;
    };
    wifi: {
      smartConnect: number;
      MLOEnable: number;
      common: {
        Enable: number;
        SSID: string;
        SecurityMode: string;
        Password: string;
      };
      bands: {
        '2g': {
          Enable: number;
          SSID: string;
          SecurityMode: string;
          Password: string;
        };
        '5g': {
          Enable: number;
          SSID: string;
          SecurityMode: string;
          Password: string;
        };
        '6g': {
          Enable: number;
          SSID: string;
          SecurityMode: string;
          Password: string;
        };
      };
    };
    mesh: {
      MeshEnable: number;
    };
    admin: {
      username: string;
      password: string;
    };
  };
}

export interface WizardSubmitResponse {
  Wizard: {
    ok: boolean;
    message: string;
    job_id: string;
    eta_seconds: number;
  };
}

export type AgentSetupMode = 'wps' | 'ethernet';
