// ==============================================================
// WEDDING AUDIO MANAGER: Quản lý phát nhạc thiệp cưới chuyên dụng
// Hỗ trợ file cục bộ, file tải lên từ máy (lưu IndexedDB & ArrayBuffer)
// ==============================================================

const DB_NAME = 'WeddingAudioDB';
const DB_VERSION = 2; // Nâng version để reset cấu trúc ổn định
const STORE_NAME = 'audio_files';
const CUSTOM_AUDIO_KEY = 'custom_wedding_music';

// Bộ nhớ đệm tạm thời trong phiên (Memory Cache)
let memoryAudioBlob: { blob: Blob; fileName: string } | null = null;

// 1. Khởi tạo / mở kết nối IndexedDB an toàn
function openAudioDB(): Promise<IDBDatabase> {
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
    request.onerror = () => reject(request.error || new Error('Không thể mở IndexedDB'));
  });
}

// 2. Lưu file nhạc tải lên vào IndexedDB
// Chuyển đổi sang ArrayBuffer để tương thích 100% với thuật toán Structured Clone của mọi trình duyệt
export async function saveCustomAudioBlob(file: File | Blob, fileName: string): Promise<void> {
  const mimeType = file.type || 'audio/mpeg';

  // Lưu ngay vào bộ nhớ RAM để đảm bảo phát được tức thì
  memoryAudioBlob = { blob: file, fileName };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const db = await openAudioDB();

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        buffer: arrayBuffer,
        mimeType: mimeType,
        fileName: fileName,
        updatedAt: Date.now(),
      };
      const req = store.put(record, CUSTOM_AUDIO_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => {
        console.warn('Lỗi ghi IndexedDB, giữ bản lưu trong RAM:', req.error);
        resolve(); // Không ngắt luồng của người dùng
      };
    });
  } catch (err) {
    console.warn('Lỗi xử lý ArrayBuffer / IndexedDB, dùng bộ nhớ RAM:', err);
    // Không ném lỗi ra ngoài vì memoryAudioBlob đã sẵn sàng phục vụ
  }
}

// 3. Đọc file nhạc tải lên từ IndexedDB
export async function getCustomAudioBlob(): Promise<{ blob: Blob; fileName: string } | null> {
  if (memoryAudioBlob) {
    return memoryAudioBlob;
  }
  try {
    const db = await openAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(CUSTOM_AUDIO_KEY);
      req.onsuccess = () => {
        const res = req.result;
        if (!res) return resolve(null);

        if (res.buffer) {
          const blob = new Blob([res.buffer], { type: res.mimeType || 'audio/mpeg' });
          memoryAudioBlob = { blob, fileName: res.fileName || 'Nhạc cưới đã tải lên' };
          return resolve(memoryAudioBlob);
        } else if (res.blob) {
          memoryAudioBlob = { blob: res.blob, fileName: res.fileName || 'Nhạc cưới đã tải lên' };
          return resolve(memoryAudioBlob);
        }
        resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Không thể đọc audio từ IndexedDB:', err);
    return null;
  }
}

// 4. Xử lý đường dẫn âm thanh tương thích cả Vercel (root /) và GitHub Pages (/hysu/)
export function formatAudioStreamUrl(url: string): string {
  if (!url) return '';
  // Chuyển link Google Drive chia sẻ sang link stream trực tiếp
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return url;
}

export function resolveAudioUrl(url?: string): string {
  if (!url) return '';
  const formatted = formatAudioStreamUrl(url);
  if (
    formatted.startsWith('http://') ||
    formatted.startsWith('https://') ||
    formatted.startsWith('data:') ||
    formatted.startsWith('blob:')
  ) {
    return formatted;
  }
  const clean = formatted.startsWith('/') ? formatted.slice(1) : formatted;
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.includes('/hysu')) {
      return `/hysu/${clean}`;
    }
    return `/${clean}`;
  }
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
}

// 5. Chuyển đổi musicUrl bất kỳ thành URL có thể phát được ngay lập tức
export async function resolvePlayableAudioUrl(url?: string): Promise<string> {
  if (!url) {
    return resolveAudioUrl('/audio/canon-in-d.mp3');
  }

  // Nếu là nhạc tải lên lưu trong IndexedDB hoặc RAM
  if (url === 'indexeddb:custom_wedding_music' || url.startsWith('indexeddb:')) {
    const custom = await getCustomAudioBlob();
    if (custom && custom.blob) {
      return URL.createObjectURL(custom.blob);
    }
    // Nếu chưa có file thì dùng nhạc mặc định
    return resolveAudioUrl('/audio/canon-in-d.mp3');
  }

  // Nếu là link cũ lỗi (mixkit hoặc wav cũ)
  if (url.includes('mixkit.co') || url.endsWith('.wav') || url === 'builtin:synth') {
    return resolveAudioUrl('/audio/canon-in-d.mp3');
  }

  return resolveAudioUrl(url);
}

// 6. Định nghĩa bài hát gợi ý có sẵn
export interface PresetWeddingSong {
  id: string;
  title: string;
  artist?: string;
  genre: 'classical' | 'piano' | 'waltz' | 'strings' | 'romantic';
  genreLabel: string;
  url: string;
  description: string;
  badge?: string;
}

// Danh sách các bản nhạc cưới chuẩn studio có sẵn trong hệ thống
export const PRESET_WEDDING_SONGS: PresetWeddingSong[] = [
  {
    id: 'canon-in-d',
    title: 'Canon in D Major (Pachelbel)',
    artist: 'Johann Pachelbel',
    genre: 'classical',
    genreLabel: 'Kinh điển lễ đường',
    url: '/audio/canon-in-d.mp3',
    description: 'Bản hòa tấu bất hủ trang trọng bậc nhất trong mọi lễ đường cưới',
    badge: 'Kinh điển',
  },
  {
    id: 'romantic-piano',
    title: 'Romantic Wedding Piano',
    artist: 'Studio Acoustic',
    genre: 'piano',
    genreLabel: 'Piano Acoustic',
    url: '/audio/romantic-wedding-piano.mp3',
    description: 'Giai điệu piano acoustic nhẹ nhàng, êm dịu, lắng đọng',
    badge: 'Phổ biến',
  },
  {
    id: 'wedding-waltz',
    title: 'Wedding Waltz Piano (Điệu Valse)',
    artist: 'Vienna Valse Romance',
    genre: 'waltz',
    genreLabel: 'Valse Lễ Đường',
    url: '/audio/wedding-waltz-piano.mp3',
    description: 'Nhịp valse bay bổng, ngọt ngào khi cặp đôi cùng bước vào lễ đường',
    badge: 'Lãng mạn',
  },
  {
    id: 'there-is-romance',
    title: 'There is Romance (Tình Ca Sâu Lắng)',
    artist: 'Kevin MacLeod',
    genre: 'romantic',
    genreLabel: 'Piano Tình Cảm',
    url: '/audio/there-is-romance.mp3',
    description: 'Bản piano tình ca sâu lắng, thiêng liêng, giàu cảm xúc tình yêu',
    badge: 'Tình cảm',
  },
  {
    id: 'heartwarming-piano',
    title: 'Heartwarming (Ấm Áp & Hân Hoan)',
    artist: 'Kevin MacLeod',
    genre: 'piano',
    genreLabel: 'Tươi Vui Ấm Áp',
    url: '/audio/heartwarming-piano.mp3',
    description: 'Giai điệu piano tươi sáng, ấm áp, lan tỏa niềm vui hạnh phúc',
    badge: 'Hân hoan',
  },
  {
    id: 'reawakening-strings',
    title: 'Reawakening (Hòa Tấu Piano & Cello)',
    artist: 'Kevin MacLeod',
    genre: 'strings',
    genreLabel: 'Hòa Tấu Cello',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Reawakening.mp3',
    description: 'Tiếng đàn Cello trầm ấm hòa quyện piano sang trọng, tinh tế',
    badge: 'Sang trọng',
  },
  {
    id: 'gymnopedie-no1',
    title: 'Gymnopédie No. 1 (Erik Satie)',
    artist: 'Erik Satie',
    genre: 'classical',
    genreLabel: 'Thính Phòng Quý Tộc',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Gymnopedie%20No%201.mp3',
    description: 'Bản nhạc thính phòng tĩnh tại, quý phái cho không gian tiệc cưới',
    badge: 'Thư thái',
  },
  {
    id: 'prelude-in-c',
    title: 'Prelude in C Major (J.S. Bach)',
    artist: 'Johann Sebastian Bach',
    genre: 'classical',
    genreLabel: 'Thánh Đường Tinh Khiết',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Prelude%20in%20C%20-%20BWV%20846.mp3',
    description: 'Giai điệu trong trẻo, tinh khôi như tình yêu thuở ban đầu',
    badge: 'Tinh tế',
  },
];

// 7. Helper thông minh tách tên Cha và Mẹ thành các dòng riêng biệt
// Khắc phục triệt để lỗi gãy chữ hoặc tràn mép hai họ trên slide màn hình LED
export function splitParents(raw?: string): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // Nếu người dùng đã gõ xuống dòng \n (hoặc \r\n)
  if (trimmed.includes('\n')) {
    const lines = trimmed
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
    if (lines.length > 0) return lines;
  }

  // Nếu dùng các ký tự ngăn cách thông dụng: " & ", " và ", " • ", " + ", " / ", " - "
  if (/\s*(?:&|và|\+|•|\/)\s*/i.test(trimmed)) {
    const parts = trimmed
      .split(/\s*(?:&|và|\+|•|\/)\s*/i)
      .map(s => s.trim())
      .filter(Boolean);
    if (parts.length > 1) return parts;
  }

  // Nếu người dùng nhập liền "Ông ... Bà ..." mà không có dấu nối
  const ongBaMatch = trimmed.match(/^(.*?(?:Ông|Bác|Chú|Thân phụ)[^,–\-]+?)\s+(Bà|Thân mẫu.+)$/i);
  if (ongBaMatch && ongBaMatch[1] && ongBaMatch[2]) {
    return [ongBaMatch[1].trim(), ongBaMatch[2].trim()];
  }

  return [trimmed];
}
