# 部署到 OpenWrt 板子（WiFi Logo 專案）

## 適用範圍

此文件適用：

1. OpenWrt 原生板（uhttpd + uci/ubus）
2. 前端專案分支：`ChtWebUI-202603-openwrt-wifilogo`

## 0. 前置條件

1. 本機已可 build 專案（`npm install` 已完成）
2. 板子可 SSH（例：`root@192.168.1.1`）
3. 板子可寫入 `/www`

## 1. 本機打包

```powershell
npm run build
```

輸出目錄：`dist/`

## 2. 板子備份舊網頁

```sh
ssh root@192.168.1.1
cd /www
mkdir -p backup
[ -d wifilogo ] && mv wifilogo "backup/wifilogo_$(date +%Y%m%d_%H%M%S)"
mkdir -p wifilogo
exit
```

## 3. 上傳新檔

在本機執行：

```powershell
scp -r dist\* root@192.168.1.1:/www/wifilogo/
```

## 4. 檢查 uhttpd

```sh
ssh root@192.168.1.1
/etc/init.d/uhttpd status
/etc/init.d/uhttpd restart
```

## 5. 驗證網址

1. `http://192.168.1.1/wifilogo/`
2. 若要測試新頁面路由，先從入口進入（避免直接打深層路徑 404）

## 6. 常見問題

1. 直接開 `http://192.168.1.1/openwrt/wifi` 出現 404：
   - 這是 SPA history route 在 uhttpd 常見情況。
   - 先用 `http://192.168.1.1/wifilogo/` 進入，再由前端 router 切頁。
2. API 404：
   - 板端尚未完成 `/api/openwrt/v1/*` adapter。
3. 設定有送出但 WiFi 沒套用：
   - 需確認後端有執行 `uci commit wireless` + `ubus call network.wireless reconf`。

## 7. 回滾

```sh
ssh root@192.168.1.1
rm -rf /www/wifilogo
cp -a /www/backup/wifilogo_YYYYMMDD_HHMMSS /www/wifilogo
/etc/init.d/uhttpd restart
```

## 8. 本次實測補充（避免下次重踩）

### 8.1 如果頁面變成空白且 Network 顯示 JS/CSS 404

通常是 `/www/wifilogo` 內容不完整或被舊檔覆蓋。請重新部署：

```sh
ssh root@192.168.1.1
rm -rf /www/wifilogo
mkdir -p /www/wifilogo
exit
```

```powershell
npm run build
scp -r dist\* root@192.168.1.1:/www/wifilogo/
```

再重啟一次 web server：

```sh
ssh root@192.168.1.1
/etc/init.d/uhttpd restart
```

### 8.2 直接打 deep link 404（例如 `/openwrt/wifi`）

OpenWrt `uhttpd` 預設不會做 SPA fallback。請固定從入口進入：

1. `http://192.168.1.1/wifilogo/`
2. 再由前端選單切頁

### 8.3 WiFi 設定已儲存但 SSID 沒出現

部分板子需額外觸發無線重載：

```sh
wifi
```

若要自動化，請確認後端 `apply` 流程有：

1. `uci commit wireless`
2. `ubus call network.wireless reconf`（或等價重載）

### 8.4 部署前後的快速核對

```sh
ssh root@192.168.1.1
ls -lah /www/wifilogo | head -n 30
```

確認至少包含：

1. `index.html`
2. `assets/` 目錄
3. `assets/index-*.js` 與 `assets/index-*.css`

### 8.5 先確認「目前操作路徑」避免誤改專案

這個專案常同時存在多個資料夾（例如 `project-bolt...` 與 `CHT_WiFi_logo_git`）。
每次開始操作前，請先確認目前 shell 的路徑與 git root 是否正確。

本機先跑：

```powershell
pwd
git rev-parse --show-toplevel
git branch --show-current
```

預期應為（WiFi Logo 專案）：

1. 路徑：`C:\Users\paul0\Downloads\CHT_WiFi_logo_git\AI-Driven-WebUI`
2. 分支：`ChtWebUI-202603-openwrt-wifilogo`

如果 `git rev-parse --show-toplevel` 失敗，或顯示到其他資料夾，請先切回正確路徑再操作。

建議額外做法：

1. 在指令前固定加上 `workdir`（若使用自動化工具）。
2. 每次 `build / deploy / commit` 前先看一次 `git status --short`。
3. 若看到非預期大量變更，先停止，不要直接 commit。
