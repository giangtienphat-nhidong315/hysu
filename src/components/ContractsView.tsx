import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  Camera,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Phone,
  Eye,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatNumberInput, parseNumberInput } from '../data/categories';
import { ContractItem } from '../types/wedding';
import { compressImage } from '../utils/imageCompressor';

export const ContractsView: React.FC = () => {
  const {
    contracts,
    addContract,
    updateContract,
    deleteContract,
    addContractImage,
    deleteContractImage,
    sheetConfig,
    syncWithGoogleSheets,
    isSyncing,
  } = useWedding();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractItem | null>(null);

  // Fullscreen photo preview
  const [viewingPhoto, setViewingPhoto] = useState<{ contractTitle: string; image: string; contractId: string; index: number } | null>(null);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    vendorName: '',
    category: 'Nhà Hàng & Tiệc Cưới',
    signedDate: new Date().toISOString().split('T')[0],
    contractValue: '',
    depositValue: '',
    vendorPhone: '',
    notes: '',
    status: 'active' as 'active' | 'completed' | 'cancelled',
  });

  const openAddModal = () => {
    setEditingContract(null);
    setFormData({
      title: '',
      vendorName: '',
      category: 'Nhà Hàng & Tiệc Cưới',
      signedDate: new Date().toISOString().split('T')[0],
      contractValue: '',
      depositValue: '',
      vendorPhone: '',
      notes: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: ContractItem) => {
    setEditingContract(c);
    setFormData({
      title: c.title,
      vendorName: c.vendorName,
      category: c.category,
      signedDate: c.signedDate,
      contractValue: c.contractValue ? c.contractValue.toString() : '',
      depositValue: c.depositValue ? c.depositValue.toString() : '',
      vendorPhone: c.vendorPhone || '',
      notes: c.notes || '',
      status: c.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const val = parseNumberInput(formData.contractValue);
    const dep = parseNumberInput(formData.depositValue);

    if (editingContract) {
      updateContract(editingContract.id, {
        title: formData.title,
        vendorName: formData.vendorName,
        category: formData.category,
        signedDate: formData.signedDate,
        contractValue: val,
        depositValue: dep,
        vendorPhone: formData.vendorPhone,
        notes: formData.notes,
        status: formData.status,
      });
      toast.success('Đã cập nhật hợp đồng', 'Thông tin hợp đồng đã được lưu.');
    } else {
      addContract({
        title: formData.title,
        vendorName: formData.vendorName,
        category: formData.category,
        signedDate: formData.signedDate,
        contractValue: val,
        depositValue: dep,
        vendorPhone: formData.vendorPhone,
        notes: formData.notes,
        images: [],
        status: formData.status,
      });
      toast.success('Đã thêm hợp đồng mới', 'Hợp đồng mới đã được thêm vào hệ thống.');
    }

    // Tự động đồng bộ ngay lên Google Sheet nếu đã kết nối Webhook
    if (sheetConfig.webhookUrl) {
      syncWithGoogleSheets(true, true);
    }

    setIsModalOpen(false);
    setEditingContract(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingForId) return;

    try {
      const compressedDataUrl = await compressImage(file, 1400, 0.82);
      addContractImage(uploadingForId, compressedDataUrl);
    } catch (err) {
      console.error('Error compressing contract photo', err);
      toast.error('Không thể tải ảnh', 'Vui lòng thử lại với một bức ảnh khác.');
    } finally {
      setUploadingForId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalContractVal = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
  const totalDepositVal = contracts.reduce((sum, c) => sum + (c.depositValue || 0), 0);

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header and Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold">
              Giấy Tờ & Hồ Sơ Cưới
            </span>
            <h3 className="text-base font-bold text-white">Quản Lý Hợp Đồng & Ảnh Đính Kèm</h3>
            {sheetConfig.webhookUrl && sheetConfig.lastSyncedAt && (
              <span className="text-[10px] text-indigo-300/80 block mt-0.5">
                ✓ Đã đồng bộ Google Sheet: {sheetConfig.lastSyncedAt}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {sheetConfig.webhookUrl && (
              <button
                type="button"
                onClick={() => syncWithGoogleSheets(false, true)}
                disabled={isSyncing}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                title="Đồng bộ ngay dữ liệu hợp đồng lên Google Sheet"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-300' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Sheet'}</span>
              </button>
            )}
            <button
              onClick={openAddModal}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Hợp Đồng</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-indigo-900/60 text-center">
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 block">Tổng giá trị</span>
            <span className="text-xs font-bold text-white">{formatCurrency(totalContractVal)}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-emerald-400 block">Đã đặt cọc</span>
            <span className="text-xs font-bold text-emerald-400">{formatCurrency(totalDepositVal)}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2">
            <span className="text-[10px] text-rose-400 block">Còn lại</span>
            <span className="text-xs font-bold text-rose-400">
              {formatCurrency(Math.max(0, totalContractVal - totalDepositVal))}
            </span>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div>
        {contracts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Chưa có hợp đồng nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Bấm "Thêm Hợp Đồng" để lưu hợp đồng sảnh tiệc, studio, váy cưới kèm ảnh chụp các điều khoản.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contracts.map(contract => {
            const debt = Math.max(0, contract.contractValue - contract.depositValue);

            return (
              <div
                key={contract.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 hover:border-indigo-100 transition"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                        {contract.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Ký ngày: {contract.signedDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                      {contract.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Đối tác: <span className="text-slate-800">{contract.vendorName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(contract)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                      title="Sửa hợp đồng"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await toast.confirm({
                          title: 'Xác Nhận Xóa Hợp Đồng?',
                          message: `Bạn có chắc chắn muốn xóa hợp đồng "${contract.title}" và toàn bộ ảnh đính kèm?`,
                          confirmText: 'Xóa Hợp Đồng',
                          cancelText: 'Hủy',
                        });
                        if (confirmed) {
                          deleteContract(contract.id);
                          if (sheetConfig.webhookUrl) {
                            syncWithGoogleSheets(true, true);
                          }
                          toast.info('Đã xóa hợp đồng', `Đã xóa hợp đồng "${contract.title}".`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Values bar */}
                <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Giá trị hợp đồng</span>
                    <span className="font-bold text-slate-900">{formatCurrency(contract.contractValue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Đã cọc</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(contract.depositValue)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-rose-400 block">Còn thiếu</span>
                    <span className="font-bold text-rose-600">{formatCurrency(debt)}</span>
                  </div>
                </div>

                {/* Notes */}
                {contract.notes && (
                  <p className="text-[11px] text-slate-600 bg-amber-50/60 border border-amber-100 p-2 rounded-xl leading-relaxed">
                    <b>Lưu ý:</b> {contract.notes}
                  </p>
                )}

                {/* Photo Gallery Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ảnh Chụp Hợp Đồng ({contract.images?.length || 0} trang)</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadingForId(contract.id);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-xl text-[11px] font-bold transition active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Chụp / Thêm Ảnh</span>
                    </button>
                  </div>

                  {/* Image thumbnails */}
                  {contract.images && contract.images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {contract.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-3/4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                        >
                          <img
                            src={img}
                            alt={`Hợp đồng trang ${idx + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                            onClick={() =>
                              setViewingPhoto({
                                contractTitle: contract.title,
                                image: img,
                                contractId: contract.id,
                                index: idx,
                              })
                            }
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] py-0.5 text-center font-bold">
                            Trang {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Chưa có ảnh hợp đồng. Hãy bấm "Chụp / Thêm Ảnh" để lưu lại các trang hợp đồng giấy.
                    </p>
                  )}
                </div>

                {/* Phone row if available */}
                {contract.vendorPhone && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 text-[11px]">Liên hệ: {contract.vendorPhone}</span>
                    <a
                      href={`tel:${contract.vendorPhone}`}
                      className="flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Gọi đối tác</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Fullscreen Photo Viewer Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/20">
            <div>
              <h4 className="text-xs font-bold text-white">{viewingPhoto.contractTitle}</h4>
              <span className="text-[11px] text-slate-300">Trang {viewingPhoto.index + 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={viewingPhoto.image}
                download={`HopDong-${viewingPhoto.contractTitle}-Trang-${viewingPhoto.index + 1}.jpg`}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition"
                title="Tải ảnh về máy"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => {
                  if (confirm('Xác nhận xóa trang ảnh hợp đồng này?')) {
                    deleteContractImage(viewingPhoto.contractId, viewingPhoto.index);
                    setViewingPhoto(null);
                  }
                }}
                className="p-2 bg-red-600/80 hover:bg-red-600 rounded-xl text-white transition"
                title="Xóa ảnh này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewingPhoto(null)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
            <img
              src={viewingPhoto.image}
              alt="Ảnh hợp đồng xem chi tiết"
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="text-center text-[11px] text-slate-400 py-2">
            Chạm và phóng to để đọc rõ từng chữ và điều khoản hợp đồng
          </div>
        </div>
      )}

      {/* Add / Edit Contract Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>{editingContract ? 'Chỉnh Sửa Hợp Đồng' : 'Thêm Hợp Đồng Cưới Mới'}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="contract-modal-form"
                  className="sm:hidden px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
                >
                  {editingContract ? 'Lưu' : 'Tạo'}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form id="contract-modal-form" onSubmit={handleSaveContract} className="modal-form-wrapper">
              <div className="modal-scroll-area space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tên hợp đồng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hợp đồng đặt sảnh tiệc White Palace, Hợp đồng studio..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bên cung cấp / Đối tác</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên nhà hàng, studio..."
                    value={formData.vendorName}
                    onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hạng mục</label>
                  <input
                    type="text"
                    placeholder="Nhà hàng, Quay chụp, Váy cưới..."
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tổng giá trị (VNĐ)</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={formatNumberInput(formData.contractValue)}
                    onChange={e => setFormData({ ...formData, contractValue: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Đã đặt cọc (VNĐ)</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={formatNumberInput(formData.depositValue)}
                    onChange={e => setFormData({ ...formData, depositValue: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ngày ký hợp đồng</label>
                  <input
                    type="date"
                    value={formData.signedDate}
                    onChange={e => setFormData({ ...formData, signedDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số điện thoại bên dịch vụ</label>
                  <input
                    type="tel"
                    placeholder="09xx xxx xxx"
                    value={formData.vendorPhone}
                    onChange={e => setFormData({ ...formData, vendorPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ghi chú điều khoản & Cam kết</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú chi tiết điều khoản hủy/đổi, hạn thanh toán đợt tiếp theo..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold border border-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-md transition active:scale-95"
              >
                {editingContract ? 'Lưu Thay Đổi' : 'Tạo Hợp Đồng'}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};
