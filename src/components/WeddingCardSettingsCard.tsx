import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Image,
  Upload,
  Plus,
  Trash2,
  Play,
  Pause,
  Copy,
  Check,
  Heart,
  Sparkles,
  RefreshCw,
  Eye,
  FileAudio,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { DEFAULT_ALBUM_IMAGES } from '../data/defaultData';
import { resolveAudioUrl, weddingSynth, PRESET_WEDDING_SONGS } from '../utils/weddingAudio';

export const WeddingCardSettingsCard: React.FC = () => {
  const { profile, updateProfile, sheetConfig, syncWithGoogleSheets, triggerConfetti, markLocalEdit } = useWedding();

  const [musicUrl, setMusicUrl] = useState(
    profile.musicUrl && !profile.musicUrl.includes('mixkit.co')
      ? profile.musicUrl
      : '/audio/canon-in-d.wav'
  );
  const [musicTitle, setMusicTitle] = useState(
    profile.musicTitle && !profile.musicUrl?.includes('mixkit.co')
      ? profile.musicTitle
      : 'Canon in D (Pachelbel - Piano & Chuông Lãng Mạn)'
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
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Dọn dẹp âm thanh khi unmount
  useEffect(() => {
    return () => {
      weddingSynth.stop();
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  // Bật / tắt nghe thử nhạc
  const togglePlayPreview = () => {
    if (isPlayingPreview) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      weddingSynth.stop();
      setIsPlayingPreview(false);
      return;
    }

    if (musicUrl === 'builtin:synth') {
      weddingSynth.start(() => setIsPlayingPreview(true));
      return;
    }

    if (audioPreviewRef.current) {
      const resolved = resolveAudioUrl(musicUrl);
      audioPreviewRef.current.src = resolved;
      audioPreviewRef.current.load();
      audioPreviewRef.current
        .play()
        .then(() => {
          setIsPlayingPreview(true);
        })
        .catch(err => {
          console.warn('HTML Audio failed, fallback to Web Audio Synth:', err);
          weddingSynth.start(() => setIsPlayingPreview(true));
        });
    } else {
      weddingSynth.start(() => setIsPlayingPreview(true));
    }
  };

  // Chọn bài hát từ danh sách gợi ý
  const handleSelectPresetSong = (song: (typeof PRESET_WEDDING_SONGS)[0]) => {
    setMusicTitle(song.title);
    setMusicUrl(song.url);

    // Tắt bài cũ
    weddingSynth.stop();
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }

    if (song.url === 'builtin:synth') {
      weddingSynth.start(() => setIsPlayingPreview(true));
    } else if (audioPreviewRef.current) {
      const resolved = resolveAudioUrl(song.url);
      audioPreviewRef.current.src = resolved;
      audioPreviewRef.current.load();
      audioPreviewRef.current
        .play()
        .then(() => setIsPlayingPreview(true))
        .catch(() => {
          weddingSynth.start(() => setIsPlayingPreview(true));
        });
    }
  };

  // Tải file nhạc từ thiết bị (MP3, WAV, M4A)
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setMusicTitle(fileName || 'Nhạc cưới tải lên');

    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setMusicUrl(dataUrl);
        if (audioPreviewRef.current) {
          audioPreviewRef.current.src = dataUrl;
          audioPreviewRef.current
            .play()
            .then(() => setIsPlayingPreview(true))
            .catch(() => {});
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
        src={musicUrl !== 'builtin:synth' ? resolveAudioUrl(musicUrl) : undefined}
        onEnded={() => setIsPlayingPreview(false)}
        onError={() => {
          if (isPlayingPreview) {
            weddingSynth.start(() => setIsPlayingPreview(true));
          }
        }}
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-rose-600" />
            <span>Nhạc Nền Thiệp Cưới (Tự động phát khi khách mở trang):</span>
          </label>

          <div className="flex items-center gap-2">
            {isPlayingPreview && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
                <span className="w-1.5 h-3 bg-rose-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-4 bg-rose-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-2 bg-rose-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                Đang phát thử...
              </span>
            )}
            <button
              type="button"
              onClick={togglePlayPreview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                isPlayingPreview
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingPreview ? 'Dừng nghe thử' : 'Nghe thử nhạc'}</span>
            </button>
          </div>
        </div>

        {/* Gợi ý bài hát có sẵn */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
            Bài hát đám cưới có sẵn (Đã tích hợp sẵn, không bị lỗi mạng):
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_WEDDING_SONGS.map(song => (
              <button
                key={song.id}
                type="button"
                onClick={() => handleSelectPresetSong(song)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer font-bold flex items-center gap-1.5 ${
                  musicUrl === song.url
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>{song.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tùy biến: Tên bài hát & Link/Tải file */}
        <div className="bg-white/80 border border-rose-100 rounded-2xl p-3 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">Tên bài hát hiển thị:</span>
              <input
                type="text"
                value={musicTitle}
                onChange={e => setMusicTitle(e.target.value)}
                placeholder="Ví dụ: Canon in D Piano..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">
                Link file nhạc Audio (.mp3, .wav) hoặc tải từ máy:
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={musicUrl}
                  onChange={e => setMusicUrl(e.target.value)}
                  placeholder="Đường dẫn file .mp3..."
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  title="Tải bài hát từ điện thoại/máy tính"
                >
                  <FileAudio className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Tải tệp</span>
                </button>
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioFileUpload}
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Mẹo: Các bài hát gợi ý ở trên đã được tích hợp sẵn trong ứng dụng nên luôn phát được 100% trên mọi điện thoại của khách mời mà không lo bị chặn mạng.
          </p>
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
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="Dán link ảnh cưới online (https://...)..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm link</span>
            </button>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải ảnh từ máy</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Danh sách ảnh thu nhỏ trong album */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 pt-1">
          {albumImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-rose-200 group bg-slate-100 shadow-2xs"
            >
              <img
                src={imgUrl}
                alt={`Ảnh cưới ${idx + 1}`}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80';
                }}
              />
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-lg hover:bg-rose-700 transition opacity-90 sm:opacity-0 sm:group-hover:opacity-100 shadow-xs cursor-pointer"
                title="Xóa ảnh này"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. LỜI NGỎ THIỆP HỒNG */}
      {/* ============================================================== */}
      <div className="space-y-2 pt-2 border-t border-rose-100">
        <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-rose-600" />
          <span>Lời Ngỏ Thiệp Cưới (Hiển thị đầu trang khách mời):</span>
        </label>
        <textarea
          rows={3}
          value={invitationMessage}
          onChange={e => setInvitationMessage(e.target.value.normalize('NFC'))}
          placeholder="Nhập lời mời thiệp cưới trân trọng gửi đến quý khách..."
          className="w-full bg-white border border-slate-300 rounded-2xl p-3 text-xs sm:text-sm font-sans text-slate-800 focus:outline-none focus:border-rose-500 leading-relaxed shadow-2xs"
          style={{ fontFeatureSettings: 'normal', letterSpacing: 'normal' }}
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 self-center">Mẫu lời ngỏ gợi ý:</span>
          <button
            type="button"
            onClick={() =>
              setInvitationMessage(
                'Hôn nhân là khởi đầu của một hành trình mới. Chúng tôi vô cùng hạnh phúc và trân trọng kính mời Quý khách đến chung vui cùng gia đình chúng tôi trong ngày trọng đại này!'.normalize(
                  'NFC'
                )
              )
            }
            className="text-[11px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition cursor-pointer font-medium"
          >
            Mẫu 1: Truyền thống trang trọng
          </button>
          <button
            type="button"
            onClick={() =>
              setInvitationMessage(
                'Tình yêu là khi hai trái tim cùng chung một nhịp đập. Sự hiện diện và lời chúc phúc của Quý khách là món quà quý giá nhất đối với chúng tôi trong ngày kết đôi!'.normalize(
                  'NFC'
                )
              )
            }
            className="text-[11px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition cursor-pointer font-medium"
          >
            Mẫu 2: Ngọt ngào lãng mạn
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* NÚT LƯU CẤU HÌNH */}
      {/* ============================================================== */}
      <div className="pt-3 border-t border-rose-200/80 flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs text-slate-500 italic">
          * Dữ liệu thiệp cưới được lưu tự động trên thiết bị và đồng bộ Google Sheets khi kết nối.
        </span>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95 cursor-pointer"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Đã lưu thành công!</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 fill-white" />
              <span>Lưu Cài Đặt Thiệp Hồng</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
