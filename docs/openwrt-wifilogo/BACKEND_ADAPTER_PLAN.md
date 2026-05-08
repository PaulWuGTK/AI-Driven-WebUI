# OpenWrt 後端 Adapter 規劃

## 目標

提供前端可用的 API，不直接暴露 shell/uci 細節。

## API Namespace

`/api/openwrt/v1`

## 第一階段最小 API

1. `GET /api/openwrt/v1/home/summary`
2. `GET /api/openwrt/v1/wifi/basic`
3. `POST /api/openwrt/v1/wifi/basic`
4. `POST /api/openwrt/v1/wifi/apply`

## 對應資料來源

1. `uci show wireless`
2. `ubus call network.wireless status`
3. 寫入：`uci set ...` -> `uci commit wireless`
4. 套用：`ubus call network.wireless reconf`

## 欄位映射重點

1. `Enable` 與 OpenWrt `disabled` 為反向語意
2. `none` / `owe` 不需密碼（前後端都要一致）
3. `HideSSID` 對應 `hidden`（0/1）
4. `IsolationEnable` 對應 `isolate`（0/1）

## 驗證重點

1. 2.4/5/6GHz 各自可讀寫
2. `none/owe` 時 key 不殘留
3. 套用後 AP 實際廣播狀態正確
4. 失敗時回傳可診斷 reason
