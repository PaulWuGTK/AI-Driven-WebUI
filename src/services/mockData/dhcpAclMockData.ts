import type { DHCPACLRawConfig } from '../../types/dhcpAcl';

export const dhcpAclMockData: { DHCPACL: DHCPACLRawConfig } = {
  DHCPACL: {
    Enable: 0,
    MatchLogic: 'and',
    Option60: 0,
    VendorClassID: '',
    Option61: 0,
    ClientIdentifier: '',
    ListMatchLogic: 'and,or'
  }
};
