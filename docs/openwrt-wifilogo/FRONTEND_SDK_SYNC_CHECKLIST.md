# OpenWrt WiFi Logo：前端/SDK 同步檢查清單

最後更新：2026-05-13
分支：`ChtWebUI-202603-openwrt-wifilogo`
工作路徑：`C:\Users\paul0\Downloads\CHT_WiFi_logo_git\AI-Driven-WebUI`

## 1. 前端目前待提交變更（已檢查）

目前 `git status` 為大量修改（約 51 檔），可分成以下幾類：

1. 模式/路由核心
   - `src/config/runtimeMode.ts`
   - `src/router/index.ts`
   - `src/App.vue`
   - `src/components/Sidebar.vue`

2. OpenWrt API 與頁面
   - `src/services/api-openwrt/*`
   - `src/views/openwrt/HomeSummary.vue`

3. WLAN + Dashboard 串接（OpenWrt 讀寫）
   - `src/services/api/wireless.ts`
   - `src/services/api/dashboard.ts`

4. 其餘 API 模組（mock / mode 行為切換）
   - `src/services/api/*.ts`（多檔）

5. 文件
   - `docs/openwrt-wifilogo/DEPLOY_TO_OPENWRT_BOARD.md`

## 2. 建議前端 commit 分批（避免一次太大）

建議至少拆 3 個 commit：

1. `feat(openwrt-wifilogo): runtime mode and router behavior`
   - `runtimeMode.ts`, `router/index.ts`, `App.vue`, `Sidebar.vue`

2. `feat(openwrt-wifilogo): wire OpenWrt home and wlan API`
   - `services/api/wireless.ts`, `services/api/dashboard.ts`, `views/openwrt/HomeSummary.vue`, `services/api-openwrt/*`

3. `chore(openwrt-wifilogo): align mock behavior and deploy notes`
   - 其餘 `services/api/*.ts` + deploy 文件

## 3. Push 前必要檢查

1. 清掉本機暫存檔（不要 commit）
   - `tsconfig.app.tsbuildinfo`
   - `tsconfig.node.tsbuildinfo`
2. `npm run build` 必須成功
3. `git diff --stat` 確認沒有不相關檔案
4. 推送目標 branch：`ChtWebUI-202603-openwrt-wifilogo`

## 4. SDK 需要同步的重點（一定要做）

> 重點：目前板子上曾做過「手改 CGI」驗證，這些邏輯若沒回填 SDK，重 build 後會消失。

### 4.1 後端 CGI / API adapter 需納入 SDK package

至少要把以下檔案打包進 firmware：

1. `/www/cgi-bin/api/openwrt/v1/_openwrt_common.lua`
2. `/www/cgi-bin/api/openwrt/v1/home/summary`
3. `/www/cgi-bin/api/openwrt/v1/wifi/basic`
4. `/www/cgi-bin/api/openwrt/v1/wifi/apply`

並確保權限可執行（`755`）。

### 4.2 `wifi/apply` 行為要包含實際套用

`/wifi/apply` 需要確保執行流程至少包含：

1. `ubus call network.wireless reconf`（或同等）
2. `wifi reload`（可作 fallback）
3. `wifi`（本案關鍵，避免「POST 成功但 SSID 未生效」）

### 4.3 避免 package 檔案衝突（你先前遇到的 build error）

先前錯誤是 `luci-base` 與客製 package 同時安裝 `/www/index.html` 造成衝突。

建議：

1. 客製包不要覆蓋 `/www/index.html`
2. 只安裝在 `/www/wifilogo/`（靜態檔）
3. 由板端入口或手動 URL 進入 `/wifilogo/`

### 4.4 Makefile 同步

在 SDK package Makefile 中確認：

1. `PKG_SOURCE_URL` / `PKG_SOURCE_VERSION` 指到本次前端 branch commit
2. `Package/install` 會複製：
   - `dist/*` 到 `/www/wifilogo/`
   - CGI adapter 到 `/www/cgi-bin/api/openwrt/v1/`
3. 不覆蓋 LuCI 既有 `/www/index.html`

## 5. 建議驗證清單（build 後）

1. `http://192.168.1.1/wifilogo/` 可開
2. Home 正常顯示（含版本欄位）
3. WLAN GET 正常
4. WLAN POST 後，不手動下 `wifi` 也會生效
5. 重新開機後 `/cgi-bin/api/openwrt/v1/wifi/apply` 行為仍在（代表已進 FW）

## 6. 備註

若 `git status` 顯示變更量過大，可先照「第 2 節」分批 commit，再 push。
這樣回溯/回滾會比較安全。
