import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  FileSpreadsheet,
  X,
  Edit2,
  Trash2,
  Gift,
  CheckCircle,
  HelpCircle,
  XCircle,
  Send,
  DollarSign,
  UserCheck,
  UtensilsCrossed,
  QrCode,
  Printer,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { GUEST_GROUP_LABELS, RSVP_STATUS_LABELS, formatCurrency, formatNumberInput, parseNumberInput } from '../data/categories';
import { GuestGroup, GuestItem, RSVPStatus } from '../types/wedding';
import { AttendanceView } from './AttendanceView';
import { GuestQrPrintModal } from './GuestQrPrintModal';

interface GuestViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  defaultSubTab?: 'invitations' | 'attendance';
}

export const GuestView: React.FC<GuestViewProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
  defaultSubTab = 'invitations',
}) => {
  const { profile, guests, addGuest, updateGuest, deleteGuest, totalActualGifts, confirmedGuests, totalGuests } = useWedding();

  const [subTab, setSubTab] = useState<'invitations' | 'attendance'>(defaultSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedRSVP, setSelectedRSVP] = useState<string>('all');
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [isPrintQrOpen, setIsPrintQrOpen] = useState(false);
  const [selectedGuestForQr, setSelectedGuestForQr] = useState<GuestItem | null>(null);

  // Quick gift entry modal
  const [quickGiftGuest, setQuickGiftGuest] = useState<GuestItem | null>(null);
  const [quickGiftValue, setQuickGiftValue] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    group: 'friends' as GuestGroup,
    invitationStatus: 'not_sent' as RSVPStatus,
    tableNumber: '',
    estimatedGift: '',
    actualGift: '',
    plusGuests: 0,
    isVegetarian: false,
    notes: '',
  });

  const openAddModal = () => {
    setEditingGuest(null);
    setFormData({
      name: '',
      phone: '',
      group: 'friends',
      invitationStatus: 'not_sent',
      tableNumber: '',
      estimatedGift: '',
      actualGift: '',
      plusGuests: 0,
      isVegetarian: false,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (guest: GuestItem) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      phone: guest.phone || '',
      group: guest.group,
      invitationStatus: guest.invitationStatus,
      tableNumber: guest.tableNumber || '',
      estimatedGift: guest.estimatedGift ? guest.estimatedGift.toString() : '',
      actualGift: guest.actualGift ? guest.actualGift.toString() : '',
      plusGuests: guest.plusGuests || 0,
      isVegetarian: guest.isVegetarian || false,
      notes: guest.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const est = parseNumberInput(formData.estimatedGift);
    const act = parseNumberInput(formData.actualGift);

    if (editingGuest) {
      updateGuest(editingGuest.id, {
        name: formData.name,
        phone: formData.phone,
        group: formData.group,
        invitationStatus: formData.invitationStatus,
        tableNumber: formData.tableNumber,
        estimatedGift: est,
        actualGift: act,
        plusGuests: formData.plusGuests,
        isVegetarian: formData.isVegetarian,
        notes: formData.notes,
      });
    } else {
      addGuest({
        name: formData.name,
        phone: formData.phone,
        group: formData.group,
        invitationStatus: formData.invitationStatus,
        tableNumber: formData.tableNumber,
        estimatedGift: est,
        actualGift: act,
        plusGuests: formData.plusGuests,
        isVegetarian: formData.isVegetarian,
        notes: formData.notes,
      });
    }

    setIsAddModalOpen(false);
    setEditingGuest(null);
  };

  const handleSaveQuickGift = () => {
    if (!quickGiftGuest) return;
    const amount = parseNumberInput(quickGiftValue);
    updateGuest(quickGiftGuest.id, { actualGift: amount });
    setQuickGiftGuest(null);
  };

  const exportCSV = () => {
    const headers = ['Họ và Tên', 'Nhóm khách', 'Số điện thoại', 'Bàn số', 'Trạng thái thiệp', 'Tiền mừng thực tế (VNĐ)', 'Ghi chú'];
    const rows = guests.map(g => [
      `"${g.name}"`,
      `"${GUEST_GROUP_LABELS[g.group]?.label || g.group}"`,
      `"${g.phone || ''}"`,
      `"${g.tableNumber || ''}"`,
      `"${RSVP_STATUS_LABELS[g.invitationStatus]?.label || g.invitationStatus}"`,
      g.actualGift || 0,
      `"${g.notes || ''}"`,
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Danh-sach-khach-moi-va-mung-cuoi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredGuests = guests.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.phone && g.phone.includes(searchQuery)) ||
      (g.tableNumber && g.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGroup = selectedGroup === 'all' || g.group === selectedGroup;
    const matchesRSVP = selectedRSVP === 'all' || g.invitationStatus === selectedRSVP;
    return matchesSearch && matchesGroup && matchesRSVP;
  });

  const groups: GuestGroup[] = ['groom_side', 'bride_side', 'friends', 'colleagues', 'relatives'];

  return (
    <div className="space-y-4 pb-24 px-4 pt-1">
      {/* Sub Tabs: Khách Mời & Sổ Mừng vs Khách Tham Dự Tiệc */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-600">
        <button
          onClick={() => setSubTab('invitations')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'invitations' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Mời Cưới & Sổ Mừng ({guests.length})</span>
        </button>
        <button
          onClick={() => setSubTab('attendance')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'attendance' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Khách Tham Dự Tiệc</span>
        </button>
      </div>

      {subTab === 'attendance' ? (
        <AttendanceView />
      ) : (
        <>
          {/* Overview Stat Box */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-indigo-200">Sổ Mừng & Khách Mời</span>
                <h2 className="text-xl font-bold">Quản Lý Khách & Tiền Mừng</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedGuestForQr(null);
                    setIsPrintQrOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-indigo-100 px-2.5 py-1.5 rounded-xl transition backdrop-blur-sm cursor-pointer"
                  title="In mã QR định danh khách mời hàng loạt"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-300" />
                  <span>In Thẻ QR</span>
                </button>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-xl transition backdrop-blur-sm cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-700/60 text-center">
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[10px] text-indigo-200 block">Tổng số khách</span>
                <span className="text-base font-bold text-white">{totalGuests}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[10px] text-emerald-300 block">Chắc chắn đi</span>
                <span className="text-base font-bold text-emerald-300">{confirmedGuests}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl">
                <span className="text-[10px] text-amber-300 block">Tiền mừng đã thu</span>
                <span className="text-xs font-bold text-amber-300">{formatCurrency(totalActualGifts)}</span>
              </div>
            </div>
          </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm tên khách, số điện thoại, bàn..."
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
          <span>Thêm Khách</span>
        </button>
      </div>

      {/* Group Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedGroup('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
            selectedGroup === 'all'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả nhóm ({guests.length})
        </button>
        {groups.map(grp => {
          const count = guests.filter(g => g.group === grp).length;
          return (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedGroup === grp
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {GUEST_GROUP_LABELS[grp].label} ({count})
            </button>
          );
        })}
      </div>

      {/* RSVP Filter */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium text-[11px]">Lọc theo trạng thái thiệp:</span>
        <select
          value={selectedRSVP}
          onChange={e => setSelectedRSVP(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="confirmed">Chắc chắn đi</option>
          <option value="sent">Đã gửi thiệp</option>
          <option value="not_sent">Chưa gửi</option>
          <option value="declined">Báo bận / Vắng</option>
        </select>
      </div>

      {/* Guest List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filteredGuests.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có khách nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Nhấn "Thêm Khách" để lập danh sách khách mời tiệc cưới.</p>
          </div>
        ) : (
          filteredGuests.map(guest => {
            const groupInfo = GUEST_GROUP_LABELS[guest.group];
            const rsvpInfo = RSVP_STATUS_LABELS[guest.invitationStatus];

            return (
              <div
                key={guest.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm hover:border-indigo-100 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${groupInfo.color}`}>
                        {groupInfo.label}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rsvpInfo.color}`}>
                        {rsvpInfo.label}
                      </span>
                      {guest.tableNumber && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {guest.tableNumber}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mt-1 leading-snug">
                      {guest.name}
                    </h3>

                    {guest.notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5 italic">
                        {guest.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedGuestForQr(guest);
                        setIsPrintQrOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                      title="Xem & Tải thẻ mã QR định danh khách mời"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(guest)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xác nhận xóa khách mời "${guest.name}"?`)) {
                          deleteGuest(guest.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Money Record Bar */}
                <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tiền mừng đám cưới</span>
                    <span className={`font-bold ${guest.actualGift ? 'text-purple-700 text-sm' : 'text-slate-400'}`}>
                      {guest.actualGift ? formatCurrency(guest.actualGift) : 'Chưa ghi nhận'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setQuickGiftGuest(guest);
                      setQuickGiftValue(guest.actualGift ? guest.actualGift.toString() : '');
                    }}
                    className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-800 px-2.5 py-1.5 rounded-xl font-semibold transition active:scale-95"
                  >
                    <Gift className="w-3.5 h-3.5 text-purple-600" />
                    <span>{guest.actualGift ? 'Sửa tiền mừng' : 'Ghi tiền mừng'}</span>
                  </button>
                </div>

                {/* Phone dial */}
                {guest.phone && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{guest.phone}</span>
                    </span>
                    <a
                      href={`tel:${guest.phone}`}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Gọi điện
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* Quick Gift Record Modal */}
      {quickGiftGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-purple-600" />
                <span>Ghi Nhận Tiền Mừng Cưới</span>
              </h3>
              <button
                onClick={() => setQuickGiftGuest(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Khách mừng: <span className="font-bold text-slate-900">{quickGiftGuest.name}</span>
            </p>

            <div className="mb-4">
              <label className="block text-slate-700 font-semibold text-xs mb-1">
                Số tiền mừng (VNĐ)
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ví dụ: 1.000.000"
                value={formatNumberInput(quickGiftValue)}
                onChange={e => setQuickGiftValue(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-purple-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <div className="flex gap-1.5 mt-2">
                {[500000, 1000000, 2000000, 3000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuickGiftValue(val.toString())}
                    className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 py-1 rounded-lg text-[10px] font-semibold"
                  >
                    {(val / 1000).toLocaleString()}k
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuickGiftGuest(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveQuickGift}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm"
              >
                Lưu Tiền Mừng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[88dvh] sm:max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-slate-900">
                {editingGuest ? 'Chỉnh Sửa Khách Mời' : 'Thêm Khách Mời Mới'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Họ và tên khách <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Anh Nguyễn Văn A, Bác Hai..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nhóm khách mời</label>
                  <select
                    value={formData.group}
                    onChange={e => setFormData({ ...formData, group: e.target.value as GuestGroup })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {groups.map(grp => (
                      <option key={grp} value={grp}>
                        {GUEST_GROUP_LABELS[grp].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trạng thái thiệp mời</label>
                  <select
                    value={formData.invitationStatus}
                    onChange={e => setFormData({ ...formData, invitationStatus: e.target.value as RSVPStatus })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="not_sent">Chưa gửi thiệp</option>
                    <option value="sent">Đã gửi thiệp</option>
                    <option value="confirmed">Chắc chắn tham dự</option>
                    <option value="declined">Báo bận / Vắng mặt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="09xx xxx xxx"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Xếp bàn số</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Bàn 05, VIP 1..."
                    value={formData.tableNumber}
                    onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Người đi cùng (+người)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0"
                    value={formData.plusGuests}
                    onChange={e => setFormData({ ...formData, plusGuests: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Suất ăn chay
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian}
                      onChange={e => setFormData({ ...formData, isVegetarian: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-700 font-medium">Khách ăn món chay</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tiền mừng cưới thực tế (VNĐ)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={formatNumberInput(formData.actualGift)}
                  onChange={e => setFormData({ ...formData, actualGift: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ghi chú (Đi kèm ai, quà tặng riêng...)</label>
                <textarea
                  rows={2}
                  placeholder="Đi cùng vợ con, tặng kèm vàng hồi môn..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex gap-2.5 shrink-0 rounded-b-3xl">
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
                  {editingGuest ? 'Lưu Thay Đổi' : 'Thêm Khách Mời'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest QR Print Modal */}
      <GuestQrPrintModal
        isOpen={isPrintQrOpen}
        onClose={() => {
          setIsPrintQrOpen(false);
          setSelectedGuestForQr(null);
        }}
        guests={guests}
        profile={profile}
        initialSelectedGuest={selectedGuestForQr}
      />
    </div>
  );
};
