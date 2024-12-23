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
      management: 'Management'
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
      management: '管理'
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
    }
  }
};

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
});