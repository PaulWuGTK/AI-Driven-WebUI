export type DHCPACLMatchLogic = 'and' | 'or';

export interface DHCPACLRawConfig {
  Enable: 0 | 1 | boolean | string | number | null | undefined;
  MatchLogic: DHCPACLMatchLogic | string;
  Option60: 0 | 1 | boolean | string | number | null | undefined;
  VendorClassID: string;
  Option61: 0 | 1 | boolean | string | number | null | undefined;
  ClientIdentifier: string;
  ListMatchLogic?: string;
}

export interface DHCPACLConfig {
  Enable: boolean;
  MatchLogic: DHCPACLMatchLogic;
  Option60: boolean;
  VendorClassID: string;
  Option61: boolean;
  ClientIdentifier: string;
  ListMatchLogic: string;
}

export interface DHCPACLResponse {
  DHCPACL: DHCPACLConfig;
}

export interface DHCPACLUpdateRequest {
  DHCPACL: DHCPACLConfig;
}

export interface DHCPACLUpdatePayload {
  DHCPACL: {
    Enable: 0 | 1;
    MatchLogic: DHCPACLMatchLogic;
    Option60: 0 | 1;
    VendorClassID: string;
    Option61: 0 | 1;
    ClientIdentifier: string;
  };
}
