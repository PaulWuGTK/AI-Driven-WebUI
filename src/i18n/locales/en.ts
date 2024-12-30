import type { Translations } from './types';

// English translations
const translations: Translations = {
  menu: {
    dashboard: 'Dashboard',
    status: 'Status',
    wan: 'WAN',
    lan: 'LAN',
    wlan: 'WLAN',
    statistics: 'Statistics',
    wifiNeighbor: 'WiFi Neighbor',
    meshInfo: 'Mesh Information',
    lcm: 'LCM',
    basicSetting: 'Basic Setting',
    management: 'Management',
    ntp: 'NTP',
    ssh: 'SSH',
    advanced: 'Advanced',
    ddns: 'DDNS'
  },
  header: {
    account: 'Account',
    logout: 'Logout'
  },
  wan: {
    title: 'WAN Status',
    operationMode: 'Operation Mode',
    sensingPolicy: 'Sensing Policy',
    sensingTimeout: 'Sensing Timeout',
    wanMode: 'WAN Mode',
    interface: 'Interface',
    macAddress: 'MAC Address',
    speed: 'Speed',
    duplex: 'Duplex',
    ipv4Address: 'IPv4 Address',
    status: 'Status'
  },
  lan: {
    title: 'LAN',
    macAddress: 'MAC Address',
    mtu: 'MTU',
    ipv4: 'IPv4',
    ipv6: 'IPv6',
    name: 'Name',
    ipAddress: 'IP Address',
    netmask: 'Netmask',
    status: 'Status'
  },
  wlan: {
    title: 'WLAN Status',
    channel: 'Channel',
    bandwidth: 'Bandwidth',
    macAddress: 'MAC Address',
    interface: 'Interface',
    name: 'Name',
    alias: 'Alias',
    status: 'Status',
    ssid: 'SSID',
    authentication: 'Authentication',
    encryption: 'Encryption',
    password: 'Password',
    bssid: 'BSSID',
    auto: '(auto)',
    enable: 'Enable',
    disable: 'Disable'
  },
    statistics: {
    title: 'Statistics',
    ethernet: 'Statistics - Ethernet',
    wlan: 'Statistics - WLAN',
    port: 'Port',
    rxBytes: 'RxBytes',
    rxPackets: 'RxPackets',
    rxError: 'RxError',
    rxDiscard: 'RxDiscard',
    txBytes: 'TxBytes',
    txPackets: 'TxPackets',
    txError: 'TxError',
    txDiscard: 'TxDiscard'
  },
  wifiNeighbor: {
    title: 'WiFi Neighbor',
    wifiNeighbor: 'WiFi Neighbor',
    ssid: 'SSID',
    bssid: 'BSSID',
    channel: 'Channel',
    signal: 'Signal (%)',
    security: 'Security',
    wirelessMode: 'Wireless Mode',
    scan: 'SCAN',
    scanning: 'Scanning...'
  },
  lcm: {
    title: 'Status - LCM',
    execEnv: 'Execution Environments',
    execUnits: 'Execution Units',
    deployUnits: 'Deployment Units',
    deploymentUnits: 'Deployment Units',
    name: 'Name',
    status: 'Status',
    url: 'URL',
    uuid: 'UUID',
    vendor: 'Vendor',
    version: 'Version'
  },
  ddns: {
    title: 'DDNS Settings',
    management: 'DDNS Management',
    addService: 'Add Service',
    editService: 'Edit Service',
    refresh: 'Refresh',
    no: 'No',
    provider: 'Service Provider',
    domain: 'Domain Name',
    username: 'Username',
    password: 'Password',
    wanInterface: 'WAN Interface',
    enable: 'Enable',
    status: 'Status',
    lastUpdate: 'Last Update Time',
    action: 'Action',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Are you sure you want to delete this DDNS service?'
  },
  ntp: {
    title: 'NTP',
    currentTime: 'Current Time',
    timeZoneSelect: 'Time Zone Select',
    automaticDaylight: 'Automatically Adjust for Daylight Saving',
    enableNtp: 'Enable NTP client Update',
    ntpServer: 'NTP server',
    cancel: 'Cancel',
    apply: 'Apply',
    placeholder: 'Please Enter the value'
  },
  ssh: {
    title: 'SSH Settings',
    enableServer: 'Enable SSH Server',
    port: 'Port',
    allowRootLogin: 'Allow Root Login',
    enablePasswordAuth: 'Enable Password Authentication',
    apply: 'Apply'
  },
  login: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    submit: 'Login',
    error: 'Invalid username or password'
  },
};

export default translations;