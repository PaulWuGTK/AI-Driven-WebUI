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
