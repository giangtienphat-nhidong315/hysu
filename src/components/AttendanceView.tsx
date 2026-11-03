import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  UserCheck,
  UserX,
  Plus,
  Minus,
  UtensilsCrossed,
  LayoutGrid,
  List,
  Phone,
  Sparkles,
  Check,
  X,
  FileSpreadsheet,
  Camera,
  QrCode,
  Printer,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { GUEST_GROUP_LABELS } from '../data/categories';
import { GuestItem } from '../types/wedding';
import { QrScannerModal } from './QrScannerModal';
import { GuestQrPrintModal } from './GuestQrPrintModal';

export const AttendanceView: React.FC = () => {
  const {
    profile,
    guests,
    toggleCheckIn,
    checkInGuest,
    updateGuestPlus,
    totalAttendees,
    checkedInGuestsCount,
    checkedInTotalPeople,
    totalVegetarianCount,
    confirmedGuests,
  } = useWedding();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'checked_in' | 'pending' | 'veg'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'tables'>('list');
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPrintQrOpen, setIsPrintQrOpen] = useState(false);

  // Filter only guests who are confirmed or sent (likely attendees)
  const relevantGuests = guests.filter(
    g => g.invitationStatus === 'confirmed' || g.invitationStatus === 'sent' || g.isCheckedIn
  );

  const filteredGuests = relevantGuests.filter(g => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      g.name.toLowerCase().includes(q) ||
      (g.code && g.code.toLowerCase().includes(q)) ||
      (g.phone && g.phone.includes(searchQuery)) ||
      (g.tableNumber && g.tableNumber.toLowerCase().includes(q));

    const matchesStatus =
      filterMode === 'all' ||
      (filterMode === 'checked_in' && g.isCheckedIn) ||
      (filterMode === 'pending' && !g.isCheckedIn) ||
      (filterMode === 'veg' && g.isVegetarian);

    const matchesTable = selectedTable === 'all' || g.tableNumber === selectedTable;

    return matchesSearch && matchesStatus && matchesTable;
  });

  // Extract unique table names
  const allTables = Array.from(
    new Set(relevantGuests.map(g => g.tableNumber).filter(Boolean))
  ) as string[];

  // Attendance percentage
  const attendPercent =
    totalAttendees > 0 ? Math.round((checkedInTotalPeople / totalAttendees) * 100) : 0;

  const exportAttendanceCSV = () => {
    const headers = ['Họ Tên Khách', 'Nhóm', 'SĐT', 'Bàn Tiệc', 'Đi Cùng (+Người)', 'Tổng Suất Ăn', 'Trạng Thái', 'Giờ Check-in', 'Ăn Chay', 'Ghi Chú'];
    const rows = relevantGuests.map(g => [
      `"${g.name}"`,
      `"${GUEST_GROUP_LABELS[g.group]?.label || g.group}"`,
      `"${g.phone || ''}"`,
      `"${g.tableNumber || ''}"`,
      g.plusGuests || 0,
      1 + (g.plusGuests || 0),
      g.isCheckedIn ? 'ĐÃ ĐẾN' : 'Chưa đến',
      `"${g.checkInTime || ''}"`,
      g.isVegetarian ? 'Ăn chay' : '',
      `"${g.notes || ''}"`,
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Danh-sach-khach-tham-du-tiec-cuoi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-1">
      {/* Live Reception Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                Bàn Đón Khách • Trực Tuyến
              </span>
              <h2 className="text-lg font-bold">Khách Tham Dự Tiệc Cưới</h2>
            </div>
          </div>
          <button
            onClick={exportAttendanceCSV}
            className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-emerald-200 px-2.5 py-1.5 rounded-xl transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Danh Sách</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-emerald-700/50">
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <span className="text-[10px] text-emerald-200 block">Đã có mặt tại tiệc</span>
            <span className="text-xl font-black text-emerald-300 leading-tight">
              {checkedInTotalPeople}
            </span>
            <span className="text-[10px] text-emerald-200 block mt-0.5">
              ({checkedInGuestsCount} thiệp)
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <span className="text-[10px] text-emerald-200 block">Dự kiến tham gia</span>
            <span className="text-xl font-black text-white leading-tight">
              {totalAttendees}
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5">
              ({confirmedGuests} thiệp)
            </span>
          </div>

          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <span className="text-[10px] text-emerald-200 block">Tỷ lệ hiện diện</span>
            <span className="text-xl font-black text-amber-300 leading-tight">
              {attendPercent}%
            </span>
            {totalVegetarianCount > 0 && (
              <span className="text-[10px] text-yellow-200 block mt-0.5">
                {totalVegetarianCount} suất chay
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${attendPercent}%` }}
          />
        </div>
      </div>

      {/* Quick QR Reception Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center justify-center gap-2 py-3 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition cursor-pointer text-xs sm:text-sm"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
          <span>Quét QR Điểm Danh</span>
        </button>

        <button
          onClick={() => setIsPrintQrOpen(true)}
          className="flex items-center justify-center gap-2 py-3 px-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl shadow-xs hover:shadow-sm active:scale-[0.98] transition cursor-pointer text-xs sm:text-sm"
        >
          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          <span>In Thẻ QR Hàng Loạt</span>
        </button>
      </div>

      {/* Quick Search for Receptionist */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm tên khách, số điện thoại, bàn..."
            className="w-full bg-white border border-slate-200 pl-9 pr-8 py-2.5 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
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

        {/* Toggle List / Table View */}
        <div className="flex bg-slate-200 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-xl transition ${
              viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
            }`}
            title="Dạng danh sách"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('tables')}
            className={`p-1.5 rounded-xl transition ${
              viewMode === 'tables' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
            }`}
            title="Dạng sơ đồ bàn"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            filterMode === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả ({relevantGuests.length})
        </button>
        <button
          onClick={() => setFilterMode('checked_in')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
            filterMode === 'checked_in'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Đã đến ({checkedInGuestsCount})</span>
        </button>
        <button
          onClick={() => setFilterMode('pending')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
            filterMode === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Chưa đến ({relevantGuests.length - checkedInGuestsCount})</span>
        </button>
        {totalVegetarianCount > 0 && (
          <button
            onClick={() => setFilterMode('veg')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              filterMode === 'veg'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Ăn chay ({totalVegetarianCount})</span>
          </button>
        )}
      </div>

      {/* Optional Table Dropdown Filter */}
      {allTables.length > 0 && (
        <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200/60">
          <span className="text-slate-600 font-medium">Lọc theo bàn tiệc:</span>
          <select
            value={selectedTable}
            onChange={e => setSelectedTable(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Tất cả bàn ({allTables.length} bàn)</option>
            {allTables.map(tbl => (
              <option key={tbl} value={tbl}>
                {tbl}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* VIEW 1: DẠNG DANH SÁCH (LIST VIEW) */}
      {viewMode === 'list' && (
        <div>
          {filteredGuests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Không tìm thấy khách nào</p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy kiểm tra lại từ khóa tìm kiếm hoặc bộ lọc trạng thái.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredGuests.map(guest => {
              const groupInfo = GUEST_GROUP_LABELS[guest.group];
              const totalPeople = 1 + (guest.plusGuests || 0);

              return (
                <div
                  key={guest.id}
                  className={`bg-white rounded-2xl p-3.5 border transition space-y-2.5 shadow-xs ${
                    guest.isCheckedIn
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-extrabold bg-slate-900 text-amber-300 px-2 py-0.5 rounded-md shadow-2xs tracking-wide">
                          {guest.code || 'KH-000'}
                        </span>
                        {guest.tableNumber ? (
                          <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                            {guest.tableNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                            Chưa xếp bàn
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${groupInfo?.color}`}>
                          {groupInfo?.label}
                        </span>
                        {guest.isVegetarian && (
                          <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <UtensilsCrossed className="w-3 h-3" /> Ăn chay
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {guest.name}
                      </h3>

                      {guest.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          {guest.notes}
                        </p>
                      )}
                    </div>

                    {/* Quick Phone Call if needed */}
                    {guest.phone && (
                      <a
                        href={`tel:${guest.phone}`}
                        className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition"
                        title="Gọi điện cho khách"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Plus Guests Controls & Check-In Action Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 gap-2">
                    {/* Plus Guests Counter */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl">
                      <span className="text-[11px] text-slate-500 font-medium">Suất ăn:</span>
                      <button
                        onClick={() => updateGuestPlus(guest.id, (guest.plusGuests || 0) - 1)}
                        disabled={(guest.plusGuests || 0) <= 0}
                        className="w-5 h-5 rounded-md bg-white text-slate-600 disabled:opacity-30 flex items-center justify-center shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 px-1">
                        {totalPeople} {guest.plusGuests ? `(+${guest.plusGuests})` : ''}
                      </span>
                      <button
                        onClick={() => updateGuestPlus(guest.id, (guest.plusGuests || 0) + 1)}
                        className="w-5 h-5 rounded-md bg-white text-slate-600 flex items-center justify-center shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Check-In Button */}
                    <button
                      onClick={() => toggleCheckIn(guest.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-xs ${
                        guest.isCheckedIn
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {guest.isCheckedIn ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ĐÃ ĐẾN {guest.checkInTime ? `(${guest.checkInTime})` : ''}</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Điểm Danh</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* VIEW 2: DẠNG SƠ ĐỒ BÀN TIỆC (TABLE GROUPING VIEW) */}
      {viewMode === 'tables' && (
        <div>
          {allTables.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
              <LayoutGrid className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Chưa có thông tin bàn tiệc</p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy gán số bàn tiệc cho khách trong phần Khách mời để xem theo bàn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allTables.map(tableName => {
              const tableGuests = relevantGuests.filter(g => g.tableNumber === tableName);
              const tableTotalSeats = tableGuests.reduce((sum, g) => sum + 1 + (g.plusGuests || 0), 0);
              const tableArrivedSeats = tableGuests
                .filter(g => g.isCheckedIn)
                .reduce((sum, g) => sum + 1 + (g.plusGuests || 0), 0);

              return (
                <div key={tableName} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>{tableName}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Có mặt: <b className="text-emerald-600">{tableArrivedSeats}</b>/{tableTotalSeats} người
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tableArrivedSeats === tableTotalSeats && tableTotalSeats > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : tableArrivedSeats > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tableArrivedSeats === tableTotalSeats && tableTotalSeats > 0
                        ? 'Đã đủ bàn'
                        : `Còn thiếu ${tableTotalSeats - tableArrivedSeats}`}
                    </span>
                  </div>

                  {/* List of Guests at this Table */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    {tableGuests.map(g => (
                      <div
                        key={g.id}
                        onClick={() => toggleCheckIn(g.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          g.isCheckedIn
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center text-white text-[10px] ${
                              g.isCheckedIn ? 'bg-emerald-600' : 'border border-slate-300'
                            }`}
                          >
                            {g.isCheckedIn && <Check className="w-3 h-3" />}
                          </div>
                          {g.code && (
                            <span className="text-[9px] font-mono font-bold bg-slate-800 text-amber-300 px-1 py-0.2 rounded">
                              {g.code}
                            </span>
                          )}
                          <span className="text-xs">{g.name}</span>
                          {g.plusGuests ? (
                            <span className="text-[10px] text-slate-500 font-normal">
                              (+{g.plusGuests} người)
                            </span>
                          ) : null}
                          {g.isVegetarian && (
                            <span className="text-[9px] bg-teal-100 text-teal-800 px-1 rounded">
                              Chay
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {g.isCheckedIn ? `Có mặt ${g.checkInTime || ''}` : 'Chưa đến'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        guests={guests}
        onCheckInGuest={checkInGuest}
      />

      {/* Guest QR Batch / Single Print Modal */}
      <GuestQrPrintModal
        isOpen={isPrintQrOpen}
        onClose={() => setIsPrintQrOpen(false)}
        guests={guests}
        profile={profile}
      />
    </div>
  );
};
