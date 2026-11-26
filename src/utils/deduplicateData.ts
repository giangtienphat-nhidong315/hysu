import {
  ContractItem,
  DayScheduleItem,
  ExpenseItem,
  GuestItem,
  MusicItem,
  TaskItem,
  VendorItem,
} from '../types/wedding';
import {
  getExpenseItemActual,
  normalizeExpenseCategory,
  normalizePaymentStatus,
} from '../data/categories';

/**
 * Khử trùng lặp danh sách Chi Tiêu (Expenses).
 * Gộp các bản ghi bị nhân bản do xung đột đồng bộ Google Sheets,
 * ưu tiên giữ bản ghi có số tiền đã thanh toán (paidAmount) cao hơn hoặc mới nhất.
 */
export const deduplicateExpenses = (items: ExpenseItem[]): ExpenseItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const map = new Map<string, ExpenseItem>();

  items.forEach(rawItem => {
    if (!rawItem || !rawItem.title) return;
    const normCat = normalizeExpenseCategory(rawItem.categoryId);
    const actual = getExpenseItemActual(rawItem);
    const est = rawItem.estimatedAmount || actual || 0;
    const paid = rawItem.paidAmount || 0;
    const normStatus = normalizePaymentStatus(rawItem.status, actual, paid);

    const item: ExpenseItem = {
      ...rawItem,
      categoryId: normCat,
      estimatedAmount: est,
      actualAmount: actual,
      paidAmount: paid,
      status: normStatus,
    };

    // Khóa nhận diện khoản chi trùng lặp: Danh mục + Tên khoản chi + Số tiền thực tế + Bên chi + Ghi chú
    const key = [
      normCat,
      item.title.trim().toLowerCase(),
      actual,
      item.payer || 'both',
      (item.notes || '').trim().toLowerCase(),
    ].join('||');

    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
    } else {
      // Nếu có bản trùng, giữ lại bản có paidAmount lớn hơn hoặc có SĐT/ghi chú đầy đủ hơn
      const betterPaid = Math.max(existing.paidAmount || 0, item.paidAmount || 0);
      const mergedStatus = normalizePaymentStatus(
        betterPaid >= actual && actual > 0 ? 'paid' : betterPaid > 0 ? 'deposit' : existing.status,
        actual,
        betterPaid
      );
      map.set(key, {
        ...existing,
        paidAmount: betterPaid,
        status: mergedStatus,
        vendorPhone: existing.vendorPhone || item.vendorPhone || '',
        notes: existing.notes || item.notes || '',
      });
    }
  });

  return Array.from(map.values());
};

/**
 * Khử trùng lặp danh sách Khách Mời (Guests).
 * Gộp các khách mời bị lặp lại (cùng Tên + Nhóm + SĐT), bảo toàn trạng thái điểm danh và tiền mừng.
 */
export const deduplicateGuests = (items: GuestItem[]): GuestItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const map = new Map<string, GuestItem>();

  items.forEach((g, idx) => {
    if (!g || !g.name) return;
    const cleanName = g.name.trim().toLowerCase();
    const cleanGroup = (g.group || 'friends').trim().toLowerCase();
    const cleanPhone = (g.phone || '').trim().replace(/\s+/g, '');

    // Khóa nhận diện khách trùng: Tên + Nhóm + SĐT
    const key = `${cleanName}||${cleanGroup}||${cleanPhone}`;

    const digits = (g.code || '').replace(/\D/g, '');
    const formattedCode = digits ? String(parseInt(digits, 10)).padStart(3, '0') : String(idx + 1).padStart(3, '0');

    const normalizedGuest: GuestItem = {
      ...g,
      code: formattedCode,
    };

    const existing = map.get(key);
    if (!existing) {
      map.set(key, normalizedGuest);
    } else {
      // Gộp thông tin tốt nhất giữa các bản trùng (ưu tiên bản đã check-in hoặc có tiền mừng)
      map.set(key, {
        ...existing,
        phone: existing.phone || normalizedGuest.phone || '',
        tableNumber: existing.tableNumber || normalizedGuest.tableNumber || '',
        invitationStatus:
          existing.invitationStatus === 'confirmed' || normalizedGuest.invitationStatus === 'confirmed'
            ? 'confirmed'
            : existing.invitationStatus || normalizedGuest.invitationStatus,
        plusGuests: Math.max(existing.plusGuests || 0, normalizedGuest.plusGuests || 0),
        isCheckedIn: Boolean(existing.isCheckedIn || normalizedGuest.isCheckedIn),
        checkInTime: existing.checkInTime || normalizedGuest.checkInTime || '',
        isVegetarian: Boolean(existing.isVegetarian || normalizedGuest.isVegetarian),
        actualGift: Math.max(existing.actualGift || 0, normalizedGuest.actualGift || 0),
        estimatedGift: Math.max(existing.estimatedGift || 0, normalizedGuest.estimatedGift || 0),
        wishes: existing.wishes || normalizedGuest.wishes || '',
        notes: existing.notes || normalizedGuest.notes || '',
      });
    }
  });

  return Array.from(map.values());
};

/**
 * Khử trùng lặp danh sách Công Việc (Tasks).
 */
export const deduplicateTasks = (items: TaskItem[]): TaskItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const map = new Map<string, TaskItem>();

  items.forEach(t => {
    if (!t || !t.title) return;
    const key = `${(t.phase || '').trim()}||${t.title.trim().toLowerCase()}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, t);
    } else {
      map.set(key, {
        ...existing,
        isCompleted: Boolean(existing.isCompleted || t.isCompleted),
      });
    }
  });

  return Array.from(map.values());
};

/**
 * Khử trùng lặp Hợp Đồng (Contracts).
 */
export const deduplicateContracts = (items: ContractItem[]): ContractItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const map = new Map<string, ContractItem>();

  items.forEach(c => {
    if (!c || !c.title) return;
    const key = `${c.title.trim().toLowerCase()}||${(c.vendorName || '').trim().toLowerCase()}||${c.contractValue || 0}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, c);
    } else {
      map.set(key, {
        ...existing,
        depositValue: Math.max(existing.depositValue || 0, c.depositValue || 0),
        images: (existing.images && existing.images.length > 0) ? existing.images : (c.images || []),
      });
    }
  });

  return Array.from(map.values());
};

/**
 * Khử trùng lặp Lịch Trình (Schedule).
 */
export const deduplicateSchedule = (items: DayScheduleItem[]): DayScheduleItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const map = new Map<string, DayScheduleItem>();

  items.forEach(s => {
    if (!s || !s.eventName) return;
    const key = `${(s.time || '').trim()}||${s.eventName.trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, s);
    }
  });

  return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
};

/**
 * Khử trùng lặp Nhà Cung Cấp (Vendors).
 */
export const deduplicateVendors = (items: VendorItem[]): VendorItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const map = new Map<string, VendorItem>();

  items.forEach(v => {
    if (!v || !v.name) return;
    const key = `${v.name.trim().toLowerCase()}||${(v.category || '').trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, v);
    }
  });

  return Array.from(map.values());
};

/**
 * Khử trùng lặp Nhạc Cưới (Playlist).
 */
export const deduplicatePlaylist = (items: MusicItem[]): MusicItem[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const map = new Map<string, MusicItem>();

  items.forEach(m => {
    if (!m || !m.title) return;
    const key = `${(m.phase || '').trim()}||${m.title.trim().toLowerCase()}||${(m.artist || '').trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, m);
    }
  });

  return Array.from(map.values());
};
