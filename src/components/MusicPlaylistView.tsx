import React, { useState } from 'react';
import {
  Music,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  Play,
  Share2,
  X,
  FileSpreadsheet,
  ListMusic,
  HelpCircle,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { MusicItem, MusicPhase } from '../types/wedding';
import { MUSIC_PHASE_LABELS } from '../data/categories';

export const MusicPlaylistView: React.FC = () => {
  const { playlist, addMusicItem, updateMusicItem, deleteMusicItem, toggleMusicPrepared, triggerConfetti } = useWedding();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMusic, setEditingMusic] = useState<MusicItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    phase: 'welcome' as MusicPhase,
    duration: '',
    link: '',
    notes: '',
  });

  const phases = Object.entries(MUSIC_PHASE_LABELS) as [MusicPhase, typeof MUSIC_PHASE_LABELS[MusicPhase]][];

  const filteredPlaylist = playlist.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.artist.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q));

    const matchPhase = selectedPhase === 'all' || item.phase === selectedPhase;

    return matchSearch && matchPhase;
  });

  const preparedCount = playlist.filter(m => m.isPrepared).length;
  const totalCount = playlist.length;
  const percentPrepared = totalCount > 0 ? Math.round((preparedCount / totalCount) * 100) : 0;

  const openAddModal = (presetPhase?: MusicPhase) => {
    setEditingMusic(null);
    setFormData({
      title: '',
      artist: '',
      phase: presetPhase || 'welcome',
      duration: '',
      link: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: MusicItem) => {
    setEditingMusic(item);
    setFormData({
      title: item.title,
      artist: item.artist,
      phase: item.phase,
      duration: item.duration || '',
      link: item.link || '',
      notes: item.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingMusic) {
      updateMusicItem(editingMusic.id, {
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        phase: formData.phase,
        duration: formData.duration.trim(),
        link: formData.link.trim(),
        notes: formData.notes.trim(),
      });
    } else {
      addMusicItem({
        title: formData.title.trim(),
        artist: formData.artist.trim() || 'Nhiều nghệ sĩ',
        phase: formData.phase,
        duration: formData.duration.trim(),
        link: formData.link.trim(),
        notes: formData.notes.trim(),
        isPrepared: false,
      });
      triggerConfetti();
    }

    setIsAddModalOpen(false);
    setEditingMusic(null);
  };

  return (
    <div className="space-y-4">
      {/* Overview Stat Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <ListMusic className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Kế Hoạch Danh Sách Nhạc Cưới</h2>
              <p className="text-[11px] text-purple-200">Giai điệu trọn vẹn theo từng khoảnh khắc tiệc</p>
            </div>
          </div>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Bài Hát</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 relative z-10 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-purple-200 font-medium text-[11px]">
              Tiến độ chuẩn bị file nhạc: <b>{preparedCount}/{totalCount} bài</b>
            </span>
            <span className="text-amber-300 font-bold text-xs">{percentPrepared}%</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentPrepared}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bài hát, ca sĩ, ghi chú..."
            className="w-full bg-white border border-slate-200 pl-9 pr-3 py-2.5 rounded-2xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
          />
        </div>

        {/* Phase Pill Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedPhase === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({totalCount})
          </button>

          {phases.map(([key, info]) => {
            const count = playlist.filter(m => m.phase === key).length;
            const isSelected = selectedPhase === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedPhase(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  isSelected
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{info.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Music Playlist Items */}
      {filteredPlaylist.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-2">
          <Music className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Chưa có bài hát nào trong danh sách</p>
          <p className="text-[11px] text-slate-400">
            Bấm "Thêm Bài Hát" để lên danh sách nhạc theo từng mốc đón khách, cắt bánh hay tiến lễ đường!
          </p>
          <button
            onClick={() => openAddModal()}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm bài hát đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPlaylist.map((music, idx) => {
            const phaseInfo = MUSIC_PHASE_LABELS[music.phase] || MUSIC_PHASE_LABELS.welcome;

            return (
              <div
                key={music.id}
                className={`bg-white rounded-2xl p-3 sm:p-3.5 border transition space-y-2 shadow-2xs hover:shadow-xs ${
                  music.isPrepared ? 'border-emerald-200/90' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleMusicPrepared(music.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                        music.isPrepared
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'border border-slate-300 text-transparent hover:border-slate-400'
                      }`}
                      title={music.isPrepared ? 'Đã chuẩn bị file nhạc' : 'Bấm để đánh dấu đã chuẩn bị'}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${phaseInfo.bgColor} ${phaseInfo.color}`}
                        >
                          {phaseInfo.label}
                        </span>

                        {music.duration && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-medium">
                            <Clock className="w-2.5 h-2.5" /> {music.duration}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-black mt-1 leading-snug truncate ${
                          music.isPrepared ? 'text-slate-900' : 'text-slate-800'
                        }`}
                      >
                        {music.title}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium truncate">
                        Ca sĩ / Thể hiện: <span className="text-slate-700">{music.artist}</span>
                      </p>

                      {music.notes && (
                        <p className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/60 rounded-lg p-1.5 italic mt-1.5">
                          💡 {music.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {music.link && (
                      <a
                        href={music.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition cursor-pointer"
                        title="Mở link bài hát (YouTube/Spotify)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => openEditModal(music)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Xác nhận xóa bài hát "${music.title}"?`)) {
                          deleteMusicItem(music.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Music Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-sm">
                <Music className="w-4 h-4" />
                <span>{editingMusic ? 'Chỉnh Sửa Bài Hát' : 'Thêm Bài Hát Vào Playlist'}</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form-wrapper">
              <div className="modal-scroll-area space-y-3.5 text-xs">
                {/* Tên bài hát */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tên bài hát <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: A Thousand Years, Ngày Đầu Tiên..."
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Ca sĩ & Thời lượng */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nghệ sĩ / Ca sĩ</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Đức Phúc, Christina Perri..."
                      value={formData.artist}
                      onChange={e => setFormData({ ...formData, artist: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Thời lượng (phút:giây)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 3:45"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>

                {/* Giai đoạn phát nhạc trong tiệc cưới */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Giai đoạn phát nhạc trong tiệc cưới
                  </label>
                  <select
                    value={formData.phase}
                    onChange={e => setFormData({ ...formData, phase: e.target.value as MusicPhase })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white font-medium"
                  >
                    {phases.map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.label} — {info.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Link nghe thử (YouTube, Spotify, v.v.) */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Link bài hát (YouTube, Spotify, Zing MP3)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.link}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dán link để chuyển giao cho ban nhạc, DJ hoặc đội âm thanh nhà hàng mở đúng phiên bản.
                  </p>
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ghi chú cho âm thanh / DJ</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Bắt đầu phát khi MC đếm 1 2 3; chỉnh âm lượng vừa phải..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer-actions">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                >
                  {editingMusic ? 'Cập Nhật' : 'Thêm Vào Danh Sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};