# AI-Driven-WebUI
Using bolt.new to generate router pages

## SSID UTF-8 Storage Rule

Wireless SSID fields are validated and normalized using these rules:

- SSID length is validated by `UTF-8` byte length, not character count
- allowed range is `1..32 bytes`
- input is normalized to Unicode `NFC` before validation and before POST payload generation
- the UI may show Chinese and English, but stored values are normalized UTF-8 strings

Examples:

- `HomeWiFi`
  - stored value: `HomeWiFi`
  - UTF-8 byte length: `8`

- `測試WiFi`
  - stored value: `測試WiFi`
  - UTF-8 byte length: `10`
  - reasoning: `測` = 3 bytes, `試` = 3 bytes, `W` = 1, `i` = 1, `F` = 1, `i` = 1

- visually similar Unicode input
  - input form A: decomposed characters such as `e + combining acute`
  - input form B: precomposed `é`
  - stored value: normalized `NFC` form
  - result: byte counting and backend payload stay consistent

Implementation:

- validation utility: [src/utils/ssidValidation.ts](c:/Users/paul0/Downloads/project-bolt-github-20251104_genix/project/src/utils/ssidValidation.ts)
- multi-group wireless page: [src/views/network/wireless/BasicConfig.vue](c:/Users/paul0/Downloads/project-bolt-github-20251104_genix/project/src/views/network/wireless/BasicConfig.vue)
- single-band wireless editor: [src/views/network/wireless/basic/WirelessBandConfig.vue](c:/Users/paul0/Downloads/project-bolt-github-20251104_genix/project/src/views/network/wireless/basic/WirelessBandConfig.vue)
