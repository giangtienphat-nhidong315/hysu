import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ContractItem,
  CoupleProfile,
  DayScheduleItem,
  ExpenseItem,
  GoogleSheetConfig,
  GuestItem,
  TaskItem,
  VendorItem,
} from '../types/wedding';
import {
  DEFAULT_CONTRACTS,
  DEFAULT_EXPENSES,
  DEFAULT_GUESTS,
  DEFAULT_PROFILE,
  DEFAULT_SCHEDULE,
  DEFAULT_TASKS,
  DEFAULT_VENDORS,
} from '../data/defaultData';
import { DEFAULT_WEDDING_PLAYLIST } from '../data/categories';
import { syncToGoogleSheets, fetchFromGoogleSheets } from '../services/googleSheets';
import { getAlbumImagesFromDB, saveAlbumImagesToDB } from '../utils/weddingAlbumStorage';

interface WeddingContextType {
  profile: CoupleProfile;
  updateProfile: (profile: Partial<CoupleProfile>) => void;
  
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, task: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;

  guests: GuestItem[];
  addGuest: (guest: Omit<GuestItem, 'id'>) => void;
  updateGuest: (id: string, guest: Partial<GuestItem>) => void;
  deleteGuest: (id: string) => void;
  toggleCheckIn: (id: string) => void;
  checkInGuest: (id: string) => { success: boolean; guest?: GuestItem; alreadyCheckedIn?: boolean };
  selfCheckInGuest: (data: {
    name: string;
    phone?: string;
    wishes?: string;
    isVegetarian?: boolean;
    plusGuests?: number;
    hasKids?: boolean;
    kidsCount?: number;
    code?: string;
    guestId?: string;
  }) => { success: boolean; guest: GuestItem; isExisting: boolean };
  updateGuestPlus: (id: string, plusCount: number) => void;

  schedule: DayScheduleItem[];
  addScheduleItem: (item: Omit<DayScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, item: Partial<DayScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  vendors: VendorItem[];
  addVendor: (vendor: Omit<VendorItem, 'id'>) => void;
  updateVendor: (id: string, vendor: Partial<VendorItem>) => void;
  deleteVendor: (id: string) => void;

  contracts: ContractItem[];
  addContract: (contract: Omit<ContractItem, 'id'>) => void;
  updateContract: (id: string, contract: Partial<ContractItem>) => void;
  deleteContract: (id: string) => void;
  addContractImage: (contractId: string, imageBase64: string) => void;
  deleteContractImage: (contractId: string, imageIndex: number) => void;

  // Music Playlist
  playlist: import('../types/wedding').MusicItem[];
  addMusicItem: (item: Omit<import('../types/wedding').MusicItem, 'id'>) => void;
  updateMusicItem: (id: string, item: Partial<import('../types/wedding').MusicItem>) => void;
  deleteMusicItem: (id: string) => void;
  toggleMusicPrepared: (id: string) => void;

  // Google Sheet Sync
  sheetConfig: GoogleSheetConfig;
  updateSheetConfig: (config: Partial<GoogleSheetConfig>) => void;
  syncWithGoogleSheets: (silent?: boolean, force?: boolean) => Promise<{ success: boolean; message: string }>;
  pullFromGoogleSheets: (targetUrl?: string, silent?: boolean, force?: boolean) => Promise<{ success: boolean; message: string }>;
  isSyncing: boolean;
  markLocalEdit: () => void;

  // Computed stats
  totalBudget: number;
  totalEstimatedExpense: number;
  totalActualExpense: number;
  totalPaidExpense: number;
  totalRemainingDebt: number;
  totalGuests: number;
  confirmedGuests: number;
  totalActualGifts: number;
  completedTasksCount: number;
  totalTasksCount: number;

  // Reception / Attendance stats
  totalAttendees: number; // Tổng số người (khách xác nhận + người đi kèm)
  checkedInGuestsCount: number; // Số khách đại diện đã đến
  checkedInTotalPeople: number; // Tổng số người đã có mặt tại tiệc
  totalVegetarianCount: number; // Số suất ăn chay

  resetToDefault: () => void;
  triggerConfetti: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'wedding_profile_v1',
  EXPENSES: 'wedding_expenses_v1',
  TASKS: 'wedding_tasks_v1',
  GUESTS: 'wedding_guests_v1',
  SCHEDULE: 'wedding_schedule_v1',
  VENDORS: 'wedding_vendors_v1',
  CONTRACTS: 'wedding_contracts_v1',
  PLAYLIST: 'wedding_playlist_v1',
  SHEET_CONFIG: 'wedding_sheet_config_v1',
};

// Chuẩn hóa ngày cưới về định dạng chuẩn YYYY-MM-DD để các trình duyệt và input[type=date] không bị lỗi
export const sanitizeWeddingDate = (val: any): string => {
  if (!val) return '2026-11-20';
  const str = String(val).trim();
  const m = str.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (m) return m[0];
  const m2 = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m2) {
    return `${m2[3]}-${m2[2].padStart(2, '0')}-${m2[1].padStart(2, '0')}`;
  }
  const dt = new Date(str);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }
  return '2026-11-20';
};

// Chuẩn hóa giờ cưới về HH:mm
export const sanitizeWeddingTime = (val: any): string => {
  if (!val) return '11:00';
  const str = String(val).trim();
  const m = str.match(/\b(\d{1,2}):(\d{2})\b/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  const dt = new Date(str);
  if (!isNaN(dt.getTime())) {
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '11:00';
};

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CoupleProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          weddingDate: sanitizeWeddingDate(parsed.weddingDate),
          weddingTime: sanitizeWeddingTime(parsed.weddingTime),
          albumImages: parsed.albumImages && parsed.albumImages.length > 0 ? parsed.albumImages : (DEFAULT_PROFILE.albumImages || []),
          musicUrl: (parsed.musicUrl && !parsed.musicUrl.includes('mixkit.co') && !parsed.musicUrl.endsWith('.wav') && parsed.musicUrl !== 'builtin:synth') ? parsed.musicUrl : DEFAULT_PROFILE.musicUrl,
          musicTitle: (parsed.musicUrl && !parsed.musicUrl.includes('mixkit.co') && !parsed.musicUrl.endsWith('.wav') && parsed.musicUrl !== 'builtin:synth') ? (parsed.musicTitle || DEFAULT_PROFILE.musicTitle) : DEFAULT_PROFILE.musicTitle,
          invitationMessage: parsed.invitationMessage || DEFAULT_PROFILE.invitationMessage,
        };
      } catch (e) {
        console.error('Error loading saved profile:', e);
      }
    }
    return DEFAULT_PROFILE;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [guests, setGuests] = useState<GuestItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GUESTS);
    const rawList: GuestItem[] = saved ? JSON.parse(saved) : DEFAULT_GUESTS;
    let nextNum = 1;
    return rawList.map((g, idx) => {
      // Chỉ giữ lại chữ số (ví dụ: 001, 002)
      const digits = (g.code || '').replace(/\D/g, '');
      const code = digits ? String(parseInt(digits, 10)).padStart(3, '0') : String(idx + 1).padStart(3, '0');
      return { ...g, code };
    });
  });

  const [schedule, setSchedule] = useState<DayScheduleItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
  });

  const [vendors, setVendors] = useState<VendorItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return saved ? JSON.parse(saved) : DEFAULT_VENDORS;
  });

  const [contracts, setContracts] = useState<ContractItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    return saved ? JSON.parse(saved) : DEFAULT_CONTRACTS;
  });

  const [playlist, setPlaylist] = useState<import('../types/wedding').MusicItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYLIST);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_WEDDING_PLAYLIST.map((item, idx) => ({
      ...item,
      id: `music-init-${idx + 1}`,
    }));
  });

  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
      };
    }
    return {
      webhookUrl: '',
      autoSync: true,
      lastStatus: 'idle',
    };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const isInitialMount = useRef(true);
  const isPullingRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLocalEditTimeRef = useRef<number>(0);
  const lastLocalSaveTimestampRef = useRef<number>(0);
  const hasOldScriptRef = useRef<boolean>(false);
  // Cờ theo dõi xem người dùng có thực sự chỉnh sửa dữ liệu trên thiết bị này hay chưa
  const hasPendingLocalEditsRef = useRef<boolean>(false);

  const markLocalEdit = () => {
    lastLocalEditTimeRef.current = Date.now();
    hasPendingLocalEditsRef.current = true;
  };

  // Tự động khôi phục album ảnh cưới từ IndexedDB khi mở ứng dụng
  useEffect(() => {
    getAlbumImagesFromDB().then(dbImages => {
      if (dbImages && dbImages.length > 0) {
        setProfile(prev => ({
          ...prev,
          albumImages: dbImages,
        }));
      }
    });

    const handleAlbumUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setProfile(prev => ({
          ...prev,
          albumImages: e.detail,
        }));
      }
    };

    window.addEventListener('wedding-album-updated', handleAlbumUpdated);
    return () => {
      window.removeEventListener('wedding-album-updated', handleAlbumUpdated);
    };
  }, []);

  // Sync to local storage an toàn, chống tràn bộ nhớ QuotaExceededError
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn('LocalStorage quota warning for profile, saving safe fallback:', err);
      try {
        const safeProfile = {
          ...profile,
          albumImages: (profile.albumImages || []).map((img, i) =>
            img.length > 500 ? `indexeddb:img_${i}` : img
          ),
        };
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(safeProfile));
      } catch (err2) {
        console.error('Không thể lưu profile vào localStorage:', err2);
      }
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(sheetConfig));
  }, [sheetConfig]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#ec4899'],
    });
  };

  // Google Sheets Sync
  const updateSheetConfig = (data: Partial<GoogleSheetConfig>) => {
    setSheetConfig(prev => ({ ...prev, ...data }));
  };

  const syncWithGoogleSheets = async (silent = false, force = false): Promise<{ success: boolean; message: string }> => {
    if (!sheetConfig.webhookUrl) {
      return { success: false, message: 'Chưa cấu hình Google Sheets Webhook URL' };
    }

    // Nếu người dùng chủ động lưu (force=true), hủy cờ kéo ngầm để gửi ngay
    if (force) {
      isPullingRef.current = false;
    } else if (isPullingRef.current) {
      // Nếu đang trong quá trình kéo dữ liệu từ Sheet về, tạm hoãn gửi ngầm
      return { success: false, message: 'Đang tải dữ liệu từ Google Sheets, tạm hoãn gửi đi' };
    }

    // NGUYÊN TẮC BẢO VỆ DỮ LIỆU:
    // Nếu là đồng bộ tự động ngầm (silent) và người dùng chưa thực sự chỉnh sửa gì tại máy này, KHÔNG gửi!
    if (silent && !hasPendingLocalEditsRef.current && !force) {
      return { success: true, message: 'Dữ liệu tại máy đã đồng bộ' };
    }

    setIsSyncing(true);
    setSheetConfig(prev => ({ ...prev, lastStatus: 'syncing' }));

    try {
      const nowTs = Date.now();
      lastLocalSaveTimestampRef.current = nowTs;

      // Tách chuỗi ảnh base64 lớn ra khỏi payload gửi lên Google Sheets để đảm bảo không bị nghẽn mạng hoặc lỗi quota
      const lightweightContracts = (contracts || []).map(c => ({
        ...c,
        images: [],
        imageCount: (c.images || []).length,
      }));

      const payload = {
        profile,
        expenses,
        tasks,
        guests,
        schedule,
        vendors,
        contracts: lightweightContracts,
        playlist,
        clientTimestamp: nowTs,
        forceOverwrite: force,
      };

      const result = await syncToGoogleSheets(sheetConfig.webhookUrl, payload);
      if (result.success) {
        hasPendingLocalEditsRef.current = false;
      }
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setSheetConfig(prev => ({
        ...prev,
        lastStatus: result.success ? 'success' : 'error',
        lastSyncedAt: result.success ? timeStr : prev.lastSyncedAt,
        lastMessage: result.message,
      }));

      if (!silent && result.success) {
        triggerConfetti();
      }
      return result;
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi đồng bộ Google Sheets';
      setSheetConfig(prev => ({
        ...prev,
        lastStatus: 'error',
        lastMessage: errMsg,
      }));
      return { success: false, message: errMsg };
    } finally {
      setIsSyncing(false);
    }
  };

  // Tải dữ liệu mới nhất từ Google Sheets về thiết bị này (Đồng bộ 2 chiều an toàn)
  const pullFromGoogleSheets = async (
    targetUrl?: string,
    silent = false,
    force = false
  ): Promise<{ success: boolean; message: string }> => {
    const url = targetUrl || sheetConfig.webhookUrl;
    if (!url) {
      return { success: false, message: 'Chưa cấu hình Google Sheets Webhook URL' };
    }

    // Hủy ngay lập tức bất kỳ lệnh đẩy ngầm nào đang hẹn giờ để không chạy đè
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }

    // ĐÁNH DẤU NGAY LẬP TỨC LÀ ĐANG KÉO DỮ LIỆU
    isPullingRef.current = true;
    setIsSyncing(true);
    setSheetConfig(prev => ({ ...prev, lastStatus: 'syncing' }));

    // NGUYÊN TẮC BẢO VỆ DỮ LIỆU:
    // Nếu là đồng bộ ngầm và máy đang có sửa đổi chưa đẩy hoặc vừa chỉnh sửa trong 60s qua thì hoãn kéo để tránh ghi đè mất dữ liệu đang nhập
    if (!force && silent && (hasPendingLocalEditsRef.current || Date.now() - lastLocalEditTimeRef.current < 60000)) {
      setIsSyncing(false);
      isPullingRef.current = false;
      return { success: true, message: 'Đang ưu tiên dữ liệu vừa nhập tại máy' };
    }

    try {
      const result = await fetchFromGoogleSheets(url);
      if (result.success && result.data) {
        const d = result.data;

        // KIỂM TRA TIMESTAMP ĐỂ BẢO VỆ DỮ LIỆU:
        // Nếu không phải force, và Sheet trả về dữ liệu cũ hơn lần lưu gần nhất của máy thì không ghi đè
        const incomingTs = (d as any).clientTimestamp || (result as any).clientTimestamp;
        if (!force && incomingTs && lastLocalSaveTimestampRef.current) {
          if (incomingTs < lastLocalSaveTimestampRef.current) {
            // Dữ liệu trên sheet cũ hơn bản vừa lưu tại máy
            return { success: true, message: 'Dữ liệu tại máy đang mới hơn sheet' };
          }
        }

        // Cập nhật thông tin cặp đôi / tiệc cưới (hỗ trợ nhiều định dạng tên biến)
        if (d.profile) {
          const rawProf: any = d.profile;
          const groom = rawProf.groomName || rawProf.groom || rawProf.chuRe;
          const bride = rawProf.brideName || rawProf.bride || rawProf.coDau;
          if (groom || bride) {
            setProfile(prev => {
              const nextProf = {
                ...prev,
                groomName: groom ? String(groom).trim() : prev.groomName,
                brideName: bride ? String(bride).trim() : prev.brideName,
                weddingDate: rawProf.weddingDate ? sanitizeWeddingDate(rawProf.weddingDate) : (rawProf.date ? sanitizeWeddingDate(rawProf.date) : prev.weddingDate),
                weddingTime: rawProf.weddingTime ? sanitizeWeddingTime(rawProf.weddingTime) : (rawProf.time ? sanitizeWeddingTime(rawProf.time) : prev.weddingTime),
                venue: rawProf.venue !== undefined ? String(rawProf.venue).trim() : (rawProf.location !== undefined ? String(rawProf.location).trim() : prev.venue),
                targetBudget: rawProf.targetBudget !== undefined ? Number(rawProf.targetBudget) : (rawProf.budget !== undefined ? Number(rawProf.budget) : prev.targetBudget),
              };
              localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(nextProf));
              return nextProf;
            });
          }
        }

        // Cập nhật danh sách chi tiêu nếu có ít nhất 1 dòng
        if (d.expenses && Array.isArray(d.expenses) && d.expenses.length > 0) {
          setExpenses(d.expenses);
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(d.expenses));
        }

        // Cập nhật danh sách khách mời & điểm danh nếu có ít nhất 1 dòng
        if (d.guests && Array.isArray(d.guests) && d.guests.length > 0) {
          setGuests(d.guests);
          localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(d.guests));
        }

        // Cập nhật danh sách công việc nếu có ít nhất 1 dòng
        if (d.tasks && Array.isArray(d.tasks) && d.tasks.length > 0) {
          setTasks(d.tasks);
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(d.tasks));
        }

        // Cập nhật lịch trình nếu có
        if (d.schedule && Array.isArray(d.schedule) && d.schedule.length > 0) {
          setSchedule(d.schedule);
          localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(d.schedule));
        }

        // Cập nhật nhà cung cấp nếu có
        if (d.vendors && Array.isArray(d.vendors) && d.vendors.length > 0) {
          setVendors(d.vendors);
          localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(d.vendors));
        }

        // Cập nhật hợp đồng nếu có, đồng thời bảo tồn ảnh đính kèm cục bộ trên máy
        if (d.contracts && Array.isArray(d.contracts) && d.contracts.length > 0) {
          setContracts(prev => {
            const merged = d.contracts!.map(sheetItem => {
              const localMatch = prev.find(p => p.id === sheetItem.id || (p.title === sheetItem.title && p.vendorName === sheetItem.vendorName));
              return {
                ...sheetItem,
                status: sheetItem.status || 'active',
                images: (localMatch && localMatch.images && localMatch.images.length > 0) ? localMatch.images : (sheetItem.images || []),
              };
            });
            localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(merged));
            return merged;
          });
        }

        // Cập nhật danh sách nhạc cưới (playlist) nếu có
        if (d.playlist && Array.isArray(d.playlist) && d.playlist.length > 0) {
          setPlaylist(d.playlist);
          localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(d.playlist));
        }

        // Đã đồng bộ mới nhất từ Sheet về, xóa cờ cần đẩy cục bộ
        hasPendingLocalEditsRef.current = false;
        hasOldScriptRef.current = false;
        const timeStr = new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        setSheetConfig(prev => ({
          ...prev,
          lastStatus: 'success',
          lastSyncedAt: timeStr,
          lastMessage: 'Đã nhận dữ liệu mới nhất từ Google Sheet',
        }));

        if (!silent) {
          triggerConfetti();
        }

        return { success: true, message: 'Đã cập nhật dữ liệu mới nhất từ Google Sheet thành công!' };
      }

      if (result.isOldScriptVersion) {
        hasOldScriptRef.current = true;
      }

      if (!silent || result.isOldScriptVersion) {
        setSheetConfig(prev => ({
          ...prev,
          lastStatus: result.isOldScriptVersion ? 'idle' : 'error',
          lastMessage: result.message,
        }));
      }

      return { success: false, message: result.message || 'Không thể đọc dữ liệu' };
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi khi tải từ Google Sheet';
      if (!silent) {
        setSheetConfig(prev => ({
          ...prev,
          lastStatus: 'error',
          lastMessage: errMsg,
        }));
      }
      return { success: false, message: errMsg };
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        isPullingRef.current = false;
      }, 1500);
    }
  };

  // Tự động kết nối và tải dữ liệu:
  // 1. Khi mở ứng dụng có link chứa ?p=... (thông tin ngày cưới) hoặc ?sheet=...
  // 2. Tự động kéo dữ liệu mới nhất từ Google Sheet khi vào app
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sheetParam = params.get('sheet');
      const pParam = params.get('p');

      // Tải ngay thông tin cặp đôi từ URL nếu có
      if (pParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(pParam))));
          if (decoded && (decoded.groomName || decoded.brideName)) {
            setProfile(prev => {
              const nextProf = {
                ...prev,
                groomName: decoded.groomName || prev.groomName,
                brideName: decoded.brideName || prev.brideName,
                weddingDate: sanitizeWeddingDate(decoded.weddingDate || prev.weddingDate),
                weddingTime: sanitizeWeddingTime(decoded.weddingTime || prev.weddingTime),
                venue: decoded.venue !== undefined ? decoded.venue : prev.venue,
                targetBudget: Number(decoded.targetBudget) || prev.targetBudget,
              };
              localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(nextProf));
              return nextProf;
            });
          }
        } catch (e) {
          console.error('Error reading profile url param:', e);
        }
      }

      if (sheetParam && sheetParam.startsWith('https://script.google.com/')) {
        updateSheetConfig({ webhookUrl: sheetParam, autoSync: true });
        pullFromGoogleSheets(sheetParam, false, true);
        // Nếu không phải đang ở guest checkin mode thì mới xóa query params khỏi thanh địa chỉ
        const isCheckin = params.get('mode') === 'checkin';
        if (!isCheckin) {
          const cleanPath = window.location.pathname;
          window.history.replaceState({}, '', cleanPath);
        }
        return;
      }
    } catch (e) {
      console.error('Error reading sheet url param:', e);
    }

    // Nếu đã có sẵn webhookUrl, tải dữ liệu mới nhất ngầm khi mở app
    if (sheetConfig.webhookUrl) {
      pullFromGoogleSheets(sheetConfig.webhookUrl, true);
    }
  }, []);

  // 1. Tự động kiểm tra và kéo dữ liệu mới liên tục mỗi 10 giây (Auto-Polling 2 chiều liên tục giữa các thiết bị)
  useEffect(() => {
    if (!sheetConfig.webhookUrl) return;

    const timer = setInterval(() => {
      // Nếu đã phát hiện script trên Google Sheet là bản cũ, tạm hoãn auto-poll ngầm để tránh lỗi
      if (hasOldScriptRef.current) return;

      // Chỉ kéo khi tab đang mở, không có sửa đổi đang chờ đẩy và không vừa thao tác trong 60 giây qua
      if (
        document.visibilityState === 'visible' &&
        !isSyncing &&
        !isPullingRef.current &&
        !hasPendingLocalEditsRef.current &&
        Date.now() - lastLocalEditTimeRef.current > 60000
      ) {
        pullFromGoogleSheets(sheetConfig.webhookUrl, true);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [sheetConfig.webhookUrl, isSyncing]);

  // 2. Tự động kéo dữ liệu ngay lập tức khi chuyển qua tab này, mở khóa màn hình hoặc kết nối mạng lại
  useEffect(() => {
    const handleRefresh = () => {
      if (
        document.visibilityState === 'visible' &&
        sheetConfig.webhookUrl &&
        !isSyncing &&
        !isPullingRef.current &&
        !hasPendingLocalEditsRef.current &&
        Date.now() - lastLocalEditTimeRef.current > 60000
      ) {
        pullFromGoogleSheets(sheetConfig.webhookUrl, true);
      }
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);
    window.addEventListener('online', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
      window.removeEventListener('online', handleRefresh);
    };
  }, [sheetConfig.webhookUrl, isSyncing]);

  // Tự động đồng bộ lên Google Sheets khi có bất kỳ thay đổi nào (Debounced Auto-Sync)
  useEffect(() => {
    // Bỏ qua lần đầu khởi tạo ứng dụng hoặc khi đang kéo dữ liệu từ Google Sheets về
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isPullingRef.current) {
      return;
    }

    // NGUYÊN TẮC BẢO VỆ DỮ LIỆU CỐT LÕI:
    // Chỉ tự động đẩy lên Google Sheet khi người dùng THỰC SỰ CHỈNH SỬA dữ liệu trên máy này!
    // Tuyệt đối KHÔNG tự ý đẩy khi vừa mở app hoặc vừa dán/sửa Webhook URL!
    if (!hasPendingLocalEditsRef.current) {
      return;
    }

    if (!sheetConfig.webhookUrl || sheetConfig.autoSync === false) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Tự động lưu lên Google Sheet sau 1500ms khi người dùng dừng thao tác
    syncTimeoutRef.current = setTimeout(() => {
      if (hasPendingLocalEditsRef.current && !isPullingRef.current) {
        syncWithGoogleSheets(true);
      }
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    profile,
    expenses,
    tasks,
    guests,
    schedule,
    vendors,
    contracts,
    playlist,
  ]);

  // Profile
  const updateProfile = (data: Partial<CoupleProfile>) => {
    markLocalEdit();
    if (data.albumImages && Array.isArray(data.albumImages)) {
      saveAlbumImagesToDB(data.albumImages);
    }
    setProfile(prev => {
      const next = {
        ...prev,
        ...data,
        weddingDate: data.weddingDate ? sanitizeWeddingDate(data.weddingDate) : prev.weddingDate,
        weddingTime: data.weddingTime ? sanitizeWeddingTime(data.weddingTime) : prev.weddingTime,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(next));
      } catch (err) {
        console.warn('LocalStorage quota warning in updateProfile, saving safe fallback:', err);
        try {
          const safeNext = {
            ...next,
            albumImages: (next.albumImages || []).map((img, i) =>
              img.length > 500 ? `indexeddb:img_${i}` : img
            ),
          };
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(safeNext));
        } catch (err2) {
          console.error('Lỗi lưu fallback profile:', err2);
        }
      }
      return next;
    });
  };

  // Expenses
  const addExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    markLocalEdit();
    const newItem: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setExpenses(prev => [newItem, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<ExpenseItem>) => {
    markLocalEdit();
    setExpenses(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteExpense = (id: string) => {
    markLocalEdit();
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // Tasks
  const addTask = (task: Omit<TaskItem, 'id'>) => {
    markLocalEdit();
    const newItem: TaskItem = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTasks(prev => [newItem, ...prev]);
  };

  const toggleTask = (id: string) => {
    markLocalEdit();
    setTasks(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextState = !item.isCompleted;
          if (nextState) triggerConfetti();
          return { ...item, isCompleted: nextState };
        }
        return item;
      })
    );
  };

  const updateTask = (id: string, updated: Partial<TaskItem>) => {
    markLocalEdit();
    setTasks(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteTask = (id: string) => {
    markLocalEdit();
    setTasks(prev => prev.filter(item => item.id !== id));
  };

  // Guests
  const addGuest = (guest: Omit<GuestItem, 'id'>) => {
    markLocalEdit();
    let maxNum = 0;
    guests.forEach(g => {
      const digits = (g.code || '').replace(/\D/g, '');
      if (digits) maxNum = Math.max(maxNum, parseInt(digits, 10));
    });
    const customDigits = (guest.code || '').replace(/\D/g, '');
    const assignedCode = customDigits
      ? String(parseInt(customDigits, 10)).padStart(3, '0')
      : String(maxNum + 1).padStart(3, '0');

    const newItem: GuestItem = {
      ...guest,
      code: assignedCode,
      plusGuests: guest.plusGuests ?? 0,
      isCheckedIn: guest.isCheckedIn ?? false,
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setGuests(prev => [newItem, ...prev]);
  };

  const updateGuest = (id: string, updated: Partial<GuestItem>) => {
    markLocalEdit();
    setGuests(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        let nextCode = item.code;
        if (updated.code !== undefined) {
          const digits = updated.code.replace(/\D/g, '');
          nextCode = digits ? String(parseInt(digits, 10)).padStart(3, '0') : item.code;
        }
        return {
          ...item,
          ...updated,
          code: nextCode,
        };
      })
    );
  };

  const deleteGuest = (id: string) => {
    markLocalEdit();
    setGuests(prev => prev.filter(item => item.id !== id));
  };

  const toggleCheckIn = (id: string) => {
    markLocalEdit();
    setGuests(prev =>
      prev.map(g => {
        if (g.id === id) {
          const next = !g.isCheckedIn;
          const time = next ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined;
          if (next) triggerConfetti();
          return { ...g, isCheckedIn: next, checkInTime: time };
        }
        return g;
      })
    );
  };

  const checkInGuest = (idOrCode: string): { success: boolean; guest?: GuestItem; alreadyCheckedIn?: boolean } => {
    markLocalEdit();
    const q = idOrCode.trim().toLowerCase();
    const qDigits = idOrCode.replace(/\D/g, '');
    const target = guests.find(
      g =>
        g.id.toLowerCase() === q ||
        g.code === q ||
        (qDigits && g.code === qDigits.padStart(3, '0'))
    );
    if (!target) return { success: false };
    if (target.isCheckedIn) {
      return { success: true, guest: target, alreadyCheckedIn: true };
    }
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    triggerConfetti();
    const updated = { ...target, isCheckedIn: true, checkInTime: time };
    setGuests(prev => prev.map(g => (g.id === target.id ? updated : g)));
    return { success: true, guest: updated, alreadyCheckedIn: false };
  };

  // Khách tự điểm danh qua QR Form (Tự điền tên, SĐT, lời chúc, cấp số may mắn)
  const selfCheckInGuest = (data: {
    name: string;
    phone?: string;
    wishes?: string;
    isVegetarian?: boolean;
    plusGuests?: number;
    hasKids?: boolean;
    kidsCount?: number;
    code?: string;
    guestId?: string;
  }): { success: boolean; guest: GuestItem; isExisting: boolean } => {
    markLocalEdit();
    const cleanPhone = (data.phone || '').trim().replace(/\s+/g, '');
    const cleanName = data.name.trim();

    // 1. Kiểm tra xem khách đã có trong danh sách theo guestId, code, SĐT hoặc Tên chưa
    let existingIndex = -1;
    if (data.guestId) {
      existingIndex = guests.findIndex(g => g.id === data.guestId);
    }
    if (existingIndex === -1 && data.code) {
      const cleanInputCode = data.code.trim().toLowerCase();
      const inputDigits = data.code.replace(/\D/g, '');
      existingIndex = guests.findIndex(g => {
        if (!g.code) return false;
        if (g.code.trim().toLowerCase() === cleanInputCode) return true;
        const gDigits = g.code.replace(/\D/g, '');
        return Boolean(inputDigits && gDigits && parseInt(inputDigits, 10) === parseInt(gDigits, 10));
      });
    }
    if (existingIndex === -1 && cleanPhone) {
      existingIndex = guests.findIndex(g => g.phone && g.phone.replace(/\s+/g, '') === cleanPhone);
    }
    if (existingIndex === -1 && cleanName) {
      existingIndex = guests.findIndex(
        g => g.name.trim().toLowerCase() === cleanName.toLowerCase()
      );
    }

    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    triggerConfetti();

    if (existingIndex !== -1) {
      // Khách đã có trong danh sách -> Cập nhật check-in & lưu lời chúc
      const current = guests[existingIndex];
      const assignedLucky = current.luckyNumber || current.code || data.code || String(existingIndex + 1).padStart(3, '0');
      const updated: GuestItem = {
        ...current,
        name: cleanName || current.name,
        code: current.code || data.code || assignedLucky,
        isCheckedIn: true,
        checkInTime: current.checkInTime || time,
        wishes: data.wishes ? data.wishes.trim() : current.wishes,
        isVegetarian: data.isVegetarian !== undefined ? data.isVegetarian : current.isVegetarian,
        plusGuests: data.plusGuests !== undefined ? data.plusGuests : current.plusGuests,
        hasKids: data.hasKids !== undefined ? data.hasKids : current.hasKids,
        kidsCount: data.kidsCount !== undefined ? data.kidsCount : current.kidsCount,
        luckyNumber: assignedLucky,
      };

      setGuests(prev => prev.map((g, idx) => (idx === existingIndex ? updated : g)));
      return { success: true, guest: updated, isExisting: true };
    } else {
      // Khách mới chưa có trong danh sách -> Thêm mới với mã số tự sinh hoặc mã truyền vào
      let assignedCode = (data.code || '').trim();
      if (!assignedCode) {
        let maxNum = 0;
        guests.forEach(g => {
          const digits = (g.code || '').replace(/\D/g, '');
          if (digits) maxNum = Math.max(maxNum, parseInt(digits, 10));
        });
        assignedCode = String(maxNum + 1).padStart(3, '0');
      }

      const newGuest: GuestItem = {
        id: `guest-self-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code: assignedCode,
        luckyNumber: assignedCode,
        name: cleanName,
        phone: cleanPhone,
        group: 'friends',
        invitationStatus: 'confirmed',
        isCheckedIn: true,
        checkInTime: time,
        wishes: data.wishes ? data.wishes.trim() : '',
        isVegetarian: data.isVegetarian ?? false,
        plusGuests: data.plusGuests ?? 0,
        hasKids: data.hasKids ?? false,
        kidsCount: data.kidsCount ?? 0,
      };

      setGuests(prev => [newGuest, ...prev]);
      return { success: true, guest: newGuest, isExisting: false };
    }
  };

  const updateGuestPlus = (id: string, plusCount: number) => {
    markLocalEdit();
    setGuests(prev =>
      prev.map(g => (g.id === id ? { ...g, plusGuests: Math.max(0, plusCount) } : g))
    );
  };

  // Schedule
  const addScheduleItem = (item: Omit<DayScheduleItem, 'id'>) => {
    markLocalEdit();
    const newItem: DayScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    setSchedule(prev => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const updateScheduleItem = (id: string, updated: Partial<DayScheduleItem>) => {
    markLocalEdit();
    setSchedule(prev =>
      prev
        .map(item => (item.id === id ? { ...item, ...updated } : item))
        .sort((a, b) => a.time.localeCompare(b.time))
    );
  };

  const deleteScheduleItem = (id: string) => {
    markLocalEdit();
    setSchedule(prev => prev.filter(item => item.id !== id));
  };

  // Vendors
  const addVendor = (vendor: Omit<VendorItem, 'id'>) => {
    markLocalEdit();
    const newItem: VendorItem = {
      ...vendor,
      id: `ven-${Date.now()}`,
    };
    setVendors(prev => [newItem, ...prev]);
  };

  const updateVendor = (id: string, updated: Partial<VendorItem>) => {
    markLocalEdit();
    setVendors(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteVendor = (id: string) => {
    markLocalEdit();
    setVendors(prev => prev.filter(item => item.id !== id));
  };

  // Contracts
  const addContract = (contract: Omit<ContractItem, 'id'>) => {
    markLocalEdit();
    const newItem: ContractItem = {
      ...contract,
      images: contract.images || [],
      id: `ctr-${Date.now()}`,
    };
    setContracts(prev => [newItem, ...prev]);
  };

  const updateContract = (id: string, updated: Partial<ContractItem>) => {
    markLocalEdit();
    setContracts(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteContract = (id: string) => {
    markLocalEdit();
    setContracts(prev => prev.filter(item => item.id !== id));
  };

  const addContractImage = (contractId: string, imageBase64: string) => {
    markLocalEdit();
    setContracts(prev =>
      prev.map(item =>
        item.id === contractId
          ? { ...item, images: [...(item.images || []), imageBase64] }
          : item
      )
    );
  };

  const deleteContractImage = (contractId: string, imageIndex: number) => {
    markLocalEdit();
    setContracts(prev =>
      prev.map(item =>
        item.id === contractId
          ? { ...item, images: item.images.filter((_, idx) => idx !== imageIndex) }
          : item
      )
    );
  };

  // Music Playlist methods
  const addMusicItem = (item: Omit<import('../types/wedding').MusicItem, 'id'>) => {
    markLocalEdit();
    const newItem: import('../types/wedding').MusicItem = {
      ...item,
      id: `music-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setPlaylist(prev => [...prev, newItem]);
  };

  const updateMusicItem = (id: string, updated: Partial<import('../types/wedding').MusicItem>) => {
    markLocalEdit();
    setPlaylist(prev => prev.map(m => (m.id === id ? { ...m, ...updated } : m)));
  };

  const deleteMusicItem = (id: string) => {
    markLocalEdit();
    setPlaylist(prev => prev.filter(m => m.id !== id));
  };

  const toggleMusicPrepared = (id: string) => {
    markLocalEdit();
    setPlaylist(prev =>
      prev.map(m => (m.id === id ? { ...m, isPrepared: !m.isPrepared } : m))
    );
  };

  // Reset
  const resetToDefault = () => {
    setProfile(DEFAULT_PROFILE);
    setExpenses(DEFAULT_EXPENSES);
    setTasks(DEFAULT_TASKS);
    setGuests(DEFAULT_GUESTS);
    setSchedule(DEFAULT_SCHEDULE);
    setVendors(DEFAULT_VENDORS);
    setContracts(DEFAULT_CONTRACTS);
  };

  const exportDataJSON = () => {
    const data = {
      profile,
      expenses,
      tasks,
      guests,
      schedule,
      vendors,
      contracts,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ke-Hoach-Cuoi-${profile.groomName}-${profile.brideName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) {
        const p = data.profile;
        const cleanProfile: CoupleProfile = {
          groomName: p.groomName || 'Chú rể',
          brideName: p.brideName || 'Cô dâu',
          weddingDate: sanitizeWeddingDate(p.weddingDate),
          weddingTime: sanitizeWeddingTime(p.weddingTime),
          venue: p.venue || '',
          targetBudget: Number(p.targetBudget) || 200000000,
        };
        setProfile(cleanProfile);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(cleanProfile));
      }
      if (data.expenses) setExpenses(data.expenses);
      if (data.tasks) setTasks(data.tasks);
      if (data.guests) setGuests(data.guests);
      if (data.schedule) setSchedule(data.schedule);
      if (data.vendors) setVendors(data.vendors);
      if (data.contracts) setContracts(data.contracts);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  // Calculations
  const totalBudget = profile.targetBudget || 0;
  const totalEstimatedExpense = expenses.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0);
  const totalActualExpense = expenses.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
  const totalPaidExpense = expenses.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
  const totalRemainingDebt = Math.max(0, totalActualExpense - totalPaidExpense);

  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.invitationStatus === 'confirmed').length;
  const totalActualGifts = guests.reduce((sum, g) => sum + (g.actualGift || 0), 0);

  const completedTasksCount = tasks.filter(t => t.isCompleted).length;
  const totalTasksCount = tasks.length;

  // Reception Attendance stats
  const totalAttendees = guests
    .filter(g => g.invitationStatus === 'confirmed')
    .reduce((sum, g) => sum + 1 + (g.plusGuests || 0), 0);

  const checkedInGuests = guests.filter(g => g.isCheckedIn);
  const checkedInGuestsCount = checkedInGuests.length;
  const checkedInTotalPeople = checkedInGuests.reduce((sum, g) => sum + 1 + (g.plusGuests || 0), 0);
  const totalVegetarianCount = guests.filter(g => g.isVegetarian).length;

  return (
    <WeddingContext.Provider
      value={{
        profile,
        updateProfile,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        tasks,
        addTask,
        toggleTask,
        updateTask,
        deleteTask,
        guests,
        addGuest,
        updateGuest,
        deleteGuest,
        toggleCheckIn,
        checkInGuest,
        selfCheckInGuest,
        updateGuestPlus,
        schedule,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        contracts,
        addContract,
        updateContract,
        deleteContract,
        addContractImage,
        deleteContractImage,
        playlist,
        addMusicItem,
        updateMusicItem,
        deleteMusicItem,
        toggleMusicPrepared,
        sheetConfig,
        updateSheetConfig,
        syncWithGoogleSheets,
        pullFromGoogleSheets,
        isSyncing,
        markLocalEdit,
        totalBudget,
        totalEstimatedExpense,
        totalActualExpense,
        totalPaidExpense,
        totalRemainingDebt,
        totalGuests,
        confirmedGuests,
        totalActualGifts,
        completedTasksCount,
        totalTasksCount,
        totalAttendees,
        checkedInGuestsCount,
        checkedInTotalPeople,
        totalVegetarianCount,
        resetToDefault,
        triggerConfetti,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
