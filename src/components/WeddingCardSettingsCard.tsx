import React, { useState, useRef } from 'react';
import {
  Music,
  Image,
  Upload,
  Plus,
  Trash2,
  Play,
  Pause,
  ExternalLink,
  Copy,
  Check,
  Heart,
  Sparkles,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { DEFAULT_ALBUM_IMAGES } from '../data/defaultData';

export const WeddingCardSettingsCard: React.FC = () => {
  const { profile, updateProfile, sheetConfig, syncWithGoogleSheets, triggerConfetti, markLocalEdit } = useWedding();

  const [musicUrl, setMusicUrl] = useState(
    profile.musicUrl || 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-586.mp3'
  );
  const [musicTitle, setMusicTitle] = useState(
    profile.musicTitle || 'Wedding Waltz Piano (Nhạc cưới lãng mạn)'
  );
  const [invitationMessage, setInvitationMessage] = useState(
    profile.invitationMessage ||
      'Hôn nhân là khởi đầu của một hành trình mới. Chúng tôi vô cùng hạnh phúc và trân trọng kính mời Quý khách đến chung vui cùng gia đình chúng tôi trong ngày trọng đại này!'
  );
  const [albumImages, setAlbumImages] = useState<string[]>(
    profile.albumImages && profile.albumImages.length > 0 ? profile.albumImages : DEFAULT_ALBUM_IMAGES
  );

  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Danh sách nhạc cưới gợi ý phổ biến
  const PRESET_SONGS = [
    {
      title: 'Wedding Waltz Piano (Mixkit - Khuyên dùng)',
      url: 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-586.mp3',
    },
    {
      title: 'Romantic Wedding Piano (Acoustic nhẹ nhàng)',
      url: 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-piano-123.mp3',
    },
    {
      title: 'Love Story Piano (Trữ tình lãng mạn)',
      url: 'https://assets.mixkit.co/music/preview/mixkit-loving-memories-545.mp3',
    },
  ];

  // Bật / tắt nghe thử nhạc
  const togglePlayPreview = () => {
    if (!audioPreviewRef.current) return;
    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(err => {
        console.error('Audio play error:', err);
      });
    }
  };

  // Chọn bài hát từ danh sách gợi ý
  const handleSelectPresetSong = (song: { title: string; url: string }) => {
    setMusicTitle(song.title);
    setMusicUrl(song.url);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.src = song.url;
      audioPreviewRef.current.play().then(() => setIsPlayingPreview(true)).catch(() => {});
    }
  };

  // Thêm ảnh từ URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setAlbumImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  // Tải ảnh từ máy tính / điện thoại
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        const result = event.target?.result as string;
        if (result) {
          setAlbumImages(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Xóa ảnh khỏi album
  const handleRemoveImage = (index: number) => {
    setAlbumImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Khôi phục 5 ảnh mẫu mặc định
  const handleResetDefaultImages = () => {
    setAlbumImages(DEFAULT_ALBUM_IMAGES);
  };

  // Lưu cấu hình thiệp hồng
  const handleSave = () => {
    markLocalEdit();
    const updated = {
      ...profile,
      musicUrl: musicUrl.trim(),
      musicTitle: musicTitle.trim(),
      invitationMessage: invitationMessage.trim(),
      albumImages: albumImages.length > 0 ? albumImages : DEFAULT_ALBUM_IMAGES,
    };

    updateProfile(updated);
    triggerConfetti();

    if (sheetConfig.webhookUrl) {
      syncWithGoogleSheets(true, true);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Lấy URL trang khách mời
  const getGuestCheckInUrl = () => {
    const origin = window.location.origin.includes('github.io')
      ? 'https://giangtienphat-nhidong315.github.io/hysu/'
      : `${window.location.origin}${window.location.pathname}`;
    const cleanBase = origin.endsWith('/') ? origin : `${origin}/`;
    return `${cleanBase}?mode=checkin`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getGuestCheckInUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-rose-50/70 via-white to-pink-50/60 border-2 border-rose-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Thẻ audio ẩn phục vụ nghe thử */}
      <audio
        ref={audioPreviewRef}
        src={musicUrl}
        onEnded={() => setIsPlayingPreview(false)}
      />

      {/* Header phần cài đặt thiệp hồng */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-rose-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-xs">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
              Cài Đặt Thiệp Hồng & Trang Khách Mời
            </h2>
            <p className="text-xs text-rose-700">
              Tùy chỉnh Nhạc Nền, Album Ảnh Cưới (Slide) & Lời Ngỏ thiệp cưới cho khách
            </p>
          </div>
        </div>

        {/* Nút xem thử & sao chép link trang khách */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Sao chép link trang khách"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Đã sao chép' : 'Sao chép link'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.open(getGuestCheckInUrl(), '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="Mở xem thử trải nghiệm của khách mời"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem thử trang khách</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. CÀI ĐẶT NHẠC NỀN THIỆP CƯỚI */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-rose-600" />
            <span>Nhạc Nền Thiệp Cưới (Phát khi khách mở trang):</span>
          </label>

          <button
            type="button"
            onClick={togglePlayPreview}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              isPlayingPreview
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-rose-100/80 text-rose-700 hover:bg-rose-200/80'
            }`}
          >
            {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingPreview ? 'Dừng nghe thử' : 'Nghe thử nhạc'}</span>
          </button>
        </div>

        {/* Tên bài hát & Link file mp3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">Tên bài hát hiển thị:</span>
            <input
              type="text"
              value={musicTitle}
              onChange={e => setMusicTitle(e.target.value)}
              placeholder="Ví dụ: Wedding Waltz Piano..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">Đường dẫn file Audio (.mp3):</span>
            <input
              type="url"
              value={musicUrl}
              onChange={e => setMusicUrl(e.target.value)}
              placeholder="https://...file.mp3"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Gợi ý bài hát có sẵn */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Gợi ý bài hát đám cưới lãng mạn có sẵn:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SONGS.map((song, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPresetSong(song)}
                className={`text-xs px-2.5 py-1 rounded-xl border transition cursor-pointer font-medium ${
                  musicUrl === song.url
                    ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                    : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                }`}
              >
                ♪ {song.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CÀI ĐẶT ALBUM ẢNH CƯỚI (SLIDE CHO KHÁCH XEM) */}
      {/* ============================================================== */}
      <div className="space-y-3 pt-2 border-t border-rose-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Image className="w-4 h-4 text-rose-600" />
            <span>Album Ảnh Cưới (Slide trình chiếu cho khách xem - {albumImages.length} ảnh):</span>
          </label>

          <button
            type="button"
            onClick={handleResetDefaultImages}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Khôi phục ảnh mẫu mặc định</span>
          </button>
        </div>

        {/* Thêm ảnh bằng URL hoặc tải từ thiết bị */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="url"
              placeholder="Dán link ảnh cưới (https://...)"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              disabled={!newImageUrl.trim()}
              className="bg-slate-900 hover:bg-black disabled:opacity-40 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm URL</span>
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải ảnh từ máy / điện thoại</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Danh sách ảnh thu nhỏ trong album */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 pt-1">
          {albumImages.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-100"
            >
              <img
                src={img}
                alt={`Ảnh ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg opacity-90 transition cursor-pointer"
                title="Xóa ảnh này"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. LỜI NGỎ THIỆP HỒNG CHÀO ĐÓN KHÁCH */}
      {/* ============================================================== */}
      <div className="space-y-2 pt-2 border-t border-rose-100">
        <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Lời Ngỏ Thiệp Hồng (Hiển thị trang trọng trên trang khách):</span>
        </label>
        <textarea
          rows={3}
          value={invitationMessage}
          onChange={e => setInvitationMessage(e.target.value.normalize ? e.target.value.normalize('NFC') : e.target.value)}
          placeholder="Nhập câu lời ngỏ mời cưới ngọt ngào gửi gắm đến khách mời..."
          className="w-full bg-white border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm text-slate-800 font-sans tracking-normal leading-relaxed focus:outline-none focus:border-rose-500"
        />

        {/* Mẫu lời ngỏ chọn nhanh chuẩn tiếng Việt */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 block">Gợi ý mẫu lời ngỏ chuẩn (Bấm để chọn ngay):</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {[
              'Hôn nhân là khởi đầu của một hành trình mới. Chúng tôi vô cùng hạnh phúc và trân trọng kính mời Quý khách đến chung vui cùng gia đình chúng tôi trong ngày trọng đại này!',
              'Tình yêu đơm hoa kết trái trong sự chúc phúc của hai bên gia đình. Trân trọng kính mời Quý khách đến nâng ly rượu mừng cùng chúng tôi!',
              'Ngày vui của chúng tôi sẽ trọn vẹn và ấm áp hơn khi có sự hiện diện và những lời chúc tốt đẹp của Quý khách!',
              'Hân hoan chào đón Quý khách đến chia vui cùng đôi uyên ương trong ngày hạnh phúc trăm năm!',
            ].map((msg, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInvitationMessage(msg)}
                className={`text-left p-2.5 rounded-xl border text-[11px] sm:text-xs transition cursor-pointer font-sans leading-relaxed ${
                  invitationMessage === msg
                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-semibold shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                “{msg}”
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* NÚT LƯU THAY ĐỔI */}
      {/* ============================================================== */}
      <div className="pt-2 flex items-center justify-between border-t border-rose-200/70">
        <span className="text-xs text-slate-500">
          * Dữ liệu cài đặt sẽ được tự động lưu vào máy và đồng bộ lên Google Sheets.
        </span>

        <button
          type="button"
          onClick={handleSave}
          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          {saveSuccess ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4 fill-white" />}
          <span>{saveSuccess ? 'Đã Lưu Cài Đặt!' : 'Lưu Cài Đặt Thiệp Hồng'}</span>
        </button>
      </div>
    </div>
  );
};
