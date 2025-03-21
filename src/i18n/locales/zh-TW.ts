// Traditional Chinese translations
export default {
  menu: {
    dashboard: '儀表板',
    status: '狀態',
    wan: 'WAN',
    lan: 'LAN',
    wlan: 'WLAN',
    statistics: '統計數據',
    wifiNeighbor: 'Wi-Fi 鄰近設備',
    meshInfo: 'Mesh 資訊',
    lcm: 'LCM',
    basicSetting: '基本設定',
    wireless: '無線',
    wanSetting: 'WAN',
    management: '管理',
    ntp: 'NTP',
    ssh: 'SSH',
    advanced: '進階設定',
    ddns: 'DDNS',
    device: '裝置管理',
    diagnostics: '診斷工具',
    firmware: '韌體升級',
    reset: '裝置重置'
  },
  header: {
    account: '帳號',
    logout: '登出'
  },
  dashboard: {
    system: '系統',
    softwareVersion: '軟體版本',
    hardwareVersion: '硬體版本',
    model: '型號',
    serialNumber: '序號',
    cpu: 'CPU',
    processes: '程序',
    memory: '記憶體',
    total: '總計',
    free: '可用',
    used: '已用',
    wan: 'WAN',
    status: '狀態',
    speed: '速度',
    received: '已接收',
    sent: '已傳送',
    wifi: 'WiFi',
    clients: '用戶端',
    ethernet: '乙太網路埠'
  },
  wan: {
    title: 'WAN 狀態',
    operationMode: '操作模式',
    sensingPolicy: '感測策略',
    sensingTimeout: '感測逾時',
    name: '名稱',
    wanMode: 'WAN 模式',
    interface: '介面',
    macAddress: 'MAC 位址',
    speed: '連線速度',
    duplex: '雙工模式',
    ipv4Address: 'IPv4 位址',
    status: '狀態',
    wanModeConfig: 'WAN模式設定',
    dnsMode: 'DNS模式',
    physicalType: '實體類型',
    origin: '來源',
    mode: '模式',
    address: '位址',
    gateway: '閘道器',
    dnsServer: 'DNS伺服器',
    subnetMask: '子網路遮罩',
    type: '類型',
    prefix: '前綴'
  },
  lan: {
    title: 'LAN 狀態',
    macAddress: 'MAC 位址',
    mtu: 'MTU',
    ipv4: 'IPv4',
    ipv6: 'IPv6',
    name: '名稱',
    ipAddress: 'IP 位址',
    netmask: '子網路遮罩',
    status: '狀態'
  },
  wlan: {
    title: 'Wi-Fi 狀態',
    channel: '頻道',
    bandwidth: '頻寬',
    macAddress: 'MAC 位址',
    interface: '介面',
    name: '名稱',
    alias: '別名',
    status: '狀態',
    ssid: 'SSID',
    authentication: '驗證方式',
    encryption: '加密方式',
    password: '密碼',
    bssid: 'BSSID',
    auto: '自動',
    enable: '啟用',
    disable: '停用'
  },
  statistics: {
    title: '統計數據',
    ethernet: '統計數據 - 乙太網路',
    wlan: '統計數據 - 無線網路',
    port: '連接埠',
    rxbytes: '接收位元組數',
    rxpackets: '接收封包數',
    rxerror: '接收錯誤',
    rxdiscard: '接收丟棄',
    txbytes: '傳送位元組數',
    txpackets: '傳送封包數',
    txerror: '傳送錯誤',
    txdiscard: '傳送丟棄'
  },
  wifiNeighbor: {
    title: 'Wi-Fi 鄰近設備',
    wifiNeighbor: 'Wi-Fi 鄰近設備',
    ssid: 'SSID',
    bssid: 'BSSID',
    channel: '頻道',
    signal: '訊號 (%)',
    security: '安全性',
    wirelessMode: '無線模式',
    scan: '掃描',
    scanning: '掃描中...'
  },
  mesh: {
    title: '網格資訊',
    networkInformation: '網格網路資訊',
    nodeList: '網格節點清單',
    clientList: '網格用戶端清單',
    name: '名稱',
    mode: '模式',
    ipAddress: 'IPv4位址',
    macAddress: 'MAC位址',
    mediaType: '媒體類型',
    supportedBand: '支援頻段',
    upstream: '上游',
    action: '操作',
    map: '地圖',
    list: '清單',
    back: '返回',
    steeringControl: '轉向控制',
    selectedNode: '已選節點',
    destination: '目標',
    selectDestination: '選擇目標',
    band: '頻段',
    selectBand: '選擇頻段'
  },
  lcm: {
    title: "狀態 - LCM",
    execEnv: "執行環境",
    execUnits: "執行單元",
    deployUnits: "部署單元",
    deploymentUnits: "部署單元",
    name: "名稱",
    status: "狀態",
    url: "URL",
    uuid: "UUID",
    vendor: "供應商",
    version: "版本"
  },
  wireless: {
    title: '無線設定',
    basicConfig: '基本設定',
    advancedConfig: '進階設定',
    wpsConfig: 'WPS設定',
    meshNetwork: '網格網路',
    settings: '設定',
    ssid: 'SSID',
    password: 'WPA金鑰',
    mode: '模式',
    bandwidth: '頻寬',
    channel: '頻道',
    autoChannel: '自動選擇頻道',
    wpsConfiguration: 'WPS設定',
    wpsPushButton: 'WPS按鈕',
    wpsPushButtonDesc: '點擊「WPS按鈕」，然後在兩分鐘內按下要連接裝置上的WPS按鈕',
    wpsPinConnect: 'WPS PIN碼連接',
    wpsPinConnectDesc: '輸入用戶端裝置產生的PIN碼，然後點擊「連接裝置」按鈕建立WiFi連接',
    generatePinCode: '產生PIN碼',
    devicePinDesc: '將此裝置加入網路的PIN碼',
    enterPin: '請輸入PIN碼',
    connect: '連接裝置',
    vapInformation: 'VAP資訊',
    band: '頻段',
    authentication: '認證',
    encryption: '加密',
    wpsStatus: 'WPS狀態',
    easyMesh: 'EasyMesh',
    commonSsidConfig: '通用SSID設定',
    pushButtonTitle: '透過按鈕連接新裝置',
    pinConnectTitle: '透過 PIN 碼連接新裝置',
    devicePinTitle: '將此裝置加入網路的 PIN 碼',
    pushButton: 'WPS 按鈕',
    pinCode: 'PIN 碼',
    pinCodeOfClient: '用戶端裝置的 PIN 碼',
    noPublicKeys: '尚未新增公開金鑰'
  },
  wanSetup: {
    title: 'WAN 設定',
    modeSetup: 'WAN 模式設定',
    modeManagement: 'WAN 模式管理',
    operationMode: '運作模式',
    wanMode: 'WAN 模式',
    manual: '手動',
    auto: '自動'
  },
  wanManagement: {
    addMode: '新增 WAN 模式',
    editMode: '編輯 WAN 模式',
    name: '名稱',
    interface: '介面',
    ipv4Mode: 'IPv4 模式',
    ipv6Mode: 'IPv6 模式',
    status: '狀態',
    type: '類型',
    action: '操作',
    physicalType: '實體類型',
    vlanType: 'VLAN 類型',
    vlanId: 'VLAN ID',
    vlanPriority: 'VLAN 優先級',
    pppoeUsername: 'PPPoE 使用者名稱',
    pppoePassword: 'PPPoE 密碼',
    staticIpv4: '靜態 IPv4 位址',
    staticIpv6: '靜態 IPv6 位址',
    ipv4Address: 'IPv4 位址',
    ipv6Address: 'IPv6 位址',
    defaultRouter: '預設路由器',
    subnetMask: '子網路遮罩',
    prefixLength: '前綴長度',
    dnsServers: 'DNS 伺服器',
    addInterface: '新增介面',
    edit: '編輯',
    delete: '刪除',
    detail: '詳細資訊',
    confirmDelete: '確定要刪除這個 WAN 模式嗎？',
    enableSensing: '啟用感測',
    ipv4DnsMode: 'IPv4 DNS 模式',
    ipv6DnsMode: 'IPv6 DNS 模式'
  },
  lanBasic: {
    title: 'LAN 設定',
    ipv4Configuration: 'IPv4 設定',
    deviceConnected: '已連接設備',
    lanIpSetting: 'LAN IP 設定',
    enable: '啟用',
    ipAddress: 'IP 位址',
    subnetMask: '子網路遮罩',
    dhcpv4Setting: 'DHCPv4 設定',
    enableDhcpServer: '啟用 DHCP 伺服器',
    dnsServer: 'DNS 伺服器',
    beginAddress: '起始位址',
    endAddress: '結束位址',
    leaseTime: '租約時間',
    seconds: '秒',
    ipAddressReservation: 'IP 位址保留',
    add: '新增',
    macAddress: 'MAC 位址',
    action: '操作',
    hostName: '主機名稱',
    refresh: '重新整理',
    apply: '套用',
    cancel: '取消'
  },
  ddns: {
    title: 'DDNS設定',
    management: 'DDNS管理',
    addService: '新增服務',
    editService: '編輯服務',
    refresh: '重新整理',
    no: '編號',
    provider: '服務提供商',
    domain: '網域名稱',
    username: '使用者名稱',
    password: '密碼',
    wanInterface: 'WAN介面',
    status: '狀態',
    lastUpdate: '最後更新',
    action: '操作',
    save: '儲存',
    cancel: '取消',
    confirmDelete: '確定要刪除此DDNS服務嗎？'
  },
  ntp: {
    title: 'NTP',
    currentTime: '目前時間',
    timeZoneSelect: '時區選擇',
    automaticDaylight: '自動調整夏令時間',
    enableNtp: '啟用 NTP 用戶端更新',
    ntpServer: 'NTP 伺服器',
    cancel: '取消',
    apply: '套用',
    placeholder: '請輸入數值'
  },
  ssh: {
    title: 'SSH',
    serverManagement: 'SSH伺服器管理',
    publicKeyManagement: '公開金鑰管理',
    currentSessions: '目前工作階段',
    addServer: '新增伺服器',
    editServer: '編輯伺服器',
    id: 'ID',
    interface: '介面',
    status: '狀態',
    port: '連接埠',
    autoDisableServer: '自動停用伺服器',
    connectionTimeout: '連線逾時',
    keepAliveMessage: '保持連線訊息',
    ipv4Prefix: 'IPv4前綴',
    ipv6Prefix: 'IPv6前綴',
    loginWithPassword: '密碼登入',
    rootLogin: 'root登入',
    rootLoginWithPassword: 'root密碼登入',
    enabled: '已啟用',
    disabled: '已停用',
    action: '操作',
    enable: '啟用SSH伺服器',
    allowPasswordLogin: '允許密碼登入',
    allowRootLogin: '允許root登入',
    maxAuthTries: '最大認證嘗試次數',
    idleTimeout: '閒置逾時（秒）',
    confirmDelete: '確定要刪除此SSH伺服器嗎？',
    comment: '註解',
    publicKey: '公開金鑰',
    select: '選擇',
    clickToView: '點擊檢視',
    key: '公開金鑰',
    viewKey: '檢視金鑰',
    newSshKey: '新SSH金鑰',
    enterNewSshKey: '輸入新SSH金鑰...',
    confirmDeleteKey: '確定要刪除此SSH金鑰嗎？',
    user: '使用者',
    clientAddress: '用戶端位址',
    clientPort: '用戶端連接埠',
    serverId: '伺服器ID',
    serverPort: '伺服器連接埠',
    algorithm : '演算法'
  },
  device: {
    title: '裝置管理',
    tr069Config: 'TR-069 設定',
    tr369Config: 'TR-369 設定',
    enableCWMP: '啟用 CWMP',
    acsUrl: 'ACS URL',
    connectionRequestUrl: '連線請求 URL',
    acsCredentials: 'ACS 憑證',
    connectionRequestCredentials: '連線請求憑證',
    username: '使用者名稱',
    password: '密碼',
    enablePeriodicInform: '啟用定期通知',
    periodicInformInterval: '定期通知間隔',
    sendInform: '向 ACS 伺服器發送通知',
    alias: '別名',
    endpointId: '控制器 EndpointID',
    controllerTopic: '控制器主題 (Topic)',
    agentTopic: '代理主題 (Topic)',
    brokerAddress: 'MQTT Broker 位址',
    brokerPort: 'MQTT Broker 埠號',
    clientId: '用戶端 ID',
    status: '狀態',
    periodicNotify: '定期通知',
    keepAliveTime: '保持連線時間',
    protocolVersion: '協定版本',
    transportProtocol: '傳輸協定',
    addController: '新增控制器',
    editController: '編輯控制器',
    confirmDelete: '確定要刪除此控制器嗎？',
    action: '操作',
    agentEndpointId: '代理 EndpointID',
    maxControllersReached: '已達控制器最大數量（5）',
    controller: '控制器（MQTT）'
  },
  diagnostics: {
    title: '診斷工具',
    ping: 'Ping',
    traceRoute: '路由追蹤',
    dnsLookup: 'DNS 查詢',
    interface: '介面',
    protocol: '協定',
    targetHost: '目標 IP 位址/網域',
    repeatTimes: '重複次數',
    start: '開始',
    results: '結果',
    hostAddress: '主機 IP 位址',
    packetsInfo: '封包資訊',
    sent: '已傳送',
    received: '已接收',
    lost: '遺失',
    minRoundTrip: '最小往返時間',
    maxRoundTrip: '最大往返時間',
    avgRoundTrip: '平均往返時間',
    hop: '躍點',
    host: '主機',
    address: '位址',
    rtt: 'RTT (ms)',
    dnsServer: 'DNS 伺服器名稱/DNS IP 位址',
    status: '狀態',
    answerType: '回應類型',
    hostname: '主機名稱',
    ipAddresses: 'IP 位址',
    responseTime: '回應時間',
    dnsServerIp: 'DNS 伺服器 IP',
    processing: '處理中...',
    errorState: '錯誤: {state}',
    errorTimeout: '請求逾時',
    errorInternal: '發生內部錯誤',
    errorNetwork: '發生網路錯誤',
    errorInvalidHost: '指定的主機無效',
    errorResolveFailed: '主機名稱解析失敗'
  },
  firmware: {
    title: '韌體升級',
    firmwareBank: '韌體庫',
    status: '狀態',
    firmwareVersion: '韌體版本',
    action: '動作',
    activate: '啟用',
    uploadFirmware: '上傳韌體',
    chooseFile: '選擇檔案',
    noFileSelected: '未選擇檔案',
    dragAndDrop: '將檔案拖放至此',
    autoActivate: '自動啟用',
    updateFirmware: '更新韌體',
    selectFromComputer: '或從電腦選擇檔案',
    processing: '處理中...',
    upgrading: '韌體升級中...',
    activating: '韌體啟用中...',
    powerOffWarning: '請勿關閉電源。',
    rebootWarning: '啟用後裝置將重新啟動。'
  },
  reset: {
    title: '裝置重置',
    restartTitle: '重新啟動裝置',
    restartDescription: '重新啟動裝置。這將暫時中斷所有使用者和連線。在重新啟動過程中，裝置將無法使用。',
    restartButton: '重新啟動',
    restartConfirm: '您確定要重新啟動裝置嗎？',
    factoryTitle: '恢復出廠設定',
    factoryDescription: '將裝置重置為出廠預設設定。這將清除所有設定並將裝置恢復到原始狀態。',
    factoryButton: '恢復出廠設定',
    factoryConfirm: '您確定要將裝置重置為出廠設定嗎？所有設定都將遺失。',
    countdown: '裝置將在 {seconds} 秒後重新啟動...',
    success: '命令已成功傳送'
  },
  login: {
    title: '登入',
    username: '使用者名稱',
    password: '密碼',
    submit: '登入',
    error: '使用者名稱或密碼無效'
  },
  common: {
    save: '儲存',
    cancel: '取消',
    close: '關閉',
    refresh: '重新整理',
    create: '建立',
    apply: '套用',
    edit: '編輯',
    delete: '刪除',
    enable: '啟用'
  }
};