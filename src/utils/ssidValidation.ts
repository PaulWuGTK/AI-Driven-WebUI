export interface SsidValidationResult {
  isValid: boolean;
  errorMessage?: string;
  byteLength: number;
}

export const SSID_MIN_BYTES = 1;
export const SSID_MAX_BYTES = 32;

/**
 * Calculate the byte length of a string in UTF-8 encoding
 */
export function getByteLength(str: string): number {
  let byteLength = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      byteLength += 1;
    } else if (charCode < 0x800) {
      byteLength += 2;
    } else if (charCode < 0x10000) {
      byteLength += 3;
    } else {
      byteLength += 4;
    }
  }
  return byteLength;
}

/**
 * Validate SSID length (1-32 bytes, supports Chinese and English)
 */
export function validateSsid(ssid: string, t: (key: string, params?: any) => string): SsidValidationResult {
  const byteLength = getByteLength(ssid);

  if (byteLength === 0) {
    return {
      isValid: false,
      errorMessage: t('wireless.ssidRequired'),
      byteLength: 0
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
  let byteLength = 0;
  let truncatedStr = '';

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    let charByteLength = 0;

    if (charCode < 0x80) {
      charByteLength = 1;
    } else if (charCode < 0x800) {
      charByteLength = 2;
    } else if (charCode < 0x10000) {
      charByteLength = 3;
    } else {
      charByteLength = 4;
    }

    if (byteLength + charByteLength > maxBytes) {
      break;
    }

    truncatedStr += str[i];
    byteLength += charByteLength;
  }

  return truncatedStr;
}
