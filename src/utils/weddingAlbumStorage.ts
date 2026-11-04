// ==============================================================
// WEDDING ALBUM STORAGE: Lưu trữ và đồng bộ album ảnh cưới
// Hỗ trợ lưu trữ IndexedDB không giới hạn dung lượng và bộ nhớ đệm RAM
// ==============================================================

const DB_NAME = 'WeddingAlbumDB';
const DB_VERSION = 1;
const STORE_NAME = 'album_store';
const ALBUM_IMAGES_KEY = 'custom_wedding_album_images';

// Bộ nhớ đệm RAM tức thì (Memory Cache)
let memoryAlbumImages: string[] | null = null;

/**
 * Mở kết nối an toàn tới IndexedDB cho Album ảnh cưới
 */
function openAlbumDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
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
    request.onerror = () => reject(request.error || new Error('Không thể mở Album IndexedDB'));
  });
}

/**
 * Lưu danh sách ảnh cưới vào IndexedDB và bộ nhớ RAM
 */
export async function saveAlbumImagesToDB(images: string[]): Promise<void> {
  memoryAlbumImages = images;

  try {
    const db = await openAlbumDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ images, updatedAt: Date.now() }, ALBUM_IMAGES_KEY);

      req.onsuccess = () => {
        // Bắn sự kiện thông báo cập nhật album cho các tab/component đang mở
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wedding-album-updated', { detail: images }));
        }
        resolve();
      };

      req.onerror = () => {
        console.warn('Lỗi ghi Album vào IndexedDB, đã lưu trên RAM:', req.error);
        resolve();
      };
    });
  } catch (err) {
    console.warn('Không thể mở IndexedDB để lưu ảnh cưới, đã lưu trên RAM:', err);
  }
}

/**
 * Đọc danh sách ảnh cưới đã lưu từ IndexedDB
 */
export async function getAlbumImagesFromDB(): Promise<string[] | null> {
  if (memoryAlbumImages && memoryAlbumImages.length > 0) {
    return memoryAlbumImages;
  }

  try {
    const db = await openAlbumDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ALBUM_IMAGES_KEY);

      req.onsuccess = () => {
        const res = req.result;
        if (res && Array.isArray(res.images) && res.images.length > 0) {
          memoryAlbumImages = res.images;
          return resolve(res.images);
        }
        resolve(null);
      };

      req.onerror = () => {
        console.warn('Lỗi đọc Album từ IndexedDB:', req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Không thể mở IndexedDB để đọc album ảnh cưới:', err);
    return null;
  }
}

/**
 * Xóa album ảnh cưới đã lưu trong IndexedDB (khôi phục mặc định)
 */
export async function clearAlbumImagesFromDB(): Promise<void> {
  memoryAlbumImages = null;
  try {
    const db = await openAlbumDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(ALBUM_IMAGES_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('Không thể xóa album trong IndexedDB:', err);
  }
}
