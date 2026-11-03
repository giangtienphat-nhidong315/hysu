import React, { useState } from 'react';
import { X, Heart, Calendar, Clock, MapPin, DollarSign, Image } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { formatNumberInput, parseNumberInput } from '../data/categories';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, triggerConfetti } = useWedding();

  const [formData, setFormData] = useState({
    groomName: profile.groomName,
    brideName: profile.brideName,
    weddingDate: profile.weddingDate,
    weddingTime: profile.weddingTime || '11:00',
    venue: profile.venue || '',
    targetBudget: profile.targetBudget ? profile.targetBudget.toString() : '200000000',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      groomName: formData.groomName.trim() || 'Chú rể',
      brideName: formData.brideName.trim() || 'Cô dâu',
      weddingDate: formData.weddingDate,
      weddingTime: formData.weddingTime,
      venue: formData.venue.trim(),
      targetBudget: parseNumberInput(formData.targetBudget),
    });
    triggerConfetti();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-sm">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>Thông Tin Ngày Hạnh Phúc</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="profile-modal-form"
              className="sm:hidden px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95"
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

        <form id="profile-modal-form" onSubmit={handleSubmit} className="modal-form-wrapper">
          <div className="modal-scroll-area space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên Chú Rể</label>
                <input
                  type="text"
                  required
                  value={formData.groomName}
                  onChange={e => setFormData({ ...formData, groomName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên Cô Dâu</label>
                <input
                  type="text"
                  required
                  value={formData.brideName}
                  onChange={e => setFormData({ ...formData, brideName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ngày cưới</label>
                <input
                  type="date"
                  required
                  value={formData.weddingDate}
                  onChange={e => setFormData({ ...formData, weddingDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Giờ cử hành tiệc</label>
                <input
                  type="time"
                  value={formData.weddingTime}
                  onChange={e => setFormData({ ...formData, weddingTime: e.target.value })}
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
                required
                placeholder="Ví dụ: 250.000.000"
                value={formatNumberInput(formData.targetBudget)}
                onChange={e => setFormData({ ...formData, targetBudget: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Địa điểm tổ chức hôn lễ</label>
              <input
                type="text"
                placeholder="Tên nhà hàng / trung tâm tiệc cưới..."
                value={formData.venue}
                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold border border-slate-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-md transition active:scale-95"
            >
              Lưu Thông Tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
