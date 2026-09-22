export interface WizardWifiInterface {
  InstanceIndex?: number;
  Alias?: string;
  OperatingFrequencyBand?: string;
  Enable: number;
  SSID: string;
  SecurityMode: string;
  SecurityModeAvailable: string;
  KeyPassPhrase: string;
}

export interface WizardWifiIntfGroup {
  InstanceIndex?: number;
  Alias?: string;
  Enable: number;
  SSID: string;
  KeyPassPhrase: string;
  SecurityMode: string;
  SecurityModeAvailable: string;
  CommonSSIDEnable: number;
  MLOEnable: number;
  Interface: WizardWifiInterface[];
}

export interface WizardData {
  ModelName: string;
  OpMode: string;
  Wan: {
    WANMode: string;
    WANModeList: string[];
  };
  WiFi: {
    MeshEnable: number;
    MFPConfig: number;
    PSC6g: number;
    IntfGroup: WizardWifiIntfGroup[];
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
      MeshEnable: number;
      MFPConfig: number;
      PSC6g: number;
      IntfGroup: Array<{
        Alias?: string;
        Enable: number;
        SSID: string;
        SecurityMode: string;
        KeyPassPhrase: string;
        CommonSSIDEnable: number;
        MLOEnable: number;
        Interface: Array<{
          Alias?: string;
          Enable: number;
          SSID: string;
          SecurityMode: string;
          KeyPassPhrase: string;
        }>;
      }>;
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
