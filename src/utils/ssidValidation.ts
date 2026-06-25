export interface SsidValidationResult {
  isValid: boolean;
  errorMessage?: string;
  byteLength: number;
}

export const SSID_MIN_BYTES = 1;
export const SSID_MAX_BYTES = 32;
const utf8Encoder = new TextEncoder();

export function normalizeSsid(str: string): string {
  return str.normalize('NFC');
}

/**
 * Calculate the byte length of a string in UTF-8 encoding
 */
export function getByteLength(str: string): number {
  return utf8Encoder.encode(normalizeSsid(str)).length;
}

/**
 * Check if SSID contains only allowed characters
 * Block only control characters (< 0x20) except space; all printable characters are allowed
 * per BBF TR-181 specification (string(32), no character type restriction)
 */
export function hasValidCharacters(ssid: string): boolean {
  // Block control characters (0x00-0x1F) except allow everything else
  const controlCharPattern = /[\x00-\x1F]/;
  return !controlCharPattern.test(normalizeSsid(ssid));
}

/**
 * Validate SSID length (1-32 bytes, supports Chinese and English)
 * Character restrictions: English, numbers, ASCII symbols, Chinese only
 */
export function validateSsid(ssid: string, t: (key: string, params?: any) => string): SsidValidationResult {
  const normalizedSsid = normalizeSsid(ssid);
  const byteLength = getByteLength(normalizedSsid);

  if (byteLength === 0) {
    return {
      isValid: false,
      errorMessage: t('wireless.ssidRequired'),
      byteLength: 0
    };
  }

  // Check for invalid characters
  if (!hasValidCharacters(normalizedSsid)) {
    return {
      isValid: false,
      errorMessage: t('wireless.ssidInvalidCharacters'),
      byteLength
    };
  }

  if (byteLength < SSID_MIN_BYTES) {
    return {
      isValid: false,
      errorMessage: t('wireless.ssidTooShort', { min: SSID_MIN_BYTES }),
      byteLength
    };
  }

  if (byteLength > SSID_MAX_BYTES) {
    return {
      isValid: false,
      errorMessage: t('wireless.ssidTooLong', { max: SSID_MAX_BYTES, current: byteLength }),
      byteLength
    };
  }

  return {
    isValid: true,
    byteLength
  };
}

/**
 * Truncate string to fit within byte limit
 */
export function truncateToByteLength(str: string, maxBytes: number): string {
  const normalized = normalizeSsid(str);
  let byteLength = 0;
  let truncatedStr = '';

  for (const char of normalized) {
    const charByteLength = utf8Encoder.encode(char).length;
    if (byteLength + charByteLength > maxBytes) {
      break;
    }

    truncatedStr += char;
    byteLength += charByteLength;
  }

  return truncatedStr;
}
