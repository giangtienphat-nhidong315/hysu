import React, { useState } from 'react';
import {
  Clock,
  Plus,
  MapPin,
  User,
  Phone,
  Settings,
  Download,
  Upload,
  RefreshCw,
  X,
  Edit2,
  Trash2,
  CheckCircle,
  Smartphone,
  FileText,
  Music,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { DayScheduleItem, VendorItem } from '../types/wedding';
import { formatCurrency, formatNumberInput, parseNumberInput } from '../data/categories';
import { ContractsView } from './ContractsView';
import { MusicPlaylistView } from './MusicPlaylistView';

interface ScheduleViewProps {
  onOpenGoogleSheets?: () => void;
  defaultSubTab?: 'schedule' | 'contracts' | 'vendors' | 'music' | 'settings';
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  onOpenGoogleSheets,
  defaultSubTab = 'schedule',
}) => {
  const {
    schedule,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    contracts,
    playlist,
    sheetConfig,
    syncWithGoogleSheets,
    isSyncing,
    exportDataJSON,
    importDataJSON,
    resetToDefault,
  } = useWedding();

  const [subTab, setSubTab] = useState<'schedule' | 'contracts' | 'vendors' | 'music' | 'settings'>(defaultSubTab);

  // Schedule item modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DayScheduleItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    time: '11:00',
    eventName: '',
    description: '',
    personInCharge: '',
    location: '',
  });

  // Vendor modal
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: '',
    phone: '',
    address: '',
    contractAmount: '',
    depositAmount: '',
    notes: '',
  });

  const openAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({
      time: '11:00',
      eventName: '',
      description: '',
      personInCharge: '',
      location: '',
    });
    setIsScheduleModalOpen(true);
  };

  const openEditSchedule = (item: DayScheduleItem) => {
    setEditingSchedule(item);
    setScheduleForm({
      time: item.time,
      eventName: item.eventName,
      description: item.description || '',
      personInCharge: item.personInCharge || '',
      location: item.location || '',
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.eventName.trim()) return;

    if (editingSchedule) {
      updateScheduleItem(editingSchedule.id, scheduleForm);
    } else {
      addScheduleItem(scheduleForm);
    }
    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
  };

  const openAddVendor = () => {
    setEditingVendor(null);
    setVendorForm({
      name: '',
      category: '',
      phone: '',
      address: '',
      contractAmount: '',
      depositAmount: '',
      notes: '',
    });
    setIsVendorModalOpen(true);
  };

  const openEditVendor = (v: VendorItem) => {
    setEditingVendor(v);
    setVendorForm({
      name: v.name,
      category: v.category,
      phone: v.phone,
      address: v.address || '',
      contractAmount: v.contractAmount ? v.contractAmount.toString() : '',
      depositAmount: v.depositAmount ? v.depositAmount.toString() : '',
      notes: v.notes || '',
    });
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) return;

    const cont = parseNumberInput(vendorForm.contractAmount);
    const dep = parseNumberInput(vendorForm.depositAmount);

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        name: vendorForm.name,
        category: vendorForm.category,
        phone: vendorForm.phone,
        address: vendorForm.address,
        contractAmount: cont,
        depositAmount: dep,
        notes: vendorForm.notes,
      });
    } else {
      addVendor({
        name: vendorForm.name,
        category: vendorForm.category,
        phone: vendorForm.phone,
        address: vendorForm.address,
        contractAmount: cont,
        depositAmount: dep,
        notes: vendorForm.notes,
      });
    }
    setIsVendorModalOpen(false);
    setEditingVendor(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        const success = importDataJSON(text);
        if (success) {
          alert('Khôi phục dữ liệu kế hoạch cưới thành công!');
        } else {
          alert('Tệp dữ liệu không hợp lệ!');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-1">
      {/* Sub Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl text-[11px] font-bold text-slate-600 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSubTab('schedule')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 whitespace-nowrap ${
            subTab === 'schedule' ? 'bg-white text-rose-600 shadow-xs' : ''
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Kịch Bản</span>
        </button>
        <button
          onClick={() => setSubTab('contracts')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 whitespace-nowrap ${
            subTab === 'contracts' ? 'bg-white text-indigo-700 shadow-xs' : ''
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Hợp Đồng ({contracts.length})</span>
        </button>
        <button
          onClick={() => setSubTab('vendors')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 whitespace-nowrap ${
            subTab === 'vendors' ? 'bg-white text-rose-600 shadow-xs' : ''
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Danh Bạ</span>
        </button>
        <button
          onClick={() => setSubTab('music')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 whitespace-nowrap ${
            subTab === 'music' ? 'bg-white text-purple-700 shadow-xs' : ''
          }`}
        >
          <Music className="w-3.5 h-3.5 text-purple-600" />
          <span>Nhạc Cưới ({playlist.length})</span>
        </button>
        <button
          onClick={() => setSubTab('settings')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 whitespace-nowrap ${
            subTab === 'settings' ? 'bg-white text-rose-600 shadow-xs' : ''
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Cài Đặt</span>
        </button>
      </div>

      {/* TAB 1: KỊCH BẢN NGÀY CƯỚI (TIMELINE) */}
      {subTab === 'schedule' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Lịch trình chi tiết từng mốc giờ trong ngày cưới
            </p>
            <button
              onClick={openAddSchedule}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Mốc Giờ</span>
            </button>
          </div>

          <div className="relative pl-6 border-l-2 border-rose-300 space-y-4 my-2">
            {schedule.map(item => (
              <div key={item.id} className="relative group">
                {/* Circle marker */}
                <div
                  onClick={() => updateScheduleItem(item.id, { isDone: !item.isDone })}
                  className={`absolute -left-[31px] top-1 w-5 h-5 rounded-full border-2 cursor-pointer flex items-center justify-center transition ${
                    item.isDone
                      ? 'bg-emerald-500 border-white text-white shadow-sm'
                      : 'bg-white border-rose-500 hover:bg-rose-50'
                  }`}
                >
                  {item.isDone && <CheckCircle className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`bg-white rounded-2xl p-3.5 border transition ${
                    item.isDone
                      ? 'border-emerald-200 bg-emerald-50/20 opacity-75'
                      : 'border-slate-100 shadow-xs hover:border-rose-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                          {item.time}
                        </span>
                        <h4 className={`text-xs font-bold ${item.isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {item.eventName}
                        </h4>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 flex-wrap">
                        {item.personInCharge && (
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Phụ trách: {item.personInCharge}</span>
                          </span>
                        )}
                        {item.location && (
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{item.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => openEditSchedule(item)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Xác nhận xóa mốc sự kiện này?')) {
                            deleteScheduleItem(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HỢP ĐỒNG & ẢNH LƯU TRỮ */}
      {subTab === 'contracts' && <ContractsView />}

      {/* TAB 2: DANH BẠ NHÀ CUNG CẤP (VENDORS) */}
      {subTab === 'vendors' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Danh bạ liên hệ nhanh các dịch vụ cưới hỏi
            </p>
            <button
              onClick={openAddVendor}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Dịch Vụ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {vendors.map(v => (
              <div key={v.id} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      {v.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 mt-1">{v.name}</h4>
                    {v.address && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{v.address}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditVendor(v)} className="p-1.5 text-slate-400 hover:text-slate-600">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa dịch vụ "${v.name}"?`)) deleteVendor(v.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Hợp đồng</span>
                    <span className="font-bold text-slate-800">{formatCurrency(v.contractAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Đã cọc</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(v.depositAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Còn thiếu</span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(Math.max(0, v.contractAmount - v.depositAmount))}
                    </span>
                  </div>
                </div>

                {v.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/50">
                    {v.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-700">{v.phone}</span>
                  <a
                    href={`tel:${v.phone}`}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Gọi Ngay</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DANH SÁCH NHẠC CƯỚI (PLAYLIST) */}
      {subTab === 'music' && <MusicPlaylistView />}

      {/* TAB 5: CÀI ĐẶT & SAO LƯU DỮ LIỆU */}
      {subTab === 'settings' && (
        <div className="space-y-4">
          {/* Mobile Install Guide */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/60 rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-xs">
              <Smartphone className="w-4 h-4 text-rose-600" />
              <span>Cài Đặt Lên Màn Hình Điện Thoại Android</span>
            </div>
            <p className="text-xs text-rose-900/80 leading-relaxed mb-3">
              Bạn có thể sử dụng ứng dụng này như một ứng dụng native trên Android bằng cách:
            </p>
            <ol className="text-xs text-rose-900/90 space-y-1.5 list-decimal pl-4">
              <li>Mở trình duyệt <b>Google Chrome</b> trên điện thoại Android của bạn.</li>
              <li>Bấm vào biểu tượng <b>Ba chấm (⋮)</b> ở góc trên bên phải.</li>
              <li>Chọn <b>"Thêm vào Màn hình chính"</b> (Add to Home screen) hoặc <b>"Cài đặt ứng dụng"</b>.</li>
              <li>Biểu tượng <b>Hỷ Sự</b> sẽ xuất hiện trên màn hình điện thoại, hoạt động mượt mà offline không cần mạng!</li>
            </ol>
          </div>

          {/* Google Sheets Sync Section */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    Đồng Bộ Lên Google Sheet
                  </h3>
                  <p className="text-[11px] text-emerald-700">
                    {sheetConfig.lastSyncedAt
                      ? `Lần cuối: ${sheetConfig.lastSyncedAt}`
                      : 'Chưa kết nối Webhook URL'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {sheetConfig.webhookUrl ? (
                <button
                  onClick={() => syncWithGoogleSheets()}
                  disabled={isSyncing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
                </button>
              ) : null}

              {onOpenGoogleSheets && (
                <button
                  onClick={onOpenGoogleSheets}
                  className="flex-1 bg-white hover:bg-emerald-100/60 text-emerald-800 border border-emerald-300 py-2 px-3 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Cấu hình Webhook
                </button>
              )}
            </div>
          </div>

          {/* Backup & Restore Data */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Sao Lưu & Đồng Bộ Dữ Liệu</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dữ liệu của bạn được lưu an toàn trên máy. Bạn có thể xuất file sao lưu để gửi cho vợ/chồng hoặc khôi phục bất cứ lúc nào.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={exportDataJSON}
                className="flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 px-3 rounded-2xl text-xs font-semibold transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Xuất File Sao Lưu</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-2xl text-xs font-semibold cursor-pointer transition active:scale-95">
                <Upload className="w-4 h-4" />
                <span>Nhập File Sao Lưu</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset button */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Dữ Liệu Mẫu</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nếu bạn muốn xem lại toàn bộ dữ liệu mẫu chuẩn của đám cưới Việt Nam (ngân sách, danh sách việc, khách mời mẫu).
            </p>
            <button
              onClick={() => {
                if (confirm('Bạn có chắc muốn đặt lại toàn bộ dữ liệu về mẫu ban đầu? Các thay đổi của bạn sẽ được thay thế.')) {
                  resetToDefault();
                  alert('Đã khôi phục dữ liệu mẫu thành công!');
                }
              }}
              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 py-2 rounded-xl text-xs font-semibold transition"
            >
              Đặt lại dữ liệu mẫu gợi ý
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                {editingSchedule ? 'Sửa Mốc Giờ' : 'Thêm Mốc Giờ Mới'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="schedule-modal-form"
                  className="sm:hidden px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
                >
                  {editingSchedule ? 'Lưu' : 'Thêm'}
                </button>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form id="schedule-modal-form" onSubmit={handleSaveSchedule} className="modal-form-wrapper">
              <div className="modal-scroll-area space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-slate-700 font-semibold mb-1">Thời gian</label>
                    <input
                      type="time"
                      required
                      value={scheduleForm.time}
                      onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Tên sự kiện / Nghi thức</label>
                    <input
                      type="text"
                      required
                      placeholder="Lễ rước dâu, Khai tiệc..."
                      value={scheduleForm.eventName}
                      onChange={e => setScheduleForm({ ...scheduleForm, eventName: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Người phụ trách</label>
                  <input
                    type="text"
                    placeholder="MC, Trưởng đoàn, Bạn bè..."
                    value={scheduleForm.personInCharge}
                    onChange={e => setScheduleForm({ ...scheduleForm, personInCharge: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Địa điểm</label>
                  <input
                    type="text"
                    placeholder="Nhà gái, Nhà trai, Sảnh tiệc..."
                    value={scheduleForm.location}
                    onChange={e => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chi tiết mô tả</label>
                  <textarea
                    rows={2}
                    placeholder="Nội dung kịch bản, lời dặn dò..."
                    value={scheduleForm.description}
                    onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold border border-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold shadow-md transition active:scale-95"
                >
                  Lưu Mốc Giờ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: HỢP ĐỒNG & ẢNH LƯU TRỮ */}
      {subTab === 'contracts' && <ContractsView />}

      {/* Add / Edit Vendor Modal */}
      {isVendorModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                {editingVendor ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="vendor-modal-form"
                  className="sm:hidden px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
                >
                  {editingVendor ? 'Lưu' : 'Thêm'}
                </button>
                <button
                  onClick={() => setIsVendorModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form id="vendor-modal-form" onSubmit={handleSaveVendor} className="modal-form-wrapper">
              <div className="modal-scroll-area space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tên nhà cung cấp / Dịch vụ</label>
                  <input
                    type="text"
                    required
                    placeholder="Trung tâm tiệc cưới, Studio ảnh cưới..."
                    value={vendorForm.name}
                    onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Loại dịch vụ</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhà hàng, Quay chụp..."
                      value={vendorForm.category}
                      onChange={e => setVendorForm({ ...vendorForm, category: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      required
                      placeholder="09xx xxx xxx"
                      value={vendorForm.phone}
                      onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    placeholder="Địa chỉ studio, sảnh tiệc..."
                    value={vendorForm.address}
                    onChange={e => setVendorForm({ ...vendorForm, address: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Giá hợp đồng (VNĐ)</label>
                    <input
                      type="text"
                      placeholder="0"
                      value={formatNumberInput(vendorForm.contractAmount)}
                      onChange={e => setVendorForm({ ...vendorForm, contractAmount: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Đã cọc (VNĐ)</label>
                    <input
                      type="text"
                      placeholder="0"
                      value={formatNumberInput(vendorForm.depositAmount)}
                      onChange={e => setVendorForm({ ...vendorForm, depositAmount: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ghi chú hợp đồng</label>
                  <textarea
                    rows={2}
                    placeholder="Người liên hệ chính, giờ giao nhận..."
                    value={vendorForm.notes}
                    onChange={e => setVendorForm({ ...vendorForm, notes: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold border border-slate-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold shadow-md transition active:scale-95"
                >
                  Lưu Dịch Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: HỢP ĐỒNG & ẢNH LƯU TRỮ */}
      {subTab === 'contracts' && <ContractsView />}
    </div>
  );
};
