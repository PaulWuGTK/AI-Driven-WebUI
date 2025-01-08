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
    management: '管理',
    ntp: 'NTP',
    ssh: 'SSH',
    advanced: '進階設定',
    ddns: 'DDNS'
  },
  header: {
    account: '帳號',
    logout: '登出'
  },
  dashboard: {
    system: '系統',
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
    rxBytes: '接收位元組數',
    rxPackets: '接收封包數',
    rxError: '接收錯誤',
    rxDiscard: '接收丟棄',
    txBytes: '傳送位元組數',
    txPackets: '傳送封包數',
    txError: '傳送錯誤',
    txDiscard: '傳送丟棄'
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
    commonSsidConfig: '通用SSID設定'
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