# API 規格文件 (API Specification)

> 本文件列出系統所有 API 端點、HTTP 方法、請求/回應格式。
> 資料結構的詳細欄位定義請參考 `02-data-models.md`。

---

## 1. 通用規範

### 1.1 Base URL
```
/API/info?list={ResourceName}
```

### 1.2 認證方式
```
Authorization: bearer <sessionID>
```
- 除了 `/API/info?list=Login` 和 `/session` 外，所有 API 請求都需要此 Header
- 401/403 回應表示 session 失效，需重新登入

### 1.3 Content-Type
```
Content-Type: application/json
```

### 1.4 錯誤回應格式
```json
{ "NOK": "錯誤訊息" }
```

### 1.5 成功回應格式
```json
{ "OK": "成功訊息" }
```

---

## 2. 認證 API

### 2.1 登入驗證
```
POST /API/info?list=Login
```
**Request Body:**
```json
{
  "Login": {
    "username": "admin",
    "password": "password123",
    "captchaId": "abc123",
    "captcha": "1234"
  }
}
```
**Response:** `LoginVerifyResponse` (見 data-models.md #1)

### 2.2 建立 Session
```
POST /session
```
**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```
**Response:** `LoginResponse`
```json
{
  "absoluteTimeout": 86400,
  "loginAttempts": 3,
  "idleTimeout": 600,
  "sessionID": "xxx-xxx-xxx"
}
```

---

## 3. Dashboard API

### 3.1 取得 Dashboard 資料
```
GET /API/info?list=Dashboard
```
**Response:** `DashboardResponse` (見 data-models.md #2)

---

## 4. 狀態查詢 API (Status)

### 4.1 WAN 狀態
```
GET /API/info?list=StatusWan
```
**Response:** `WanStatusResponse`

### 4.2 WAN 狀態（CHT 版）
```
GET /API/info?list=StatusWanCht
```
**Response:** `StatusWanChtResponse`

### 4.3 LAN 狀態
```
GET /API/info?list=StatusLan
```
**Response:** `LanStatusResponse`

### 4.4 LAN 狀態（Bridge 版）
```
GET /API/info?list=StatusBridgeLan
```
**Response:** `StatusBridgeLanResponse`

### 4.5 WLAN 狀態
```
GET /API/info?list=StatusWlan
```
**Response:** `WlanStatusResponse`

### 4.6 統計資訊
```
GET /API/info?list=StatusSystemStat
```
**Response:** `SystemStatsResponse`

### 4.7 系統日誌
```
GET /API/info?list=StatusLog
```
**Response:** `LogResponse`

```
POST /API/info?list=StatusLog
```
**Request Body:** `LogRequest`（含篩選條件）

### 4.8 雙映像資訊
```
GET /API/info?list=StatusDualImage
```
**Response:** `DualImageResponse`（注意：此 API 從 data-models.md 推斷，實際端點名稱請確認）

### 4.9 Mesh 網路資訊
```
GET /API/info?list=MeshMap
```
**Response:** `MeshMapResponse`

```
POST /API/info?list=MeshMap
```
**Request Body:** `SteeringControlData`（客戶端導引）

### 4.10 LCM 狀態
```
GET /API/info?list=StatusLcm
```
**Response:** `StatusLcmResponse`（注意：此端點從 types 推斷）

---

## 5. WAN 設定 API

### 5.1 WAN 模式設定查詢
```
GET /API/info?list=WanModeSetup
```
**Response:** `WanModeSetupResponse`

### 5.2 WAN 模式設定更新
```
POST /API/info?list=WanModeSetup
```
**Request Body:** `WanModeSetupUpdateRequest`

### 5.3 WAN 模式管理查詢
```
GET /API/info?list=WanModeManagement
```
**Response:** `WanModeManagementResponse`

### 5.4 WAN 模式管理更新
```
POST /API/info?list=WanModeManagement
```
**Request Body:** `WanModeManagementUpdateRequest`

### 5.5 WAN 設定（CHT 版）
```
GET /API/info?list=BasicWanCht
```
**Response:** `BasicWanChtResponse`

```
POST /API/info?list=BasicWanCht
```
**Request Body:** 各連線類型（PPPoE/IPoE/Bridge）的設定

### 5.6 備援 WAN
```
GET /API/info?list=BackupWAN
```
**Response:** `BackupWANResponse`

```
POST /API/info?list=BackupWAN
```
**Request Body:** `BackupWANRequest`

---

## 6. LAN 設定 API

### 6.1 LAN 基本設定
```
GET /API/info?list=LanBasic
```
**Response:** `LanBasicResponse`

```
POST /API/info?list=LanBasic
```
**Request Body:** `LanBasicUpdateRequest`

### 6.2 已連線裝置
```
GET /API/info?list=LanDeviceConnected
```
**Response:** `DeviceConnectedResponse`

### 6.3 Bridge LAN 設定
```
GET /API/info?list=BasicBridgeLan
```
**Response:** `BasicBridgeLanResponse`

```
POST /API/info?list=BasicBridgeLan
```
**Request Body:** `BasicBridgeLanUpdateRequest`

---

## 7. 無線網路 API (Wireless)

### 7.1 基本無線設定
```
GET /API/info?list=WlanBasic
```
**Response:** `WlanBasicResponse`

```
POST /API/info?list=WlanBasic
```
**Request Body:** `WlanBasicResponse`（更新結構同回應）

### 7.2 多 SSID 群組設定
```
GET /API/info?list=WlanGroup
```
**Response:** `WlanBasicMultiGetResponse`

```
POST /API/info?list=WlanGroup
```
**Request Body:** `WlanBasicMultiPostRequest`

### 7.3 進階無線設定
```
GET /API/info?list=WlanAdvanced
```
**Response:** `WlanAdvancedResponse`

```
POST /API/info?list=WlanAdvanced
```
**Request Body:** `WlanAdvancedResponse`（更新結構同回應）

### 7.4 WPS 設定
```
GET /API/info?list=WlanWps
```
**Response:** `WlanWpsResponse`

```
POST /API/info?list=WlanWps
```
**Request Body:** WPS 啟用/觸發配對

### 7.5 Mesh 設定
```
GET /API/info?list=WlanMesh
```
**Response:** `WlanMeshResponse`

```
POST /API/info?list=WlanMesh
```
**Request Body:** `WlanMeshResponse`（更新結構同回應）

### 7.6 WiFi MAC 過濾
```
GET /API/info?list=MACFiltering
```
**Response:** `MACFilteringResponse`

```
POST /API/info?list=MACFiltering
```
**Request Body:** `MACFilteringUpdateRequest`

---

## 8. 行動網路 API (Cellular)

### 8.1 行動網路資訊
```
GET /API/info?list=Cellular
```
**Response:** `CellularResponse`

### 8.2 行動網路設定更新
```
POST /API/system
```
**Request Body:** `CellularConfigRequest`

---

## 9. NAT API

### 9.1 Port Forwarding
```
GET /API/info?list=PortForwarding
```
**Response:** `PortForwardingResponse`

```
POST /API/info?list=PortForwarding
```
**Request Body:** `PortForwardingUpdateRequest`

### 9.2 DMZ
```
GET /API/info?list=AdvancedDmz
```
**Response:** `DmzResponse`

```
POST /API/info?list=AdvancedDmz
```
**Request Body:** `DmzUpdateRequest`

---

## 10. 安全 API (Security)

### 10.1 一般 MAC 過濾
```
GET /API/info?list=MACFiltering
```
**Response:** `GeneralMacFilteringResponse`

```
POST /API/info?list=MACFiltering
```
**Request Body:** `GeneralMacFilteringUpdateRequest`

### 10.2 IP 過濾
```
GET /API/info?list=IPFiltering
```
**Response:** `IpFilteringResponse`

```
POST /API/info?list=IPFiltering
```
**Request Body:** `IpFilteringRequest`

---

## 11. SSH API

### 11.1 SSH 伺服器設定
```
GET /API/info?list=SshServer
```
**Response:** `SshServerResponse`

```
POST /API/info?list=SshServer
```
**Request Body:** SSH 伺服器設定更新

### 11.2 SSH 公鑰管理
```
GET /API/info?list=SshAuthorizedKey
```
**Response:** `SshAuthorizedKeyResponse`

```
POST /API/info?list=SshAuthorizedKey
```
**Request Body:** 公鑰更新

### 11.3 SSH 連線查詢
```
GET /API/info?list=SshSession
```
**Response:** `SshSessionResponse`

---

## 12. QoS API

### 12.1 頻寬設定
```
GET /API/info?list=QosBandwidth
```
**Response:** `QosBandwidthResponse`

```
POST /API/info?list=QosBandwidth
```
**Request Body:** `{ QosBandwidth: QosBandwidthConfig }`

### 12.2 QoS 規則
```
GET /API/info?list=QosRule
```
**Response:** `QosRuleResponse`

```
POST /API/info?list=QosRule
```
**Request Body:** `QosRuleRequest`

---

## 13. DDNS API

```
GET /API/info?list=Ddns
```
**Response:** `DdnsResponse`

```
POST /API/info?list=Ddns
```
**Request Body:** `DdnsUpdateRequest`

---

## 14. 服務控制 API

```
GET /API/info?list=AdvancedServiceControl
```
**Response:** `ServiceControlResponse`

```
POST /API/info?list=AdvancedServiceControl
```
**Request Body:** `ServiceControlUpdateRequest`

---

## 15. MCL API

### 15.1 MCL 管理
```
GET /API/info?list=AdvancedMclMGMT
```
**Response:** `AdvancedMclMGMTResponse`

```
POST /API/info?list=AdvancedMclMGMT
```
**Request Body:** `AdvancedMclMGMTUpdateRequest`

### 15.2 Trust Domain
```
GET /API/info?list=AdvancedMclTrustDomain
```
**Response:** `AdvancedMclTrustDomainResponse`

```
POST /API/info?list=AdvancedMclTrustDomain
```
**Request Body:** `AdvancedMclTrustDomainUpdateRequest`

---

## 16. LCM API（容器生命週期管理）

### 16.1 Deployment Unit
```
GET /API/info?list=AdvancedLcmDeploymentUnit
```
**Response:** `LcmDeploymentUnitResponse`

```
POST /API/info?list=AdvancedLcmDeploymentUnit
```
**Request Body:** `LcmDeploymentUnitRequest`（Install/Update/Uninstall）

### 16.2 Execution Environment
```
GET /API/info?list=AdvancedLcmExecEnv
```
**Response:** `LcmExecEnvResponse`

```
POST /API/info?list=AdvancedLcmExecEnv
```
**Request Body:** `LcmExecEnvRequest`（Add/Update/Delete）

### 16.3 Execution Unit
```
POST /API/info?list=AdvancedLcmExecutionUnit
```
**Request Body (查詢):** `{ AdvancedLcmExecutionUnit: { Action: "List" } }`
**Response:** `ExecutionUnitResponse`

```
POST /API/info?list=AdvancedLcmExecutionUnit
```
**Request Body (操作):** `ExecutionUnitActionRequest`（Start/Stop）

### 16.4 LCM 監控
```
GET /API/info?list=AdvancedLcmMonitor
```
**Response:** `LcmMonitorResponse`

---

## 17. 靜態路由 API

```
GET /API/info?list=StaticRoute
```
**Response:** `StaticRouteResponse`

```
POST /API/info?list=StaticRoute
```
**Request Body:** `StaticRouteUpdateRequest`

---

## 18. DNS 路由 API

```
GET /API/info?list=DNSRoute
```
**Response:** `DnsRouteResponse`

```
POST /API/info?list=DNSRoute
```
**Request Body:** `DnsRouteUpdateRequest`

---

## 19. 運作模式 API

```
GET /API/info?list=OperationMode
```
**Response:** `OperationModeResponse`

```
POST /API/info?list=OperationMode
```
**Request Body:** `OperationModeUpdateRequest`

---

## 20. Extender API

### 20.1 Extender 狀態
```
GET /API/info?list=Extender
```
**Response:** `ExtenderResponse`

### 20.2 Extender 操作
```
POST /API/info?list=Extender
```
**Request Body:** `ExtenderUpdateRequest`（ExtenderEnable/WPSbtn/trigger_scan）

### 20.3 Extender 連線
```
POST /API/info?list=Extender
```
**Request Body:** `ExtenderConnectRequest`（connection_setting）

### 20.4 Extender 掃描結果
```
POST /API/info?list=ExtenderScan
```
**Response:** `ExtenderScanResponse`

---

## 21. WiFi 鄰居掃描 API

```
GET /API/info?list=WifiNeighbor
```
**Response:** `WifiNeighborStatusResponse`

```
POST /API/info?list=WifiNeighbor
```
**Request Body:** `WifiNeighborScanRequest`
**Response:** `WifiNeighborScanResponse`

---

## 22. 訪客網路 API

### 22.1 訪客 WiFi
```
GET /API/info?list=GuestWiFi
```
**Response:** `GuestWiFiResponse`

```
POST /API/info?list=GuestWiFi
```
**Request Body:** `GuestWiFiUpdateRequest`

### 22.2 訪客 LAN
```
GET /API/info?list=GuestLAN
```
**Response:** `GuestLANResponse`

```
POST /API/info?list=GuestLAN
```
**Request Body:** `GuestLANUpdateRequest`

### 22.3 訪客已連線裝置
```
GET /API/info?list=GuestDeviceConnected
```
**Response:** `GuestDeviceConnectedResponse`

---

## 23. NTP API

```
GET /API/info?list=Ntp
```
**Response:** `NtpResponse`

```
POST /API/info?list=Ntp
```
**Request Body:** `NtpUpdateRequest`

---

## 24. Timezone API

```
GET /API/info?list=Timezone
```
**Response:** `TimezoneResponse`

```
POST /API/info?list=Timezone
```
**Request Body:** `TimezoneUpdateRequest`

---

## 25. 診斷工具 API

### 25.1 查詢診斷設定
```
GET /API/info?list=ManagementDiagnostic
```
**Response:** `DiagnosticsResponse`

### 25.2 執行 Ping 測試
```
POST /API/info?list=SetNSubscribe
```
**Request Body:** `PingRequest`

### 25.3 查詢 Ping 結果
```
GET /API/info?list=ManagementDiagnostic
```
**Response:** `DiagnosticsResponse`（檢查 IPPing.DiagnosticsState）

### 25.4 執行 Traceroute
```
POST /API/info?list=SetNSubscribe
```
**Request Body:** `TraceRouteRequest`（注意：Request 中使用 `SetNSubscribe` 或 `ManagementDiagnostic` 做為 key）

### 25.5 執行 DNS 查詢
```
POST /API/info?list=SetNSubscribe
```
**Request Body:** `DNSLookupRequest`

---

## 26. TR-471 速度測試 API

```
GET /API/info?list=TR471
```
**Response:** `TR471Response`

```
POST /API/info?list=TR471
```
**Request Body:** TR471 設定與啟動測試

---

## 27. 裝置管理 API

### 27.1 TR-069 設定
```
GET /API/info?list=ManagementServer
```
**Response:** 包含 `TR069Config` 資料

```
POST /API/info?list=ManagementServer
```
**Request Body:** TR-069 設定更新

### 27.2 Management Server Log
```
GET /API/info?list=ManagementServerLog
```
**Response:** 包含 `ManagementServerLogData`

### 27.3 TR-369 設定
```
GET /API/info?list=TR369
```
**Response:** `TR369Response`

```
POST /API/info?list=TR369
```
**Request Body:** `TR369UpdateRequest`

---

## 28. 帳號管理 API

### 28.1 標準帳號管理
```
GET /API/info?list=ManagementAccount
```
**Response:** `ManagementAccountResponse`

```
POST /API/info?list=ManagementAccount
```
**Request Body:** `ManagementAccountUpdateRequest`（修改密碼）

### 28.2 CHT 帳號管理（多使用者）
```
GET /API/info?list=ManagementAccountCht
```
**Response:** `ManagementAccountChtResponse`

```
POST /API/info?list=ManagementAccountCht
```
**Request Body:** `ManagementAccountChtUpdateRequest`
- Action: `SetPassword` | `AddUser` | `DeleteUser` | `SetPolicy`

---

## 29. 韌體管理 API

### 29.1 韌體資訊
```
GET /API/info?list=UpgradeFw
```
**Response:** `FirmwareResponse`

### 29.2 韌體升級
```
POST /API/info?list=UpgradeFw
```
**Request Body:** `FirmwareUpgradeRequest`

---

## 30. 系統重置 API

```
POST /API/info?list=ManagementDeviceReset
```
**Request Body:**
```json
{
  "ManagementDeviceReset": {
    "Action": "Reset"
  }
}
```

---

## 31. 備份還原 API

### 31.1 取得裝置型號
```
GET /API/dm?list=DeviceInfo.ModelName
```

### 31.2 備份設定
```
POST /commands
```
**Request Body:**
```json
{
  "command": "Device.X_PRPLWARE-COM_PersistentConfiguration.Backup()",
  "commandKey": "",
  "sendresp": true,
  "inputArgs": { "Type": "export" }
}
```

### 31.3 下載備份檔案
```
GET /download/{FileName}
```

### 31.4 新增備份檔案（還原前置）
```
POST /commands
```
**Request Body:**
```json
{
  "command": "Device.X_PRPLWARE-COM_PersistentConfiguration.AddBackupFile()",
  "commandKey": "",
  "sendresp": true,
  "inputArgs": { "FileName": "user_backup.tar", "Tag": "Manual" }
}
```

### 31.5 上傳備份檔案
```
POST /upload/{FileName}
```
**Content-Type:** `multipart/form-data`
**Body:** 檔案內容

### 31.6 還原設定
```
POST /commands
```
**Request Body:**
```json
{
  "command": "Device.X_PRPLWARE-COM_PersistentConfiguration.Restore()",
  "commandKey": "",
  "sendresp": true,
  "inputArgs": { "Type": "export", "FileRef": "{Alias}" }
}
```

---

## 32. UPnP API

```
GET /API/info?list=ApplicationUpnp
```
**Response:** `UpnpResponse`

```
POST /API/info?list=ApplicationUpnp
```
**Request Body:** `UpnpUpdateRequest`

---

## 33. Speed Test API

```
POST /API/info?list=AppXperienceControl
```
**Request Body:**
```json
{
  "AppXperienceControl": {
    "Action": "RunSpeedtest"
  }
}
```
**Response:** `SpeedTestResponse`

---

## 34. Sidebar 選單 API

```
GET /API/info?list=SidebarMenu
```
**Response:** 包含 operationMode, netLayoutType, features, userRole

---

## 35. Wizard API

### 35.1 Router Wizard 資料查詢
```
GET /API/info?list=WizardRouter
```
**Response:** `{ WizardRouter: WizardData }`

### 35.2 Router Wizard 提交設定
```
POST /API/info?list=WizardRouter
```
**Request Body:** `WizardSubmitData`

### 35.3 Router Wizard 跳過
```
POST /API/info?list=WizardRouter
```
**Request Body:** `WizardSkipData`

### 35.4 Agent Wizard 啟動
```
POST /API/info?list=WizardAgent
```
**Request Body:** `WizardAgentOnboardingRequest`

### 35.5 Agent Wizard 狀態查詢
```
GET /API/info?list=WizardAgent
```
**Response:** `WizardAgentStatusResponse`

### 35.6 Agent Wizard 結束
```
POST /API/info?list=WizardAgent
```
**Request Body:** `WizardAgentEndPageRequest`

---

## 36. Thread API（IoT）

### 36.1 Thread 狀態
```
GET /API/info?list=ThreadStatus
```
**Response:** `ThreadStatusResponse`

### 36.2 Thread 掃描
```
GET /API/info?list=ThreadScan
```
**Response:** `ThreadScanResponse`

### 36.3 Thread 設定
```
GET /API/info?list=ThreadConfiguration
```
**Response:** `ThreadConfigurationResponse`

```
POST /API/info?list=ThreadConfiguration
```
**Request Body:** `ThreadConfigurationUpdateRequest`

### 36.4 Thread 加入網路
```
POST /API/info?list=ThreadJoinNetwork
```
**Request Body:** `ThreadJoinNetworkRequest`

### 36.5 Thread Commissioner
```
GET /API/info?list=ThreadCommissioner
```
**Response:** `ThreadCommissionerResponse`

```
POST /API/info?list=ThreadCommissioner
```
**Request Body:** `ThreadCommissionerUpdateRequest`

### 36.6 Thread 拓撲
```
GET /API/info?list=ThreadTopology
```
**Response:** `ThreadTopologyResponse`

---

## API 端點快速索引

| # | Endpoint (`?list=`) | GET | POST | 說明 |
|---|---------------------|-----|------|------|
| 1 | `Login` | - | ✓ | 登入驗證 |
| 2 | `Dashboard` | ✓ | - | 主控台資料 |
| 3 | `StatusWan` | ✓ | - | WAN 狀態 |
| 4 | `StatusWanCht` | ✓ | - | WAN 狀態（CHT） |
| 5 | `StatusLan` | ✓ | - | LAN 狀態 |
| 6 | `StatusBridgeLan` | ✓ | - | Bridge LAN 狀態 |
| 7 | `StatusWlan` | ✓ | - | WLAN 狀態 |
| 8 | `StatusSystemStat` | ✓ | - | 系統統計 |
| 9 | `StatusLog` | ✓ | ✓ | 系統日誌 |
| 10 | `MeshMap` | ✓ | ✓ | Mesh 網路 |
| 11 | `WanModeSetup` | ✓ | ✓ | WAN 模式設定 |
| 12 | `WanModeManagement` | ✓ | ✓ | WAN 管理 |
| 13 | `BasicWanCht` | ✓ | ✓ | WAN 設定（CHT） |
| 14 | `BackupWAN` | ✓ | ✓ | 備援 WAN |
| 15 | `LanBasic` | ✓ | ✓ | LAN 基本設定 |
| 16 | `LanDeviceConnected` | ✓ | - | 已連線裝置 |
| 17 | `BasicBridgeLan` | ✓ | ✓ | Bridge LAN 設定 |
| 18 | `WlanBasic` | ✓ | ✓ | 基本無線設定 |
| 19 | `WlanGroup` | ✓ | ✓ | 多 SSID 群組 |
| 20 | `WlanAdvanced` | ✓ | ✓ | 進階無線設定 |
| 21 | `WlanWps` | ✓ | ✓ | WPS 設定 |
| 22 | `WlanMesh` | ✓ | ✓ | Mesh 設定 |
| 23 | `MACFiltering` | ✓ | ✓ | MAC 過濾 |
| 24 | `IPFiltering` | ✓ | ✓ | IP 過濾 |
| 25 | `Cellular` | ✓ | - | 行動網路資訊 |
| 26 | `PortForwarding` | ✓ | ✓ | Port Forwarding |
| 27 | `AdvancedDmz` | ✓ | ✓ | DMZ |
| 28 | `SshServer` | ✓ | ✓ | SSH 伺服器 |
| 29 | `SshAuthorizedKey` | ✓ | ✓ | SSH 公鑰 |
| 30 | `SshSession` | ✓ | - | SSH 連線 |
| 31 | `QosBandwidth` | ✓ | ✓ | QoS 頻寬 |
| 32 | `QosRule` | ✓ | ✓ | QoS 規則 |
| 33 | `Ddns` | ✓ | ✓ | DDNS |
| 34 | `AdvancedServiceControl` | ✓ | ✓ | 服務控制 |
| 35 | `AdvancedMclMGMT` | ✓ | ✓ | MCL 管理 |
| 36 | `AdvancedMclTrustDomain` | ✓ | ✓ | MCL 信任網域 |
| 37 | `AdvancedLcmDeploymentUnit` | ✓ | ✓ | LCM 部署單元 |
| 38 | `AdvancedLcmExecEnv` | ✓ | ✓ | LCM 執行環境 |
| 39 | `AdvancedLcmExecutionUnit` | - | ✓ | LCM 執行單元 |
| 40 | `AdvancedLcmMonitor` | ✓ | - | LCM 監控 |
| 41 | `StaticRoute` | ✓ | ✓ | 靜態路由 |
| 42 | `DNSRoute` | ✓ | ✓ | DNS 路由 |
| 43 | `OperationMode` | ✓ | ✓ | 運作模式 |
| 44 | `Extender` | ✓ | ✓ | 無線延伸 |
| 45 | `ExtenderScan` | - | ✓ | 延伸掃描 |
| 46 | `WifiNeighbor` | ✓ | ✓ | WiFi 鄰居 |
| 47 | `GuestWiFi` | ✓ | ✓ | 訪客 WiFi |
| 48 | `GuestLAN` | ✓ | ✓ | 訪客 LAN |
| 49 | `GuestDeviceConnected` | ✓ | - | 訪客裝置 |
| 50 | `Ntp` | ✓ | ✓ | NTP 設定 |
| 51 | `Timezone` | ✓ | ✓ | 時區設定 |
| 52 | `ManagementDiagnostic` | ✓ | - | 診斷查詢 |
| 53 | `SetNSubscribe` | - | ✓ | 診斷執行 |
| 54 | `TR471` | ✓ | ✓ | TR-471 速測 |
| 55 | `ManagementServer` | ✓ | ✓ | TR-069 |
| 56 | `ManagementServerLog` | ✓ | - | 管理日誌 |
| 57 | `TR369` | ✓ | ✓ | TR-369 |
| 58 | `ManagementAccount` | ✓ | ✓ | 帳號管理 |
| 59 | `ManagementAccountCht` | ✓ | ✓ | 帳號管理（CHT） |
| 60 | `UpgradeFw` | ✓ | ✓ | 韌體管理 |
| 61 | `ManagementDeviceReset` | - | ✓ | 系統重置 |
| 62 | `ApplicationUpnp` | ✓ | ✓ | UPnP |
| 63 | `AppXperienceControl` | - | ✓ | Speed Test |
| 64 | `SidebarMenu` | ✓ | - | 側邊選單 |
| 65 | `WizardRouter` | ✓ | ✓ | Router Wizard |
| 66 | `WizardAgent` | ✓ | ✓ | Agent Wizard |
| 67 | `ThreadStatus` | ✓ | - | Thread 狀態 |
| 68 | `ThreadScan` | ✓ | - | Thread 掃描 |
| 69 | `ThreadConfiguration` | ✓ | ✓ | Thread 設定 |
| 70 | `ThreadJoinNetwork` | - | ✓ | Thread 加入 |
| 71 | `ThreadCommissioner` | ✓ | ✓ | Thread 委任 |
| 72 | `ThreadTopology` | ✓ | - | Thread 拓撲 |

---

## 特殊端點（非 `/API/info?list=` 格式）

| 端點 | 方法 | 說明 |
|------|------|------|
| `POST /session` | POST | 建立 Session |
| `GET /API/dm?list=DeviceInfo.ModelName` | GET | 取得裝置型號 |
| `POST /API/system` | POST | 行動網路設定更新 |
| `POST /commands` | POST | 執行裝置命令（備份/還原/韌體升級） |
| `GET /download/{FileName}` | GET | 下載備份檔案 |
| `POST /upload/{FileName}` | POST | 上傳備份/韌體檔案 |
