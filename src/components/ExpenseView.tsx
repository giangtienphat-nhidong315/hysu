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
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import {
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatNumberInput,
  getExpenseItemActual,
  getExpenseItemDebt,
  normalizeExpenseCategory,
  normalizePaymentStatus,
  parseNumberInput,
} from '../data/categories';
import { ExpenseCategory, ExpenseItem, PaymentStatus, PayerType } from '../types/wedding';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayer, setSelectedPayer] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [showCategoryDebtBoard, setShowCategoryDebtBoard] = useState(true);
  const [onlyDebtCategories, setOnlyDebtCategories] = useState(false);

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
    setFormData({
      title: '',
      categoryId: (selectedCategory !== 'all' ? selectedCategory : 'nha_hang') as ExpenseCategory,
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
  const categoryStats = EXPENSE_CATEGORIES.map(cat => {
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

  // Chỉ lấy các hạng mục đã có khoản chi, sắp xếp ưu tiên hạng mục còn nợ cao nhất lên đầu
  const activeCategoryStats = categoryStats
    .filter(c => c.count > 0)
    .sort((a, b) => {
      if (b.totalDebt !== a.totalDebt) return b.totalDebt - a.totalDebt;
      return b.totalActual - a.totalActual;
    });

  const categoriesWithDebt = activeCategoryStats.filter(c => c.totalDebt > 0);
  const displayedCategoryStats = onlyDebtCategories ? categoriesWithDebt : activeCategoryStats;

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

  const exportCSV = () => {
    const headers = ['Hạng mục', 'Tên khoản chi', 'Dự tính (VNĐ)', 'Thực tế (VNĐ)', 'Đã trả (VNĐ)', 'Còn nợ (VNĐ)', 'Bên chi', 'Trạng thái', 'Ghi chú', 'SĐT'];
    const rows = expenses.map(e => {
      const normCat = normalizeExpenseCategory(e.categoryId);
      const cat = EXPENSE_CATEGORIES.find(c => c.id === normCat)?.name || e.categoryId;
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

  // Filtered list
  const filteredExpenses = expenses.filter(item => {
    const normCat = normalizeExpenseCategory(item.categoryId);
    const normStatus = normalizePaymentStatus(item.status, getExpenseItemActual(item), item.paidAmount);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || normCat === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || normStatus === selectedStatus;
    const matchesPayer = selectedPayer === 'all' || item.payer === selectedPayer;
    return matchesSearch && matchesCat && matchesStatus && matchesPayer;
  });

  // Tổng hợp của danh sách đang lọc (hoặc hạng mục đang chọn)
  const filteredTotalActual = filteredExpenses.reduce((sum, item) => sum + getExpenseItemActual(item), 0);
  const filteredTotalPaid = filteredExpenses.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
  const filteredTotalDebt = filteredExpenses.reduce((sum, item) => sum + getExpenseItemDebt(item), 0);
  const filteredUnpaidCount = filteredExpenses.filter(item => getExpenseItemDebt(item) > 0).length;
  const activeSelectedCatInfo =
    selectedCategory !== 'all' ? categoryStats.find(c => c.id === selectedCategory) : null;

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
                      {categoriesWithDebt.length} mục còn nợ
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Đã tất toán hết
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chạm vào từng hạng mục để lọc khoản chi hoặc bấm tất toán nhanh khi thanh toán
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
                  {onlyDebtCategories ? `Chỉ mục còn nợ (${categoriesWithDebt.length})` : 'Chỉ hiện mục còn nợ'}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {displayedCategoryStats.map(catStat => {
                const isSelected = selectedCategory === catStat.id;
                const hasDebt = catStat.totalDebt > 0;

                return (
                  <div
                    key={catStat.id}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : catStat.id)}
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
                      <span
                        className={`text-[10px] font-semibold ${
                          isSelected ? 'text-rose-600 underline' : 'text-slate-500'
                        }`}
                      >
                        {isSelected ? '✓ Đang lọc mục này (chạm để bỏ lọc)' : 'Chạm để xem các khoản mục này →'}
                      </span>

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
            placeholder="Tìm khoản chi, dịch vụ..."
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
          className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm</span>
        </button>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả danh mục ({expenses.length})
        </button>
        {categoryStats.map(cat => {
          if (cat.count === 0 && selectedCategory !== cat.id) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>
                {cat.name} ({cat.count})
              </span>
              {cat.totalDebt > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  Nợ {formatCurrency(cat.totalDebt)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status & Payer Quick Filters */}
      <div className="flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px]">Trạng thái:</span>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">Tất cả</option>
            <option value="paid">Đã tất toán</option>
            <option value="deposit">Đã cọc</option>
            <option value="not_paid">Chưa trả</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px]">Bên chi:</span>
          <select
            value={selectedPayer}
            onChange={e => setSelectedPayer(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">Tất cả</option>
            <option value="both">Cả hai</option>
            <option value="groom">Nhà trai</option>
            <option value="bride">Nhà gái</option>
          </select>
        </div>
      </div>

      {/* Thanh tóm tắt tổng còn nợ của hạng mục đang chọn / bộ lọc hiện tại */}
      {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPayer !== 'all' || searchQuery.trim() !== '') && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50/60 to-rose-50 border border-rose-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-extrabold text-slate-800">
                {activeSelectedCatInfo ? `Hạng mục: ${activeSelectedCatInfo.name}` : 'Tổng hợp danh sách đang lọc'}
              </span>
              <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {filteredExpenses.length} khoản
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSelectedPayer('all');
                  setSearchQuery('');
                }}
                className="text-[10px] text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                Xóa bộ lọc
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

            {filteredTotalDebt > 0 && activeSelectedCatInfo && (
              <button
                type="button"
                onClick={() => handleSettleCategory(activeSelectedCatInfo.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tất toán mục này ({filteredUnpaidCount})</span>
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
            const cat = EXPENSE_CATEGORIES.find(c => c.id === normCat) || EXPENSE_CATEGORIES[0];
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
                <label className="block text-slate-700 font-semibold mb-1">Danh mục chi tiêu</label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value as ExpenseCategory })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
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
