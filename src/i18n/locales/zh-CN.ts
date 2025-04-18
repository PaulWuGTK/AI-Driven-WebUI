// Simplified Chinese translations
export default {
  menu: {
    dashboard: '仪表板',
    status: '状态',
    wan: 'WAN',
    lan: 'LAN',
    wlan: 'WLAN',
    statistics: '统计数据',
    wifiNeighbor: 'WiFi 邻近设备',
    meshInfo: '网格信息',
    lcm: 'LCM',
    basicSetting: '基本设置',
    wireless: '无线',
    wanSetting: 'WAN',
    management: '管理',
    ntp: 'NTP',
    ssh: 'SSH',
    advanced: '高级设置',
    ddns: 'DDNS',
    device: '设备管理',
    diagnostics: '诊断工具',
    firmware: '固件升级',
    reset: '设备重置',
    backup: '备份',
    xperienceControl: 'XperienceControl',
    application: '应用程序'
  },
  header: {
    account: '帐户',
    logout: '登出'
  },
  dashboard: {
    system: '系统',
    softwareVersion: '软件版本',
    hardwareVersion: '硬件版本',
    model: '型号',
    serialNumber: '序列号',
    cpu: 'CPU',
    processes: '进程',
    memory: '内存',
    total: '总计',
    free: '空闲',
    used: '已用',
    wan: 'WAN',
    status: '状态',
    speed: '速度',
    received: '已接收',
    sent: '已发送',
    wifi: 'WiFi',
    clients: '客户端',
    ethernet: '以太网端口',
    ipv4Address: 'IPv4 地址',
    ipv6Address: 'IPv6 地址'
  },
  wan: {
    title: '广域网状态',
    operationMode: '操作模式',
    sensingPolicy: '感知策略',
    sensingTimeout: '感知超时',
    name: '名称',
    wanMode: 'WAN 模式',
    interface: '接口',
    macAddress: 'MAC 地址',
    speed: '速度',
    duplex: '双工',
    ipv4Address: 'IPv4 地址',
    status: '状态',
    wanModeConfig: 'WAN模式配置',
    dnsMode: 'DNS模式',
    physicalType: '物理类型',
    origin: '来源',
    mode: '模式',
    address: '地址',
    gateway: '网关',
    dnsServer: 'DNS服务器',
    subnetMask: '子网掩码',
    type: '类型',
    prefix: '前缀'
  },
  lan: {
    title: 'LAN',
    macAddress: 'MAC 地址',
    mtu: 'MTU',
    ipv4: 'IPv4',
    ipv6: 'IPv6',
    name: '名称',
    ipAddress: 'IP 地址',
    netmask: '子网掩码',
    status: '状态'
  },
  wlan: {
    title: '无线网络状态',
    channel: '信道',
    bandwidth: '带宽',
    macAddress: 'MAC 地址',
    interface: '接口',
    name: '名称',
    alias: '别名',
    status: '状态',
    ssid: 'SSID',
    authentication: '验证',
    encryption: '加密',
    password: '密码',
    bssid: 'BSSID',
    auto: '（自动）',
    enable: '启用',
    disable: '禁用'
  },
  statistics: {
    title: '统计数据',
    ethernet: '统计 - 以太网',
    wlan: '统计信息 - WLAN',
    port: '端口',
    rxbytes: '接收字节数',
    rxpackets: '接收数据包',
    rxerror: '接收错误',
    rxdiscard: '接收丢弃',
    txbytes: '发送字节数',
    txpackets: '发送数据包',
    txerror: '发送错误',
    txdiscard: '发送丢弃'
  },
  wifiNeighbor: {
    title: 'WiFi 邻近设备',
    wifiNeighbor: 'WiFi 邻近设备',
    ssid: 'SSID',
    bssid: 'BSSID',
    channel: '信道',
    signal: '信号 (%)',
    security: '安全性',
    wirelessMode: '无线模式',
    scan: '扫描',
    scanning: '扫描中...'
  },
  mesh: {
    title: '网格信息',
    networkInformation: '网格网络信息',
    nodeList: '网格节点列表',
    clientList: '网格客户端列表',
    name: '名称',
    mode: '模式',
    ipAddress: 'IPv4地址',
    macAddress: 'MAC地址',
    mediaType: '媒体类型',
    supportedBand: '支持频段',
    upstream: '上游',
    action: '操作',
    map: '地图',
    list: '列表',
    back: '返回',
    steeringControl: '转向控制',
    selectedNode: '已选节点',
    destination: '目标',
    selectDestination: '选择目标',
    band: '频段',
    selectBand: '选择频段'
  },
  lcm: {
    title: "状态 - LCM",
    execEnv: "执行环境",
    execUnits: "执行单元",
    deployUnits: "部署单元",
    deploymentUnits: "部署单元",
    name: "名称",
    status: "状态",
    url: "URL",
    uuid: "UUID",
    vendor: "供应商",
    version: "版本"
  },
  wireless: {
    title: '无线设置',
    basicConfig: '基本配置',
    advancedConfig: '高级配置',
    wpsConfig: 'WPS配置',
    meshNetwork: '网格网络',
    settings: '设置',
    ssid: 'SSID',
    password: 'WPA密钥',
    mode: '模式',
    bandwidth: '带宽',
    channel: '信道',
    autoChannel: '自动选择信道',
    wpsConfiguration: 'WPS配置',
    wpsPushButton: 'WPS按钮',
    wpsPushButtonDesc: '点击"WPS按钮"，然后在两分钟内按下要连接设备上的WPS按钮',
    wpsPinConnect: 'WPS PIN码连接',
    wpsPinConnectDesc: '输入客户端设备生成的PIN码，然后点击"连接设备"按钮建立WiFi连接',
    generatePinCode: '生成PIN码',
    devicePinDesc: '将此设备添加到网络的PIN码',
    enterPin: '请输入PIN码',
    connect: '连接设备',
    vapInformation: 'VAP信息',
    band: '频段',
    authentication: '认证',
    encryption: '加密',
    wpsStatus: 'WPS状态',
    easyMesh: 'EasyMesh',
    commonSsidConfig: '通用SSID配置',
    pushButtonTitle: '通过按钮连接新设备',
    pinConnectTitle: '通过 PIN 码连接新设备',
    devicePinTitle: '将此设备添加到网络的 PIN 码',
    pushButton: 'WPS 按钮',
    pinCode: 'PIN 码',
    pinCodeOfClient: '客户端设备的 PIN 码',
    noPublicKeys: '尚未添加公钥'
  },
  wanSetup: {
    title: 'WAN 设置',
    modeSetup: 'WAN 模式设置',
    modeManagement: 'WAN 模式管理',
    operationMode: '运行模式',
    wanMode: 'WAN 模式',
    manual: '手动',
    auto: '自动'
  },
  wanManagement: {
    addMode: '新增 WAN 模式',
    editMode: '编辑 WAN 模式',
    name: '名称',
    interface: '接口',
    ipv4Mode: 'IPv4 模式',
    ipv6Mode: 'IPv6 模式',
    status: '状态',
    type: '类型',
    action: '操作',
    physicalType: '物理类型',
    vlanType: 'VLAN 类型',
    vlanId: 'VLAN ID',
    vlanPriority: 'VLAN 优先级',
    pppoeUsername: 'PPPoE 用户名',
    pppoePassword: 'PPPoE 密码',
    staticIpv4: '静态 IPv4 地址',
    staticIpv6: '静态 IPv6 地址',
    ipv4Address: 'IPv4 地址',
    ipv6Address: 'IPv6 地址',
    defaultRouter: '默认路由器',
    subnetMask: '子网掩码',
    prefixLength: '前缀长度',
    dnsServers: 'DNS 服务器',
    addInterface: '新增接口',
    edit: '编辑',
    delete: '删除',
    detail: '详细信息',
    confirmDelete: '确定要删除此 WAN 模式吗？',
    enableSensing: '启用感知',
    ipv4DnsMode: 'IPv4 DNS 模式',
    ipv6DnsMode: 'IPv6 DNS 模式'
  },
  lanBasic: {
    title: 'LAN 设置',
    ipv4Configuration: 'IPv4 设置',
    deviceConnected: '已连接设备',
    lanIpSetting: 'LAN IP 设置',
    enable: '启用',
    ipAddress: 'IP 地址',
    subnetMask: '子网掩码',
    dhcpv4Setting: 'DHCPv4 设置',
    enableDhcpServer: '启用 DHCP 服务器',
    dnsServer: 'DNS 服务器',
    beginAddress: '起始地址',
    endAddress: '结束地址',
    leaseTime: '租约时间',
    seconds: '秒',
    ipAddressReservation: 'IP 地址保留',
    add: '新增',
    macAddress: 'MAC 地址',
    action: '操作',
    hostName: '主机名称',
    refresh: '刷新',
    apply: '应用',
    cancel: '取消'
  },
  ddns: {
    title: 'DDNS设置',
    management: 'DDNS管理',
    addService: '添加服务',
    editService: '编辑服务',
    refresh: '刷新',
    no: '编号',
    provider: '服务提供商',
    domain: '域名',
    username: '用户名',
    password: '密码',
    wanInterface: 'WAN接口',
    status: '状态',
    lastUpdate: '最后更新',
    action: '操作',
    save: '保存',
    cancel: '取消',
    confirmDelete: '确定要删除此DDNS服务吗？'
  },
  ntp: {
    title: 'NTP',
    currentTime: '当前时间',
    timeZoneSelect: '时区选择',
    automaticDaylight: '自动调整夏令时',
    enableNtp: '启用 NTP 客户端更新',
    ntpServer: 'NTP 服务器',
    cancel: '取消',
    apply: '应用',
    placeholder: '请输入值'
  },
  ssh: {
    title: 'SSH',
    serverManagement: 'SSH服务器管理',
    publicKeyManagement: '公钥管理',
    currentSessions: '当前会话',
    addServer: '添加服务器',
    editServer: '编辑服务器',
    id: 'ID',
    interface: '接口',
    status: '状态',
    port: '端口',
    autoDisableServer: '自动禁用服务器',
    connectionTimeout: '连接超时',
    keepAliveMessage: '保持连接消息',
    ipv4Prefix: 'IPv4前缀',
    ipv6Prefix: 'IPv6前缀',
    loginWithPassword: '密码登录',
    rootLogin: 'root登录',
    rootLoginWithPassword: 'root密码登录',
    enabled: '已启用',
    disabled: '已禁用',
    action: '操作',
    enable: '启用SSH服务器',
    allowPasswordLogin: '允许密码登录',
    allowRootLogin: '允许root登录',
    maxAuthTries: '最大认证尝试次数',
    idleTimeout: '空闲超时（秒）',
    confirmDelete: '确定要删除此SSH服务器吗？',
    comment: '注释',
    publicKey: '公钥',
    select: '选择',
    clickToView: '点击查看',
    key: '公钥',
    viewKey: '查看密钥',
    newSshKey: '新SSH密钥',
    enterNewSshKey: '输入新SSH密钥...',
    confirmDeleteKey: '确定要删除此SSH密钥吗？',
    user: '用户',
    clientAddress: '客户端地址',
    clientPort: '客户端端口',
    serverId: '服务器ID',
    serverPort: '服务器端口',
    algorithm : '算法'
  },
  device: {
    title: '设备管理',
    tr069Config: 'TR-069 配置',
    tr369Config: 'TR-369 配置',
    enableCWMP: '启用 CWMP',
    acsUrl: 'ACS URL',
    connectionRequestUrl: '连接请求 URL',
    acsCredentials: 'ACS 凭证',
    connectionRequestCredentials: '连接请求凭证',
    username: '用户名',
    password: '密码',
    enablePeriodicInform: '启用定期通知',
    periodicInformInterval: '定期通知间隔',
    sendInform: '向 ACS 服务器发送通知',
    alias: '别名',
    endpointId: '控制器 EndpointID',
    controllerTopic: '控制器主题 (Topic)',
    agentTopic: '代理主题 (Topic)',
    brokerAddress: 'MQTT Broker 地址',
    brokerPort: 'MQTT Broker 端口',
    clientId: '客户端 ID',
    status: '状态',
    periodicNotify: '周期性通知',
    keepAliveTime: '保持连接时间',
    connectRetryTime: '连接重试时间',
    connectRetryMaxInterval: '连接重试最大间隔',
    protocolVersion: '协议版本',
    transportProtocol: '传输协议',
    addController: '添加控制器',
    editController: '编辑控制器',
    confirmDelete: '确定要删除该控制器吗？',
    action: '操作',
    agentEndpointId: '代理 EndpointID',
    maxControllersReached: '已达到最大控制器数量（5）',
    controller: '控制器（MQTT）'
  },
  diagnostics: {
    title: '诊断工具',
    ping: 'Ping',
    traceRoute: '路由跟踪',
    dnsLookup: 'DNS 查询',
    interface: '接口',
    protocol: '协议',
    targetHost: '目标 IP 地址/域名',
    repeatTimes: '重复次数',
    start: '开始',
    results: '结果',
    hostAddress: '主机 IP 地址',
    packetsInfo: '数据包信息',
    sent: '已发送',
    received: '已接收',
    lost: '丢失',
    minRoundTrip: '最小往返时间',
    maxRoundTrip: '最大往返时间',
    avgRoundTrip: '平均往返时间',
    hop: '跃点',
    host: '主机',
    address: '地址',
    rtt: 'RTT (ms)',
    dnsServer: 'DNS 服务器名称/DNS IP 地址',
    status: '状态',
    answerType: '回答类型',
    hostname: '主机名',
    ipAddresses: 'IP 地址',
    responseTime: '响应时间',
    dnsServerIp: 'DNS 服务器 IP',
    processing: '处理中...',
    errorState: '错误: {state}',
    errorTimeout: '请求超时',
    errorInternal: '发生内部错误',
    errorNetwork: '发生网络错误',
    errorInvalidHost: '指定的主机无效',
    errorResolveFailed: '主机名解析失败'
  },
  firmware: {
    title: '固件升级',
    firmwareBank: '固件库',
    status: '状态',
    firmwareVersion: '固件版本',
    action: '操作',
    activate: '启用',
    uploadFirmware: '上传固件',
    chooseFile: '选择文件',
    noFileSelected: '未选择文件',
    dragAndDrop: '将文件拖放至此',
    autoActivate: '自动启用',
    updateFirmware: '更新固件',
    selectFromComputer: '或从计算机选择文件',
    processing: '处理中...',
    upgrading: '固件升级中...',
    activating: '固件激活中...',
    powerOffWarning: '请勿关闭电源。',
    rebootWarning: '激活后设备将重新启动。'
  },
  reset: {
    title: '设备重置',
    restartTitle: '重启设备',
    restartDescription: '重启设备。这将暂时断开所有用户和连接。在重启过程中，设备将不可用。',
    restartButton: '重启',
    restartConfirm: '您确定要重启设备吗？',
    factoryTitle: '恢复出厂设置',
    factoryDescription: '将设备重置为出厂默认设置。这将清除所有配置设置并将设备恢复到原始状态。',
    factoryButton: '恢复出厂设置',
    factoryConfirm: '您确定要将设备重置为出厂设置吗？所有配置都将丢失。',
    countdown: '设备将在 {seconds} 秒后重启...',
    success: '命令发送成功'
  },
  backup: {
    title: '备份与还原',
    backupTitle: '备份',
    backupDescription: '将当前配置文件备份到本地计算机',
    backupButton: '备份',
    restoreTitle: '还原',
    restoreDescription: '从备份文件还原配置',
    dragAndDrop: '将文件拖放到此处',
    selectFromComputer: '（或）从电脑中选择文件',
    chooseFile: '选择文件',
    noFileSelected: '未选择文件',
    restoreButton: '还原',
    processing: '处理中...'
  },
  xperienceControl: {
    title: 'XperienceControl',
    description: '点击下方按钮开始速度测试。',
    startTest: '开始速度测试',
    downloadSpeed: '下载速度',
    uploadSpeed: '上传速度',
    pingInfo: 'Ping 信息',
    mbps: 'Mbps',
    ms: 'ms',
    packetLoss: '丢包率',
    minEchoTime: '最小回显时间',
    meanEchoTime: '平均回显时间',
    maxEchoTime: '最大回显时间',
    testFailed: '测速失败，请重试。',
    testing: '测试中...'
  },
  login: {
    title: '登录',
    username: '用户名',
    password: '密码',
    submit: '登录',
    error: '用户名或密码无效'
  },
  common: {
    save: '保存',
    cancel: '取消',
    close: '关闭',
    refresh: '刷新',
    create: '创建',
    apply: '应用',
    edit: '编辑',
    delete: '删除',
    enable: '启用'
  }
};