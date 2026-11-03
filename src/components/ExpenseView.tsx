import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Phone,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  X,
  CreditCard,
  User,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { EXPENSE_CATEGORIES, formatCurrency, formatNumberInput, parseNumberInput } from '../data/categories';
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
      categoryId: 'nha_hang',
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
    setEditingItem(item);
    setFormData({
      title: item.title,
      categoryId: item.categoryId,
      estimatedAmount: item.estimatedAmount ? item.estimatedAmount.toString() : '',
      actualAmount: item.actualAmount ? item.actualAmount.toString() : '',
      paidAmount: item.paidAmount ? item.paidAmount.toString() : '',
      payer: item.payer,
      status: item.status,
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

  const exportCSV = () => {
    const headers = ['Hạng mục', 'Tên khoản chi', 'Dự tính (VNĐ)', 'Thực tế (VNĐ)', 'Đã trả (VNĐ)', 'Còn nợ (VNĐ)', 'Bên chi', 'Trạng thái', 'Ghi chú', 'SĐT'];
    const rows = expenses.map(e => {
      const cat = EXPENSE_CATEGORIES.find(c => c.id === e.categoryId)?.name || e.categoryId;
      const statusMap = { paid: 'Đã tất toán', deposit: 'Đã đặt cọc', not_paid: 'Chưa thanh toán' };
      const payerMap = { both: 'Cả hai', groom: 'Nhà trai', bride: 'Nhà gái' };
      return [
        `"${cat}"`,
        `"${e.title}"`,
        e.estimatedAmount || 0,
        e.actualAmount || 0,
        e.paidAmount || 0,
        Math.max(0, (e.actualAmount || 0) - (e.paidAmount || 0)),
        `"${payerMap[e.payer] || e.payer}"`,
        `"${statusMap[e.status] || e.status}"`,
        `"${e.notes || ''}"`,
        `"${e.vendorPhone || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
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
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesPayer = selectedPayer === 'all' || item.payer === selectedPayer;
    return matchesSearch && matchesCat && matchesStatus && matchesPayer;
  });

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
        {EXPENSE_CATEGORIES.map(cat => {
          const count = expenses.filter(e => e.categoryId === cat.id).length;
          if (count === 0 && selectedCategory !== cat.id) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name} ({count})
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
            const cat = EXPENSE_CATEGORIES.find(c => c.id === item.categoryId) || EXPENSE_CATEGORIES[0];
            const debt = Math.max(0, (item.actualAmount || 0) - (item.paidAmount || 0));

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
                        {item.status === 'paid' && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" /> Đã xong
                          </span>
                        )}
                        {item.status === 'deposit' && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> Đã cọc
                          </span>
                        )}
                        {item.status === 'not_paid' && (
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
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Thực tế / Dự tính</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(item.actualAmount || item.estimatedAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Đã thanh toán</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(item.paidAmount || 0)}
                    </span>
                  </div>
                  {debt > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-rose-400 block">Còn nợ</span>
                      <span className="font-bold text-rose-600">{formatCurrency(debt)}</span>
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? 'Chỉnh Sửa Khoản Chi' : 'Thêm Khoản Chi Mới'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
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

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-semibold shadow-sm transition active:scale-95"
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
