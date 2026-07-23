# 資料模型文件 (Data Models)

> 本文件定義系統所有 API 回傳與請求的資料結構。
> 原始碼來自 TypeScript 介面，已轉換為語言無關的格式，供 Lua 端實作時參考。
>
> **型別說明：**
> - `0 | 1` = 整數布林值（0=false, 1=true）
> - `string` = 字串
> - `number` = 數字
> - `?` = 可選欄位
> - `[]` = 陣列

---

## 1. 認證 (Authentication)

### LoginResponse
```
absoluteTimeout: number        -- 絕對超時秒數
loginAttempts: number          -- 登入嘗試次數
idleTimeout: number            -- 閒置超時秒數
sessionID: string              -- Session ID（後續 API 請求使用）
```

### LoginVerifyResponse
```
Login: {
  status: "ok" | "captcha_invalid" | "captcha_expired" | "credentials_invalid" | "locked" | "failed"
  locked?: boolean             -- 帳號是否鎖定
  lockUntil?: number           -- 鎖定到期時間
  retryAfter?: number          -- 可重試等待秒數
  failCount?: number           -- 失敗次數
  error?: string               -- 錯誤訊息
  next?: string                -- 下一步重導路徑
  opMode?: string              -- 運作模式
  wizardRequired?: number | boolean  -- 是否需要 Wizard
}
```

---

## 2. Dashboard

### DashboardResponse
```
Dashboard: {
  Memory: {
    Total: number              -- 總記憶體 (KB)
    Free: number               -- 可用記憶體 (KB)
  }
  Ethernet: [                  -- 乙太網路埠列表
    {
      Duplex: string           -- 全雙工/半雙工
      Port: string             -- 埠名稱
      Speed: string            -- 速度
      Role: string             -- 角色（LAN/WAN）
      Status: string           -- 狀態（Up/Down）
    }
  ]
  WiFi: {
    wifi2g: {
      Password: string
      Enable: number           -- 0=停用, 1=啟用
      SecurityModeAvailable: string
      SSID: string
      SecurityMode: string
    }
    wifi5g: { ...同上 }
    wifi6g: { ...同上 }
  }
  Guest?: {                    -- 訪客 WiFi（可選）
    wifi2g: {
      Enable: number
      GuestClients: number     -- 訪客連線數
      SSID: string
      Password: string
    }
    wifi5g: { ...同上 }
    wifi6g: { ...同上 }
  }
  WAN: {
    Protocol: string           -- 連線協定
    InternetAddress: string    -- 外部 IP
    SubnetMask: string
    DefaultGateway: string
    PrimaryDNS: string
    SecondaryDNS: string
    MacAddress: string
  }
  CPU: {
    CPUUsage: number           -- CPU 使用率 (%)
  }
  System: {
    SoftwareVersion: string    -- 韌體版本
    HardwareVersion: string    -- 硬體版本
    SerialNumber: string       -- 序號
    ModelName: string          -- 型號名稱
  }
}
```

---

## 3. WAN 狀態

### WanStatusResponse
```
StatusWan: {
  SensingPolicy: string
  OperationMode: string
  WANMode: string
  SensingTimeout: string
  WANModeConfig: {
    Interfaces: [
      {
        Duplex: string
        Type: string
        PPPoEUserName: string
        VlanPriority: string
        MACAddress: string
        Name: string
        Speed: string
        VlanID: string
        PPPoEPassword: string
        WanPort: string
        ipv4: [
          {
            DNSServer: string
            Gateway: string
            Status: string
            SubnetMask: string
            IPv4Address: string
            IPv4Mode: string
          }
        ]
        ipv6: [
          {
            IPv6Address: string
            Prefix: string
            Gateway: string
            IPv6Type: string
            Status: string
            DNSServer: string
          }
        ]
      }
    ]
    DNSMode: string
    Status: string
    PhysicalType: string
    Origin: string
    EnableSensing: string
  }
}
```

### WanModeSetupResponse
```
WanModeSetup: {
  OperationMode: string
  WANMode: string
  WANModeList?: string[]       -- 支援的 WAN 模式列表
}
```

### StatusWanChtResponse（CHT 版）
```
StatusWanCht: {
  PPPoE: {
    Interface: string
    Protocol: string
    Status: string
    IPv4Address?: string
    IPv4Gateway?: string
    SubnetMask?: string
    IPv4PrimaryDNS?: string
    IPv4SecondaryDNS?: string
    MACAddress?: string
    IPv6Address?: string
    IPv6Gateway?: string
    IPv6Prefix?: string
    IPv6PrimaryDNS?: string
    IPv6SecondaryDNS?: string
  }
  IPoE: { ...同上 }
  Bridge: { ...同上 }
}
```

---

## 4. WAN 設定

### WanModeManagementResponse
```
WanModeManagement: [
  {
    WANMode: string
    Status: string
    PhysicalType: "Ethernet" | "ADSL" | "VDSL" | "SFP" | "GPON" | "GFAST" | "Bridge" | "WWAN"
    EnableSensing: number
    DNSMode: "Static" | "Dynamic" | ""
    IPv6DNSMode: "Static" | "Dynamic" | ""
    Interfaces: [
      {
        Interface: "wan" | "voip" | "mgmt" | "iptv"
        IPv4Mode: "dhcp4" | "ppp4" | "none" | "static" | "dslite" | "link"
        IPv6Mode: "dhcp6" | "ppp6" | "none" | "static" | "link"
        PPPoEUserName: string
        PPPoEPassword: string
        VLANType: "untagged" | "vlan" | "atm"
        VLANID: number
        VLANPriority: number
        StaticIPv4Address?: {
          DNSServers: string
          DefaultRouter: string
          IPv4Address: string
          SubnetMask: string
        }
        StaticIPv6Address?: {
          DNSServers: string
          DefaultRouter: string
          IPv6Address: string
          PrefixLength: number
        }
      }
    ]
  }
]
```

### BasicWanChtResponse（CHT 版 WAN 設定）
```
BasicWanCht: {
  PPPoE: {
    Enable: 0 | 1
    Protocol: string
    UserName: string
    Password: string
    ServiceName: string
    ConnectionTrigger: string
    IdleTime: number
    MTU: number
    DefaultGateway: 0 | 1
    PassthroughEnable: 0 | 1
    IPv4Enable: 0 | 1
    IPv6Enable: 0 | 1
    DNSMode: string
    PrimaryDNS: string
    SecondaryDNS: string
    NATEnable: 0 | 1
    IGMPEnable: 0 | 1
    VLANEnable: 0 | 1
    VLANPriority: number
    VLANID: number
    ListConnectionTrigger?: string[]
    ListDNSMode?: string[]
  }
  IPoE: {
    Enable: 0 | 1
    Protocol: string
    MTU: number
    DefaultGateway: 0 | 1
    IPv4Enable: 0 | 1
    IPv6Enable: 0 | 1
    DHCPv4Option60Enable: 0 | 1
    DHCPv4Option60Value: string
    DHCPv4Option61Enable: 0 | 1
    IAID: string
    DUIDType: string
    EnterpriseNumber: string
    Identifier: string
    DNSMode: string
    PrimaryDNS: string
    SecondaryDNS: string
    NATEnable: 0 | 1
    IGMPEnable: 0 | 1
    VLANEnable: 0 | 1
    VLANPriority: number
    VLANID: number
    IPAddress: string
    SubnetMask: string
    Gateway: string
    ListProtocol?: string[]
    ListDNSMode?: string[]
  }
  Bridge: {
    Enable: 0 | 1
    Protocol: string
    MTU: number
    VLANEnable: 0 | 1
    VLANPriority: number
    VLANID: number
    ListSupportedLANInterfaces?: string[]
    ListLANInterfaces: string[]
  }
}
```

### BackupWANResponse
```
BackupWAN: {
  PhysicalInterface: string
  SupportedEthernetInterface: string[]
  SupportedCellularInterface: string[]
  Enable: 0 | 1
  WHCEnable: 0 | 1
  PhysicalType: "Ethernet" | "Cellular"
  WANHealthCheck: [
    {
      CheckMethod: "Ping" | "DNS"
      Alias: string
      CheckPeriod: number
      Name?: string
      DNSAddress: string
      Status?: string
      PingAddress: string
      CheckCount: number
    }
  ]
}
```

---

## 5. LAN 設定

### LanStatusResponse
```
StatusLan: [
  {
    MACAddress: string
    Name: string
    MTU: string
    ipv4: [
      { Status: string, IPv4Netmask: string, IPv4Address: string, Name: string }
    ]
    ipv6: [
      { IPv6Address: string, Name: string, Status: string }
    ]
  }
]
```

### LanBasicResponse
```
LanBasic: {
  LANIPSetting: {
    IPv4Enable: 0 | 1
    IPv4Protocol: string
    IPv4IPAddress: string
    SubnetMask: string
    IPv6Enable: 0 | 1
    IPv6Protocol: string
    IPv6Address: string
    IPv6PrefixProtocol: string
    IPv6Prefix: string
    ListIPv4Protocol?: string[]
    ListIPv6Protocol?: string[]
    ListIPv6PrefixProtocol?: string[]
  }
  DHCPv4Setting: {
    Enable: 0 | 1
    DNSServers: string
    BeginAddress: string
    EndAddress: string
    SubnetMask: string
    LeaseTime: number
  }
  IPAddressReservation: [
    {
      MACAddress: string
      IPAddress: string
      Enable: 0 | 1
    }
  ]
}
```

### DeviceConnectedResponse
```
LanDeviceConnected: [
  {
    Host: string
    MACAddress: string
    IPAddress: string
  }
]
```

### BasicBridgeLanResponse（Bridge/CHT 版 LAN）
```
BasicBridgeLan: {
  IPv4Enable: 0 | 1
  IPv4Protocol: string
  IPv4Address: string
  SubnetMask: string
  IPv6Enable: 0 | 1
  IPv6Protocol: string
  IPv6Address: string
  IPv6Prefix: string
  ListIPv4Protocol: string[]
  ListIPv6Protocol: string[]
}
```

### StatusBridgeLanResponse
```
StatusBridgeLan: {
  IPv4Protocol: string
  IPv4Address: string
  SubnetMask: string
  IPv4Status: string
  MACAddress: string
  IPv6Protocol: string
  IPv6Address: string
  IPv6Prefix: string
  IPv6Status: string
}
```

---

## 6. 無線網路 (Wireless / WLAN)

### WlanBasicResponse
```
WlanBasic: {
  MLOEnable: number
  CommonSSIDEnable: number
  MeshEnable?: number
  wifimlo: { Enable: number, Password: string, SecurityMode: string, SSID: string, SecurityModeAvailable?: string }
  wifi2g: { Password: string, SecurityMode: string, SSID: string, Enable: number, SecurityModeAvailable?: string }
  wifi5g: { ...同上 }
  wifi6g: { ...同上 }
}
```

### WlanBasicMultiGetResponse（多 SSID 群組版）
```
WlanBasic: {
  WlanGroup: [
    {
      Index?: number
      Enable?: 0 | 1
      Alias?: string
      SSID?: string
      SecurityMode?: string
      KeyPassPhrase?: string
      CommonSSIDEnable: 0 | 1
      MLOEnable: 0 | 1
      BridgeInterface?: string
      MFPConfig?: string | number
      SecurityModeAvailable?: string
      SSIDAdvertisementEnabled?: 0 | 1
      IsolationEnable?: 0 | 1
      CommonSSIDBandSetting?: [
        { Band: string, Enable: 0 | 1 }
      ]
      Interface: [
        {
          Name?: string
          Alias?: string
          Band: string
          Enable: 0 | 1
          SSID: string
          SecurityMode: string
          SecurityModeAvailable?: string
          KeyPassPhrase?: string
          WpaPreShareKey?: string
          MFPConfig?: string | number
          AccessPointReference?: string
          SSIDReference?: string
          SSIDAdvertisementEnabled?: 0 | 1
          IsolationEnable?: 0 | 1
        }
      ]
    }
  ]
}
```

### WlanAdvancedResponse
```
WlanAdvanced: {
  MLOEnable?: number
  wifi2g: {
    RadioEnable: number
    Mode: string
    Channel: string | number
    ChannelBandwidth: string
    AutoChannelEnable: number
    MultiUserMIMOEnabled?: number
    ModeList?: string
    ChannelBandwidthList?: string
    ChannelList?: string
    Band?: string
  }
  wifi5g: { ...同上 }
  wifi6g: { ...同上 }
}
```

### WlanWpsResponse
```
WlanWps: {
  Enable: number
  PINCode: string
  PairingResult?: "NotExecute" | "PairingInprogress" | "Success" | "NotSuccess"
  Band: [
    {
      Band: string
      SSID: string
      AuthType: string
      ConnectStatus: string
      EncryType: string
      Configured: string
    }
  ]
}
```

### WlanMeshResponse
```
WlanMesh: {
  MeshEnable: number
  Enable: number
  SSID: string
  SecurityMode: string
  Password: string
  MLOEnable: number
  CommonSSIDEnable: number
}
```

### WlanStatusResponse
```
StatusWlan: [
  {
    Band: string
    Channel: number
    AutoChannel: 0 | 1
    Bandwidth: string
    MACAddress: string
    Enable: 0 | 1
    Interface: [
      {
        Alias: string
        Password: string
        Authentication: string
        Encryption: string
        BSSID: string
        Enable: 0 | 1
        SSID: string
        Name: string
      }
    ]
    AssociatedDevice?: [
      {
        MACAddress: string
        BSSID: string
        ConnectionDuration: number
        SignalStrength: number
        LastDataDownlinkRate: number
        LastDataUplinkRate: number
      }
    ]
  }
]
```

---

## 7. Mesh 網路

### MeshMapResponse
```
MeshMap: [
  {
    Name: string
    Mode: "Controller" | "Agent" | "Client"
    ipv4: string
    MACAddress: string
    MediaType: string
    Upstream: string
    UpstreamBand?: string
    SupportedBand?: string
    TxRate?: string
    RxRate?: string
    RSSI?: number | string
  }
]
```

### SteeringControlData（客戶端導引）
```
{
  stationMac: string
  targetBssid: string
  band: string
}
```

---

## 8. 行動網路 (Cellular)

### CellularResponse
```
Cellular: {
  RoamingEnabled: number
  RoamingStatus: string
  ConnectionStatus: string
  ConnectionTime: number
  InterfaceEnable: number
  PreferredAccessTechnology: string
  SupportedAccessTechnologies: string
  IMEI: string
  IMSI: string
  ICCID: string
  USIMStatus: string
  PLMN: string
  OperatorName: string
  PIN: string
  PINCheck: string
  PINRemain: string
  PUKRemain: string
  APN: string
  Username: string
  Password: string
  X_PRPLWARE_COM_IPType: string
  RSSI: number
  RSRP: number
  RSRQ: number
  SINR: string
  PCI: string
  CellID: string
  ConnectedBand: string
  DLEarfcn: string
  UplinkCurrentSpeed: string
  DownlinkCurrentSpeed: string
  VoiceUplinkTraffic: string
  VoiceDownlinkTraffic: string
  PacketsReceived: number
  PacketsSent: number
  BytesReceived: number
  BytesSent: number
}
```

### CellularConfigRequest
```
Cellular: {
  RoamingEnabled: 0 | 1
  InterfaceEnable: 0 | 1
  X_PRPLWARE_COM_IPType: string
  APN: string
  PreferredAccessTechnology: string
}
```

---

## 9. NAT

### PortForwardingResponse
```
PortForwarding: {
  WanList: string[]
  ProtoList: string[]
  PortForwardList: [
    {
      No: number
      Enable: 0 | 1
      Description: string
      Protocol: string
      Interface: string
      ExternalPortRange: string
      InternalPort: string
      InternalIPAdress: string
    }
  ]
}
```

### DmzResponse
```
AdvancedDmz: {
  Enable: 0 | 1
  IPAddress: string
}
```

---

## 10. 安全 (Security)

### MACFilteringResponse（WiFi MAC 過濾）
```
MACFiltering: {
  wifi2g: [
    { Path: string, SSID: string, ACLMode: string, MACList: string }
  ]
  wifi5g: [ ...同上 ]
  wifi6g: [ ...同上 ]
}
```

### GeneralMacFilteringResponse（一般 MAC 過濾）
```
MACFiltering: {
  Enable: 0 | 1
  WhiteList: [
    { No: number, MACAddress: string, Comment: string }
  ]
  BlackList: [
    { No: number, MACAddress: string, Comment: string }
  ]
}
```

### IpFilteringResponse
```
IPFiltering: {
  Enable: 0 | 1
  ProtoList: string[]
  BlackList: [
    { No: number, IPStart: string, IPEnd: string, Protocol: "TCP" | "UDP" | "Both", Comment: string }
  ]
  WhiteList: [
    ...同上
  ]
}
```

---

## 11. SSH 服務

### SshServerResponse
```
SshServer: {
  Interfaces: string[]
  SshServers: [
    {
      ID: string
      Interface: string
      Status: string
      AllowAllIPv4: number
      AllowAllIPv6: number
      AllowPasswordLogin: number
      AllowRootLogin: number
      AllowRootPasswordLogin: number
      AutoDisableDuration: number
      Enable: number
      IPv4AllowedSourcePrefix: string
      IPv6AllowedSourcePrefix: string
      IdleTimeout: number
      KeepAlive: number
      MaxAuthTries: number
      Port: number
    }
  ]
}
```

### SshSessionResponse
```
SshSession: [
  { User: string, ClientIP: string, ClientPort: number, ServerID: string, ServerPort: number }
]
```

### SshAuthorizedKeyResponse
```
SshAuthorizedKey: [
  { Key: string }
]
```

---

## 12. QoS

### QosBandwidthResponse
```
QosBandwidth: {
  Enable: 0 | 1
  Bandwidth: {
    Download: number
    Upload: number
    Priority: {
      High: { Min: number, Max: number }
      Medium: { Min: number, Max: number }
      Low: { Min: number, Max: number }
      "Low-latency": { Min: number, Max: number }
    }
  }
}
```

### QosRuleResponse
```
QosRule: {
  ApplicationTypeList: [
    { ApplicationType: string, Port: string, Protocol: string }
  ]
  DeviceList: [
    { DeviceName: string, MACAddress: string }
  ]
  ProtocolList: string[]
  PriorityList: string[]
  RuleList: [
    {
      Order: number
      Type: "Application" | "Device"
      ApplicationName: string
      DeviceName: string
      MACAddress: string
      Port: string
      Protocol: string
      Priority: string
    }
  ]
}
```

---

## 13. DDNS

### DdnsResponse
```
Ddns: {
  ServNum: number
  SupServProv: string[]
  Interfaces: string[]
  Service: [
    {
      ID: string
      ServProv: string
      ServUsername: string
      ServPassword: string
      DomainName: string
      UpdatedIP: string
      Status?: string
      LastUpdate?: string
      HostEnable: number
    }
  ]
}
```

---

## 14. 服務控制 (Service Control)

### ServiceControlResponse
```
AdvancedServiceControl: {
  Rules: [
    {
      DestPort: string
      Protocol: string
      Action: string
      Enable: 0 | 1
      Service: string
      Interface: string
      InterfaceOriginal?: string
      IPVersion: number
      SourceIPStart?: string
      SourceIPEnd?: string
    }
  ]
  ACLAvailableOptions: {
    Protocols: [ { value: string, label: string } ]
    IPVersions: [ { value: string, label: string } ]
    Interfaces: [ { value: string, label: string } ]
    Services: [ { value: string, port: string, protocol: string } ]
  }
}
```

---

## 15. MCL（管理控制清單）

### AdvancedMclMGMTResponse
```
AdvancedMclMGMT: {
  WanAccessMode: "AnyWAN" | "MultipleWAN"
  WanAccessInterfaces: string[]
  Services: {
    [ServiceName]: {           -- ServiceName: HTTP | HTTPS | FTP | TELNET | SSH | PING | TFTP
      LAN: 0 | 1
      WAN: 0 | 1
      TrustDomain: 0 | 1
      Port: string
    }
  }
  ReadOnly: {
    [ServiceName]: string[]    -- 唯讀欄位列表
  }
}
```

### AdvancedMclTrustDomainResponse
```
AdvancedMclTrustDomain: string[]     -- 信任網域列表
```

---

## 16. LCM（容器生命週期管理）

### StatusLcmResponse
```
StatusLcm: {
  ExecutionUnitNumberOfEntries: number
  ExecEnvNumberOfEntries: number
  DeploymentUnitNumberOfEntries: number
  DeploymentUnits: [
    { Name: string, URL: string, Status: string, Version: string, Vendor: string, UUID: string, Alias: string, Resolved: number }
  ]
}
```

### LcmDeploymentUnitResponse
```
AdvancedLcmDeploymentUnit: {
  DUList: [
    {
      Name: string, UUID: string, DUID: string, Version: string, Status: string
      Description: string, InstalledEE: string, URL: string, Privileged: 0 | 1
      NetworkConfig: {
        ShareParentNetwork: 0 | 1
        AccessInterfaces: string[]
        PortForwarding: [ { Protocol: string, ExternalPort: number, Interface: string, InternalPort: number } ]
      }
      HostObject: [ { Source: string, Destination: string, Type: string } ]
      AutoRestart: { Enable: 0 | 1, MaxRetryCount: number }
    }
  ]
  ExecEnvList: [ { Name: string } ]
  InterfaceList: string[]
  ProtocolList: string[]
  HostObjectMountType: string[]
}
```

### LcmExecEnvResponse
```
AdvancedLcmExecEnv: {
  MaxMem: number
  MaxDisk: number
  ExecEnvList: [
    { Name: string, Status: string, Enable: 0 | 1, AllocatedCpu: number, AllocatedMem: number, AllocatedDisk: number }
  ]
}
```

### ExecutionUnitResponse
```
AdvancedLcmExecutionUnit: [
  { Name: string, EUID: string, AutoRestart: boolean, Status: string, Uptime: number }
]
```

### LcmMonitorResponse
```
AdvancedLcmMonitor: [
  {
    EEName: string
    AvailableMemory: number
    AvailableDiskSpace: number
    EUList: [
      { EUName: string, State: string, PID: number, IPAddress: string[], UID: number }
    ]
  }
]
```

---

## 17. 靜態路由

### StaticRouteResponse
```
StaticRoute: {
  IPv4: [
    { Enable: 0 | 1, Alias: string, DestIp: string, DestMask: string, GatewayIp: string, UsedGWIp: 0 | 1, WanIf: string }
  ]
  IPv6: [
    { Enable: 0 | 1, Alias: string, DestIp: string, PrefixLen: number, GatewayIp: string, UsedGWIp: 0 | 1, WanIf: string }
  ]
  WanIfList?: string[]
}
```

### DnsRouteResponse
```
DNSRoute: [
  { Enable: 0 | 1, Alias: string, DomainName: string, SubMask: string, WanIf: string }
]
WanIfList?: string[]
```

---

## 18. 系統統計

### StatisticsResponse
```
Statistics: {
  Ethernet: [
    { Port: string, RxBytes: string, RxPackets: string, RxError: string, RxDiscard: string, TxBytes: string, TxPackets: string, TxError: string, TxDiscard: string }
  ]
  Wlan: [ ...同上 ]
}
```

### SystemStatsResponse
```
StatusSystemStat: {
  LAN: [ { Receive: string, Sent: string, interface?: string } ]
  WAN: [ { Receive: string, Sent: string, interface?: string } ]
  WiFi: {
    wifi2g: { Receive: string, Sent: string }
    wifi5g: { Receive: string, Sent: string }
    wifi6g: { Receive: string, Sent: string }
  }
}
```

---

## 19. 系統日誌 (Log)

### LogResponse
```
StatusLog: {
  categories?: {
    [key]: { alias: string, pattern: string }
  }
  matchCount: number
  source: string
  count: number
  more: boolean
  serverTime: string
  entries: [
    { host: string, ts: string, program: string, severity: string, raw: string, message: string, module: string, account?: string, interface?: string, ip?: string }
  ]
  limitDefault?: number
  limitMax?: number
  url?: string
  filename?: string
  size?: number
}
```

### LogRequest
```
StatusLog: {
  limit?: number
  categories?: { [key]: number }
  contains?: string
  export?: string
}
```

---

## 20. 診斷工具

### DiagnosticsResponse
```
ManagementDiagnostic: {
  IPPing: {
    AverageResponseTimeDetailed: number
    DataBlockSize: string
    DiagnosticsState: string
    FailureCount: string
    Host: string
    Interface: string
    MaximumResponseTimeDetailed: number
    MinimumResponseTimeDetailed: number
    NumberOfRepetitions: string
    ProtocolVersion: string
    SuccessCount: string
    Timeout: string
  }
  TraceRoute: {
    DataBlockSize: string
    DiagnosticsState: string
    Host: string
    IPAddressUsed: string
    Interface: string
    MaxHopCount: string
    NumberOfTries: string
    ProtocolVersion: string
    RouteHopsNumberOfEntries: string
    Timeout: string
    RouteHops: [
      { HostAddress: string, RTTimes: string, Host: string, ErrorCode: string }
    ]
  }
  DNSLookup: {
    DNSServer: string
    DiagnosticsState: string
    HostName: string
    Interface: string
    NumberOfRepetitions: string
    ResultNumberOfEntries: string
    SuccessCount: string
    Timeout: string
    Result: [
      { Status: string, AnswerType: string, IPAddresses: string, HostNameReturned: string, ResponseTime: string, DNSServerIP: string }
    ]
  }
  Interfaces: [
    { Name: string, IPv4Enable: boolean, IPv6Enable: boolean, Interface: string }
  ]
}
```

---

## 21. 韌體管理

### FirmwareResponse
```
UpgradeFw: {
  UpgradeFw: {
    [bankName]: {
      Name: string
      Available: number
      BootFailureLog: string
      Version: string
      Alias: string
      Status: string
      Switch_Status?: string
      FW_UG_Status?: string
      Min_Allowed_Ver?: string
      PRPL_Ver?: string
      BSP_Ver?: string
      GTK_FW_Ver?: string
      Rollback?: number
    }
  }
}
```

### DualImageResponse
```
StatusDualImage: {
  boot_partition: string
  p1_version: string
  p2_version: string
}
```

---

## 22. 帳號管理

### ManagementAccountResponse（標準版）
```
ManagementAccount: {
  Username: string
  MaxLength: number
  NoSpace: boolean
  DMWritable: boolean
  DMReadable: boolean
}
```

### ManagementAccountChtResponse（CHT 版，多使用者）
```
ManagementAccountCht: {
  CurrentUser: {
    UserPath: string
    Username: string
    UserType: "super" | "normal"
    RoleAlias: string
  }
  Users: [
    {
      UserPath: string
      Username: string
      Enable: 0 | 1
      StaticUser: 0 | 1
      UserType: "super" | "normal"
      RoleAlias: string
      Editable: 0 | 1
      Deletable: 0 | 1
      RetryCount?: number
      IdleTimeoutMin?: number
      LockTimeMin?: number
    }
  ]
  MaxLength: number
  NoSpace: 0 | 1
  DMWritable: 0 | 1
  DMReadable: 0 | 1
}
```

---

## 23. NTP

### NtpResponse
```
Ntp: {
  CurrentLocalTime: string
  TimeZones: string
  DstEnable: number
  NtpEnable: number
  NtpServers: string[]
}
```

---

## 24. 裝置管理 (TR-069 / TR-369)

### TR069Config
```
{
  URL: string
  EnableCWMP: number
  ConnectionRequestUsername: string
  Password: string
  ConnectionRequestPassword: string
  PeriodicInformEnable: number
  PeriodicInformInterval: number
  Username: string
  ConnectionRequestURL: string
  SessionStatus: string
  PrimaryURL: string
  PrimaryUsername: string
  PrimaryPassword: string
  BackupURL: string
  BackupUsername: string
  BackupPassword: string
}
```

### TR369Response
```
TR369: {
  AgentEndpointID: string
  Controller: [
    {
      Enable: number
      Alias: string
      Status?: string
      ControllerEndpointID: string
      ControllerTopic: string
      AgentTopic: string
      BrokerAddress: string
      BrokerPort: number
      Username: string
      Password: string
      ClientID: string
      PeriodicNotify: number
      KeepAliveTime: number
      ConnectRetryTime: number
      ConnectRetryMaxInterval: number
      ProtocolVersion: string
      TransportProtocol: string
    }
  ]
}
```

---

## 25. UPnP

### UpnpResponse
```
ApplicationUpnp: {
  Enable: 0 | 1
  Interface: string
  InterfaceOptions?: [ { value: string, label: string } ]
  PortMappings?: [
    {
      Path: string, Description: string, ExternalPort: number, Id: number
      Origin: string, InternalPort: number, RemainingLeaseTime: number
      LeaseDuration: number, RemoteHost: string, Enable: 0 | 1
      Interface: string, Status: string, InternalClient: string
      Protocol: string, ExternalPortEnd: number
    }
  ]
  PortMappingStats?: { total: number }
}
```

---

## 26. 運作模式

### OperationModeResponse
```
OperationMode: {
  ListModes: string[]
  Mode: string
}
```

---

## 27. Extender（無線延伸）

### ExtenderResponse
```
Extender: {
  ExtenderEnabled: { Enabled: number }
  ExtenderRole: { Role: "MeshAgent" | "Repeater" }
  ConnectionStatus: {
    "2.4GHz": { Status: string, SSID: string, Security: string }
    "5GHz": { ...同上 }
    "6GHz": { ...同上 }
  }
  Wps: { WpsPinCode: string }
  ip_address?: string
  message?: string
}
```

### ExtenderScanResponse
```
ExtenderScan: [
  { SSID: string, Channel: number, Band: string, Signal: string, Security: string }
]
```

---

## 28. WiFi 鄰居掃描

### WifiNeighborScanResponse
```
WifiNeighbor: [
  { WirelessMode: string, Channel: number, BSSID: string, Security: string, SSID: string, Signal: number }
]
```

---

## 29. 訪客網路 (Guest)

### GuestWiFiResponse
```
GuestWiFi: {
  Enable: number
  MLOEnable: number
  MeshEnable?: number
  Password: string
  SecurityMode: string
  SSID: string
  SecurityModeAvailable: string
}
```

### GuestLANResponse
```
GuestLAN: {
  GUESTIPSetting: { Enable: number, IPAddress: string, SubnetMask: string }
  DHCPv4Setting: { Enable: number, DNSServers: string, BeginAddress: string, EndAddress: string, SubnetMask: string, LeaseTime: string | number }
}
```

### GuestDeviceConnectedResponse
```
GuestDeviceConnected: [ { Host: string, IPAddress: string, MACAddress: string } ]
```

---

## 30. Speed Test

### SpeedTestResponse
```
AppXperienceControl: {
  status_code: number
  data: {
    download_udp: { throughput: number }
    upload_udp: { throughput: number }
    ping: { packet_loss: number, min_echo_time: number, mean_echo_time: number, max_echo_time: number }
  }
}
```

### TR471Response
```
TR471: {
  Server: string, Port: string, Role: string, MTU: string, DSCP: string
  Interface: string, ProtocolVersion: string, RateAdjAlgorithm: string
  JumboFramesPermitted: number, LocalInterfaceRateIncluded: number
  IPDVEnable: number, FlowCount: string, MaximumFlows: string
  ...（完整欄位請參考 tr471.ts）
  DiagnosticsState?: string
  MaxIPLayerCapacity?: string
  LossRatioSummary?: string
  RTTRangeSummary?: string
  PDVRangeSummary?: string
  IncrementalResult?: [
    { Index: number, IPLayerCapacity: string, RTTRange: string, PDVRange: string, LossRatio: string }
  ]
}
```

---

## 31. Thread（IoT）

### ThreadStatusResponse
```
ThreadStatus: {
  "Border Router": {
    Status: string
    BorderAgentID: string
    MLE: {
      Stats: { "RX Dropped": number, "TX Bytes": number, ... }
      LeaderData: { DataVersion: number, LeaderRouterID: number, StableDataVersion: number, PartitionID: number, Weighting: number }
      Rloc16: string, Role: string, FirmwareVersion: string, ExtendedMAC: string, Interface: string
      Dataset: { Channel?: number, ExtendedPanId?: string, MeshLocalPrefix?: string, NetworkKey?: string, NetworkName?: string, PSKc?: string, PanId?: string, ... }
    }
  }
}
```

### ThreadConfigurationResponse
```
ThreadConfiguration: {
  Enable: boolean
  ActiveDataset: { NetworkName: string, NetworkKey: string, Channel: number, ChannelMask: number, PanId: string, ExtPanId: string, MeshLocalPrefix: string, PSKc: string, SecurityPolicy: {...} }
  PendingDataset: { ...同上 }
}
```

### ThreadTopologyResponse
```
ThreadTopology: {
  Links: { [key]: { Quality: { LinkQualityIn: number, LinkQualityOut: number, RouteCost: number }, type: string } }
  Nodes: { [key]: { ClientId: number, IPv6AddressList: string[], Mode: { FullNetworkData: boolean, FullThreadDevice: boolean, RxOnWhenIdle: boolean }, Rloc16: string, Role: string, RouterId: number } }
}
```

---

## 32. Wizard（初始設定精靈）

### WizardData（GET 回傳）
```
{
  ModelName: string
  OpMode: string
  Wan: { WANMode: string, WANModeList: string[] }
  WiFi: {
    CommonSSIDEnable: number, MLOEnable: number, MeshEnable: number, MFPConfig: number, PSC6g: number
    wificommon: { Enable: number, SSID: string, SecurityMode: string, SecurityModeAvailable: string, Password: string }
    wifi2g: { ...同上 }
    wifi5g: { ...同上 }
    wifi6g: { ...同上 }
  }
}
```

### WizardSubmitData（POST 提交）
```
WizardRouter: {
  Action: "Config" | "Skip"
  Wan?: { WANMode: string }
  WiFi?: {
    CommonSSIDEnable: number, MLOEnable: number, MeshEnable: number, MFPConfig: number, PSC6g: number
    wificommon: { Enable: number, SSID: string, SecurityMode: string, Password: string }
    wifi2g: { ...同上 }
    wifi5g: { ...同上 }
    wifi6g: { ...同上 }
  }
  Admin?: { Username: string, Password: string }
}
```

### WizardSubmitResponse
```
WizardRouter: {
  ok: boolean
  message: string
  job_id: string
  eta_seconds: number
}
```
