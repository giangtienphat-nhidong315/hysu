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
import { syncToGoogleSheets, fetchFromGoogleSheets } from '../services/googleSheets';

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

  // Google Sheet Sync
  sheetConfig: GoogleSheetConfig;
  updateSheetConfig: (config: Partial<GoogleSheetConfig>) => void;
  syncWithGoogleSheets: (silent?: boolean) => Promise<{ success: boolean; message: string }>;
  pullFromGoogleSheets: (targetUrl?: string, silent?: boolean) => Promise<{ success: boolean; message: string }>;
  isSyncing: boolean;

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
  SHEET_CONFIG: 'wedding_sheet_config_v1',
};

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CoupleProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
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

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
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

  const syncWithGoogleSheets = async (silent = false): Promise<{ success: boolean; message: string }> => {
    if (!sheetConfig.webhookUrl) {
      return { success: false, message: 'Chưa cấu hình Google Sheets Webhook URL' };
    }

    setIsSyncing(true);
    setSheetConfig(prev => ({ ...prev, lastStatus: 'syncing' }));

    try {
      const payload = {
        profile,
        expenses,
        tasks,
        guests,
        schedule,
        vendors,
        contracts,
      };

      const result = await syncToGoogleSheets(sheetConfig.webhookUrl, payload);
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setSheetConfig(prev => ({
        ...prev,
        lastStatus: 'success',
        lastSyncedAt: timeStr,
        lastMessage: result.message,
      }));

      if (!silent) {
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

  // Tải dữ liệu mới nhất từ Google Sheets về thiết bị này (Đồng bộ 2 chiều)
  const pullFromGoogleSheets = async (
    targetUrl?: string,
    silent = false
  ): Promise<{ success: boolean; message: string }> => {
    const url = targetUrl || sheetConfig.webhookUrl;
    if (!url) {
      return { success: false, message: 'Chưa cấu hình Google Sheets Webhook URL' };
    }

    setIsSyncing(true);
    setSheetConfig(prev => ({ ...prev, lastStatus: 'syncing' }));

    try {
      const result = await fetchFromGoogleSheets(url);
      if (result.success && result.data) {
        isPullingRef.current = true;
        const d = result.data;

        // Cập nhật thông tin cặp đôi / tiệc cưới
        if (d.profile && (d.profile.groomName || d.profile.brideName)) {
          setProfile(prev => ({
            ...prev,
            groomName: d.profile?.groomName || prev.groomName,
            brideName: d.profile?.brideName || prev.brideName,
            weddingDate: d.profile?.weddingDate || prev.weddingDate,
            weddingTime: d.profile?.weddingTime || prev.weddingTime,
            venue: d.profile?.venue || prev.venue,
            targetBudget: d.profile?.targetBudget || prev.targetBudget,
          }));
        }

        // Cập nhật danh sách chi tiêu nếu có
        if (d.expenses && d.expenses.length > 0) {
          setExpenses(d.expenses);
        }

        // Cập nhật danh sách khách mời & điểm danh nếu có
        if (d.guests && d.guests.length > 0) {
          setGuests(d.guests);
        }

        // Cập nhật danh sách công việc nếu có
        if (d.tasks && d.tasks.length > 0) {
          setTasks(d.tasks);
        }

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

        setTimeout(() => {
          isPullingRef.current = false;
        }, 3500);

        if (!silent) {
          triggerConfetti();
        }

        return { success: true, message: 'Đã cập nhật dữ liệu mới nhất từ Google Sheet thành công!' };
      }

      return { success: false, message: result.message || 'Không thể đọc dữ liệu' };
    } catch (err: any) {
      const errMsg = err.message || 'Lỗi khi tải từ Google Sheet';
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

  // Tự động kết nối và tải dữ liệu:
  // 1. Khi mở ứng dụng có link chứa ?sheet=...
  // 2. Tự động kéo dữ liệu mới nhất từ Google Sheet khi vào app
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sheetParam = params.get('sheet');
      if (sheetParam && sheetParam.startsWith('https://script.google.com/')) {
        updateSheetConfig({ webhookUrl: sheetParam, autoSync: true });
        pullFromGoogleSheets(sheetParam, false);
        const cleanPath = window.location.pathname;
        window.history.replaceState({}, '', cleanPath);
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

  // Tự động kéo dữ liệu mới khi người dùng chuyển lại tab này (Focus)
  useEffect(() => {
    const handleFocus = () => {
      if (sheetConfig.webhookUrl && !isSyncing && !isPullingRef.current) {
        pullFromGoogleSheets(sheetConfig.webhookUrl, true);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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

    if (!sheetConfig.webhookUrl || sheetConfig.autoSync === false) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncWithGoogleSheets(true);
    }, 2500); // Tự động đồng bộ ngầm sau 2.5 giây khi người dùng dừng thao tác

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
    sheetConfig.webhookUrl,
    sheetConfig.autoSync,
  ]);

  // Profile
  const updateProfile = (data: Partial<CoupleProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  // Expenses
  const addExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newItem: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setExpenses(prev => [newItem, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<ExpenseItem>) => {
    setExpenses(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // Tasks
  const addTask = (task: Omit<TaskItem, 'id'>) => {
    const newItem: TaskItem = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTasks(prev => [newItem, ...prev]);
  };

  const toggleTask = (id: string) => {
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
    setTasks(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(item => item.id !== id));
  };

  // Guests
  const addGuest = (guest: Omit<GuestItem, 'id'>) => {
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
    setGuests(prev => prev.filter(item => item.id !== id));
  };

  const toggleCheckIn = (id: string) => {
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

  const updateGuestPlus = (id: string, plusCount: number) => {
    setGuests(prev =>
      prev.map(g => (g.id === id ? { ...g, plusGuests: Math.max(0, plusCount) } : g))
    );
  };

  // Schedule
  const addScheduleItem = (item: Omit<DayScheduleItem, 'id'>) => {
    const newItem: DayScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    setSchedule(prev => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const updateScheduleItem = (id: string, updated: Partial<DayScheduleItem>) => {
    setSchedule(prev =>
      prev
        .map(item => (item.id === id ? { ...item, ...updated } : item))
        .sort((a, b) => a.time.localeCompare(b.time))
    );
  };

  const deleteScheduleItem = (id: string) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
  };

  // Vendors
  const addVendor = (vendor: Omit<VendorItem, 'id'>) => {
    const newItem: VendorItem = {
      ...vendor,
      id: `ven-${Date.now()}`,
    };
    setVendors(prev => [newItem, ...prev]);
  };

  const updateVendor = (id: string, updated: Partial<VendorItem>) => {
    setVendors(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteVendor = (id: string) => {
    setVendors(prev => prev.filter(item => item.id !== id));
  };

  // Contracts
  const addContract = (contract: Omit<ContractItem, 'id'>) => {
    const newItem: ContractItem = {
      ...contract,
      images: contract.images || [],
      id: `ctr-${Date.now()}`,
    };
    setContracts(prev => [newItem, ...prev]);
  };

  const updateContract = (id: string, updated: Partial<ContractItem>) => {
    setContracts(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteContract = (id: string) => {
    setContracts(prev => prev.filter(item => item.id !== id));
  };

  const addContractImage = (contractId: string, imageBase64: string) => {
    setContracts(prev =>
      prev.map(item =>
        item.id === contractId
          ? { ...item, images: [...(item.images || []), imageBase64] }
          : item
      )
    );
  };

  const deleteContractImage = (contractId: string, imageIndex: number) => {
    setContracts(prev =>
      prev.map(item =>
        item.id === contractId
          ? { ...item, images: item.images.filter((_, idx) => idx !== imageIndex) }
          : item
      )
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
      if (data.profile) setProfile(data.profile);
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
        sheetConfig,
        updateSheetConfig,
        syncWithGoogleSheets,
        pullFromGoogleSheets,
        isSyncing,
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
