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
  Loader2,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_ALBUM_IMAGES } from '../data/defaultData';
import {
  resolvePlayableAudioUrl,
  saveCustomAudioBlob,
  PRESET_WEDDING_SONGS,
} from '../utils/weddingAudio';

export const WeddingCardSettingsCard: React.FC = () => {
  const { profile, updateProfile, sheetConfig, syncWithGoogleSheets, triggerConfetti, markLocalEdit } = useWedding();
  const toast = useToast();

  const [musicUrl, setMusicUrl] = useState(
    profile.musicUrl && !profile.musicUrl.includes('mixkit.co') && !profile.musicUrl.endsWith('.wav')
      ? profile.musicUrl
      : '/audio/romantic-wedding-piano.mp3'
  );
  const [musicTitle, setMusicTitle] = useState(
    profile.musicTitle && !profile.musicUrl?.includes('mixkit.co') && !profile.musicUrl?.endsWith('.wav')
      ? profile.musicTitle
      : 'Romantic Wedding Piano (Acoustic nhẹ nhàng du dương)'
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
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Dọn dẹp âm thanh khi unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  // Bật / tắt nghe thử nhạc
  const togglePlayPreview = async () => {
    const audio = audioPreviewRef.current;
    if (!audio) return;

    if (isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
      return;
    }

    try {
      setIsAudioLoading(true);
      const playable = await resolvePlayableAudioUrl(musicUrl);
      if (audio.src !== playable) {
        audio.src = playable;
      }
      await audio.play();
      setIsPlayingPreview(true);
    } catch (err) {
      console.warn('Lỗi khi nghe thử nhạc:', err);
      setIsPlayingPreview(false);
      toast.warning('Chưa thể phát âm thanh', 'Vui lòng chạm lại nút "Nghe thử nhạc" để cấp quyền phát âm thanh.');
    } finally {
      setIsAudioLoading(false);
    }
  };

  // Chọn bài hát từ danh sách gợi ý có sẵn
  const handleSelectPresetSong = async (song: (typeof PRESET_WEDDING_SONGS)[0]) => {
    setMusicTitle(song.title);
    setMusicUrl(song.url);

    const audio = audioPreviewRef.current;
    if (audio) {
      audio.pause();
      setIsPlayingPreview(false);
      try {
        setIsAudioLoading(true);
        const playable = await resolvePlayableAudioUrl(song.url);
        audio.src = playable;
        await audio.play();
        setIsPlayingPreview(true);
        toast.info('Đã chọn bài hát mẫu', `Đang phát bài: ${song.title}`);
      } catch (err) {
        console.warn('Lỗi phát nhạc preset:', err);
      } finally {
        setIsAudioLoading(false);
      }
    }
  };

  // Tải file nhạc từ thiết bị (MP3, WAV, M4A, AAC)
  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng âm thanh
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name)) {
      toast.warning(
        'Định dạng không hỗ trợ',
        'Vui lòng chọn file âm thanh hợp lệ (.mp3, .wav, .m4a, .aac, .ogg).'
      );
      e.target.value = '';
      return;
    }

    const title = file.name.replace(/\.[^/.]+$/, '');
    setMusicTitle(title || 'Nhạc cưới đã tải lên');
    setMusicUrl('indexeddb:custom_wedding_music');

    try {
      setIsAudioLoading(true);
      // 1. Lưu an toàn vào IndexedDB & RAM (tránh tràn 5MB LocalStorage)
      await saveCustomAudioBlob(file, file.name);

      // 2. Tạo Blob URL trực tiếp để nghe thử ngay tức thì
      const blobUrl = URL.createObjectURL(file);
      const audio = audioPreviewRef.current;
      if (audio) {
        audio.pause();
        audio.src = blobUrl;
        audio.load();
        audio.play().catch(() => {
          // Trình duyệt có thể cần tương tác click của người dùng
        });
        setIsPlayingPreview(true);
      }

      toast.success(
        'Tải nhạc thành công!',
        `Bài hát "${title}" đã được lưu vào hệ thống và sẵn sàng phát.`
      );
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3500);
    } catch (err) {
      console.error('Lỗi khi tải file nhạc:', err);
      toast.error(
        'Không thể lưu bài hát',
        'Có lỗi khi xử lý tệp tin trên thiết bị. Bạn có thể thử lại với file .mp3 thông thường.'
      );
    } finally {
      setIsAudioLoading(false);
      e.target.value = '';
    }
  };

  // Thêm ảnh từ URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setAlbumImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    toast.success('Đã thêm ảnh', 'Ảnh mới đã được thêm vào album cưới.');
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

    toast.success('Đã tải ảnh lên', `Đã thêm ${files.length} ảnh cưới vào album.`);
    e.target.value = '';
  };

  // Xóa ảnh khỏi album
  const handleRemoveImage = (index: number) => {
    setAlbumImages(prev => prev.filter((_, idx) => idx !== index));
    toast.info('Đã xóa ảnh', 'Đã xóa ảnh được chọn khỏi album cưới.');
  };

  // Khôi phục 5 ảnh mẫu mặc định
  const handleResetDefaultImages = async () => {
    const confirmed = await toast.confirm({
      title: 'Khôi Phục Album Ảnh Mẫu?',
      message: 'Hành động này sẽ thay thế danh sách ảnh hiện tại bằng bộ 5 ảnh cưới mẫu mặc định.',
      confirmText: 'Khôi phục ngay',
      cancelText: 'Hủy',
    });
    if (confirmed) {
      setAlbumImages(DEFAULT_ALBUM_IMAGES);
      toast.success('Đã khôi phục album mẫu', 'Bộ ảnh mẫu cưới mặc định đã sẵn sàng.');
    }
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
    toast.success(
      'Đã Lưu Cài Đặt Thiệp Hồng!',
      'Nhạc nền, album ảnh cưới và lời ngỏ đã được lưu thành công.'
    );
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
    toast.info(
      'Đã Sao Chép Liên Kết',
      'Đường dẫn trang thiệp khách mời đã được lưu vào bộ nhớ tạm.'
    );
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-rose-50/70 via-white to-pink-50/60 border-2 border-rose-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Thẻ audio ẩn phục vụ nghe thử (quản lý bằng ref, không bind src trực tiếp để tránh ngắt React render) */}
      <audio
        ref={audioPreviewRef}
        onPlay={() => setIsPlayingPreview(true)}
        onPause={() => setIsPlayingPreview(false)}
        onEnded={() => setIsPlayingPreview(false)}
        onError={() => setIsPlayingPreview(false)}
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
            <span>Nhạc Nền Thiệp Cưới (Phát khi khách mở trang thiệp):</span>
          </label>

          <div className="flex items-center gap-2">
            {isPlayingPreview && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 animate-pulse">
                <span className="w-1.5 h-3 bg-rose-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-4 bg-rose-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-2 bg-rose-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                Đang phát nhạc...
              </span>
            )}
            <button
              type="button"
              disabled={isAudioLoading}
              onClick={togglePlayPreview}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                isPlayingPreview
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              {isAudioLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : isPlayingPreview ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Dừng nghe thử</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Nghe thử nhạc</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gợi ý bài hát có sẵn */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
            Gợi ý bài hát đám cưới mẫu (File MP3 Studio nhẹ nhàng & ngọt ngào):
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

        {/* Tùy biến: Tên bài hát & Tải file từ máy / Link trực tuyến */}
        <div className="bg-white/90 border border-rose-100 rounded-2xl p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">Tên bài hát hiển thị:</span>
              <input
                type="text"
                value={musicTitle}
                onChange={e => setMusicTitle(e.target.value)}
                placeholder="Ví dụ: Until I Found You, Beautiful in White..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">
                Tải bài hát từ thiết bị (.mp3, .wav, .m4a):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isAudioLoading}
                  onClick={() => audioFileInputRef.current?.click()}
                  className="flex-1 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileAudio className="w-4 h-4 text-rose-600" />
                  <span>{musicUrl.startsWith('indexeddb:') ? 'Chọn file nhạc khác từ máy' : 'Chọn tệp nhạc từ điện thoại / máy tính'}</span>
                </button>
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                  className="hidden"
                  onChange={handleAudioFileUpload}
                />
              </div>
            </div>
          </div>

          {/* Trạng thái bài hát tải lên */}
          {uploadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ Đã tải bài hát từ thiết bị thành công và đang phát thử!</span>
            </div>
          )}

          {musicUrl.startsWith('indexeddb:') && !uploadSuccess && (
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Đang sử dụng bài hát bạn đã tải lên từ máy: <b>{musicTitle}</b></span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 italic space-y-0.5">
            <p>• Bạn có thể tải bài hát cô dâu chú rể yêu thích trực tiếp từ máy (hệ thống lưu trữ an toàn bằng IndexedDB và bộ nhớ máy, không giới hạn dung lượng).</p>
            <p>• Hoặc chọn các bài hát mẫu chuẩn phòng thu có sẵn ở trên để phát ngay lập tức trên mọi thiết bị.</p>
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
            onClick={() => {
              setInvitationMessage(
                'Hôn nhân là khởi đầu của một hành trình mới. Chúng tôi vô cùng hạnh phúc và trân trọng kính mời Quý khách đến chung vui cùng gia đình chúng tôi trong ngày trọng đại này!'.normalize(
                  'NFC'
                )
              );
              toast.info('Đã chọn mẫu lời ngỏ', 'Mẫu 1: Truyền thống trang trọng');
            }}
            className="text-[11px] px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition cursor-pointer font-medium"
          >
            Mẫu 1: Truyền thống trang trọng
          </button>
          <button
            type="button"
            onClick={() => {
              setInvitationMessage(
                'Tình yêu là khi hai trái tim cùng chung một nhịp đập. Sự hiện diện và lời chúc phúc của Quý khách là món quà quý giá nhất đối với chúng tôi trong ngày kết đôi!'.normalize(
                  'NFC'
                )
              );
              toast.info('Đã chọn mẫu lời ngỏ', 'Mẫu 2: Ngọt ngào lãng mạn');
            }}
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
