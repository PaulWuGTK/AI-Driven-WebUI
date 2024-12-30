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
    macAddress: string;
    speed: string;
    duplex: string;
    ipv4Address: string;
    status: string;
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
    enableServer: string;
    port: string;
    allowRootLogin: string;
    enablePasswordAuth: string;
    apply: string;
  };
  login: {
    title: string;
    username: string;
    password: string;
    submit: string;
    error: string;
  };
}