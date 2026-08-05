export interface WizardWifiInfo {
  Enable: number;
  SSID: string;
  SecurityMode: string;
  SecurityModeAvailable: string;
  Password: string;
}

export interface WizardData {
  ModelName: string;
  OpMode: string;
  Wan: {
    WANMode: string;
    WANModeList: string[];
  };
  WiFi: {
    CommonSSIDEnable: number;
    MLOEnable: number;
    MeshEnable: number;
    MFPConfig: number;
    PSC6g: number;
    wificommon: WizardWifiInfo;
    wifi2g: WizardWifiInfo;
    wifi5g: WizardWifiInfo;
    wifi6g: WizardWifiInfo;
  };
  TimeZone: {
    CurrentTimezone: string;
    Timezonelist: string[];
  };
}

export interface WizardConfig {
  mode: 'router' | 'agent';
  wan: {
    wanMode: string;
  };
  wifi: {
    smartConnect: boolean;
    mloEnable: boolean;
    psc: boolean;
    pmf: boolean;
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
  timezone: {
    currentTimezone: string;
  };
}

export interface WizardSubmitData {
  WizardRouter: {
    Action: 'Config' | 'Skip';
    Wan?: {
      WANMode: string;
    };
    WiFi?: {
      CommonSSIDEnable: number;
      MLOEnable: number;
      MeshEnable: number;
      MFPConfig: number;
      PSC6g: number;
      wificommon: {
        Enable: number;
        SSID: string;
        SecurityMode: string;
        Password: string;
      };
      wifi2g: {
        Enable: number;
        SSID: string;
        SecurityMode: string;
        Password: string;
      };
      wifi5g: {
        Enable: number;
        SSID: string;
        SecurityMode: string;
        Password: string;
      };
      wifi6g: {
        Enable: number;
        SSID: string;
        SecurityMode: string;
        Password: string;
      };
    };
    Admin?: {
      Username: string;
      Password: string;
    };
    TimeZone?: {
      CurrentTimezone: string;
    };
  };
}

export interface WizardSkipData {
  WizardRouter: {
    Action: 'Skip';
  };
}

export interface WizardSubmitResponse {
  WizardRouter: {
    ok: boolean;
    message: string;
    job_id: string;
    eta_seconds: number;
  };
}

export type AgentSetupMode = 'wps' | 'ethernet';

export interface WizardAgentOnboardingRequest {
  WizardAgent: {
    Action: 'Onboarding';
    Method: 'Ethernet' | 'WPS';
  };
}

export interface WizardAgentStatusResponse {
  WizardAgent: {
    LinkStatus?: 'Down' | 'Up';
    OnboardingStatus: string;
  };
}

export interface WizardAgentEndPageRequest {
  WizardAgent: {
    Action: 'EndPage';
  };
}
