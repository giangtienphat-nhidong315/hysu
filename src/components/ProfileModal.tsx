import React, { useState, useEffect } from 'react';
import { X, Heart, Calendar, Clock, MapPin, DollarSign, Image, Check, AlertCircle } from 'lucide-react';
import { useWedding, sanitizeWeddingDate, sanitizeWeddingTime } from '../context/WeddingContext';
import { formatNumberInput, parseNumberInput } from '../data/categories';
import { CoupleProfile } from '../types/wedding';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    updateProfile,
    triggerConfetti,
    sheetConfig,
    syncWithGoogleSheets,
    markLocalEdit,
  } = useWedding();

  const [formData, setFormData] = useState({
    groomName: profile.groomName || 'Chú rể',
    brideName: profile.brideName || 'Cô dâu',
    weddingDate: sanitizeWeddingDate(profile.weddingDate),
    weddingTime: sanitizeWeddingTime(profile.weddingTime),
    venue: profile.venue || '',
    targetBudget: profile.targetBudget ? profile.targetBudget.toString() : '200000000',
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  // Khởi tạo lại formData khi mở modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        groomName: profile.groomName || 'Chú rể',
        brideName: profile.brideName || 'Cô dâu',
        weddingDate: sanitizeWeddingDate(profile.weddingDate),
        weddingTime: sanitizeWeddingTime(profile.weddingTime),
        venue: profile.venue || '',
        targetBudget: profile.targetBudget ? profile.targetBudget.toString() : '200000000',
      });
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const cleanGroom = formData.groomName.trim() || 'Chú rể';
    const cleanBride = formData.brideName.trim() || 'Cô dâu';
    const cleanDate = sanitizeWeddingDate(formData.weddingDate);
    const cleanTime = sanitizeWeddingTime(formData.weddingTime);
    const cleanVenue = formData.venue.trim();
    const cleanBudget = parseNumberInput(formData.targetBudget) || 200000000;

    const updatedProfile: CoupleProfile = {
      ...profile,
      groomName: cleanGroom,
      brideName: cleanBride,
      weddingDate: cleanDate,
      weddingTime: cleanTime,
      venue: cleanVenue,
      targetBudget: cleanBudget,
    };

    // Đánh dấu người dùng vừa chỉnh sửa để chặn triệt để auto-pull ngầm đè mất
    markLocalEdit();
    updateProfile(updatedProfile);
    triggerConfetti();

    // Nếu đã kết nối Google Sheet, đồng bộ ngay lập tức không cần chờ debounce
    if (sheetConfig.webhookUrl) {
      syncWithGoogleSheets(true, true);
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-sm">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>Thông Tin Ngày Hạnh Phúc</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave()}
              className="sm:hidden px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              Lưu
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="modal-form-wrapper" noValidate>
          <div className="modal-scroll-area space-y-3.5 text-xs">
            {feedback && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên Chú Rể</label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={e => {
                    markLocalEdit();
                    setFormData(prev => ({ ...prev, groomName: e.target.value }));
                  }}
                  placeholder="Nhập tên chú rể"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên Cô Dâu</label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={e => {
                    markLocalEdit();
                    setFormData(prev => ({ ...prev, brideName: e.target.value }));
                  }}
                  placeholder="Nhập tên cô dâu"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ngày cưới</label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={e => {
                    markLocalEdit();
                    setFormData(prev => ({ ...prev, weddingDate: e.target.value }));
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Giờ cử hành tiệc</label>
                <input
                  type="time"
                  value={formData.weddingTime}
                  onChange={e => {
                    markLocalEdit();
                    setFormData(prev => ({ ...prev, weddingTime: e.target.value }));
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ngân sách dự kiến toàn bộ đám cưới (VNĐ)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 250.000.000"
                value={formatNumberInput(formData.targetBudget)}
                onChange={e => {
                  markLocalEdit();
                  setFormData(prev => ({ ...prev, targetBudget: e.target.value }));
                }}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Địa điểm tổ chức hôn lễ</label>
              <input
                type="text"
                placeholder="Tên nhà hàng / trung tâm tiệc cưới..."
                value={formData.venue}
                onChange={e => {
                  markLocalEdit();
                  setFormData(prev => ({ ...prev, venue: e.target.value }));
                }}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold border border-slate-200 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              Lưu Thông Tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
