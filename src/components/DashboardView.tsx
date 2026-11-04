import React from 'react';
import {
  TrendingUp,
  Gift,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  PieChart as PieIcon,
  ChevronRight,
  HeartHandshake,
  UserCheck,
  FileSpreadsheet,
  RefreshCw,
  FileText,
  Camera,
  Music,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { EXPENSE_CATEGORIES, formatCurrency } from '../data/categories';
import { TabType } from './BottomNav';

interface DashboardViewProps {
  setActiveTab: (tab: TabType) => void;
  onOpenAddExpense: () => void;
  onOpenAddTask: () => void;
  onOpenAddGuest: () => void;
  onOpenGoogleSheets: () => void;
  onOpenAttendance: () => void;
  onOpenContracts: () => void;
  onOpenMusic?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAddExpense,
  onOpenAddTask,
  onOpenAddGuest,
  onOpenGoogleSheets,
  onOpenAttendance,
  onOpenContracts,
  onOpenMusic,
}) => {
  const {
    totalBudget,
    totalActualExpense,
    totalPaidExpense,
    totalRemainingDebt,
    totalActualGifts,
    completedTasksCount,
    totalTasksCount,
    confirmedGuests,
    totalGuests,
    totalAttendees,
    checkedInTotalPeople,
    checkedInGuestsCount,
    contracts,
    playlist,
    sheetConfig,
    expenses,
    tasks,
    toggleTask,
  } = useWedding();

  const totalPhotosCount = contracts.reduce((sum, c) => sum + (c.images?.length || 0), 0);

  const budgetUsedPercent = totalBudget > 0 ? Math.min(100, Math.round((totalActualExpense / totalBudget) * 100)) : 0;
  const taskPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const guestConfirmPercent = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;

  // Urgent pending tasks
  const urgentTasks = tasks.filter(t => !t.isCompleted).slice(0, 4);

  // Group expenses by category
  const categoryTotals = EXPENSE_CATEGORIES.map(cat => {
    const total = expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + (e.actualAmount || 0), 0);
    return {
      ...cat,
      total,
      percent: totalActualExpense > 0 ? Math.round((total / totalActualExpense) * 100) : 0,
    };
  })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4 pb-20 pt-1 px-4">
      {/* Quick Action Floating Bar */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={onOpenAddExpense}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2.5 px-2 rounded-2xl shadow-sm text-xs font-semibold hover:shadow transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chi Tiêu</span>
        </button>
        <button
          onClick={onOpenAddTask}
          className="flex items-center justify-center gap-1.5 bg-slate-900 text-white py-2.5 px-2 rounded-2xl shadow-sm text-xs font-semibold hover:bg-slate-800 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Việc</span>
        </button>
        <button
          onClick={onOpenAddGuest}
          className="flex items-center justify-center gap-1.5 bg-amber-500 text-white py-2.5 px-2 rounded-2xl shadow-sm text-xs font-semibold hover:bg-amber-600 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khách</span>
        </button>
      </div>

      {/* Main Budget Card */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Tình Hình Ngân Sách</h2>
              <p className="text-[11px] text-slate-500">Kế hoạch tài chính ngày cưới</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs text-rose-600 font-semibold flex items-center gap-0.5 hover:underline"
          >
            Chi tiết <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-50 p-3 rounded-2xl">
            <span className="text-[11px] text-slate-500 block mb-0.5">Tổng ngân sách dự tính</span>
            <span className="text-base font-bold text-slate-900">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="bg-rose-50/70 p-3 rounded-2xl">
            <span className="text-[11px] text-rose-600 block mb-0.5">Tổng thực chi hiện tại</span>
            <span className="text-base font-bold text-rose-700">{formatCurrency(totalActualExpense)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Đã sử dụng ngân sách:</span>
            <span className={`font-bold ${budgetUsedPercent > 100 ? 'text-red-600' : 'text-slate-800'}`}>
              {budgetUsedPercent}% {budgetUsedPercent > 100 && '(Vượt ngân sách!)'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                budgetUsedPercent > 100
                  ? 'bg-red-500'
                  : budgetUsedPercent > 85
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, budgetUsedPercent)}%` }}
            />
          </div>
        </div>

        {/* Secondary metrics (Đã cọc, Còn nợ, Tiền mừng) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block">Đã thanh toán/cọc</span>
            <span className="text-xs font-bold text-emerald-600">{formatCurrency(totalPaidExpense)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Còn phải trả</span>
            <span className="text-xs font-bold text-amber-600">{formatCurrency(totalRemainingDebt)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Tiền mừng đã ghi</span>
            <span className="text-xs font-bold text-purple-600">{formatCurrency(totalActualGifts)}</span>
          </div>
        </div>
      </div>

      {/* Progress Cards: Tasks & Guests */}
      <div className="grid grid-cols-2 gap-3">
        {/* Task progress card */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:border-rose-200 transition active:scale-98"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-blue-600">{taskPercent}%</span>
          </div>
          <h3 className="text-xs font-bold text-slate-800">Tiến độ công việc</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Đã xong {completedTasksCount}/{totalTasksCount} việc
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${taskPercent}%` }} />
          </div>
        </div>

        {/* Guest card */}
        <div
          onClick={() => setActiveTab('guests')}
          className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:border-rose-200 transition active:scale-98"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Gift className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-purple-600">{guestConfirmPercent}%</span>
          </div>
          <h3 className="text-xs font-bold text-slate-800">Khách xác nhận</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {confirmedGuests}/{totalGuests} người tham dự
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${guestConfirmPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Banquet Reception & Attendance Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-4 text-white shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Bàn Đón Khách • Điểm Danh Dự Tiệc</span>
          </div>
          <h3 className="text-sm font-bold text-white mt-1">Khách Tham Dự Tiệc Cưới</h3>
          <p className="text-xs text-emerald-200/90 mt-0.5">
            Đã có mặt: <b>{checkedInTotalPeople}</b>/{totalAttendees} người ({checkedInGuestsCount} thiệp)
          </p>
        </div>
        <button
          onClick={onOpenAttendance}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm active:scale-95 shrink-0"
        >
          Điểm Danh
        </button>
      </div>

      {/* Google Sheets & Contracts Quick Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div
          onClick={onOpenContracts}
          className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs cursor-pointer hover:border-indigo-200 transition"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="p-1 bg-indigo-50 text-indigo-700 rounded-lg">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1 py-0.2 rounded-md">
              {contracts.length}
            </span>
          </div>
          <h4 className="text-[11px] font-bold text-slate-800 truncate">Hợp Đồng</h4>
          <p className="text-[9px] text-slate-400 mt-0.5 truncate">
            {totalPhotosCount} ảnh lưu
          </p>
        </div>

        <div
          onClick={onOpenMusic}
          className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs cursor-pointer hover:border-purple-200 transition"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="p-1 bg-purple-50 text-purple-700 rounded-lg">
              <Music className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1 py-0.2 rounded-md">
              {playlist.length}
            </span>
          </div>
          <h4 className="text-[11px] font-bold text-slate-800 truncate">Nhạc Cưới</h4>
          <p className="text-[9px] text-slate-400 mt-0.5 truncate">
            {playlist.filter(m => m.isPrepared).length}/{playlist.length} đã chuẩn bị
          </p>
        </div>

        <div
          onClick={onOpenGoogleSheets}
          className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs cursor-pointer hover:border-emerald-200 transition"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            {sheetConfig.lastSyncedAt && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <h4 className="text-[11px] font-bold text-slate-800 truncate">Google Sheet</h4>
          <p className="text-[9px] text-slate-400 mt-0.5 truncate">
            {sheetConfig.lastSyncedAt ? `${sheetConfig.lastSyncedAt}` : 'Chạm đồng bộ'}
          </p>
        </div>
      </div>

      {/* Urgent Tasks Section */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800">Việc Cần Chuẩn Bị Tiếp Theo</h2>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs text-rose-600 font-semibold flex items-center gap-0.5"
          >
            Tất cả <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentTasks.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            🎉 Tuyệt vời! Bạn đã hoàn thành tất cả công việc!
          </div>
        ) : (
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition"
              >
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">Hạn: {task.dueDate}</span>
                    {task.priority === 'high' && (
                      <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
                        Gấp
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense by Category snapshot */}
      {categoryTotals.length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-800">Top Chi Phí Chính</h2>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs text-rose-600 font-semibold flex items-center gap-0.5"
            >
              Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {categoryTotals.slice(0, 4).map(cat => (
              <div key={cat.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{formatCurrency(cat.total)}</span>
                    <span className="text-[10px] text-slate-400">({cat.percent}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wedding Tip / Advice */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-3.5 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-900">Mẹo chi tiêu đám cưới tiết kiệm</h4>
          <p className="text-[11px] text-amber-800/90 leading-relaxed mt-0.5">
            Nên dành ra khoảng 10% ngân sách tổng cho các khoản phát sinh ngoài ý muốn (tiền phát sinh bàn tiệc, tip phụ tá, tiền xe dự phòng).
          </p>
        </div>
      </div>
    </div>
  );
};
