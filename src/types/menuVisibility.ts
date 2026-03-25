export type NetLayoutType = 'prpl' | 'genix' | 'cht';
export type OperationMode = 'Init' | 'Gateway' | 'Bridge' | 'Extender';
export type UserRole = 'super' | 'normal';

export interface RoleVisibilityRule {
  super: boolean;
  normal: boolean;
}

export interface MenuVisibilityRule {
  netLayoutTypes: {
    prpl: boolean;
    genix: boolean;
    cht: boolean;
  };
  operationModes: {
    Init: boolean;
    Gateway: boolean;
    Bridge: boolean;
    Extender: boolean;
  };
  roles?: RoleVisibilityRule;
}

export interface MenuVisibilityRules {
  [menuKey: string]: MenuVisibilityRule;
}

export const menuVisibilityRules: MenuVisibilityRules = {
  'setupWizard': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: true, Gateway: false, Bridge: false, Extender: false }
  },
  'home': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'status': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'status.wan': {
    netLayoutTypes: { prpl: true, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'status.wanCht': {
    netLayoutTypes: { prpl: false, genix: false, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'status.wanFailover': {
    netLayoutTypes: { prpl: false, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'status.lan': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'status.lanCht': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: false, Bridge: true, Extender: true }
  },
  'status.wlan': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'status.statistics': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'status.throughput': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'status.wifiNeighbor': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'status.meshInfo': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: false }
  },
  'status.lcm': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'status.dualImage': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'status.cellular': {
    netLayoutTypes: { prpl: false, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'status.log': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'basicSetup': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'basicSetup.wan': {
    netLayoutTypes: { prpl: true, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.wanCht': {
    netLayoutTypes: { prpl: false, genix: false, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.backupWan': {
    netLayoutTypes: { prpl: false, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.lan': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.lanCht': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: false, Bridge: true, Extender: true }
  },
  'basicSetup.lan.ipv4': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'basicSetup.lan.ipv6': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'basicSetup.lan.deviceConnected': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.wlan': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'basicSetup.wlan.basicConfig': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: false }
  },
  'basicSetup.wlan.basicConfigMulti': {
    netLayoutTypes: { prpl: false, genix: false, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: false }
  },
  'basicSetup.wlan.advancedConfig': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: false }
  },
  'basicSetup.wlan.wpsConfig': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: false }
  },
  'basicSetup.wlan.meshNetwork': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: false }
  },
  'basicSetup.wlan.wifiZones': {
    netLayoutTypes: { prpl: false, genix: false, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.wlan.wirelessExtender': {
    netLayoutTypes: { prpl: false, genix: false, cht: false },
    operationModes: { Init: false, Gateway: false, Bridge: false, Extender: true }
  },
  'basicSetup.wlan.wirelessMacFilter': {
    netLayoutTypes: { prpl: false, genix: false, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.cellular': {
    netLayoutTypes: { prpl: false, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.operationMode': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'basicSetup.nat': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.nat.portForwarding': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.nat.dmzHost': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.nat.alg': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.security': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.security.ipFiltering': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.security.macFiltering': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'basicSetup.routing': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'advanceSetup': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'advanceSetup.sshService': {
    netLayoutTypes: { prpl: true, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'advanceSetup.serviceControl': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'advanceSetup.mcl': {
    netLayoutTypes: { prpl: false, genix: false, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'advanceSetup.mcl.mgmt': {
    netLayoutTypes: { prpl: false, genix: false, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'advanceSetup.mcl.trustDomain': {
    netLayoutTypes: { prpl: false, genix: false, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'advanceSetup.qos': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'advanceSetup.lcm': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'application': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'application.upnp': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'application.ddns': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: false, Extender: false }
  },
  'application.storageService': {
    netLayoutTypes: { prpl: false, genix: false, cht: false },
    operationModes: { Init: false, Gateway: false, Bridge: false, Extender: false }
  },
  'management': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.reboot': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.account': {
    netLayoutTypes: { prpl: true, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.accountCht': {
    netLayoutTypes: { prpl: false, genix: false, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.ntp': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.device': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.settings': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.settings.resetToDefault': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.settings.backupRestore': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.settings.updateSoftware': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.tools': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.tools.pingDiagnosis': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.tools.traceRoute': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'management.tools.dnsDiagnosis': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'speedtest': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'speedtest.xperienceControl': {
    netLayoutTypes: { prpl: false, genix: true, cht: false },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  },
  'speedtest.tr471': {
    netLayoutTypes: { prpl: true, genix: true, cht: true },
    operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true }
  }
};

// Source: PRPL CPE WebUI.csv (super user vs normal user)
// Only role-differentiated entries are listed here.
export const menuRoleVisibilityRules: Record<string, RoleVisibilityRule> = {
  'basicSetup.nat': { super: true, normal: false },
  'basicSetup.nat.portForwarding': { super: true, normal: false },
  'basicSetup.nat.dmzHost': { super: true, normal: false },
  'basicSetup.nat.alg': { super: true, normal: false },
  'basicSetup.security': { super: true, normal: false },
  'basicSetup.security.ipFiltering': { super: true, normal: false },
  'basicSetup.security.macFiltering': { super: true, normal: false },
  'basicSetup.routing': { super: true, normal: false },
  'advanceSetup': { super: true, normal: false },
  'advanceSetup.sshService': { super: true, normal: false },
  'advanceSetup.serviceControl': { super: true, normal: false },
  'advanceSetup.mcl': { super: true, normal: false },
  'advanceSetup.mcl.mgmt': { super: true, normal: false },
  'advanceSetup.mcl.trustDomain': { super: true, normal: false },
  'advanceSetup.qos': { super: true, normal: false },
  'advanceSetup.lcm': { super: true, normal: false },
  'application': { super: true, normal: false },
  'application.upnp': { super: true, normal: false },
  'application.ddns': { super: true, normal: false },
  'management.account': { super: true, normal: false },
  'management.accountCht': { super: true, normal: false },
  'management.device': { super: true, normal: false }
};

export function isMenuVisible(
  menuKey: string,
  netLayoutType: NetLayoutType,
  operationMode: OperationMode,
  features?: { cellular?: boolean; matter?: boolean; thread?: boolean },
  userRole: UserRole = 'super'
): boolean {
  const rule = menuVisibilityRules[menuKey];

  if (!rule) {
    const roleRule = menuRoleVisibilityRules[menuKey];
    return roleRule ? roleRule[userRole] : true;
  }

  if (menuKey.includes('cellular') && features?.cellular === false) {
    return false;
  }

  const netLayoutVisible = rule.netLayoutTypes[netLayoutType];
  const operationModeVisible = rule.operationModes[operationMode];
  const roleRule = rule.roles ?? menuRoleVisibilityRules[menuKey];
  const roleVisible = roleRule ? roleRule[userRole] : true;

  return netLayoutVisible && operationModeVisible && roleVisible;
}
