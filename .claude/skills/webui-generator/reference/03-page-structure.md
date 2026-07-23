# 頁面結構文件 (Page Structure)

> 本文件描述每個頁面的功能、使用的 API、顯示的資料、以及使用者可執行的操作。
> 供 Lua + API 重建前端頁面時參考。

---

## 1. Login 頁面

**路徑:** `/login`
**API:** `POST /API/info?list=Login`, `POST /session`

**功能:**
- 帳號/密碼輸入表單
- 驗證碼（Captcha）輸入
- 登入錯誤提示（帳號鎖定、密碼錯誤、驗證碼錯誤）
- 登入成功後根據 opMode 決定導向 Dashboard 或 Wizard
- 多語言切換

---

## 2. Wizard 初始設定精靈

**路徑:** `/wizard`
**API:** `GET/POST /API/info?list=WizardRouter`, `GET/POST /API/info?list=WizardAgent`

**功能:**
- 分步驟引導使用者完成初始設定
- **Router 模式步驟：**
  1. 選擇 WAN 模式
  2. 設定 WiFi（SSID、密碼、安全模式，分 2.4G/5G/6G）
  3. Smart Connect / MLO / Mesh 開關
  4. 管理員帳號密碼設定
  5. 確認 & 套用
- **Agent 模式步驟：**
  1. 選擇加入方式（WPS 或乙太網路）
  2. 等待 Onboarding 完成
  3. 狀態顯示（LinkStatus, OnboardingStatus）
- 可跳過 Wizard（Action: 'Skip'）
- 套用後顯示進度條（job_id + eta_seconds）

---

## 3. Dashboard 主控台

**路徑:** `/dashboard`
**API:** `GET /API/info?list=Dashboard`
**自動重新整理:** 每 3 秒

**顯示區塊:**

| 區塊 | 資料 | 說明 |
|------|------|------|
| 系統資訊 | System.ModelName, SoftwareVersion, HardwareVersion, SerialNumber | 裝置基本資訊 |
| CPU 使用率 | CPU.CPUUsage | 即時 CPU 百分比（圖表） |
| 記憶體狀態 | Memory.Total, Memory.Free | 使用量/可用量（圖表） |
| WAN 狀態 | WAN.Protocol, InternetAddress, SubnetMask, DefaultGateway, DNS | 外部連線資訊 |
| WiFi 狀態 | WiFi.wifi2g/5g/6g (SSID, Enable, SecurityMode) | 各頻段 WiFi 狀態 |
| 訪客 WiFi | Guest.wifi2g/5g/6g (Enable, SSID, GuestClients) | 訪客網路狀態 |
| 乙太網路 | Ethernet[] (Port, Role, Status, Speed, Duplex) | 各埠狀態指示燈 |

---

## 4. Status 狀態頁面

### 4.1 WAN 狀態
**路徑:** `/status/wan`
**API:** `GET /API/info?list=StatusWan`

**顯示:**
- Operation Mode, WAN Mode, Sensing Policy/Timeout
- 每個 WAN 介面的 IPv4/IPv6 詳細資訊（Address, Gateway, DNS, Status）
- MAC Address, Speed, Duplex, VLAN

### 4.2 WAN 狀態（CHT 版）
**路徑:** `/status/wan-cht`
**API:** `GET /API/info?list=StatusWanCht`

**顯示:**
- PPPoE/IPoE/Bridge 三種連線各自的 IPv4/IPv6 狀態

### 4.3 LAN 狀態
**路徑:** `/status/lan`
**API:** `GET /API/info?list=StatusLan`

**顯示:**
- 每個 LAN 介面的 MAC, MTU, IPv4/IPv6 資訊

### 4.4 LAN 狀態（CHT/Bridge 版）
**路徑:** `/status/lan-cht`
**API:** `GET /API/info?list=StatusBridgeLan`

**顯示:**
- IPv4/IPv6 Address, SubnetMask, Status, MACAddress

### 4.5 WLAN 狀態
**路徑:** `/status/wlan`
**API:** `GET /API/info?list=StatusWlan`

**顯示:**
- 每個頻段：Band, Channel, AutoChannel, Bandwidth, Enable
- 每個 SSID 介面：Name, SSID, Authentication, Encryption, BSSID, Enable
- 已關聯裝置：MACAddress, SignalStrength, Uplink/Downlink Rate, ConnectionDuration

### 4.6 統計資訊
**路徑:** `/status/statistics`
**API:** 使用 Dashboard 或 StatusWlan 的統計資料

**顯示:**
- Ethernet 埠統計：Rx/Tx Bytes, Packets, Error, Discard
- WLAN 統計：同上

### 4.7 WiFi 鄰居掃描
**路徑:** `/status/wifi-neighbor`
**API:** `GET/POST /API/info?list=WifiNeighbor`

**功能:**
- 顯示各頻段啟用狀態
- 選擇頻段執行掃描
- 掃描結果表格：SSID, BSSID, Channel, Security, Signal, WirelessMode

### 4.8 Mesh 資訊
**路徑:** `/status/mesh`
**API:** `GET /API/info?list=MeshMap`

**顯示:**
- 拓撲圖（D3.js 視覺化）
- 節點列表：Name, Mode (Controller/Agent/Client), IP, MAC, MediaType
- Upstream 連線資訊, Band, TxRate, RxRate, RSSI
- 客戶端導引操作

### 4.9 系統統計
**路徑:** `/status/system-stats`
**API:** `GET /API/info?list=StatusSystemStat`
**自動重新整理:** 每 3 秒

**顯示:**
- WAN/LAN/WiFi 即時吞吐量圖表（Chart.js）
- Receive/Sent 流量（按介面分類）

### 4.10 系統日誌
**路徑:** `/status/log`
**API:** `GET/POST /API/info?list=StatusLog`

**功能:**
- 日誌表格：時間, 來源, 程式, 嚴重性, 訊息
- 篩選：類別 (dhcp/lcm/wifi/firewall), 包含關鍵字, 嚴重程度
- 分頁/載入更多
- 匯出日誌

### 4.11 雙映像管理
**路徑:** `/status/dual-image`
**API:** 雙映像相關 API

**顯示:**
- 目前啟動分區
- 分區 1/2 版本資訊

### 4.12 LCM 狀態
**路徑:** `/status/lcm`
**API:** LCM 相關 API

**顯示:**
- Deployment Unit 數量/清單
- Execution Environment 數量
- Execution Unit 數量

### 4.13 行動網路狀態
**路徑:** `/status/cellular`
**API:** `GET /API/info?list=Cellular`

**顯示:**
- 連線狀態, 連線時間, 漫遊狀態
- SIM 卡資訊：IMEI, IMSI, ICCID, USIM Status
- 電信商：PLMN, OperatorName
- 訊號品質：RSSI, RSRP, RSRQ, SINR
- Cell 資訊：PCI, CellID, ConnectedBand, DLEarfcn
- 流量統計：Bytes/Packets Sent/Received

---

## 5. 網路設定頁面

### 5.1 WAN 設定
**路徑:** `/network/wan`
**API:** `GET/POST /API/info?list=WanModeSetup`, `GET/POST /API/info?list=WanModeManagement`

**功能:**
- WAN 模式選擇（WANModeList 下拉選單）
- 每個 WAN 介面設定：
  - IPv4 Mode (dhcp4/ppp4/static/none/dslite)
  - IPv6 Mode (dhcp6/ppp6/static/none)
  - PPPoE 帳密（若使用 PPPoE）
  - VLAN 設定 (Type, ID, Priority)
  - 靜態 IP 設定（若使用 static）
- DNS 模式（Static/Dynamic）
- Sensing 設定

### 5.2 WAN 設定（CHT 版）
**路徑:** `/basic/wan-cht`
**API:** `GET/POST /API/info?list=BasicWanCht`

**功能:**
- 分頁：PPPoE / IPoE / Bridge
- PPPoE 設定：帳密, MTU, VLAN, NAT, IGMP, DNS, Connection Trigger
- IPoE 設定：Protocol, DHCP Options, DNS, VLAN
- Bridge 設定：MTU, VLAN, LAN Interface 對應
- 連線表格顯示

### 5.3 備援 WAN
**路徑:** `/basic/backup-wan`
**API:** `GET/POST /API/info?list=BackupWAN`

**功能:**
- 啟用/停用備援 WAN
- 實體介面類型選擇（Ethernet/Cellular）
- 健康檢查設定：方法（Ping/DNS）, 位址, 間隔, 次數
- WHC 啟用

### 5.4 LAN 基本設定
**路徑:** `/network/lan`
**API:** `GET/POST /API/info?list=LanBasic`

**功能:**
- LAN IP 設定：IPv4/IPv6 啟用, 協定, 位址, 子網
- DHCPv4 設定：啟用, DNS, 位址範圍, 租約時間
- IP 預留表格：MAC + IP 對應（新增/刪除/啟停用）

### 5.5 LAN IPv4 詳細設定
**路徑:** `/network/lan/ipv4`
**API:** 同 LAN 基本設定

### 5.6 已連線裝置
**路徑:** `/network/lan/devices`
**API:** `GET /API/info?list=LanDeviceConnected`

**顯示:**
- 裝置表格：Hostname, MAC Address, IP Address

### 5.7 Bridge LAN 設定
**路徑:** `/basic/lan-cht`
**API:** `GET/POST /API/info?list=BasicBridgeLan`

**功能:**
- IPv4/IPv6 啟用/協定/位址設定（Bridge 模式用）

---

## 6. 無線網路設定頁面

### 6.1 基本無線設定
**路徑:** `/network/wireless/basic`
**API:** `GET/POST /API/info?list=WlanBasic` 或 `GET/POST /API/info?list=WlanGroup`

**功能:**
- Smart Connect（CommonSSIDEnable）開關
- MLO 開關
- Mesh 開關
- 每個頻段 (2.4G/5G/6G)：
  - 啟用/停用
  - SSID 設定
  - 安全模式選擇（下拉選單，選項來自 SecurityModeAvailable）
  - 密碼設定
- 多 SSID 群組管理（WlanGroup 模式）

### 6.2 進階無線設定
**路徑:** `/network/wireless/advanced`
**API:** `GET/POST /API/info?list=WlanAdvanced`

**功能:**
- 每個頻段：
  - Radio 啟用/停用
  - 模式 (Mode + ModeList)
  - 頻道（手動/自動）
  - 頻寬（ChannelBandwidth + ChannelBandwidthList）
  - MU-MIMO 啟用

### 6.3 WPS 設定
**路徑:** `/network/wireless/wps`
**API:** `GET/POST /API/info?list=WlanWps`

**功能:**
- WPS 全域啟用/停用
- PIN Code 顯示
- 觸發 WPS 配對按鈕
- 配對結果狀態
- 每個頻段的 SSID, AuthType, ConnectStatus, Configured 狀態

### 6.4 Mesh 設定
**路徑:** `/network/wireless/mesh`
**API:** `GET/POST /API/info?list=WlanMesh`

**功能:**
- Mesh 啟用/停用
- Mesh SSID, 安全模式, 密碼
- MLO / CommonSSID 顯示

### 6.5 Extender 設定
**路徑:** `/network/wireless/extender`
**API:** `GET/POST /API/info?list=Extender`, `POST /API/info?list=ExtenderScan`

**功能:**
- Extender 啟用/停用
- 角色選擇（MeshAgent/Repeater）
- 各頻段連線狀態
- WiFi 掃描並選擇連線
- WPS 配對（PIN Code 顯示）

---

## 7. 行動網路設定

**路徑:** `/basic/cellular`
**API:** `GET /API/info?list=Cellular`, `POST /API/system`

**功能:**
- 啟用/停用行動網路
- APN 設定
- 漫遊啟用/停用
- IP 類型選擇
- 偏好存取技術選擇
- 顯示連線狀態和訊號資訊

---

## 8. 運作模式

**路徑:** `/basic/operation-mode`
**API:** `GET/POST /API/info?list=OperationMode`

**功能:**
- 顯示可用模式列表（Gateway/Bridge/Extender）
- 選擇並切換運作模式
- 切換後裝置將重新啟動

---

## 9. NAT 設定

### 9.1 Port Forwarding
**路徑:** `/advanced/nat`
**API:** `GET/POST /API/info?list=PortForwarding`

**功能:**
- Port Forwarding 規則表格
- 新增/編輯/刪除規則
- 每條規則：啟用, 描述, 協定, WAN 介面, 外部埠範圍, 內部埠, 內部 IP

### 9.2 DMZ
**路徑:** `/advanced/nat/dmz`
**API:** `GET/POST /API/info?list=AdvancedDmz`

**功能:**
- DMZ 啟用/停用
- DMZ 主機 IP 設定

---

## 10. 安全設定

**路徑:** `/advanced/security`
**API:** 多個 API，使用分頁 (Tabs)

**分頁結構:**

| Tab | API | 功能 |
|-----|-----|------|
| WiFi MAC 過濾 | `MACFiltering` | 每頻段的 ACL Mode + MAC 清單 |
| 一般 MAC 過濾 | `MACFiltering`（general） | 黑/白名單 MAC 清單 |
| IP 過濾 | `IPFiltering` | 啟用, 黑/白名單 IP 範圍 + 協定 |

---

## 11. SSH 設定

**路徑:** `/advanced/ssh`
**API:** `GET/POST /API/info?list=SshServer`, `SshAuthorizedKey`, `SshSession`

**功能:**
- SSH 伺服器列表（支援多個伺服器）
- 每個伺服器：啟用, 埠號, 介面, 允許密碼登入, 允許 Root 登入
- IPv4/IPv6 存取控制, 來源前綴限制
- 自動停用時間, 閒置逾時, KeepAlive, 最大認證嘗試
- 公鑰管理（檢視/新增/刪除）
- 目前活動 SSH 連線列表

---

## 12. 服務控制

**路徑:** `/advanced/service-control`
**API:** `GET/POST /API/info?list=AdvancedServiceControl`

**功能:**
- ACL 規則表格
- 每條規則：服務, 啟用, 介面, 協定, IP 版本, 目標埠, 動作, 來源 IP 範圍
- 可用選項下拉：Protocols, IPVersions, Interfaces, Services
- 新增/編輯/刪除規則

---

## 13. MCL 管理控制清單

**路徑:** `/advanced/mcl`
**API:** `GET/POST /API/info?list=AdvancedMclMGMT`, `AdvancedMclTrustDomain`

**功能:**
- WAN 存取模式（AnyWAN/MultipleWAN）
- WAN 存取介面選擇
- 服務設定表格（HTTP, HTTPS, FTP, TELNET, SSH, PING, TFTP）
  - 每個服務：LAN/WAN/TrustDomain 啟用, Port
  - 部分欄位唯讀
- Trust Domain 管理（新增/刪除信任網域）

---

## 14. QoS 設定

**路徑:** `/advanced/qos`
**API:** `GET/POST /API/info?list=QosBandwidth`, `QosRule`

**功能:**
- 頻寬設定：啟用, Download/Upload 頻寬, 優先級配置
- 規則表格：Application/Device 類型, 優先級
- 新增/編輯/刪除規則

---

## 15. DDNS 設定

**路徑:** `/advanced/ddns`
**API:** `GET/POST /API/info?list=Ddns`

**功能:**
- DDNS 服務列表
- 每個服務：啟用, 服務提供商（下拉選單）, 帳號, 密碼, 域名
- 狀態顯示：UpdatedIP, Status, LastUpdate
- 新增/編輯/刪除服務

---

## 16. LCM 容器管理

**路徑:** `/advanced/lcm`
**API:** 多個 LCM API，使用分頁

**分頁結構:**

| Tab | API | 功能 |
|-----|-----|------|
| Deployment Units | `AdvancedLcmDeploymentUnit` | 安裝/更新/卸載容器 |
| Execution Environments | `AdvancedLcmExecEnv` | 新增/編輯/刪除執行環境，CPU/記憶體/磁碟配置 |
| Execution Units | `AdvancedLcmExecutionUnit` | 啟動/停止執行單元 |
| Monitor | `AdvancedLcmMonitor` | 監控記憶體/磁碟使用量, 執行單元狀態 |

---

## 17. UPnP 設定

**路徑:** `/application/upnp`
**API:** `GET/POST /API/info?list=ApplicationUpnp`

**功能:**
- UPnP 啟用/停用
- 介面選擇
- Port Mapping 表格（唯讀）：描述, 外/內部埠, 協定, 狀態, 客戶端

---

## 18. 靜態路由

**路徑:** `/basic/routing`
**API:** `GET/POST /API/info?list=StaticRoute`, `DNSRoute`

**功能:**
- IPv4 靜態路由表格：啟用, 目的 IP, 子網遮罩, Gateway, WAN 介面
- IPv6 靜態路由表格：啟用, 目的 IP, Prefix 長度, Gateway, WAN 介面
- DNS 路由表格：啟用, 域名, 子網, WAN 介面
- 新增/編輯/刪除路由

---

## 19. NTP 時間設定

**路徑:** `/system/ntp`
**API:** `GET/POST /API/info?list=Ntp`, `Timezone`

**功能:**
- NTP 啟用/停用
- NTP 伺服器設定
- 時區選擇
- DST（日光節約時間）啟用
- 目前本地時間顯示

---

## 20. 重新開機

**路徑:** `/system/reboot`

**功能:**
- 重新開機確認按鈕
- 重開機後倒數計時

---

## 21. 系統設定

### 21.1 恢復出廠設定
**路徑:** `/system/settings/reset`
**API:** `POST /API/info?list=ManagementDeviceReset`

**功能:**
- 恢復出廠設定確認按鈕
- 重置後倒數計時

### 21.2 備份/還原
**路徑:** `/system/settings/backup`
**API:** `POST /commands`（備份/還原命令）, `/download/`, `/upload/`

**功能:**
- 備份按鈕 → 下載 .bin 檔案
- 還原：選擇檔案 → 上傳 → 還原
- 檔案格式驗證（Gemtek_*.bin）
- Checksum 驗證

### 21.3 韌體更新
**路徑:** `/system/settings/update`
**API:** `GET/POST /API/info?list=UpgradeFw`

**功能:**
- 顯示韌體 Bank 資訊（版本, 狀態）
- URL 韌體升級
- 升級進度顯示
- Bank 切換

---

## 22. 診斷工具

### 22.1 Ping
**路徑:** `/system/diagnostics/ping`
**API:** `POST /API/info?list=SetNSubscribe`, `GET /API/info?list=ManagementDiagnostic`

**功能:**
- 輸入：主機位址, 介面, 協定版本 (IPv4/IPv6), 次數, 逾時, 封包大小
- 執行 Ping 測試
- 結果：平均/最小/最大回應時間, 成功/失敗數

### 22.2 Traceroute
**路徑:** `/system/diagnostics/traceroute`
**API:** 同上

**功能:**
- 輸入：主機位址, 介面, 協定版本, 最大跳數, 逾時, 封包大小
- 結果表格：每一跳的 Host, IP, RTT

### 22.3 DNS 查詢
**路徑:** `/system/diagnostics/dns`
**API:** 同上

**功能:**
- 輸入：Hostname, 介面, DNS Server, 逾時, 次數
- 結果表格：IP, HostName, ResponseTime, DNSServerIP

### 22.4 TR-471 速度測試
**路徑:** `/system/diagnostics/tr471`
**API:** `GET/POST /API/info?list=TR471`

**功能:**
- 伺服器/埠設定
- 測試參數設定
- 執行測試
- 結果：IPLayerCapacity, LossRatio, RTTRange, PDVRange

---

## 23. 裝置管理

### 23.1 TR-069
**路徑:** `/system/device/tr069`
**API:** `GET/POST /API/info?list=ManagementServer`, `ManagementServerLog`

**功能:**
- CWMP 啟用/停用
- ACS URL, 帳密設定
- Connection Request URL/帳密
- Periodic Inform 啟用/間隔
- Primary/Backup ACS URL 設定
- Session 狀態
- Management Server 日誌

### 23.2 TR-369
**路徑:** `/system/device/tr369`
**API:** `GET/POST /API/info?list=TR369`

**功能:**
- Agent Endpoint ID 顯示
- Controller 列表管理
- 每個 Controller：啟用, Alias, EndpointID, Topic, Broker 設定, MQTT 設定
- 新增/編輯/刪除 Controller

---

## 24. 帳號管理

### 24.1 標準帳號
**路徑:** `/system/account`（prpl/genix 佈局）
**API:** `GET/POST /API/info?list=ManagementAccount`

**功能:**
- 顯示目前使用者名稱
- 修改密碼（舊密碼 + 新密碼）
- 密碼規則：最大長度, 不允許空格

### 24.2 CHT 帳號（多使用者）
**路徑:** `/system/account`（cht 佈局）
**API:** `GET/POST /API/info?list=ManagementAccountCht`

**功能:**
- 使用者列表表格：Username, UserType, Enable, Editable, Deletable
- 新增使用者（帳號, 密碼, 類型 super/normal）
- 刪除使用者
- 修改密碼
- 使用者策略設定：RetryCount, IdleTimeoutMin, LockTimeMin

---

## 25. IoT 頁面

### 25.1 Thread
**路徑:** `/iot/thread`
**API:** 多個 Thread API

**功能:**
- Border Router 狀態：Status, BorderAgentID
- MLE 資訊：Role, FirmwareVersion, ExtendedMAC
- Dataset 設定：NetworkName, Channel, PanId, NetworkKey
- 拓撲視覺化（D3.js）：Nodes + Links
- PAN 掃描
- 加入網路（NetworkKey 或 PSKd）
- Commissioner 管理：新增/刪除 Joiner

### 25.2 Matter
**路徑:** `/iot/matter`

**功能:**
- Matter 裝置管理

---

## 26. Speed Test / Xperience Control

**路徑:** `/application/xperience-control`
**API:** `POST /API/info?list=AppXperienceControl`

**功能:**
- 執行速度測試
- 結果：Download/Upload throughput, Ping 統計

---

## 通用 UI 元件

以下通用元件在多個頁面中重複使用，Lua 端重建時需考慮：

| 元件 | 說明 |
|------|------|
| BaseInput | 文字輸入框 |
| BaseSelect | 下拉選單 |
| BaseTextarea | 多行文字框 |
| BaseCheckbox | 核取方塊 |
| BaseSwitch | 開關切換 |
| BaseSecretInput | 密碼輸入框（含顯示/隱藏） |
| BaseButton | 按鈕 |
| BaseCard | 卡片容器 |
| BaseTable | 資料表格 |
| BaseTabs | 分頁標籤 |
| BaseModal | 彈出對話框 |
| BaseSpinner | 載入中旋轉圖示 |
| BaseBadge | 標籤 |
| BaseToast | 通知訊息（成功/錯誤/警告） |
| SectionCard | 區段卡片（含標題） |
| ActionButtons | 操作按鈕列（儲存/取消） |
| ConfirmationDialog | 確認對話框 |
| LineChart | 折線圖（Chart.js） |

---

## 頁面共通行為模式

### 資料載入
```
1. 進入頁面 → 呼叫 GET API
2. 顯示載入中 (BaseSpinner)
3. 資料回傳 → 填入表單/表格
4. 錯誤 → 顯示 BaseToast 錯誤通知
```

### 表單儲存
```
1. 使用者修改表單
2. 點擊儲存 → 呼叫 POST API
3. 顯示載入中
4. 成功 → BaseToast 成功通知 + 重新載入資料
5. 失敗 → BaseToast 錯誤通知
```

### 表格操作 (CRUD)
```
1. 列表顯示 → GET API
2. 新增 → 彈出 BaseModal 表單 → POST API
3. 編輯 → 彈出 BaseModal 表單（預填資料）→ POST API
4. 刪除 → ConfirmationDialog 確認 → POST API
5. 啟用/停用 → BaseSwitch 切換 → POST API
```
