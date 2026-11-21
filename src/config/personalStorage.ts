/**
 * CẤU HÌNH LƯU DỮ LIỆU CỐ ĐỊNH CÁ NHÂN (PERSONAL FIXED STORAGE)
 *
 * - Dán Web App URL của Google Apps Script (bắt đầu bằng https://script.google.com/macros/s/.../exec)
 *   vào biến PERSONAL_SHEET_WEBHOOK_URL bên dưới (hoặc cấu hình biến môi trường VITE_PERSONAL_SHEET_URL trên Vercel).
 * - Khi biến này có giá trị, ứng dụng sẽ TỰ ĐỘNG kết nối cố định tới Google Sheet cá nhân của bạn trên
 *   mọi máy tính / điện thoại, tự tải dữ liệu khi mở và tự lưu mọi thay đổi (bao gồm cả cấu hình Màn hình LED).
 * - Sau này khi phát triển cho nhiều người dùng, chỉ cần để trống biến này ('') là ứng dụng trở về chế độ đa người dùng.
 */
export const PERSONAL_SHEET_WEBHOOK_URL: string = (
  import.meta.env.VITE_PERSONAL_SHEET_URL ||
  'https://script.google.com/macros/s/AKfycbze17FUmSKioJEOJGued3LkfzcAJTVYbcxDP87CVCllvDvjeE2pnCzlGJeyAWpTSSBT/exec'
).trim();

export const PERSONAL_SHEET_SPREADSHEET_URL: string =
  'https://docs.google.com/spreadsheets/d/1VfpjkRMBJZzrvaYhu_pC-ld7CMQSjvQM8sEbab8i-Nk/edit?usp=sharing';

export const IS_PERSONAL_FIXED_STORAGE = PERSONAL_SHEET_WEBHOOK_URL.startsWith(
  'https://script.google.com/'
);

export const LED_CONFIG_STORAGE_KEY = 'wedding_led_screen_config_v1';
export const LED_CONFIG_UPDATED_EVENT = 'wedding-led-config-updated';
export const LED_CONFIG_PULLED_EVENT = 'wedding-led-config-pulled';

/**
 * Lấy cấu hình Màn hình LED gọn nhẹ để đồng bộ lên Google Sheets.
 * Tự động loại bỏ ảnh nền dạng base64 quá lớn (> 35KB) để không vượt giới hạn ô 50.000 ký tự của Google Sheets.
 */
export const getLightweightLedConfig = (): Record<string, any> | null => {
  try {
    const raw = localStorage.getItem(LED_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const copy = { ...parsed };
    if (
      typeof copy.customBackgroundUrl === 'string' &&
      copy.customBackgroundUrl.startsWith('data:') &&
      copy.customBackgroundUrl.length > 35000
    ) {
      delete copy.customBackgroundUrl;
    }
    return copy;
  } catch {
    return null;
  }
};

/**
 * Áp dụng cấu hình Màn hình LED mới tải từ Google Sheets về máy,
 * giữ lại ảnh nền base64 cục bộ nếu trên Sheet không lưu ảnh lớn.
 */
export const applyPulledLedConfig = (incoming: Record<string, any>): void => {
  if (!incoming || typeof incoming !== 'object') return;
  try {
    let existing: Record<string, any> = {};
    const raw = localStorage.getItem(LED_CONFIG_STORAGE_KEY);
    if (raw) {
      try {
        existing = JSON.parse(raw) || {};
      } catch {
        existing = {};
      }
    }

    const merged = {
      ...existing,
      ...incoming,
      customBackgroundUrl:
        incoming.customBackgroundUrl !== undefined
          ? incoming.customBackgroundUrl
          : existing.customBackgroundUrl,
    };

    localStorage.setItem(LED_CONFIG_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(LED_CONFIG_PULLED_EVENT, { detail: merged }));
  } catch (err) {
    console.warn('Không thể áp dụng cấu hình Màn hình LED từ Sheet:', err);
  }
};
