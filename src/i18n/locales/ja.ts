// Japanese translations
export default {
  menu: {
    dashboard: 'ダッシュボード',
    status: '状態',
    wan: 'WAN',
    lan: 'LAN',
    wlan: 'WLAN',
    statistics: '統計',
    wifiNeighbor: 'WiFi ネイバー',
    meshInfo: 'メッシュ情報',
    lcm: 'LCM',
    basicSetting: '基本設定',
    wireless: '無線',
    wanSetting: 'WAN',
    management: '管理',
    ntp: 'NTP',
    ssh: 'SSH',
    advanced: '詳細設定',
    ddns: 'DDNS',
    device: 'デバイス管理',
    diagnostics: '診断ツール',
    firmware: 'ファームウェアアップグレード',
    reset: 'デバイスリセット'
  },
  header: {
    account: 'アカウント',
    logout: 'ログアウト'
  },
  dashboard: {
    system: 'システム',
    softwareVersion: 'ソフトウェアバージョン',
    hardwareVersion: 'ハードウェアバージョン',
    model: 'モデル',
    serialNumber: 'シリアル番号',
    cpu: 'CPU',
    processes: 'プロセス',
    memory: 'メモリ',
    total: '合計',
    free: '空き',
    used: '使用中',
    wan: 'WAN',
    status: '状態',
    speed: '速度',
    received: '受信',
    sent: '送信',
    wifi: 'WiFi',
    clients: 'クライアント',
    ethernet: 'イーサネットポート'
  },
  wan: {
    title: 'WAN ステータス',
    operationMode: '操作モード',
    sensingPolicy: '検知ポリシー',
    sensingTimeout: '検知タイムアウト',
    name: '名前',
    wanMode: 'WANモード',
    interface: 'インターフェース',
    macAddress: 'MACアドレス',
    speed: '通信速度',
    duplex: 'デュプレックスモード',
    ipv4Address: 'IPv4 アドレス',
    status: '状態',
    wanModeConfig: 'WANモード設定',
    dnsMode: 'DNSモード',
    physicalType: '物理タイプ',
    origin: '起源',
    mode: 'モード',
    address: 'アドレス',
    gateway: 'ゲートウェイ',
    dnsServer: 'DNSサーバー',
    subnetMask: 'サブネットマスク',
    type: 'タイプ',
    prefix: 'プレフィックス'
  },
  lan: {
    title: 'LAN',
    macAddress: 'MACアドレス',
    mtu: 'MTU',
    ipv4: 'IPv4',
    ipv6: 'IPv6',
    name: '名前',
    ipAddress: 'IPアドレス',
    netmask: 'ネットマスク',
    status: '状態'
  },
  wlan: {
    title: 'WLAN状態',
    channel: 'チャンネル',
    bandwidth: '帯域幅',
    macAddress: 'MACアドレス',
    interface: 'インターフェース',
    name: '名前',
    alias: '別名',
    status: '状態',
    ssid: 'SSID',
    authentication: '認証',
    encryption: '暗号化',
    password: 'パスワード',
    bssid: 'BSSID',
    auto: '（自動）',
    enable: '有効にする',
    disable: '無効にする'
  },
  statistics: {
    title: '統計',
    ethernet: '統計 - イーサネット',
    wlan: '統計 - WLAN',
    port: 'ポート',
    rxbytes: '受信バイト',
    rxpackets: '受信パケット',
    rxerror: '受信エラー',
    rxdiscard: '受信破棄',
    txbytes: '送信バイト',
    txpackets: '送信パケット',
    txerror: '送信エラー',
    txdiscard: '送信破棄'
  },
  wifiNeighbor: {
    title: 'WiFi ネイバー',
    wifiNeighbor: 'WiFi ネイバー',
    ssid: 'SSID',
    bssid: 'BSSID',
    channel: 'チャンネル',
    signal: '信号強度 (%)',
    security: 'セキュリティ',
    wirelessMode: '無線モード',
    scan: 'スキャン',
    scanning: 'スキャン中...'
  },
  mesh: {
    title: 'メッシュ情報',
    networkInformation: 'メッシュネットワーク情報',
    nodeList: 'メッシュノードリスト',
    clientList: 'メッシュクライアントリスト',
    name: '名前',
    mode: 'モード',
    ipAddress: 'IPv4アドレス',
    macAddress: 'MACアドレス',
    mediaType: 'メディアタイプ',
    supportedBand: '対応バンド',
    upstream: 'アップストリーム',
    action: 'アクション',
    map: 'マップ',
    list: 'リスト',
    back: '戻る',
    steeringControl: 'ステアリング制御',
    selectedNode: '選択されたノード',
    destination: '接続先',
    selectDestination: '接続先を選択',
    band: 'バンド',
    selectBand: 'バンドを選択'
  },
  lcm: {
    title: "ステータス - LCM",
    execEnv: "実行環境",
    execUnits: "実行ユニット",
    deployUnits: "デプロイメントユニット",
    deploymentUnits: "デプロイメントユニット",
    name: "名前",
    status: "ステータス",
    url: "URL",
    uuid: "UUID",
    vendor: "ベンダー",
    version: "バージョン"
  },
  wireless: {
    title: '無線設定',
    basicConfig: '基本設定',
    advancedConfig: '詳細設定',
    wpsConfig: 'WPS設定',
    meshNetwork: 'メッシュネットワーク',
    settings: '設定',
    ssid: 'SSID',
    password: 'WPAキー',
    mode: 'モード',
    bandwidth: '帯域幅',
    channel: 'チャンネル',
    autoChannel: '自動チャンネル',
    wpsConfiguration: 'WPS設定',
    wpsPushButton: 'WPSプッシュボタン',
    wpsPushButtonDesc: '「WPSプッシュボタン」をクリックし、2分以内に接続したいデバイスのWPSボタンを押してください',
    wpsPinConnect: 'WPS PINコード接続',
    wpsPinConnectDesc: 'クライアントデバイスで生成されたPINコードを入力し、「デバイスを接続」ボタンをクリックしてWiFi接続を確立します',
    generatePinCode: 'PINコード生成',
    devicePinDesc: 'Wi-Fiに接続するには、ルーターで生成されたPINコードをデバイスに入力してください',
    enterPin: 'PINコードを入力してください',
    connect: 'デバイスを接続',
    vapInformation: 'VAP情報',
    band: 'バンド',
    authentication: '認証',
    encryption: '暗号化',
    wpsStatus: 'WPS状態',
    easyMesh: 'EasyMesh',
    commonSsidConfig: '共通SSID設定',
    pushButtonTitle: 'プッシュボタンで新しいデバイスを接続',
    pinConnectTitle: 'PINコードで新しいデバイスを接続',
    devicePinTitle: 'このデバイスをネットワークに追加するためのPINコード',
    pushButton: 'WPSプッシュボタン',
    pinCode: 'PINコード',
    pinCodeOfClient: 'クライアントデバイスのPINコード',
    noPublicKeys: '公開鍵が追加されていません'
  },
  wanSetup: {
    title: 'WAN設定',
    modeSetup: 'WANモード設定',
    modeManagement: 'WANモード管理',
    operationMode: '動作モード',
    wanMode: 'WANモード',
    manual: '手動',
    auto: '自動'
  },
  wanManagement: {
    addMode: 'WANモードを追加',
    editMode: 'WANモードを編集',
    name: '名前',
    interface: 'インターフェース',
    ipv4Mode: 'IPv4モード',
    ipv6Mode: 'IPv6モード',
    status: 'ステータス',
    type: '種類',
    action: 'アクション',
    physicalType: '物理タイプ',
    vlanType: 'VLANタイプ',
    vlanId: 'VLAN ID',
    vlanPriority: 'VLAN優先度',
    pppoeUsername: 'PPPoE ユーザー名',
    pppoePassword: 'PPPoE パスワード',
    staticIpv4: '静的IPv4アドレス',
    staticIpv6: '静的IPv6アドレス',
    ipv4Address: 'IPv4アドレス',
    ipv6Address: 'IPv6アドレス',
    defaultRouter: 'デフォルトルーター',
    subnetMask: 'サブネットマスク',
    prefixLength: 'プレフィックス長',
    dnsServers: 'DNSサーバー',
    addInterface: 'インターフェースを追加',
    edit: '編集',
    delete: '削除',
    detail: '詳細',
    confirmDelete: 'このWANモードを削除してもよろしいですか？',
    enableSensing: 'センシング有効化',
    ipv4DnsMode: 'IPv4 DNS モード',
    ipv6DnsMode: 'IPv6 DNS モード'
  },
  lanBasic: {
    title: 'LAN 設定',
    ipv4Configuration: 'IPv4 設定',
    deviceConnected: '接続済みデバイス',
    lanIpSetting: 'LAN IP 設定',
    enable: '有効化',
    ipAddress: 'IP アドレス',
    subnetMask: 'サブネットマスク',
    dhcpv4Setting: 'DHCPv4 設定',
    enableDhcpServer: 'DHCP サーバー有効化',
    dnsServer: 'DNS サーバー',
    beginAddress: '開始アドレス',
    endAddress: '終了アドレス',
    leaseTime: 'リース時間',
    seconds: '秒',
    ipAddressReservation: 'IP アドレス予約',
    add: '追加',
    macAddress: 'MAC アドレス',
    action: '操作',
    hostName: 'ホスト名',
    refresh: '更新',
    apply: '適用',
    cancel: 'キャンセル'
  },
  ddns: {
    title: 'DDNS設定',
    management: 'DDNS管理',
    addService: 'サービス追加',
    editService: 'サービス編集',
    refresh: '更新',
    no: '番号',
    provider: 'プロバイダー',
    domain: 'ドメイン名',
    username: 'ユーザー名',
    password: 'パスワード',
    wanInterface: 'WANインターフェース',
    status: '状態',
    lastUpdate: '最終更新',
    action: 'アクション',
    save: '保存',
    cancel: 'キャンセル',
    confirmDelete: 'このDDNSサービスを削除してもよろしいですか？'
  },
  ntp: {
    title: 'NTP',
    currentTime: '現在時刻',
    timeZoneSelect: 'タイムゾーン選択',
    automaticDaylight: '夏時間の自動調整',
    enableNtp: 'NTPクライアント更新を有効化',
    ntpServer: 'NTPサーバー',
    cancel: 'キャンセル',
    apply: '適用',
    placeholder: '値を入力してください'
  },
  ssh: {
    title: 'SSH',
    serverManagement: 'SSHサーバー管理',
    publicKeyManagement: '公開鍵管理',
    currentSessions: '現在のセッション',
    addServer: 'サーバー追加',
    editServer: 'サーバー編集',
    id: 'ID',
    interface: 'インターフェース',
    status: '状態',
    port: 'ポート',
    autoDisableServer: 'サーバー自動無効化',
    connectionTimeout: '接続タイムアウト',
    keepAliveMessage: 'キープアライブメッセージ',
    ipv4Prefix: 'IPv4プレフィックス',
    ipv6Prefix: 'IPv6プレフィックス',
    loginWithPassword: 'パスワードでログイン',
    rootLogin: 'rootログイン',
    rootLoginWithPassword: 'パスワードでrootログイン',
    enabled: '有効',
    disabled: '無効',
    action: 'アクション',
    enable: 'SSHサーバーを有効化',
    allowPasswordLogin: 'パスワードログインを許可',
    allowRootLogin: 'rootログインを許可',
    maxAuthTries: '最大認証試行回数',
    idleTimeout: 'アイドルタイムアウト（秒）',
    confirmDelete: 'このSSHサーバーを削除してもよろしいですか？',
    comment: 'コメント',
    publicKey: '公開鍵',
    select: '選択',
    clickToView: 'クリックして表示',
    key: '公開鍵',
    viewKey: '鍵を表示',
    newSshKey: '新しいSSH鍵',
    enterNewSshKey: '新しいSSH鍵を入力...',
    confirmDeleteKey: 'このSSH鍵を削除してもよろしいですか？',
    user: 'ユーザー',
    clientAddress: 'クライアントアドレス',
    clientPort: 'クライアントポート',
    serverId: 'サーバーID',
    serverPort: 'サーバーポート',
    algorithm : 'アルゴリズム'
  },
  device: {
    title: 'デバイス管理',
    tr069Config: 'TR-069設定',
    tr369Config: 'TR-369設定',
    enableCWMP: 'CWMPを有効にする',
    acsUrl: 'ACS URL',
    connectionRequestUrl: '接続要求URL',
    acsCredentials: 'ACS認証情報',
    connectionRequestCredentials: '接続要求認証情報',
    username: 'ユーザー名',
    password: 'パスワード',
    enablePeriodicInform: '定期的な通知を有効にする',
    periodicInformInterval: '定期的な通知の間隔',
    sendInform: 'ACSサーバーに通知を送信'
  },
  diagnostics: {
    title: '診断ツール',
    ping: 'Ping',
    traceRoute: 'トレースルート',
    dnsLookup: 'DNS検索',
    interface: 'インターフェース',
    protocol: 'プロトコル',
    targetHost: '対象IPアドレス/ドメイン',
    repeatTimes: '繰り返し回数',
    start: '開始',
    results: '結果',
    hostAddress: 'ホストIPアドレス',
    packetsInfo: 'パケット情報',
    sent: '送信',
    received: '受信',
    lost: '損失',
    minRoundTrip: '最小往復時間',
    maxRoundTrip: '最大往復時間',
    avgRoundTrip: '平均往復時間',
    hop: 'ホップ',
    host: 'ホスト',
    address: 'アドレス',
    rtt: 'RTT (ms)',
    dnsServer: 'DNSサーバー名/DNS IPアドレス',
    status: '状態',
    answerType: '回答タイプ',
    hostname: 'ホスト名',
    ipAddresses: 'IPアドレス',
    responseTime: '応答時間',
    dnsServerIp: 'DNSサーバーIP',
    processing: '処理中...',
    errorState: 'エラー: {state}',
    errorTimeout: 'リクエストがタイムアウトしました',
    errorInternal: '内部エラーが発生しました',
    errorNetwork: 'ネットワークエラーが発生しました',
    errorInvalidHost: '無効なホストが指定されました',
    errorResolveFailed: 'ホスト名の解決に失敗しました'
  },
  firmware: {
    title: 'ファームウェアアップグレード',
    firmwareBank: 'ファームウェアバンク',
    status: '状態',
    firmwareVersion: 'ファームウェアバージョン',
    action: 'アクション',
    activate: '有効化',
    uploadFirmware: 'ファームウェアのアップロード',
    chooseFile: 'ファイルを選択',
    noFileSelected: 'ファイルが選択されていません',
    dragAndDrop: 'ファイルをここにドラッグ＆ドロップ',
    autoActivate: '自動有効化',
    updateFirmware: 'ファームウェアの更新',
    selectFromComputer: 'またはコンピュータからファイルを選択',
    processing: '処理中...',
    upgrading: 'ファームウェアをアップグレード中...',
    activating: 'ファームウェアを有効化中...',
    powerOffWarning: '電源を切らないでください。',
    rebootWarning: '有効化後、デバイスが再起動します。'
  },
  reset: {
    title: 'デバイスリセット',
    restartTitle: 'デバイス再起動',
    restartDescription: 'デバイスを再起動します。これにより、すべてのユーザーと接続が一時的に切断されます。再起動プロセス中はデバイスを使用できません。',
    restartButton: '再起動',
    restartConfirm: 'デバイスを再起動してもよろしいですか？',
    factoryTitle: '工場出荷時設定',
    factoryDescription: 'デバイスを工場出荷時の設定にリセットします。これにより、すべての設定が消去され、デバイスが元の状態に復元されます。',
    factoryButton: '工場出荷時設定',
    factoryConfirm: 'デバイスを工場出荷時の設定にリセットしてもよろしいですか？すべての設定が失われます。',
    countdown: 'デバイスは{seconds}秒後に再起動します...',
    success: 'コマンドが正常に送信されました'
  },
  login: {
    title: 'ログイン',
    username: 'ユーザー名',
    password: 'パスワード',
    submit: 'ログイン',
    error: 'ユーザー名またはパスワードが無効です'
  },
  common: {
    save: '保存',
    cancel: 'キャンセル',
    close: '閉じる',
    refresh: '更新',
    create: '作成',
    apply: '適用',
    edit: '編集',
    delete: '削除',
    enable: '有効'
  }
};