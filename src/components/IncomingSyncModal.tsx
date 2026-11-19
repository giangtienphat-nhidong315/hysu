import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Wallet, CheckSquare, Calendar, Check, X, RefreshCw } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { useToast } from '../context/ToastContext';
import { unpackFullWeddingData, WeddingPackageData } from '../utils/syncProtocol';

export const IncomingSyncModal: React.FC = () => {
  const { importFullWeddingPackage, triggerConfetti } = useWedding();
  const toast = useToast();
  const [incomingData, setIncomingData] = useState<WeddingPackageData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let syncToken = params.get('sync') || params.get('data');
      if (!syncToken && window.location.hash.includes('sync=')) {
        const hashQuery = window.location.hash.split('?')[1] || window.location.hash.replace(/^#/, '');
        syncToken = new URLSearchParams(hashQuery).get('sync');
      }

      if (syncToken) {
        unpackFullWeddingData(syncToken).then(data => {
          if (data && data.profile && (data.profile.groomName || data.profile.brideName)) {
            setIncomingData(data);
            setIsOpen(true);
          }
        });
      }
    } catch (e) {
      console.warn('Lỗi đọc tham số đồng bộ URL:', e);
    }
  }, []);

  if (!isOpen || !incomingData) return null;

  const handleConfirmSync = () => {
    setIsProcessing(true);
    const success = importFullWeddingPackage(incomingData);
    setIsProcessing(false);

    if (success) {
      triggerConfetti();
      toast.success(
        'Đồng bộ thành công!',
        `Đã nạp toàn bộ dữ liệu kế hoạch cưới của ${incomingData.profile.groomName} & ${incomingData.profile.brideName} vào thiết bị này.`
      );
      // Xóa tham số sync khỏi thanh địa chỉ để URL sạch sẽ
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, '', cleanPath);
      setIsOpen(false);
    } else {
      toast.error('Đồng bộ thất bại', 'Không thể nạp gói dữ liệu vào máy. Vui lòng thử lại.');
    }
  };

  const handleDismiss = () => {
    const cleanPath = window.location.pathname;
    window.history.replaceState({}, '', cleanPath);
    setIsOpen(false);
  };

  const guestCount = incomingData.guests?.length || 0;
  const expenseCount = incomingData.expenses?.length || 0;
  const taskCount = incomingData.tasks?.length || 0;
  const scheduleCount = incomingData.schedule?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 border border-rose-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs">
              <RefreshCw className="w-5 h-5 animate-spin duration-1000" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Phát Hiện Dữ Liệu Đám Cưới</h3>
              <p className="text-[11px] text-slate-500">Được chuyển từ thiết bị / máy tính khác</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin cặp đôi */}
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 p-4 rounded-2xl border border-rose-200/80 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full border border-rose-200 text-rose-600 font-bold text-xs shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kế Hoạch Cưới Hạnh Phúc</span>
          </div>

          <h2 className="text-lg font-black text-slate-900">
            {incomingData.profile.groomName || 'Chú rể'} & {incomingData.profile.brideName || 'Cô dâu'}
          </h2>

          <p className="text-xs text-slate-600">
            {incomingData.profile.weddingDate && `Ngày cưới: ${incomingData.profile.weddingDate}`}
            {incomingData.profile.venue && ` • ${incomingData.profile.venue}`}
          </p>
        </div>

        {/* Tóm tắt các mục sẽ nạp vào máy */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 block">Dữ liệu đi kèm bao gồm:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-bold block text-slate-800">{guestCount} Khách</span>
                <span className="text-[10px] text-slate-500">Danh bạ & Sổ mừng</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold block text-slate-800">{expenseCount} Mục</span>
                <span className="text-[10px] text-slate-500">Chi tiêu & Ngân sách</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold block text-slate-800">{taskCount} Công việc</span>
                <span className="text-[10px] text-slate-500">Tiến độ chuẩn bị</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              <div>
                <span className="font-bold block text-slate-800">{scheduleCount} Mốc giờ</span>
                <span className="text-[10px] text-slate-500">Kịch bản & Lịch trình</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmSync}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Đồng Bộ Ngay Vào Thiết Bị Này</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            Bỏ Qua (Giữ Dữ Liệu Hiện Tại)
          </button>
        </div>
      </div>
    </div>
  );
};
