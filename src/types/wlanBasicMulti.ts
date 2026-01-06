// Types for the multi-SSID Basic Config screen (WlanGroup-based schema).
// This file is intentionally separate from the legacy WlanBasic* types to avoid breaking existing pages.

/** A UI/JSON union for 0/1 style booleans used by the backend. */
export type BooleanInt = 0 | 1;

export type WlanBandName = '2.4GHz' | '5GHz' | '6GHz';

export interface WlanGroupBandSetting {
  /** e.g., "2.4GHz", "5GHz", "6GHz" */
  Band: WlanBandName | string;
  Enable: BooleanInt;
}

export interface WlanGroupInterface {
  /** Often an interface name or alias, may be empty. */
  Name?: string;

  /** A unique ID or alias; presence depends on backend. */
  Alias?: string;

  /** e.g., "2.4GHz", "5GHz", "6GHz" */
  Band: WlanBandName | string;

  Enable: BooleanInt;
  SSID: string;

  /** e.g., "WPA2-Personal" etc. */
  SecurityMode: string;

  /** Comma-separated list of security modes supported for this interface */
  SecurityModeAvailable?: string;

  /**
   * WPA pre-shared key / passphrase.
   * Backend sometimes uses "KeyPassPhrase"; UI should write back as "KeyPassPhrase".
   */
  KeyPassPhrase?: string;

  /**
   * Some backends still expose "WpaPreShareKey". Keep optional for compatibility.
   * UI should prefer KeyPassPhrase when posting.
   */
  WpaPreShareKey?: string;

  /** Management Frame Protection configuration */
  MFPConfig?: string | number;

  /** Reference to AccessPoint object in TR-181 data model */
  AccessPointReference?: string;

  /** Reference to SSID object in TR-181 data model */
  SSIDReference?: string;

  /** SSID Advertisement flag: 1 = show SSID (Hide SSID off), 0 = hide SSID (Hide SSID on) */
  SSIDAdvertisementEnabled?: BooleanInt;
}

export interface WlanGroup {
  /** Display order index for sorting */
  Index?: number;

  /** Group-level enable flag */
  Enable?: BooleanInt;

  /** Backend alias identifier (e.g., "PRIV", "GUEST") */
  Alias?: string;

  /** Group-level SSID (may be used when CommonSSIDEnable is true) */
  SSID?: string;

  /** Group-level security mode */
  SecurityMode?: string;

  /** Group-level passphrase */
  KeyPassPhrase?: string;

  CommonSSIDEnable: BooleanInt;
  MLOEnable: BooleanInt;

  /** Bridge interface name (e.g., "br-lan") */
  BridgeInterface?: string;

  /** Management Frame Protection at group level */
  MFPConfig?: string | number;

  /** Available security modes at group level */
  SecurityModeAvailable?: string;

  /** Band toggles for the group when Common SSID is enabled */
  CommonSSIDBandSetting?: WlanGroupBandSetting[];

  /** Per-band interface settings */
  Interface: WlanGroupInterface[];

  /** SSID Advertisement flag: 1 = show SSID (Hide SSID off), 0 = hide SSID (Hide SSID on) */
  SSIDAdvertisementEnabled?: BooleanInt;
}

export interface WlanBasicMultiGetResponse {
  WlanBasic: {
    /**
     * Array of SSID groups.
     * Each group contains CommonSSID/MLO flags and per-band Interface items.
     */
    WlanGroup: WlanGroup[];
  };
}

export interface WlanBasicMultiPostRequest {
  WlanGroup: Array<{
    Index?: number;
    Enable?: BooleanInt;
    Alias: string;
    SSID?: string;
    KeyPassPhrase?: string;
    SecurityMode?: string;
    CommonSSIDEnable: BooleanInt;
    MLOEnable: BooleanInt;
    BridgeInterface?: string;
    MFPConfig?: string | number;
    SSIDAdvertisementEnabled?: BooleanInt;
    Interface: Array<{
      Enable: BooleanInt;
      Band: string;
      Alias?: string;
      SSID: string;
      KeyPassPhrase?: string;
      SecurityMode: string;
      MFPConfig?: string | number;
      AccessPointReference?: string;
      SSIDReference?: string;
      SSIDAdvertisementEnabled?: BooleanInt;
    }>;
  }>;
}
