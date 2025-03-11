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
    wireless: 'Wireless',
    wanSetting: 'WAN',
    management: 'Management',
    ntp: 'NTP',
    ssh: 'SSH',
    advanced: 'Advanced',
    ddns: 'DDNS',
    device: 'Device Management',
    diagnostics : 'Diagnostics',
    firmware: 'Upgrade Firmware',
    reset: 'Device Reset'
  },
  header: {
    account: 'Account',
    logout: 'Logout'
  },
  dashboard: {
    system: 'System',
    softwareVersion: 'SoftwareVersion',
    hardwareVersion: 'HardwareVersion',
    model: 'Model',
    serialNumber: 'Serial Number',
    cpu: 'CPU',
    processes: 'Processes',
    memory: 'Memory',
    total: 'Total',
    free: 'Free',
    used: 'Used',
    wan: 'WAN',
    status: 'Status',
    speed: 'Speed',
    received: 'Received',
    sent: 'Sent',
    wifi: 'WiFi',
    clients: 'Clients',
    ethernet: 'Ethernet Ports'
  },
  wan: {
    title: 'WAN Status',
    operationMode: 'Operation Mode',
    sensingPolicy: 'Sensing Policy',
    sensingTimeout: 'Sensing Timeout',
    name: 'Name',
    wanMode: 'WAN Mode',
    interface: 'Interface',
    macAddress: 'MAC Address',
    speed: 'Speed',
    duplex: 'Duplex',
    ipv4Address: 'IPv4 Address',
    status: 'Status',
    wanModeConfig: 'WAN Mode Config',
    dnsMode: 'DNS Mode',
    physicalType: 'Physical Type',
    origin: 'Origin',
    mode: 'Mode',
    address: 'Address',
    gateway: 'Gateway',
    dnsServer: 'DNS Server',
    subnetMask: 'Subnet Mask',
    type: 'Type',
    prefix: 'Prefix'
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
    rxbytes: 'RxBytes',
    rxpackets: 'RxPackets',
    rxerror: 'RxError',
    rxdiscard: 'RxDiscard',
    txbytes: 'TxBytes',
    txpackets: 'TxPackets',
    txerror: 'TxError',
    txdiscard: 'TxDiscard'
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
  mesh: {
    title: 'Mesh Information',
    networkInformation: 'Mesh Network Information',
    nodeList: 'Mesh Node List',
    clientList: 'Mesh Client List',
    name: 'Name',
    mode: 'Mode',
    ipAddress: 'IPv4 Address',
    macAddress: 'MAC Address',
    mediaType: 'Media Type',
    supportedBand: 'Supported Band',
    upstream: 'Upstream',
    action: 'Action',
    map: 'MAP',
    list: 'LIST',
    back: 'Back',
    steeringControl: 'Steering Control',
    selectedNode: 'Selected Node',
    destination: 'Destination',
    selectDestination: 'Select Destination',
    band: 'Band',
    selectBand: 'Select Band'
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
  wireless: {
    title: 'Wireless Settings',
    basicConfig: 'Basic Config',
    advancedConfig: 'Advanced Config',
    wpsConfig: 'WPS Configuration',
    meshNetwork: 'Mesh Network',
    settings: 'Settings',
    ssid: 'SSID',
    password: 'WPA Preshare Key',
    mode: 'Mode',
    bandwidth: 'Bandwidth',
    channel: 'Channel',
    autoChannel: 'Auto Channel',
    wpsConfiguration: 'WPS Configuration',
    wpsPushButton: 'WPS Push Button',
    wpsPushButtonDesc: 'Click "WPS Push Button", then press the WPS pushbutton on the device you want to connect within two minutes',
    wpsPinConnect: 'WPS PIN Code Connect',
    wpsPinConnectDesc: 'Enter the PIN code generated by the client device, then click Connect Device button to connect to Wi-Fi.',
    generatePinCode: 'Generate PIN Code',
    devicePinDesc: 'Enter the PIN code generated by the router on the device to connect to Wi-Fi',
    enterPin: 'Please Enter PIN Code',
    connect: 'Connect Device',
    vapInformation: 'VAP Information',
    band: 'Band',
    authentication: 'Authentication',
    encryption: 'Encryption',
    wpsStatus: 'WPS Status',
    easyMesh: 'EasyMesh',
    commonSsidConfig: 'Common SSID Configuration',
    pushButtonTitle: 'Connect a new device by pushbutton',
    pinConnectTitle: 'Connect a new device by PIN',
    devicePinTitle: 'PIN for adding this device to a network',
    pushButton: 'WPS Push Button',
    pinCode: 'PIN Code',
    pinCodeOfClient: 'PIN Code of Client Device',
    noPublicKeys: 'No public keys added'
  },
  wanSetup: {
    title: 'WAN Settings',
    modeSetup: 'WAN Mode Setup',
    modeManagement: 'WAN Mode Management',
    operationMode: 'Operation Mode',
    wanMode: 'WAN Mode',
    manual: 'Manual',
    auto: 'Automatic'
  },
  wanManagement: {
    addMode: 'Add WAN Mode',
    editMode: 'Edit WAN Mode',
    name: 'Name',
    interface: 'Interface',
    ipv4Mode: 'IPv4 Mode',
    ipv6Mode: 'IPv6 Mode',
    status: 'Status',
    type: 'Type',
    action: 'Action',
    physicalType: 'Physical Type',
    vlanType: 'VLAN Type',
    vlanId: 'VLAN ID',
    vlanPriority: 'VLAN Priority',
    pppoeUsername: 'PPPoE Username',
    pppoePassword: 'PPPoE Password',
    staticIpv4: 'Static IPv4 Address',
    staticIpv6: 'Static IPv6 Address',
    ipv4Address: 'IPv4 Address',
    ipv6Address: 'IPv6 Address',
    defaultRouter: 'Default Router',
    subnetMask: 'Subnet Mask',
    prefixLength: 'Prefix Length',
    dnsServers: 'DNS Servers',
    addInterface: 'Add Interface',
    edit: 'Edit',
    delete: 'Delete',
    detail: 'Detail',
    confirmDelete: 'Are you sure you want to delete this WAN mode?'
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
    title: 'SSH',
    serverManagement: 'SSH Server Management',
    publicKeyManagement: 'Public Key Management',
    currentSessions: 'Current Sessions',
    addServer: 'Add Server',
    editServer: 'Edit Server',
    id: 'ID',
    interface: 'Interface',
    status: 'Status',
    port: 'Port',
    autoDisableServer: 'Auto Disable Server',
    connectionTimeout: 'Connection Timeout',
    keepAliveMessage: 'KeepAlive Message',
    ipv4Prefix: 'IPv4 Prefix',
    ipv6Prefix: 'IPv6 Prefix',
    loginWithPassword: 'Login with Password',
    rootLogin: 'Root Login',
    rootLoginWithPassword: 'Root Login with Password',
    enabled: 'Enabled',
    disabled: 'Disabled',
    action: 'Action',
    enable: 'Enable SSH Server',
    allowPasswordLogin: 'Allow Password Login',
    allowRootLogin: 'Allow Root Login',
    maxAuthTries: 'Maximum Authentication Tries',
    idleTimeout: 'Idle Timeout (seconds)',
    confirmDelete: 'Are you sure you want to delete this SSH server?',
    comment: 'Comment',
    publicKey: 'Public Key',
    select: 'Select',
    clickToView: 'Click to View',
    key: 'Public Key',
    viewKey: 'View Key',
    newSshKey: 'New SSH Key',
    enterNewSshKey: 'Enter new SSH key...',
    confirmDeleteKey: 'Are you sure you want to delete this SSH key?',
    user: 'User',
    clientAddress: 'Client Address',
    clientPort: 'Client Port',
    serverId: 'Server ID',
    serverPort: 'Server Port',
    algorithm: 'Algorithm'
  },
  device: {
    title: 'Device Management',
    tr069Config: 'TR-069 Configuration',
    tr369Config: 'TR-369 Configuration',
    enableCWMP: 'Enable CWMP',
    acsUrl: 'ACS URL',
    connectionRequestUrl: 'Connection Request URL',
    acsCredentials: 'ACS Credentials',
    connectionRequestCredentials: 'Connection Request Credentials',
    username: 'Username',
    password: 'Password',
    enablePeriodicInform: 'Enable Periodic Inform',
    periodicInformInterval: 'Periodic Inform Interval',
    sendInform: 'Send Inform To ACS Server'
  },
  diagnostics: {
    title: 'Diagnostics Tools',
    ping: 'Ping',
    traceRoute: 'Trace Route',
    dnsLookup: 'DNS Lookup',
    interface: 'Interface',
    protocol: 'Protocol',
    targetHost: 'Target IP Address/Domain',
    repeatTimes: 'Repeat Times',
    start: 'Start',
    results: 'Results',
    hostAddress: 'Host IP Address',
    packetsInfo: 'Packets Information',
    sent: 'Sent',
    received: 'Received',
    lost: 'Lost',
    minRoundTrip: 'Minimum Round-trip Times',
    maxRoundTrip: 'Maximum Round-trip Times',
    avgRoundTrip: 'Average Round-trip Times',
    hop: 'Hop',
    host: 'Host',
    address: 'Address',
    rtt: 'RTT (ms)',
    dnsServer: 'DNS Server Name/DNS IP Address',
    status: 'Status',
    answerType: 'Answer Type',
    hostname: 'Hostname',
    ipAddresses: 'IP Addresses',
    responseTime: 'Response Time',
    dnsServerIp: 'DNS Server IP',
    processing: 'Processing...',
    errorState: 'Error: {state}',
    errorTimeout: 'Request timed out',
    errorInternal: 'Internal error occurred',
    errorNetwork: 'Network error occurred',
    errorInvalidHost: 'Invalid host specified',
    errorResolveFailed: 'Failed to resolve hostname'
  },
  firmware: {
    title: 'Upgrade Firmware',
    firmwareBank: 'Firmware Bank',
    status: 'Status',
    firmwareVersion: 'Firmware Version',
    action: 'Action',
    activate: 'Activate',
    uploadFirmware: 'Upload Firmware',
    chooseFile: 'Choose File',
    noFileSelected: 'No file selected',
    dragAndDrop: 'Drag and Drop files here',
    autoActivate: 'Auto Activate',
    updateFirmware: 'Update Firmware',
    selectFromComputer: '(or) Select file from your computer',
    processing: 'Processing...',
    upgrading: 'Firmware Upgrading...',
    activating: 'Activating Firmware...',
    powerOffWarning: 'Please do not power off the device.',
    rebootWarning: 'Device will reboot after activation.'
  },
  reset: {
    title: 'Device Reset',
    restartTitle: 'Restart Device',
    restartDescription: 'Restart the device. This will temporarily disconnect all users and connections. The device will be unavailable during the restart process.',
    restartButton: 'Restart',
    restartConfirm: 'Are you sure you want to restart the device?',
    factoryTitle: 'Factory Reset',
    factoryDescription: 'Reset the device to factory default settings. This will erase all configuration settings and restore the device to its original state.',
    factoryButton: 'Factory Reset',
    factoryConfirm: 'Are you sure you want to reset the device to factory settings? All configuration will be lost.',
    countdown: 'Device will restart in {seconds} seconds...',
    success: 'Command sent successfully'
  },
  login: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    submit: 'Login',
    error: 'Invalid username or password'
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    refresh: 'Refresh',
    create: 'Create',
    apply: 'Apply',
    edit: 'Edit',
    delete: 'Delete',
    enable: 'Enable'
  }
};

export default translations;