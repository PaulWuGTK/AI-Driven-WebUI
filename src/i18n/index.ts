import { createI18n } from 'vue-i18n';

const messages = {
  en: {
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
      ssh: 'SSH'
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
    }
  },
  ja: {
    menu: {
      dashboard: 'ダッシュボード',
      status: 'ステータス',
      wan: 'WAN',
      lan: 'LAN',
      wlan: 'WLAN',
      statistics: '統計情報',
      wifiNeighbor: 'WiFiネイバー',
      meshInfo: 'メッシュ情報',
      lcm: 'LCM',
      basicSetting: '基本設定',
      management: '管理',
      ntp: 'NTP',
      ssh: 'SSH'
    },
    header: {
      account: 'アカウント',
      logout: 'ログアウト'
    },
    wan: {
      title: 'WANステータス',
      operationMode: '動作モード',
      sensingPolicy: 'センシングポリシー',
      sensingTimeout: 'センシングタイムアウト',
      wanMode: 'WANモード',
      interface: 'インターフェース',
      macAddress: 'MACアドレス',
      speed: '速度',
      duplex: 'デュプレックス',
      ipv4Address: 'IPv4アドレス',
      status: 'ステータス'
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
      status: 'ステータス'
    },
    wlan: {
      title: 'WLAN ステータス',
      channel: 'チャンネル',
      bandwidth: '帯域幅',
      macAddress: 'MACアドレス',
      interface: 'インターフェース',
      name: '名前',
      alias: 'エイリアス',
      status: 'ステータス',
      ssid: 'SSID',
      authentication: '認証',
      encryption: '暗号化',
      password: 'パスワード',
      bssid: 'BSSID',
      auto: '(自動)',
      enable: '有効',
      disable: '無効'
    },
    statistics: {
      title: '統計情報',
      ethernet: '統計情報 - イーサネット',
      wlan: '統計情報 - 無線LAN',
      port: 'ポート',
      rxBytes: '受信バイト',
      rxPackets: '受信パケット',
      rxError: '受信エラー',
      rxDiscard: '受信破棄',
      txBytes: '送信バイト',
      txPackets: '送信パケット',
      txError: '送信エラー',
      txDiscard: '送信破棄'
    },
    ntp: {
      title: 'NTP',
      currentTime: '現在時刻',
      timeZoneSelect: 'タイムゾーン選択',
      automaticDaylight: '夏時間を自動調整',
      enableNtp: 'NTPクライアント更新を有効にする',
      ntpServer: 'NTPサーバー',
      cancel: 'キャンセル',
      apply: '適用',
      placeholder: '値を入力してください'
    }
  }
};

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
});