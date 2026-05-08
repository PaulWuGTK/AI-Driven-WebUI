# OpenWrt WiFi Logo 文件索引

## 文件目的

此目錄只記錄 OpenWrt WiFi Logo 專案相關流程，不與原本 prpl/CHT 專案混用。

## 文件清單

1. `DEPLOY_TO_OPENWRT_BOARD.md`
   - 前端打包與部署到 OpenWrt 板子的步驟
2. `BACKEND_ADAPTER_PLAN.md`
   - OpenWrt 後端 API adapter 規劃（uci/ubus）

## 目前建議

1. 前端請走 `ChtWebUI-202603-openwrt-wifilogo` 分支。
2. 後端 API namespace 使用 `/api/openwrt/v1/*`，避免與 app-api-cht 或既有 API 混淆。
3. 先完成最小可驗證頁面：
   - `/openwrt/home`（FW/version/基本狀態）
   - `/openwrt/wifi`（WiFi 基本設定）
