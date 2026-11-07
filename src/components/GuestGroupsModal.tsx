import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, AlertCircle, RotateCcw, Users, Tag } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { GUEST_GROUP_COLOR_OPTIONS } from '../data/categories';
import { GuestGroupItem } from '../types/wedding';

interface GuestGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroup?: (groupId: string) => void;
}

export const GuestGroupsModal: React.FC<GuestGroupsModalProps> = ({
  isOpen,
  onClose,
  onSelectGroup,
}) => {
  const { guestGroups, addGuestGroup, updateGuestGroup, deleteGuestGroup, resetGuestGroups, guests } = useWedding();

  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(GUEST_GROUP_COLOR_OPTIONS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = newGroupName.trim();
    if (!trimmed) return;

    // Check duplicate
    if (guestGroups.some(g => g.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`Nhóm "${trimmed}" đã tồn tại! Vui lòng chọn tên khác.`);
      return;
    }

    const created = addGuestGroup({
      name: trimmed,
      color: selectedColor,
    });

    setNewGroupName('');
    if (onSelectGroup && created) {
      onSelectGroup(created.id);
    }
  };

  const handleStartEdit = (group: GuestGroupItem) => {
    setEditingId(group.id);
    setEditName(group.name);
    setEditColor(group.color);
    setErrorMessage(null);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    if (guestGroups.some(g => g.id !== id && g.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`Tên nhóm "${trimmed}" đã bị trùng!`);
      return;
    }

    updateGuestGroup(id, {
      name: trimmed,
      color: editColor,
    });
    setEditingId(null);
    setErrorMessage(null);
  };

  const handleDelete = (group: GuestGroupItem) => {
    setErrorMessage(null);
    const res = deleteGuestGroup(group.id);
    if (!res.success && res.message) {
      setErrorMessage(res.message);
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục danh sách nhóm mặc định? (Các khách đang gán nhóm cũ vẫn giữ nguyên thông tin)')) {
      resetGuestGroups();
      setErrorMessage(null);
      setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-white to-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Cài Đặt Nhóm Khách Mời</h3>
              <p className="text-[11px] text-slate-500">Phân loại họ hàng nội ngoại, bạn bè, đồng nghiệp...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-600 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form thêm nhóm mới */}
          <form onSubmit={handleAddGroup} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-600" />
                Thêm nhóm khách mới
              </span>
              <span className="text-[11px] text-slate-400">Tùy biến tự do</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: Bên nội chú rể, Bạn đại học..."
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!newGroupName.trim()}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>

            {/* Bảng chọn màu sắc badge */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
                Chọn màu thẻ đại diện:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {GUEST_GROUP_COLOR_OPTIONS.map(opt => {
                  const isSelected = selectedColor === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedColor(opt.value)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer ${opt.value} ${
                        isSelected ? `ring-2 ring-slate-800 ${opt.border} shadow-xs scale-105` : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Danh sách các nhóm */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
              <span>Danh sách nhóm ({guestGroups.length})</span>
              <span className="text-[11px] font-normal text-slate-400">Bấm bút để sửa tên / màu</span>
            </div>

            <div className="space-y-2">
              {guestGroups.map(group => {
                const isEditing = editingId === group.id;
                const guestCount = guests.filter(
                  g => g.group === group.id || g.group === group.name
                ).length;

                if (isEditing) {
                  return (
                    <div
                      key={group.id}
                      className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3 space-y-2.5 animate-in fade-in"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 bg-white border border-indigo-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(group.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-xl transition cursor-pointer"
                          title="Lưu thay đổi"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-1.5 rounded-xl transition cursor-pointer"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {GUEST_GROUP_COLOR_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setEditColor(opt.value)}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${opt.value} ${
                              editColor === opt.value
                                ? `ring-2 ring-indigo-600 ${opt.border} scale-105`
                                : 'border-transparent opacity-75 hover:opacity-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={group.id}
                    className="bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 hover:border-slate-300 transition shadow-2xs group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${group.color}`}>
                        {group.name}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        ({guestCount} khách)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(group)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Đổi tên / đổi màu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(group)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title={guestCount > 0 ? `Đang có ${guestCount} khách` : 'Xóa nhóm'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Khôi phục mặc định</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
