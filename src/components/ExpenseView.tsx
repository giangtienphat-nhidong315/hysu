import React, { useState } from 'react';
import {
  Plus,
  Search,
  Phone,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  X,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Wallet,
  Check,
  Filter,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import {
  EXPENSE_CATEGORIES,
  formatCompactCurrency,
  formatCurrency,
  formatNumberInput,
  getAllExpenseCategories,
  getCustomExpenseCategories,
  getExpenseItemActual,
  getExpenseItemDebt,
  normalizeExpenseCategory,
  normalizePaymentStatus,
  parseNumberInput,
  saveCustomExpenseCategories,
} from '../data/categories';
import { CategoryInfo, ExpenseCategory, ExpenseItem, PaymentStatus, PayerType } from '../types/wedding';
import { HorizontalScrollBar } from './HorizontalScrollBar';

interface ExpenseViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({ isAddModalOpen, setIsAddModalOpen }) => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    totalBudget,
    totalActualExpense,
    totalPaidExpense,
    totalRemainingDebt,
  } = useWedding();

  const [searchQuery, setSearchQuery] = useState('');
  // Hỗ trợ lọc thông minh: 'all' | 'has_debt' | 'paid_done' | 'selected' + chọn nhiều danh mục cùng lúc
  const [categoryPreset, setCategoryPreset] = useState<'all' | 'has_debt' | 'paid_done' | 'selected'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [showCategoryDebtBoard, setShowCategoryDebtBoard] = useState(true);
  const [expandAllDebtCards, setExpandAllDebtCards] = useState(true);
  const [onlyDebtCategories, setOnlyDebtCategories] = useState(false);

  // Bộ lọc danh mục thông minh nâng cao (cho nhiều danh mục)
  const [isCatPickerOpen, setIsCatPickerOpen] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [catSortBy, setCatSortBy] = useState<'debt_desc' | 'actual_desc' | 'count_desc' | 'name_asc'>('debt_desc');
  const [showAllCatChips, setShowAllCatChips] = useState(false);
  const [customCategories, setCustomCategories] = useState<CategoryInfo[]>(() => getCustomExpenseCategories());
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCatInputInModal, setShowNewCatInputInModal] = useState(false);

  const allCategories = getAllExpenseCategories(expenses, customCategories);

  // Thêm danh mục mới tùy chỉnh
  const handleAddCustomCategory = (rawName: string, selectInForm = false) => {
    const trimmed = rawName.trim();
    if (!trimmed) return;
    const existing = allCategories.find(
      c => c.name.toLowerCase() === trimmed.toLowerCase() || String(c.id).toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      if (selectInForm) {
        setFormData(prev => ({ ...prev, categoryId: existing.id }));
      } else {
        toggleSelectCategory(existing.id);
      }
      setNewCategoryName('');
      setShowNewCatInputInModal(false);
      return;
    }

    const slugId = (
      'cat_' +
      trimmed
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24) +
      '_' +
      Date.now().toString(36).slice(-3)
    ) as ExpenseCategory;

    const palettes = [
      { color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
      { color: 'text-orange-600', bgColor: 'bg-orange-50' },
      { color: 'text-violet-600', bgColor: 'bg-violet-50' },
      { color: 'text-lime-600', bgColor: 'bg-lime-50' },
      { color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50' },
    ];
    const pal = palettes[customCategories.length % palettes.length];
    const newCat: CategoryInfo = {
      id: slugId,
      name: trimmed,
      icon: 'Receipt',
      color: pal.color,
      bgColor: pal.bgColor,
    };

    const nextCustom = [...customCategories, newCat];
    setCustomCategories(nextCustom);
    saveCustomExpenseCategories(nextCustom);
    setNewCategoryName('');
    setShowNewCatInputInModal(false);

    if (selectInForm) {
      setFormData(prev => ({ ...prev, categoryId: newCat.id }));
    } else {
      setCategoryPreset('selected');
      setSelectedCategories(prev => (prev.includes(newCat.id) ? prev : [...prev, newCat.id]));
    }
  };

  // Chọn 1 danh mục (hoặc bỏ chọn nếu bấm lại)
  const handleQuickSelectCategory = (catId: string) => {
    if (categoryPreset === 'selected' && selectedCategories.length === 1 && selectedCategories[0] === catId) {
      setCategoryPreset('all');
      setSelectedCategories([]);
    } else {
      setCategoryPreset('selected');
      setSelectedCategories([catId]);
    }
  };

  // Tích chọn / bỏ chọn nhiều danh mục cùng lúc (Multi-select)
  const toggleSelectCategory = (catId: string) => {
    setSelectedCategories(prev => {
      const exists = prev.includes(catId);
      const next = exists ? prev.filter(id => id !== catId) : [...prev, catId];
      if (next.length === 0) {
        setCategoryPreset('all');
      } else {
        setCategoryPreset('selected');
      }
      return next;
    });
  };

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'nha_hang' as ExpenseCategory,
    estimatedAmount: '',
    actualAmount: '',
    paidAmount: '',
    payer: 'both' as PayerType,
    status: 'not_paid' as PaymentStatus,
    notes: '',
    date: new Date().toISOString().split('T')[0],
    vendorPhone: '',
  });

  const openAddModal = () => {
    const defaultCat =
      categoryPreset === 'selected' && selectedCategories.length > 0 ? selectedCategories[0] : 'nha_hang';
    setFormData({
      title: '',
      categoryId: defaultCat as ExpenseCategory,
      estimatedAmount: '',
      actualAmount: '',
      paidAmount: '',
      payer: 'both',
      status: 'not_paid',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      vendorPhone: '',
    });
    setEditingItem(null);
    setShowNewCatInputInModal(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: ExpenseItem) => {
    const normCat = normalizeExpenseCategory(item.categoryId);
    const normStatus = normalizePaymentStatus(item.status, getExpenseItemActual(item), item.paidAmount);
    setEditingItem(item);
    setFormData({
      title: item.title,
      categoryId: normCat,
      estimatedAmount: item.estimatedAmount ? item.estimatedAmount.toString() : '',
      actualAmount: item.actualAmount ? item.actualAmount.toString() : '',
      paidAmount: item.paidAmount ? item.paidAmount.toString() : '',
      payer: item.payer,
      status: normStatus,
      notes: item.notes || '',
      date: item.date || new Date().toISOString().split('T')[0],
      vendorPhone: item.vendorPhone || '',
    });
    setShowNewCatInputInModal(false);
    setIsAddModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const est = parseNumberInput(formData.estimatedAmount);
    const act = parseNumberInput(formData.actualAmount) || est;
    const paid = parseNumberInput(formData.paidAmount);

    let status = formData.status;
    if (paid >= act && act > 0) {
      status = 'paid';
    } else if (paid > 0) {
      status = 'deposit';
    } else {
      status = 'not_paid';
    }

    if (editingItem) {
      updateExpense(editingItem.id, {
        title: formData.title,
        categoryId: formData.categoryId,
        estimatedAmount: est,
        actualAmount: act,
        paidAmount: paid,
        payer: formData.payer,
        status: status,
        notes: formData.notes,
        date: formData.date,
        vendorPhone: formData.vendorPhone,
      });
    } else {
      addExpense({
        title: formData.title,
        categoryId: formData.categoryId,
        estimatedAmount: est,
        actualAmount: act,
        paidAmount: paid,
        payer: formData.payer,
        status: status,
        notes: formData.notes,
        date: formData.date,
        vendorPhone: formData.vendorPhone,
      });
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  // Thống kê tổng chi, đã thanh toán và tổng còn nợ cho từng hạng mục
  const categoryStats = allCategories.map(cat => {
    const items = expenses.filter(e => normalizeExpenseCategory(e.categoryId) === cat.id);
    const totalEstimated = items.reduce((sum, e) => sum + (e.estimatedAmount || 0), 0);
    const totalActual = items.reduce((sum, e) => sum + getExpenseItemActual(e), 0);
    const totalPaid = items.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
    const totalDebt = items.reduce((sum, e) => sum + getExpenseItemDebt(e), 0);
    const unpaidItems = items.filter(e => getExpenseItemDebt(e) > 0);
    const paidPercent = totalActual > 0 ? Math.min(100, Math.round((totalPaid / totalActual) * 100)) : 100;

    return {
      ...cat,
      items,
      count: items.length,
      unpaidCount: unpaidItems.length,
      totalEstimated,
      totalActual,
      totalPaid,
      totalDebt,
      paidPercent,
    };
  });

  // Hàm sắp xếp thông minh theo tiêu chí người dùng chọn
  const sortCategoryStats = (list: typeof categoryStats) => {
    return [...list].sort((a, b) => {
      if (catSortBy === 'debt_desc') {
        if (b.totalDebt !== a.totalDebt) return b.totalDebt - a.totalDebt;
        return b.totalActual - a.totalActual;
      }
      if (catSortBy === 'actual_desc') {
        if (b.totalActual !== a.totalActual) return b.totalActual - a.totalActual;
        return b.totalDebt - a.totalDebt;
      }
      if (catSortBy === 'count_desc') {
        if (b.count !== a.count) return b.count - a.count;
        return b.totalDebt - a.totalDebt;
      }
      return a.name.localeCompare(b.name, 'vi');
    });
  };

  // Chỉ lấy các hạng mục đã có khoản chi hoặc vừa được tạo
  const activeCategoryStats = sortCategoryStats(
    categoryStats.filter(c => c.count > 0 || customCategories.some(cc => cc.id === c.id))
  );

  const categoriesWithDebt = activeCategoryStats.filter(c => c.totalDebt > 0);
  const categoriesFullyPaid = activeCategoryStats.filter(c => c.count > 0 && c.totalDebt === 0);

  // Lọc danh mục theo ô tìm kiếm danh mục
  const searchedCategoryStats = (onlyDebtCategories ? categoriesWithDebt : activeCategoryStats).filter(c =>
    c.name.toLowerCase().includes(catSearchQuery.trim().toLowerCase())
  );

  // Tự động thu gọn bảng thẻ hạng mục nếu có nhiều hạng mục (> 4 mục) để giao diện gọn gàng
  const DEBT_BOARD_COLLAPSE_LIMIT = 4;
  const displayedCategoryStats =
    expandAllDebtCards || catSearchQuery.trim() !== ''
      ? searchedCategoryStats
      : searchedCategoryStats.slice(0, DEBT_BOARD_COLLAPSE_LIMIT);
  const hiddenDebtCardsCount = Math.max(0, searchedCategoryStats.length - displayedCategoryStats.length);

  // Sắp xếp thông minh cho lưới Chip danh mục: Đưa mục đang chọn & mục còn nợ lên đầu
  const smartChipCategories = [...activeCategoryStats].sort((a, b) => {
    const aSel = selectedCategories.includes(a.id) ? 1 : 0;
    const bSel = selectedCategories.includes(b.id) ? 1 : 0;
    if (bSel !== aSel) return bSel - aSel;
    if (b.totalDebt !== a.totalDebt) return b.totalDebt - a.totalDebt;
    return b.totalActual - a.totalActual;
  });
  const CHIP_COLLAPSE_LIMIT = 5;
  const visibleChipCategories = showAllCatChips
    ? smartChipCategories
    : smartChipCategories.slice(0, CHIP_COLLAPSE_LIMIT);
  const hiddenChipsCount = Math.max(0, smartChipCategories.length - visibleChipCategories.length);

  // Tất toán nhanh 1 khoản chi cụ thể
  const handleSettleItem = (item: ExpenseItem) => {
    const actual = getExpenseItemActual(item);
    const debt = getExpenseItemDebt(item);
    if (debt <= 0) return;
    if (
      confirm(
        `Xác nhận tất toán khoản chi "${item.title}"?\n• Số tiền còn nợ cần trả: ${formatCurrency(debt)}\n• Tổng đã thanh toán sau khi tất toán: ${formatCurrency(actual)}`
      )
    ) {
      updateExpense(item.id, {
        actualAmount: actual,
        paidAmount: actual,
        status: 'paid',
      });
    }
  };

  // Tất toán nhanh toàn bộ các khoản còn nợ trong 1 hạng mục
  const handleSettleCategory = (catId: ExpenseCategory) => {
    const stat = categoryStats.find(c => c.id === catId);
    if (!stat || stat.totalDebt <= 0) return;
    const unpaidItems = stat.items.filter(e => getExpenseItemDebt(e) > 0);
    if (
      confirm(
        `Xác nhận TẤT TOÁN TOÀN BỘ hạng mục "${stat.name}"?\n• Số khoản còn nợ: ${unpaidItems.length} khoản\n• Tổng số tiền còn nợ thanh toán: ${formatCurrency(stat.totalDebt)}`
      )
    ) {
      unpaidItems.forEach(item => {
        const actual = getExpenseItemActual(item);
        updateExpense(item.id, {
          actualAmount: actual,
          paidAmount: actual,
          status: 'paid',
        });
      });
    }
  };

  // Tất toán toàn bộ danh sách đang lọc (hỗ trợ khi chọn gộp nhiều danh mục cùng lúc)
  const handleSettleFilteredList = () => {
    const unpaidFiltered = filteredExpenses.filter(e => getExpenseItemDebt(e) > 0);
    const totalDebtToPay = unpaidFiltered.reduce((sum, e) => sum + getExpenseItemDebt(e), 0);
    if (unpaidFiltered.length === 0 || totalDebtToPay <= 0) return;
    if (
      confirm(
        `Xác nhận TẤT TOÁN ${unpaidFiltered.length} khoản chi đang lọc?\n• Tổng số tiền còn nợ thanh toán: ${formatCurrency(totalDebtToPay)}`
      )
    ) {
      unpaidFiltered.forEach(item => {
        const actual = getExpenseItemActual(item);
        updateExpense(item.id, {
          actualAmount: actual,
          paidAmount: actual,
          status: 'paid',
        });
      });
    }
  };

  const exportCSV = () => {
    const headers = ['Hạng mục', 'Tên khoản chi', 'Dự tính (VNĐ)', 'Thực tế (VNĐ)', 'Đã trả (VNĐ)', 'Còn nợ (VNĐ)', 'Bên chi', 'Trạng thái', 'Ghi chú', 'SĐT'];
    const rows = expenses.map(e => {
      const normCat = normalizeExpenseCategory(e.categoryId);
      const cat = allCategories.find(c => c.id === normCat)?.name || e.categoryId;
      const normStatus = normalizePaymentStatus(e.status, getExpenseItemActual(e), e.paidAmount);
      const statusMap = { paid: 'Đã tất toán', deposit: 'Đã đặt cọc', not_paid: 'Chưa thanh toán' };
      const payerMap = { both: 'Cả hai', groom: 'Nhà trai', bride: 'Nhà gái' };
      return [
        `"${cat}"`,
        `"${e.title}"`,
        e.estimatedAmount || 0,
        getExpenseItemActual(e),
        e.paidAmount || 0,
        getExpenseItemDebt(e),
        `"${payerMap[e.payer] || e.payer}"`,
        `"${statusMap[normStatus] || normStatus}"`,
        `"${e.notes || ''}"`,
        `"${e.vendorPhone || ''}"`,
      ].join(',');
    });

    const summaryHeaders = [
      '',
      'BẢNG TỔNG HỢP CÔNG NỢ THEO TỪNG HẠNG MỤC',
      'Hạng mục,Số khoản chi,Tổng thực chi (VNĐ),Đã thanh toán (VNĐ),Tổng còn nợ (VNĐ),Trạng thái thanh toán',
      ...activeCategoryStats.map(c =>
        [
          `"${c.name}"`,
          c.count,
          c.totalActual,
          c.totalPaid,
          c.totalDebt,
          `"${c.totalDebt > 0 ? `Còn nợ ${c.unpaidCount} khoản` : 'Đã tất toán đủ'}"`,
        ].join(',')
      ),
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...rows, ...summaryHeaders].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Danh-sach-chi-tieu-dam-cuoi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Kiểm tra 1 danh mục có khớp với bộ lọc danh mục thông minh hiện tại không
  const isCategoryMatched = (normCat: ExpenseCategory): boolean => {
    if (categoryPreset === 'all') return true;
    if (categoryPreset === 'has_debt') {
      const st = categoryStats.find(c => c.id === normCat);
      return Boolean(st && st.totalDebt > 0);
    }
    if (categoryPreset === 'paid_done') {
      const st = categoryStats.find(c => c.id === normCat);
      return Boolean(st && st.count > 0 && st.totalDebt === 0);
    }
    if (categoryPreset === 'selected') {
      return selectedCategories.length === 0 || selectedCategories.includes(normCat);
    }
    return true;
  };

  // Filtered list
  const filteredExpenses = expenses.filter(item => {
    const normCat = normalizeExpenseCategory(item.categoryId);
    const normStatus = normalizePaymentStatus(item.status, getExpenseItemActual(item), item.paidAmount);
    const catInfo = allCategories.find(c => c.id === normCat);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (catInfo && catInfo.name.toLowerCase().includes(q));
    const matchesCat = isCategoryMatched(normCat);
    const matchesStatus = selectedStatus === 'all' || normStatus === selectedStatus;
    const matchesPayer = selectedPayer === 'all' || item.payer === selectedPayer;
    return matchesSearch && matchesCat && matchesStatus && matchesPayer;
  });

  // Tổng hợp của danh sách đang lọc (hoặc các hạng mục đang chọn)
  const filteredTotalActual = filteredExpenses.reduce((sum, item) => sum + getExpenseItemActual(item), 0);
  const filteredTotalPaid = filteredExpenses.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
  const filteredTotalDebt = filteredExpenses.reduce((sum, item) => sum + getExpenseItemDebt(item), 0);
  const filteredUnpaidCount = filteredExpenses.filter(item => getExpenseItemDebt(item) > 0).length;
  const selectedCategoryObjects = categoryStats.filter(c => selectedCategories.includes(c.id));
  const isAnyFilterActive =
    categoryPreset !== 'all' || selectedStatus !== 'all' || selectedPayer !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="space-y-4 pb-24 px-4 pt-1">
      {/* Financial Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-4 shadow-md">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs text-slate-400">Tổng chi thực tế</span>
            <h2 className="text-2xl font-bold text-white mt-0.5">{formatCurrency(totalActualExpense)}</h2>
          </div>
          <button
            onClick={exportCSV}
            title="Xuất bảng Excel/CSV"
            className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1.5 rounded-xl transition backdrop-blur-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-center">
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Ngân sách dự tính</span>
            <span className="text-xs font-semibold text-slate-200">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[10px] text-emerald-400 block">Đã thanh toán</span>
            <span className="text-xs font-semibold text-emerald-400">{formatCurrency(totalPaidExpense)}</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <span className="text-[10px] text-rose-400 block">Còn thiếu nợ</span>
            <span className="text-xs font-semibold text-rose-400">{formatCurrency(totalRemainingDebt)}</span>
          </div>
        </div>
      </div>

      {/* BẢNG TỔNG CÒN NỢ CHO TỪNG HẠNG MỤC ĐỂ THANH TOÁN DỄ DÀNG */}
      {activeCategoryStats.length > 0 && (
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-rose-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCategoryDebtBoard(prev => !prev)}
              className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    Tổng Còn Nợ Theo Từng Hạng Mục
                  </h3>
                  {categoriesWithDebt.length > 0 ? (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      {categoriesWithDebt.length}/{activeCategoryStats.length} mục còn nợ
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Đã tất toán hết
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chạm để chọn 1 hoặc nhiều hạng mục • Tự động cộng gộp số nợ cần thanh toán
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              {showCategoryDebtBoard && categoriesWithDebt.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOnlyDebtCategories(prev => !prev)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                    onlyDebtCategories
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {onlyDebtCategories ? `Đang lọc mục nợ (${categoriesWithDebt.length})` : 'Chỉ hiện mục nợ'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCategoryDebtBoard(prev => !prev)}
                className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                title={showCategoryDebtBoard ? 'Thu gọn bảng công nợ hạng mục' : 'Mở rộng bảng công nợ hạng mục'}
              >
                {showCategoryDebtBoard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showCategoryDebtBoard && (
            <>
              {/* Thanh tìm nhanh & sắp xếp khi có nhiều danh mục (> 4 danh mục) */}
              {activeCategoryStats.length > 4 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={catSearchQuery}
                      onChange={e => setCatSearchQuery(e.target.value)}
                      placeholder={`Tìm nhanh trong ${activeCategoryStats.length} hạng mục chi tiêu...`}
                      className="w-full bg-slate-50 border border-slate-200 pl-8 pr-7 py-1.5 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-rose-400"
                    />
                    {catSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCatSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] shrink-0">
                    <span className="text-slate-400">Sắp xếp:</span>
                    <select
                      value={catSortBy}
                      onChange={e => setCatSortBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-rose-400"
                    >
                      <option value="debt_desc">Ưu tiên còn nợ cao nhất</option>
                      <option value="actual_desc">Tổng chi lớn nhất</option>
                      <option value="count_desc">Nhiều khoản chi nhất</option>
                      <option value="name_asc">Tên hạng mục (A → Z)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {displayedCategoryStats.map(catStat => {
                  const isSelected =
                    (categoryPreset === 'selected' && selectedCategories.includes(catStat.id)) ||
                    (categoryPreset === 'has_debt' && catStat.totalDebt > 0) ||
                    (categoryPreset === 'paid_done' && catStat.totalDebt === 0);
                  const hasDebt = catStat.totalDebt > 0;

                  return (
                    <div
                      key={catStat.id}
                      onClick={() => handleQuickSelectCategory(catStat.id)}
                      className={`rounded-2xl p-3 border transition cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                          : hasDebt
                          ? 'bg-white border-rose-200/80 hover:border-rose-300 shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-1.5 rounded-xl ${catStat.bgColor} ${catStat.color} shrink-0`}>
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{catStat.name}</h4>
                            <span className="text-[10px] text-slate-500 block">
                              {catStat.count} khoản chi
                              {catStat.unpaidCount > 0 ? ` • ${catStat.unpaidCount} khoản chưa xong` : ' • Hoàn tất'}
                            </span>
                          </div>
                        </div>

                        {hasDebt ? (
                          <div className="text-right shrink-0 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-xl">
                            <span className="text-[9px] uppercase font-bold text-rose-500 block">Tổng còn nợ</span>
                            <span className="text-xs sm:text-sm font-black text-rose-600">
                              {formatCurrency(catStat.totalDebt)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-xl flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3 h-3" /> Đã tất toán
                          </span>
                        )}
                      </div>

                      {/* Tiến độ & Tổng chi / Đã trả */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            Tổng chi: <b className="text-slate-800">{formatCurrency(catStat.totalActual)}</b>
                          </span>
                          <span className="text-emerald-600 font-semibold">
                            Đã trả: {formatCurrency(catStat.totalPaid)} ({catStat.paidPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              hasDebt ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${catStat.paidPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Nút thao tác nhanh cho hạng mục */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            toggleSelectCategory(catStat.id);
                          }}
                          className={`text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                            selectedCategories.includes(catStat.id)
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Tích chọn để cộng gộp công nợ nhiều hạng mục cùng lúc"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>
                            {selectedCategories.includes(catStat.id) ? 'Đã chọn gộp' : 'Chọn gộp mục này'}
                          </span>
                        </button>

                        {hasDebt && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleSettleCategory(catStat.id);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition active:scale-95 shrink-0 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Tất toán mục này</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nút Xem thêm / Thu gọn khi có nhiều hơn 4 hạng mục */}
              { searchedCategoryStats.length > DEBT_BOARD_COLLAPSE_LIMIT && catSearchQuery.trim() === '' && (
                <button
                  type="button"
                  onClick={() => setExpandAllDebtCards(prev => !prev)}
                  className="w-full py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {expandAllDebtCards ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Thu gọn bớt bảng hạng mục</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>
                        Xem thêm {hiddenDebtCardsCount} hạng mục khác (Tổng {searchedCategoryStats.length} hạng mục)
                      </span>
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm khoản chi, dịch vụ hoặc tên hạng mục..."
            className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm</span>
        </button>
      </div>

      {/* BỘ LỌC DANH MỤC THÔNG MINH (TỰ ĐỘNG XUỐNG DÒNG, TÌM KIẾM, CHỌN GỘP NHIỀU DANH MỤC & THU GỌN) */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-2xs space-y-2.5">
        {/* Hàng 1: Các nút Lọc Nhanh Thông Minh + Nút Mở Bảng Tìm/Chọn Nhiều Danh Mục */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setCategoryPreset('all');
                setSelectedCategories([]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryPreset === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({expenses.length})
            </button>

            {categoriesWithDebt.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (categoryPreset === 'has_debt') {
                    setCategoryPreset('all');
                  } else {
                    setCategoryPreset('has_debt');
                    setSelectedCategories([]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  categoryPreset === 'has_debt'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span>🔴 Mục còn nợ ({categoriesWithDebt.length})</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    categoryPreset === 'has_debt' ? 'bg-white/20 text-white' : 'bg-rose-200/70 text-rose-800'
                  }`}
                >
                  {formatCompactCurrency(totalRemainingDebt)}
                </span>
              </button>
            )}

            {categoriesFullyPaid.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (categoryPreset === 'paid_done') {
                    setCategoryPreset('all');
                  } else {
                    setCategoryPreset('paid_done');
                    setSelectedCategories([]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  categoryPreset === 'paid_done'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>🟢 Đã tất toán ({categoriesFullyPaid.length})</span>
              </button>
            )}
          </div>

          {/* Nút bật/tắt bảng chọn & tìm kiếm danh mục nâng cao */}
          <button
            type="button"
            onClick={() => setIsCatPickerOpen(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              isCatPickerOpen || (categoryPreset === 'selected' && selectedCategories.length > 1)
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {categoryPreset === 'selected' && selectedCategories.length > 0
                ? `Đã chọn ${selectedCategories.length} mục`
                : `Tìm & Chọn gộp (${activeCategoryStats.length})`}
            </span>
            {isCatPickerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Hộp Tìm Kiếm, Chọn Gộp Nhiều Danh Mục & Tạo Danh Mục Mới */}
        {isCatPickerOpen && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catSearchQuery}
                  onChange={e => setCatSearchQuery(e.target.value)}
                  placeholder="Gõ tên danh mục để tìm nhanh..."
                  className="w-full bg-white border border-slate-200 pl-8 pr-7 py-1.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
                {catSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCatSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {categoriesWithDebt.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryPreset('selected');
                      setSelectedCategories(categoriesWithDebt.map(c => c.id));
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold transition cursor-pointer"
                  >
                    Chọn hết mục nợ ({categoriesWithDebt.length})
                  </button>
                )}
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryPreset('all');
                      setSelectedCategories([]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Bỏ chọn ({selectedCategories.length})
                  </button>
                )}
              </div>
            </div>

            {/* Danh sách tất cả danh mục dạng tích chọn nhiều (Multi-select grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-60 overflow-y-auto pr-1">
              {categoryStats
                .filter(c => c.name.toLowerCase().includes(catSearchQuery.trim().toLowerCase()))
                .sort((a, b) => {
                  if (b.totalDebt !== a.totalDebt) return b.totalDebt - a.totalDebt;
                  return b.count - a.count;
                })
                .map(cat => {
                  const isChecked = categoryPreset === 'selected' && selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleSelectCategory(cat.id)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : cat.totalDebt > 0
                          ? 'bg-white text-slate-800 border-rose-200 hover:border-rose-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                            isChecked
                              ? 'bg-white text-indigo-600 border-white'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{cat.name}</p>
                          <p className={`text-[10px] ${isChecked ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {cat.count} khoản • Chi {formatCompactCurrency(cat.totalActual)}
                          </p>
                        </div>
                      </div>

                      {cat.totalDebt > 0 ? (
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg shrink-0 ${
                            isChecked ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          Nợ {formatCompactCurrency(cat.totalDebt)}
                        </span>
                      ) : cat.count > 0 ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg shrink-0 ${
                            isChecked ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          ✓ Xong
                        </span>
                      ) : null}
                    </button>
                  );
                })}
            </div>

            {/* Thêm danh mục mới tùy chỉnh ngay trong bộ lọc */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCategory(newCategoryName, false);
                  }
                }}
                placeholder="Thêm danh mục mới (VD: Đội bưng quả, MC & Ca sĩ, Lễ gia tiên...)"
                className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAddCustomCategory(newCategoryName, false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shrink-0 transition cursor-pointer"
              >
                + Thêm mục
              </button>
            </div>
          </div>
        )}

        {/* Hàng 2: Thanh Trượt Danh Mục Thông Minh (Có nút trượt Trái/Phải ◀ ▶, Kéo chuột trượt, Lăn chuột & Nút Hiện hết) */}
        {smartChipCategories.length > 0 && (
          <HorizontalScrollBar showWrapToggle={true} defaultWrapped={false} className="pt-0.5">
            {smartChipCategories.map(cat => {
              const isSelected = categoryPreset === 'selected' && selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleQuickSelectCategory(cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/20'
                      : cat.totalDebt > 0
                      ? 'bg-white text-slate-700 border border-rose-200 hover:bg-rose-50/50'
                      : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span>
                    {cat.name} ({cat.count})
                  </span>
                  {cat.totalDebt > 0 ? (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      Nợ {formatCompactCurrency(cat.totalDebt)}
                    </span>
                  ) : cat.count > 0 ? (
                    <span
                      className={`text-[10px] font-bold ${
                        isSelected ? 'text-white/90' : 'text-emerald-600'
                      }`}
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </HorizontalScrollBar>
        )}

        {/* Hàng 3: Bộ lọc Trạng thái thanh toán & Bên chi trả */}
        <div className="flex items-center justify-between text-xs gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1 px-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã tất toán</option>
              <option value="deposit">Đã đặt cọc</option>
              <option value="not_paid">Chưa thanh toán</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Bên chi:</span>
            <select
              value={selectedPayer}
              onChange={e => setSelectedPayer(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-1 px-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">Tất cả bên chi</option>
              <option value="both">Cả hai</option>
              <option value="groom">Nhà trai</option>
              <option value="bride">Nhà gái</option>
            </select>
          </div>
        </div>
      </div>

      {/* Thanh tóm tắt tổng còn nợ của (các) hạng mục đang chọn / bộ lọc hiện tại */}
      {isAnyFilterActive && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50/60 to-rose-50 border border-rose-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-extrabold text-slate-800">
                {categoryPreset === 'has_debt'
                  ? `Đang lọc: ${categoriesWithDebt.length} hạng mục còn nợ`
                  : categoryPreset === 'paid_done'
                  ? `Đang lọc: ${categoriesFullyPaid.length} hạng mục đã tất toán`
                  : selectedCategoryObjects.length === 1
                  ? `Hạng mục: ${selectedCategoryObjects[0].name}`
                  : selectedCategoryObjects.length > 1
                  ? `Đang gộp ${selectedCategoryObjects.length} hạng mục: ${selectedCategoryObjects.map(c => c.name).join(', ')}`
                  : 'Tổng hợp danh sách đang lọc'}
              </span>
              <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {filteredExpenses.length} khoản
              </span>
              <button
                type="button"
                onClick={() => {
                  setCategoryPreset('all');
                  setSelectedCategories([]);
                  setSelectedStatus('all');
                  setSelectedPayer('all');
                  setSearchQuery('');
                }}
                className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
              >
                ✕ Xóa bộ lọc
              </button>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
              <span>
                Tổng chi: <b className="text-slate-800">{formatCurrency(filteredTotalActual)}</b>
              </span>
              <span>
                Đã thanh toán: <b className="text-emerald-700">{formatCurrency(filteredTotalPaid)}</b>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-rose-200/60">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">
                Tổng còn nợ cần thanh toán
              </span>
              <span className="text-sm sm:text-base font-black text-rose-600">
                {formatCurrency(filteredTotalDebt)}
              </span>
            </div>

            {filteredTotalDebt > 0 && (
              <button
                type="button"
                onClick={handleSettleFilteredList}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tất toán ({filteredUnpaidCount} khoản)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có khoản chi nào</p>
            <p className="text-xs text-slate-400 mt-1">Nhấn nút "Thêm" để bắt đầu ghi chép các khoản chi tiêu.</p>
          </div>
        ) : (
          filteredExpenses.map(item => {
            const normCat = normalizeExpenseCategory(item.categoryId);
            const cat = allCategories.find(c => c.id === normCat) || EXPENSE_CATEGORIES[0];
            const actualVal = getExpenseItemActual(item);
            const debt = getExpenseItemDebt(item);
            const normStatus = normalizePaymentStatus(item.status, actualVal, item.paidAmount);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-rose-100 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className={`p-2 rounded-xl ${cat.bgColor} ${cat.color} shrink-0 mt-0.5`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          {cat.name}
                        </span>
                        {normStatus === 'paid' && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" /> Đã xong
                          </span>
                        )}
                        {normStatus === 'deposit' && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> Đã cọc
                          </span>
                        )}
                        {normStatus === 'not_paid' && (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> Chưa trả
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md">
                          {item.payer === 'both' ? 'Cả hai' : item.payer === 'groom' ? 'Nhà trai' : 'Nhà gái'}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 mt-1 leading-snug break-words">
                        {item.title}
                      </h3>
                      {item.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5 italic break-words">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                      title="Chỉnh sửa khoản chi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa khoản chi: "${item.title}"?`)) {
                          deleteExpense(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Xóa khoản chi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Thực tế / Dự tính</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(actualVal)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Đã thanh toán</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(item.paidAmount || 0)}
                    </span>
                  </div>
                  {debt > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-rose-400 block">Còn nợ</span>
                        <span className="font-bold text-rose-600">{formatCurrency(debt)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSettleItem(item)}
                        className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                        title="Đánh dấu đã thanh toán đủ khoản này"
                      >
                        <Check className="w-3 h-3" />
                        <span>Tất toán</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Vendor phone quick dial if available */}
                {item.vendorPhone && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>SĐT liên hệ: {item.vendorPhone}</span>
                    </span>
                    <a
                      href={`tel:${item.vendorPhone}`}
                      className="text-rose-600 font-semibold hover:underline"
                    >
                      Gọi ngay
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? 'Chỉnh Sửa Khoản Chi' : 'Thêm Khoản Chi Mới'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="expense-modal-form"
                  className="sm:hidden px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
                >
                  {editingItem ? 'Lưu' : 'Thêm'}
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form id="expense-modal-form" onSubmit={handleSaveExpense} className="modal-form-wrapper">
              <div className="modal-scroll-area space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tên khoản chi / Dịch vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đặt cọc sảnh tiệc, Thuê váy cưới..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">Danh mục chi tiêu</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInputInModal(prev => !prev)}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    {showNewCatInputInModal ? 'Đóng thêm mục' : '+ Tạo danh mục mới'}
                  </button>
                </div>
                {showNewCatInputInModal && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomCategory(newCategoryName, true);
                        }
                      }}
                      placeholder="Nhập tên danh mục mới (VD: Đội bưng quả, MC...)"
                      className="flex-1 border border-rose-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomCategory(newCategoryName, true)}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Lưu mục
                    </button>
                  </div>
                )}
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value as ExpenseCategory })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dự tính (VNĐ)</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={formatNumberInput(formData.estimatedAmount)}
                    onChange={e => setFormData({ ...formData, estimatedAmount: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Thực tế (VNĐ) <span className="text-slate-400 font-normal">(Chốt)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    value={formatNumberInput(formData.actualAmount)}
                    onChange={e => setFormData({ ...formData, actualAmount: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Đã trả / Đã cọc (VNĐ)</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={formatNumberInput(formData.paidAmount)}
                    onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bên chi trả</label>
                  <select
                    value={formData.payer}
                    onChange={e => setFormData({ ...formData, payer: e.target.value as PayerType })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="both">Cả hai chi chung</option>
                    <option value="groom">Nhà trai chi</option>
                    <option value="bride">Nhà gái chi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Số điện thoại bên cung cấp (Vendor)</label>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={formData.vendorPhone}
                  onChange={e => setFormData({ ...formData, vendorPhone: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ghi chú & Ưu đãi kèm theo</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú chi tiết hợp đồng, phụ thu bia, thời hạn cọc..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold border border-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-md transition active:scale-95"
              >
                {editingItem ? 'Lưu Thay Đổi' : 'Tạo Khoản Chi'}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};
