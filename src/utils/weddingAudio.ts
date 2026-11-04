// ==============================================================
// WEDDING AUDIO MANAGER: Quản lý phát nhạc thiệp cưới chuyên dụng
// Hỗ trợ file cục bộ, file tải lên từ máy (lưu IndexedDB) & link trực tuyến
// ==============================================================

const DB_NAME = 'WeddingAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_files';
const CUSTOM_AUDIO_KEY = 'custom_wedding_music';

// 1. Khởi tạo / mở kết nối IndexedDB
function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('Trình duyệt không hỗ trợ IndexedDB'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 2. Lưu file nhạc tải lên vào IndexedDB (Hỗ trợ dung lượng lớn hàng chục MB mà không tràn LocalStorage)
export async function saveCustomAudioBlob(blob: Blob, fileName: string): Promise<void> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        blob,
        fileName,
        updatedAt: Date.now(),
      };
      const req = store.put(record, CUSTOM_AUDIO_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Lỗi khi lưu audio vào IndexedDB:', err);
    throw err;
  }
}

// 3. Đọc file nhạc tải lên từ IndexedDB
export async function getCustomAudioBlob(): Promise<{ blob: Blob; fileName: string } | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(CUSTOM_AUDIO_KEY);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve({ blob: req.result.blob, fileName: req.result.fileName || 'Nhạc cưới đã tải lên' });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Không thể đọc audio từ IndexedDB:', err);
    return null;
  }
}

// 4. Xử lý đường dẫn âm thanh tương thích cả Vercel (root /) và GitHub Pages (/hysu/)
export function resolveAudioUrl(url?: string): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const clean = url.startsWith('/') ? url.slice(1) : url;
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
}

// 5. Chuyển đổi musicUrl bất kỳ thành URL có thể phát được ngay lập tức
export async function resolvePlayableAudioUrl(url?: string): Promise<string> {
  if (!url) {
    return resolveAudioUrl('/audio/romantic-wedding-piano.mp3');
  }

  // Nếu là nhạc tải lên lưu trong IndexedDB
  if (url === 'indexeddb:custom_wedding_music' || url.startsWith('indexeddb:')) {
    const custom = await getCustomAudioBlob();
    if (custom && custom.blob) {
      return URL.createObjectURL(custom.blob);
    }
    // Nếu chưa có file thì dùng nhạc mặc định
    return resolveAudioUrl('/audio/romantic-wedding-piano.mp3');
  }

  // Nếu là link cũ lỗi (mixkit hoặc wav cũ)
  if (url.includes('mixkit.co') || url.endsWith('.wav') || url === 'builtin:synth') {
    return resolveAudioUrl('/audio/romantic-wedding-piano.mp3');
  }

  return resolveAudioUrl(url);
}

// 6. Danh sách bài hát gợi ý có sẵn (File MP3 chuẩn studio)
export const PRESET_WEDDING_SONGS = [
  {
    id: 'romantic-piano',
    title: 'Romantic Wedding Piano (Acoustic nhẹ nhàng du dương)',
    url: '/audio/romantic-wedding-piano.mp3',
  },
  {
    id: 'wedding-waltz',
    title: 'Wedding Waltz Piano (Điệu Valse Lễ Đường Ngọt Ngào)',
    url: '/audio/wedding-waltz-piano.mp3',
  },
];
