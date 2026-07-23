# 路由與權限文件 (Routing & Permissions)

> 本文件描述系統的路由結構、認證流程、選單可見性規則及角色權限機制。
> 供 Lua + API 重建前端頁面時參考。

---

## 1. 認證機制 (Authentication)

### 1.1 認證流程

```
使用者輸入帳密 + 驗證碼
        │
        ▼
POST /API/info?list=Login
Body: { Login: { username, password, captchaId, captcha } }
        │
        ├─ status: "locked"             → 帳號鎖定，回傳 retryAfter / lockUntil
        ├─ status: "captcha_invalid"    → 驗證碼錯誤，回傳 failCount
        ├─ status: "credentials_invalid"→ 帳密錯誤，回傳 failCount
        └─ status: 成功                → 取得 wizardRequired + opMode
                │
                ▼
        POST /session
        Body: { username, password }
        回傳: { sessionID, idleTimeoutSeconds }
                │
                ▼
        儲存 sessionID，後續 API 請求帶入 Header:
        Authorization: bearer <sessionID>
```

### 1.2 Session 管理

| 項目 | 說明 |
|------|------|
| Token 位置 | HTTP Header `Authorization: bearer <sessionID>` |
| 閒置逾時 | 由後端回傳 `idleTimeoutSeconds`，前端自動登出 |
| 401/403 處理 | 自動清除 session，重導至 `/login` |

### 1.3 Wizard（初始設定精靈）判斷

- 登入成功後檢查 `opMode` 欄位
- 若 `opMode === 'Init'` → 需要跑 Wizard
- 若 opMode 無效（null/undefined/空字串）→ 最多重試 20 次，每次間隔 3 秒
- Wizard 狀態 API: `GET /API/info?list=Wizard`

---

## 2. 運作模式 (Operation Mode)

系統有四種運作模式，決定哪些功能可用：

| 模式 | 說明 |
|------|------|
| `Init` | 初始設定模式（只顯示 Wizard） |
| `Gateway` | 路由器模式（完整功能） |
| `Bridge` | 橋接模式（功能受限） |
| `Extender` | 無線延伸模式（功能受限） |

---

## 3. 佈局類型 (Layout Type)

| 佈局 | 說明 |
|------|------|
| `prpl` | 標準版佈局 |
| `genix` | Genix 版佈局 |
| `cht` | CHT（中華電信）客製版佈局 |

---

## 4. 使用者角色 (User Role)

| 角色 | 說明 |
|------|------|
| `super` | 超級管理員，可存取所有功能 |
| `normal` | 一般使用者，部分進階功能受限 |

---

## 5. 完整路由表

### 5.1 公開路由（不需認證）

| 路徑 | 說明 |
|------|------|
| `/login` | 登入頁面 |

### 5.2 Wizard 路由

| 路徑 | 說明 |
|------|------|
| `/wizard` | 初始設定精靈（需認證，Init 模式時強制進入） |

### 5.3 Dashboard

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/` | — | 重導至 `/dashboard` |
| `/dashboard` | Dashboard | 主控台首頁 |

### 5.4 狀態頁面 (Status)

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/status` | — | 重導至 `/dashboard` |
| `/status/wan` | StatusWan | WAN 狀態 |
| `/status/wan-cht` | StatusWanCht | WAN 狀態（CHT 版） |
| `/status/lan` | StatusLan | LAN 狀態 |
| `/status/lan-cht` | StatusLanCht | LAN 狀態（CHT 版） |
| `/status/wlan` | StatusWlan | WLAN 狀態 |
| `/status/statistics` | StatusStatistics | 統計資訊 |
| `/status/wifi-neighbor` | StatusWifiNeighbor | WiFi 鄰居掃描 |
| `/status/mesh` | StatusMesh | Mesh 網路資訊 |
| `/status/lcm` | StatusLcm | LCM 狀態 |
| `/status/system-stats` | StatusSystemStats | 系統統計（CPU/記憶體） |
| `/status/log` | StatusLog | 系統日誌 |
| `/status/dual-image` | StatusDualImage | 雙映像管理 |
| `/status/wan-failover` | StatusWanFailover | WAN 備援（開發中） |
| `/status/cellular` | StatusCellular | 行動網路狀態 |

### 5.5 網路設定 - WAN

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/network/wan` | NetworkWan | WAN 設定 |
| `/basic/wan` | — | 重導至 `/network/wan` |
| `/basic/wan-cht` | BasicWanCht | WAN 設定（CHT 版） |
| `/basic/backup-wan` | BackupWan | 備援 WAN |
| `/network/backup-wan` | — | 重導至 `/basic/backup-wan` |

### 5.6 網路設定 - LAN

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/network/lan` | NetworkLan | LAN 設定 |
| `/basic/lan` | — | 重導至 `/network/lan` |
| `/basic/lan-cht` | BasicBridgeLan | LAN 設定（CHT 版） |
| `/network/lan/ipv4` | NetworkLanIPv4 | IPv4 設定 |
| `/basic/lan/ipv4` | — | 重導至 `/network/lan/ipv4` |
| `/basic/lan/ipv6` | — | IPv6 設定（開發中） |
| `/network/lan/devices` | NetworkLanDevices | 已連線裝置列表 |
| `/basic/lan/devices` | — | 重導至 `/network/lan/devices` |

### 5.7 網路設定 - 無線 (Wireless)

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/network/wireless` | NetworkWireless | 無線網路總覽 |
| `/basic/wlan` | — | 重導至 `/network/wireless` |
| `/network/wireless/basic` | NetworkWirelessBasic | 基本無線設定 |
| `/network/wireless/advanced` | NetworkWirelessAdvanced | 進階無線設定 |
| `/network/wireless/wps` | NetworkWirelessWps | WPS 設定 |
| `/network/wireless/mesh` | NetworkWirelessMesh | Mesh 網路設定 |
| `/basic/wlan/zones` | — | WiFi 區域（開發中） |
| `/network/wireless/extender` | NetworkWirelessExtender | 無線延伸設定 |

### 5.8 行動網路 & 運作模式

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/basic/cellular` | BasicCellular | 行動網路設定 |
| `/basic/operation-mode` | BasicOperationMode | 運作模式選擇 |

### 5.9 進階設定 - NAT

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/advanced/nat` | AdvancedNat | NAT / Port Forwarding 設定 |
| `/basic/nat` | — | 重導至 `/advanced/nat` |
| `/advanced/nat/dmz` | AdvancedNatDmz | DMZ 設定 |
| `/basic/nat/dmz` | — | 重導至 `/advanced/nat/dmz` |
| `/basic/nat/alg` | — | ALG 設定（開發中） |

### 5.10 進階設定 - 安全 & 路由

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/advanced/security` | AdvancedSecurity | 安全設定（MAC/IP 過濾） |
| `/basic/security` | — | 重導至 `/advanced/security` |
| `/basic/routing` | BasicRouting | 靜態路由設定 |

### 5.11 進階設定 - 服務

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/advanced/ssh` | AdvancedSsh | SSH 服務設定 |
| `/advanced/service-control` | AdvancedServiceControl | 服務控制 |
| `/advanced/mcl` | AdvancedMcl | MCL 設定 |
| `/advanced/qos` | AdvancedQos | QoS 設定 |
| `/advanced/ddns` | AdvancedDdns | DDNS 設定 |
| `/application/ddns` | — | 重導至 `/advanced/ddns` |
| `/advanced/lcm` | AdvancedLcm | LCM 管理 |

### 5.12 系統管理

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/system/ntp` | SystemNtp | NTP 時間同步設定 |
| `/system/reboot` | SystemReboot | 重新開機 |
| `/system/settings` | SystemSettings | 系統設定總覽 |
| `/system/settings/reset` | SystemSettingsReset | 恢復出廠設定 |
| `/system/settings/backup` | SystemSettingsBackup | 備份/還原 |
| `/system/settings/update` | SystemSettingsUpdate | 韌體更新 |

### 5.13 系統診斷

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/system/diagnostics` | SystemDiagnostics | 診斷工具總覽 |
| `/system/diagnostics/ping` | SystemDiagnosticsPing | Ping 測試 |
| `/system/diagnostics/traceroute` | SystemDiagnosticsTraceroute | Traceroute 測試 |
| `/system/diagnostics/dns` | SystemDiagnosticsDns | DNS 查詢 |
| `/system/diagnostics/tr471` | SystemDiagnosticsTR471 | TR-471 速度測試 |

### 5.14 裝置管理

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/system/device` | — | 重導至 `/system/device/tr069` |
| `/system/device/tr069` | SystemDeviceTR069 | TR-069 管理 |
| `/system/device/tr369` | SystemDeviceTR369 | TR-369 管理 |
| `/system/account` | SystemAccount | 帳號管理 |

### 5.15 應用程式

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/application/xperience-control` | — | Xperience Control |
| `/application/upnp` | ApplicationUpnp | UPnP 設定 |

### 5.16 IoT

| 路徑 | 名稱 | 說明 |
|------|------|------|
| `/iot/thread` | IotThread | Thread 網路 |
| `/iot/matter` | IotMatter | Matter 裝置 |

### 5.17 404 處理

- 未認證 → 重導至 `/login?next=<原始路徑>`
- 需要 Wizard → 重導至 `/wizard`
- 其他 → 重導至 `/`

---

## 6. 選單可見性規則

### 6.1 規則結構

每個選單項目的可見性由三個維度決定：

```
可見 = 佈局類型允許 AND 運作模式允許 AND 使用者角色允許
```

特殊規則：
- 含 `cellular` 的選單項目：若 cellular feature 為 false → 不可見
- 含 `matter` 的選單項目：若 matter feature 為 false → 不可見
- 含 `thread` 的選單項目：若 thread feature 為 false → 不可見

### 6.2 完整可見性矩陣

#### Setup Wizard
| 選單鍵 | prpl | genix | cht | Init | Gateway | Bridge | Extender |
|---------|------|-------|-----|------|---------|--------|----------|
| `setupWizard` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |

#### 首頁
| 選單鍵 | prpl | genix | cht | Init | Gateway | Bridge | Extender |
|---------|------|-------|-----|------|---------|--------|----------|
| `home` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |

#### 狀態 (Status)
| 選單鍵 | prpl | genix | cht | Init | Gateway | Bridge | Extender |
|---------|------|-------|-----|------|---------|--------|----------|
| `status.wan` | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `status.wanCht` | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `status.lan` | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| `status.lanCht` | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `status.wlan` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `status.statistics` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `status.wifiNeighbor` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `status.meshInfo` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| `status.lcmInfo` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `status.systemStats` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `status.log` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `status.dualImage` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `status.wanFailover` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `status.cellular` | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |

#### 基本設定 (Basic Setup)
| 選單鍵 | prpl | genix | cht | Init | Gateway | Bridge | Extender |
|---------|------|-------|-----|------|---------|--------|----------|
| `basicSetup.wan` | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.wanCht` | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.backupWan` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.lan` | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.lanCht` | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `basicSetup.lan.ipv4` | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.lan.deviceConnected` | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.wlan` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `basicSetup.wlan.basicConfig` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| `basicSetup.wlan.advancedConfig` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| `basicSetup.wlan.wpsConfig` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| `basicSetup.wlan.meshNetwork` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| `basicSetup.wlan.wifiZones` | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.wlan.wirelessExtender` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| `basicSetup.cellular` | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.operationMode` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `basicSetup.nat` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.nat.portForwarding` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.nat.dmzHost` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.nat.alg` | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.security` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `basicSetup.routing` | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |

#### 進階設定 (Advanced Setup)
| 選單鍵 | prpl | genix | cht | Init | Gateway | Bridge | Extender |
|---------|------|-------|-----|------|---------|--------|----------|
| `advanceSetup.sshService` | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| `advanceSetup.serviceControl` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `advanceSetup.mcl` | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `advanceSetup.qos` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `advanceSetup.lcm` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |

#### 應用程式 (Application)
| 選單鍵 | prpl | genix | cht | Init | Gateway | Bridge | Extender |
|---------|------|-------|-----|------|---------|--------|----------|
| `application.upnp` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `application.ddns` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| `application.storageService` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

#### 管理 (Management)
| 選單鍵 | prpl | genix | cht | Init | Gateway | Bridge | Extender |
|---------|------|-------|-----|------|---------|--------|----------|
| `management.ntp` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.account` | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| `management.accountCht` | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.settings` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.settings.resetToDefault` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.settings.backupRestore` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.settings.updateSoftware` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.tools` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.tools.pingDiagnosis` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.tools.traceRoute` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.tools.dnsDiagnosis` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.tr069` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.tr369` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| `management.reboot` | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |

#### 速度測試
| 選單鍵 | prpl | genix | cht | Init | Gateway | Bridge | Extender |
|---------|------|-------|-----|------|---------|--------|----------|
| `speedtest.tr471` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### 6.3 角色權限矩陣

以下選單項目**僅限 super 角色**存取（normal 角色不可見）：

| 選單鍵 | super | normal |
|---------|-------|--------|
| `basicSetup.nat` | ✓ | ✗ |
| `basicSetup.nat.portForwarding` | ✓ | ✗ |
| `basicSetup.nat.dmzHost` | ✓ | ✗ |
| `basicSetup.nat.alg` | ✓ | ✗ |
| `basicSetup.security` | ✓ | ✗ |
| `basicSetup.routing` | ✓ | ✗ |
| `advanceSetup.sshService` | ✓ | ✗ |
| `advanceSetup.serviceControl` | ✓ | ✗ |
| `advanceSetup.mcl` | ✓ | ✗ |
| `advanceSetup.qos` | ✓ | ✗ |
| `advanceSetup.lcm` | ✓ | ✗ |
| `application.upnp` | ✓ | ✗ |
| `application.ddns` | ✓ | ✗ |
| `application.storageService` | ✓ | ✗ |
| `management.account` | ✓ | ✗ |
| `management.tr069` | ✓ | ✗ |
| `management.tr369` | ✓ | ✗ |

以下選單項目 **super 和 normal 都可存取**：

| 選單鍵 | super | normal |
|---------|-------|--------|
| `management.accountCht` | ✓ | ✓ |

### 6.4 路由路徑 → 選單鍵對應

路由守衛使用**最長前綴匹配**來對應路由路徑與選單鍵：

| 路由前綴 | 選單鍵 |
|----------|--------|
| `/network/lan/ipv4` | `basicSetup.lan.ipv4` |
| `/network/lan/devices` | `basicSetup.lan.deviceConnected` |
| `/network/lan` | `basicSetup.lan` |
| `/basic/lan` | `basicSetup.lan` |
| `/basic/lan-cht` | `basicSetup.lanCht` |
| `/network/wireless/basic` | `basicSetup.wlan.basicConfig` |
| `/network/wireless/advanced` | `basicSetup.wlan.advancedConfig` |
| `/network/wireless/wps` | `basicSetup.wlan.wpsConfig` |
| `/network/wireless/mesh` | `basicSetup.wlan.meshNetwork` |
| `/basic/wlan/zones` | `basicSetup.wlan.wifiZones` |
| `/network/wireless/extender` | `basicSetup.wlan.wirelessExtender` |
| `/network/wireless` | `basicSetup.wlan` |
| `/basic/wlan` | `basicSetup.wlan` |
| `/advanced/nat/dmz` | `basicSetup.nat.dmzHost` |
| `/advanced/nat` | `basicSetup.nat` |
| `/basic/nat` | `basicSetup.nat` |
| `/advanced/security` | `basicSetup.security` |
| `/basic/security` | `basicSetup.security` |
| `/basic/routing` | `basicSetup.routing` |
| `/advanced/ssh` | `advanceSetup.sshService` |
| `/advanced/service-control` | `advanceSetup.serviceControl` |
| `/advanced/mcl` | `advanceSetup.mcl` |
| `/advanced/qos` | `advanceSetup.qos` |
| `/advanced/lcm` | `advanceSetup.lcm` |
| `/application/upnp` | `application.upnp` |
| `/advanced/ddns` | `application.ddns` |
| `/application/ddns` | `application.ddns` |
| `/system/settings/reset` | `management.settings.resetToDefault` |
| `/system/settings/backup` | `management.settings.backupRestore` |
| `/system/settings/update` | `management.settings.updateSoftware` |
| `/system/settings` | `management.settings` |
| `/system/diagnostics/ping` | `management.tools.pingDiagnosis` |
| `/system/diagnostics/traceroute` | `management.tools.traceRoute` |
| `/system/diagnostics/dns` | `management.tools.dnsDiagnosis` |
| `/system/diagnostics/tr471` | `speedtest.tr471` |
| `/system/diagnostics` | `management.tools` |
| `/system/account` | `management.account` |
| `/system/device/tr069` | `management.tr069` |
| `/system/device/tr369` | `management.tr369` |
| `/system/device` | `management.tr069` |

---

## 7. Sidebar 選單 API

```
GET /API/info?list=SidebarMenu
```

回傳內容包含：
- `operationMode`: 當前運作模式
- `netLayoutType`: 當前佈局類型
- `features`: 功能旗標（cellular, matter, thread）
- `userRole`: 使用者角色

前端根據此資訊 + 上述可見性矩陣動態產生側邊選單。

---

## 8. 路由守衛流程

```
使用者瀏覽某路由
        │
        ▼
    是否已認證？ ──否──→ 重導至 /login
        │
       是
        ▼
    是否需要 Wizard？ ──是──→ 重導至 /wizard
        │
       否
        ▼
    路由是否可見？
    （根據 operationMode + netLayoutType + userRole + features）
        │
        ├─ 不可見 → 重導至 /dashboard
        └─ 可見   → 允許進入
```
