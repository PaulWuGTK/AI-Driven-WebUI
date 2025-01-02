// Translation type definitions
export interface Translations {
  [key: string]: string | { [key: string]: string };
  menu: {
    dashboard: string;
    status: string;
    wan: string;
    lan: string;
    wlan: string;
    statistics: string;
    wifiNeighbor: string;
    meshInfo: string;
    lcm: string;
    basicSetting: string;
    wireless: string;
    management: string;
    ntp: string;
    ssh: string;
    advanced: string;
    ddns: string;
  };
  header: {
    account: string;
    logout: string;
  };
  wan: {
    title: string;
    operationMode: string;
    sensingPolicy: string;
    sensingTimeout: string;
    wanMode: string;
    interface: string;
    name: string;
    macAddress: string;
    speed: string;
    duplex: string;
    ipv4Address: string;
    status: string;
    wanModeConfig: string;
    dnsMode: string;
    physicalType: string;
    origin: string;
    mode: string;
    address: string;
    gateway: string;
    dnsServer: string;
    subnetMask: string;
    type: string;
    prefix: string;
  };
  lan: {
    title: string;
    macAddress: string;
    mtu: string;
    ipv4: string;
    ipv6: string;
    name: string;
    ipAddress: string;
    netmask: string;
    status: string;
  };
  wlan: {
    title: string;
    channel: string;
    bandwidth: string;
    macAddress: string;
    interface: string;
    name: string;
    alias: string;
    status: string;
    ssid: string;
    authentication: string;
    encryption: string;
    password: string;
    bssid: string;
    auto: string;
    enable: string;
    disable: string;
  };
  statistics: {
    title: string;
    ethernet: string;
    wlan: string;
    port: string;
    rxBytes: string;
    rxPackets: string;
    rxError: string;
    rxDiscard: string;
    txBytes: string;
    txPackets: string;
    txError: string;
    txDiscard: string;
  };
  wifiNeighbor: {
    title: string;
    wifiNeighbor: string;
    ssid: string;
    bssid: string;
    channel: string;
    signal: string;
    security: string;
    wirelessMode: string;
    scan: string;
    scanning: string;
  };
  lcm: {
    title: string;
    execEnv: string;
    execUnits: string;
    deployUnits: string;
    deploymentUnits: string;
    name: string;
    status: string;
    url: string;
    uuid: string;
    vendor: string;
    version: string;
  };
  wireless: {
    title: string;
    basicConfig: string;
    advancedConfig: string;
    wpsConfig: string;
    meshNetwork: string;
    settings: string;
    ssid: string;
    password: string;
    mode: string;
    bandwidth: string;
    channel: string;
    autoChannel: string;
    wpsConfiguration: string;
    wpsPushButton: string;
    wpsPushButtonDesc: string;
    wpsPinConnect: string;
    wpsPinConnectDesc: string;
    generatePinCode: string;
    devicePinDesc: string;
    enterPin: string;
    connect: string;
    vapInformation: string;
    band: string;
    authentication: string;
    encryption: string;
    wpsStatus: string;
    easyMesh: string;
    commonSsidConfig: string;
  };
  ddns: {
    title: string;
    management: string;
    addService: string;
    editService: string;
    refresh: string;
    no: string;
    provider: string;
    domain: string;
    username: string;
    password: string;
    wanInterface: string;
    enable: string;
    status: string;
    lastUpdate: string;
    action: string;
    save: string;
    cancel: string;
    confirmDelete: string;
  };
  ntp: {
    title: string;
    currentTime: string;
    timeZoneSelect: string;
    automaticDaylight: string;
    enableNtp: string;
    ntpServer: string;
    cancel: string;
    apply: string;
    placeholder: string;
  };
  ssh: {
    title: string;
    serverManagement: string;
    publicKeyManagement: string;
    currentSessions: string;
    addServer: string;
    editServer: string;
    id: string;
    interface: string;
    status: string;
    port: string;
    autoDisableServer: string;
    connectionTimeout: string;
    keepAliveMessage: string;
    ipv4Prefix: string;
    ipv6Prefix: string;
    loginWithPassword: string;
    rootLogin: string;
    rootLoginWithPassword: string;
    enabled: string;
    disabled: string;
    edit: string;
    delete: string;
    action: string;
    enable: string;
    allowPasswordLogin: string;
    allowRootLogin: string;
    maxAuthTries: string;
    idleTimeout: string;
    confirmDelete: string;
    comment: string;
    publicKey: string;
    select: string;
    clickToView: string;
    key: string;
    viewKey: string;
    newSshKey: string;
    enterNewSshKey: string;
    confirmDeleteKey: string;
    user: string;
    clientAddress: string;
    clientPort: string;
    serverId: string;
    serverPort: string;
  };
  login: {
    title: string;
    username: string;
    password: string;
    submit: string;
    error: string;
  };
  common: {
    save: string;
    cancel: string;
    close: string;
    refresh: string;
    create: string;
    apply: string;
  },
}