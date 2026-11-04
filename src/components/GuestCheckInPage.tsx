import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  Send,
  Ticket,
  UtensilsCrossed,
  Users,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  Edit3,
  Phone,
  QrCode,
  Lock,
  Music,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Camera,
  Baby,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { GuestItem } from '../types/wedding';
import { DEFAULT_ALBUM_IMAGES } from '../data/defaultData';

export const GuestCheckInPage: React.FC = () => {
  const { profile, guests, selfCheckInGuest, triggerConfetti } = useWedding();

  // 1. Phân tích tham số mã khách từ URL (hỗ trợ ?mode=checkin&code=001&guest_id=... và hash)
  const [urlParams, setUrlParams] = useState<{ code: string; guestId: string }>({ code: '', guestId: '' });

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let pCode = searchParams.get('code') || '';
      let pGuestId = searchParams.get('guest_id') || searchParams.get('id') || '';

      if (!pCode && window.location.hash.includes('code=')) {
        const match = window.location.hash.match(/[?&#]code=([^&#]+)/);
        if (match) pCode = decodeURIComponent(match[1]);
      }
      if (!pGuestId && (window.location.hash.includes('guest_id=') || window.location.hash.includes('id='))) {
        const match = window.location.hash.match(/[?&#](?:guest_id|id)=([^&#]+)/);
        if (match) pGuestId = decodeURIComponent(match[1]);
      }

      setUrlParams({
        code: pCode.trim(),
        guestId: pGuestId.trim(),
      });
    } catch (e) {
      console.error('Error reading URL params:', e);
    }
  }, []);

  // 2. Tìm khách tương ứng trong danh sách dựa vào guestId hoặc code
  const matchedGuest = guests.find(g => {
    if (urlParams.guestId && g.id === urlParams.guestId) return true;
    if (urlParams.code) {
      if (g.code && g.code.trim().toLowerCase() === urlParams.code.toLowerCase()) return true;
      const gDigits = (g.code || '').replace(/\D/g, '');
      const uDigits = urlParams.code.replace(/\D/g, '');
      if (gDigits && uDigits && parseInt(gDigits, 10) === parseInt(uDigits, 10)) return true;
    }
    return false;
  });

  const [formData, setFormData] = useState({
    code: '',
    guestId: '',
    name: '',
    phone: '',
    wishes: '',
    plusGuests: 0,
    hasKids: false,
    kidsCount: 0,
    isVegetarian: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedInResult, setCheckedInResult] = useState<{
    guest: GuestItem;
    isExisting: boolean;
  } | null>(null);

  // 3. Tự động điền mã khách tham gia & thông tin khách khi quét mã QR (Luôn mở form để khách tự điền)
  useEffect(() => {
    if (matchedGuest) {
      setFormData(prev => ({
        ...prev,
        code: matchedGuest.code || urlParams.code || prev.code,
        guestId: matchedGuest.id,
        name: prev.name ? prev.name : matchedGuest.name,
        phone: prev.phone ? prev.phone : (matchedGuest.phone || ''),
        wishes: prev.wishes ? prev.wishes : (matchedGuest.wishes || ''),
        plusGuests: prev.plusGuests !== 0 ? prev.plusGuests : (matchedGuest.plusGuests || 0),
        hasKids: prev.hasKids !== undefined ? prev.hasKids : Boolean(matchedGuest.hasKids || (matchedGuest.kidsCount && matchedGuest.kidsCount > 0)),
        kidsCount: prev.kidsCount !== 0 ? prev.kidsCount : (matchedGuest.kidsCount || 0),
        isVegetarian: prev.isVegetarian ? prev.isVegetarian : Boolean(matchedGuest.isVegetarian),
      }));
    } else if (urlParams.code) {
      setFormData(prev => ({
        ...prev,
        code: prev.code || urlParams.code,
        guestId: prev.guestId || urlParams.guestId,
      }));
    }
  }, [matchedGuest, urlParams]);

  // ==============================================================
  // NHẠC NỀN THIỆP CƯỚI (BACKGROUND MUSIC)
  // ==============================================================
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(err => {
        console.error('Audio play blocked:', err);
      });
    }
  };

  // Cố gắng phát nhạc khi khách chạm lần đầu vào trang
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlayingMusic) {
        audioRef.current.play().then(() => {
          setIsPlayingMusic(true);
        }).catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isPlayingMusic]);

  // ==============================================================
  // ALBUM ẢNH CƯỚI (WEDDING PHOTO CAROUSEL / SLIDER)
  // ==============================================================
  const albumImages = profile.albumImages && profile.albumImages.length > 0 ? profile.albumImages : DEFAULT_ALBUM_IMAGES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Tự động chuyển slide sau mỗi 4 giây
  useEffect(() => {
    if (albumImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % albumImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [albumImages.length]);

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? albumImages.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % albumImages.length);
  };

  // Xử lý gửi biểu mẫu điểm danh
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    try {
      const codeToSend = formData.code || urlParams.code || (matchedGuest ? matchedGuest.code : undefined);
      const result = selfCheckInGuest({
        name: formData.name,
        phone: formData.phone,
        wishes: formData.wishes,
        isVegetarian: formData.isVegetarian,
        plusGuests: formData.plusGuests,
        hasKids: formData.kidsCount > 0,
        kidsCount: formData.kidsCount,
        code: codeToSend,
        guestId: formData.guestId || (matchedGuest ? matchedGuest.id : undefined),
      });

      setCheckedInResult({
        guest: result.guest,
        isExisting: result.isExisting,
      });
      triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleWishes = [
    'Trăm năm hạnh phúc, đầu bạc răng long! ❤️',
    'Chúc hai bạn luôn yêu thương và thấu hiểu nhau! 🥂',
    'Hôn nhân viên mãn, sớm đón thiên thần nhỏ nhé! 👶',
    'Chúc mừng ngày đại hỷ của hai bạn! 🎉',
    'Vạn sự như ý, gia đạo bình an, phát tài phát lộc! 🧧',
    'Một đời an yên, bên nhau trọn vẹn yêu thương! 💍',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50/60 to-amber-50/40 flex flex-col justify-between py-6 px-3 sm:px-6 font-sans text-slate-800 text-lg sm:text-xl">
      {/* Audio element phát nhạc nền */}
      <audio
        ref={audioRef}
        src={profile.musicUrl || 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-586.mp3'}
        loop
        preload="auto"
      />

      {/* NÚT BẬT / TẮT NHẠC NỀN LƠ LỬNG TRANG TRỌNG */}
      <div className="fixed top-4 right-4 z-50 animate-in fade-in duration-300">
        <button
          type="button"
          onClick={toggleMusic}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border shadow-xl transition-all cursor-pointer ${
            isPlayingMusic
              ? 'bg-rose-600 text-white border-rose-300 ring-4 ring-rose-400/30'
              : 'bg-white/95 text-slate-700 border-rose-200 hover:bg-rose-50'
          }`}
          title={isPlayingMusic ? 'Bấm để tắt nhạc nền' : 'Bấm để bật nhạc cưới lãng mạn'}
        >
          <div className={`w-5 h-5 flex items-center justify-center ${isPlayingMusic ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
            <Music className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold max-w-[120px] truncate">
            {isPlayingMusic ? (profile.musicTitle || 'Nhạc cưới') : 'Phát nhạc'}
          </span>
          {isPlayingMusic ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      <div className="max-w-xl w-full mx-auto space-y-6">

        {/* Header Cưới Sang Trọng & Lộng Lẫy */}
        <header className="text-center pt-2 pb-1">
          <div className="inline-flex items-center justify-center p-3.5 bg-rose-500/10 text-rose-600 rounded-full mb-3 shadow-inner">
            <Heart className="w-9 h-9 fill-rose-500 text-rose-500 animate-pulse" />
          </div>

          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-rose-600 mb-1">
            Thiệp Hồng Báo Hỷ • Mừng Ngày Chung Đôi
          </p>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {profile.groomName} <span className="text-rose-500 font-serif italic font-normal">&</span> {profile.brideName}
          </h1>

          {/* Chi tiết Ngày cưới & Địa điểm với cỡ chữ to, rõ ràng */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-700 font-semibold mt-3.5 flex-wrap">
            {profile.weddingDate && (
              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-rose-200 shadow-2xs">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>{profile.weddingDate}</span>
              </span>
            )}
            {profile.weddingTime && (
              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-rose-200 shadow-2xs">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>{profile.weddingTime}</span>
              </span>
            )}
            {profile.venue && (
              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-rose-200 shadow-2xs">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-[280px]">{profile.venue}</span>
              </span>
            )}
          </div>

          {/* LỜI NGỎ THIỆP CƯỚI TỪ DÂU RỂ */}
          {profile.invitationMessage && (
            <div className="mt-4 p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-rose-200/80 shadow-2xs text-center">
              <p className="text-sm sm:text-base text-rose-950 font-serif italic leading-relaxed">
                "{profile.invitationMessage}"
              </p>
            </div>
          )}
        </header>

        {/* ============================================================== */}
        {/* ALBUM ẢNH CƯỚI (SLIDE ẢNH CHO KHÁCH XEM) */}
        {/* ============================================================== */}
        {albumImages.length > 0 && (
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-rose-100 overflow-hidden space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                  Album Khoảnh Khắc Hạnh Phúc
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Ảnh {currentSlide + 1} / {albumImages.length}
              </span>
            </div>

            {/* Khung trình chiếu ảnh slide */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 group shadow-inner">
              <img
                src={albumImages[currentSlide]}
                alt={`Ảnh cưới ${currentSlide + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300 cursor-pointer select-none"
                onClick={() => setLightboxImage(albumImages[currentSlide])}
              />

              {/* Nút lùi & tiến ảnh */}
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition cursor-pointer"
                title="Ảnh trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition cursor-pointer"
                title="Ảnh tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Nút phóng to ảnh */}
              <button
                type="button"
                onClick={() => setLightboxImage(albumImages[currentSlide])}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Xem ảnh lớn</span>
              </button>
            </div>

            {/* Dải chấm chỉ số (Dots) */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {albumImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? 'w-6 bg-rose-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Xem ảnh ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MÀN HÌNH 1: THÀNH CÔNG - THẺ VÉ MAY MẮN & BÀN TIỆC */}
        {/* ============================================================== */}
        {checkedInResult ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-rose-200 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-600 block mb-1">
                ✓ XÁC NHẬN ĐIỂM DANH THÀNH CÔNG
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
                Kính Chào Quý Khách!
              </h2>
              <p className="text-base sm:text-xl text-slate-700 font-bold mt-2">
                Hân hoan chào đón <span className="text-rose-600 underline underline-offset-4">{checkedInResult.guest.name}</span> đã đến chung vui cùng gia đình chúng tôi!
              </p>
            </div>

            {/* VỊ TRÍ BÀN TIỆC CỦA KHÁCH */}
            {checkedInResult.guest.tableNumber ? (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-center shadow-xs">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-800 block mb-1">
                  🍽️ VỊ TRÍ BÀN TIỆC CỦA BẠN
                </span>
                <div className="text-2xl sm:text-3xl font-black text-rose-700">
                  {checkedInResult.guest.tableNumber}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Kính mời Quý khách di chuyển đến vị trí bàn trên để ổn định chỗ ngồi và thưởng thức tiệc cưới.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center">
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  🍽️ Đội ngũ lễ tân tại sảnh sẽ hân hạnh đón tiếp và hướng dẫn vị trí bàn tiệc phù hợp nhất cho Quý khách!
                </p>
              </div>
            )}

            {/* THẺ VÉ MAY MẮN (GOLDEN LUCKY PASS) CHO PHẦN BỐC THĂM MINI GAME */}
            <div className="bg-gradient-to-br from-amber-400 via-rose-500 to-pink-600 p-1 rounded-3xl shadow-xl">
              <div className="bg-white rounded-[22px] p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
                </div>

                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-rose-600 block mb-1">
                  🎟️ MÃ SỐ BỐC THĂM MAY MẮN
                </span>

                <div className="text-5xl sm:text-7xl font-mono font-black text-slate-900 tracking-wider my-3 drop-shadow-xs">
                  #{checkedInResult.guest.luckyNumber || checkedInResult.guest.code}
                </div>

                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 mt-2">
                  <p className="text-xs sm:text-base text-slate-700 font-semibold leading-relaxed">
                    Quý khách vui lòng <b>giữ mã số này</b> hoặc <b>chụp ảnh màn hình</b> để tham gia phần <b>Bốc Thăm Trúng Thưởng & Mini Game</b> diễn ra trong tiệc cưới!
                  </p>
                </div>
              </div>
            </div>

            {/* Lời chúc mừng đã gửi */}
            {checkedInResult.guest.wishes && (
              <div className="bg-rose-50/80 p-4 sm:p-5 rounded-2xl text-left border border-rose-200/80 shadow-2xs">
                <span className="text-xs sm:text-sm font-bold text-rose-600 block mb-1 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Lời chúc của bạn gửi đến đôi uyên ương:</span>
                </span>
                <p className="text-sm sm:text-base text-slate-800 italic font-serif leading-relaxed">
                  "{checkedInResult.guest.wishes}"
                </p>
              </div>
            )}

            {/* Nút hành động bổ sung */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCheckedInResult(null);
                  setFormData({
                    code: '',
                    guestId: '',
                    name: '',
                    phone: '',
                    wishes: '',
                    plusGuests: 0,
                    hasKids: false,
                    kidsCount: 0,
                    isVegetarian: false,
                  });
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm sm:text-base transition cursor-pointer"
              >
                + Điểm danh cho người thân đi cùng
              </button>

              <button
                type="button"
                onClick={() => setCheckedInResult(null)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm sm:text-base transition border border-rose-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa thông tin / Gửi thêm lời chúc</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* MÀN HÌNH 2: FORM ĐIỂN THÔNG TIN ĐIỂM DANH CHO KHÁCH */
          /* ============================================================== */
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 space-y-6">

            {/* Thông báo chào đón nếu đã tự nhận diện được khách từ mã QR cá nhân */}
            {matchedGuest && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-rose-50 p-4 sm:p-5 rounded-2xl border-2 border-emerald-300 shadow-xs flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-xs shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-800 block">
                    ✓ ĐÃ NHẬN DIỆN MÃ QR THIỆP MỜI
                  </span>
                  <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">
                    Kính chào: <span className="text-rose-600">{matchedGuest.name}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Mã khách tham gia: <b className="font-mono text-slate-900">#{matchedGuest.code || urlParams.code}</b>
                    {matchedGuest.tableNumber && (
                      <span className="ml-2 font-bold text-emerald-700">• Bàn tiệc: {matchedGuest.tableNumber}</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Tiêu đề mục điểm danh */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shadow-inner">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Điểm Danh Tham Dự Tiệc Cưới
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Quý khách vui lòng kiểm tra thông tin để nhận <b>Mã Số Bốc Thăm Trúng Thưởng</b>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* 1. MÃ KHÁCH THAM GIA / THIỆP CƯỚI (Khóa cố định không cho sửa để tránh sai sót) */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-rose-600" />
                    <span>Mã khách tham gia (Cố định theo mã QR):</span>
                  </label>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-600 bg-slate-200/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Mã cố định</span>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-black text-rose-500 text-lg sm:text-xl">
                    #
                  </span>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formData.code || urlParams.code || 'TỰ ĐỘNG CẤP KHI GỬI'}
                    className="w-full bg-slate-100/90 border-2 border-slate-300 rounded-xl pl-9 pr-10 py-3 sm:py-3.5 font-mono text-base sm:text-xl font-black text-rose-700 cursor-not-allowed select-none focus:outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <span>Mã này được trích xuất tự động và khóa cố định theo mã QR thiệp mời của Quý khách để tránh sai sót nhầm lẫn.</span>
                </p>
              </div>

              {/* 2. HỌ VÀ TÊN KHÁCH MỜI */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5">
                  Họ và tên của Quý khách <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A (Bạn chú rể)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border-2 border-slate-300 rounded-2xl px-4 py-3.5 sm:py-4 text-base sm:text-xl font-bold text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 focus:outline-none shadow-xs"
                />
              </div>

              {/* 3. SỐ ĐIỆN THOẠI */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>Số điện thoại của Quý khách</span>
                  </span>
                  <span className="text-xs text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912 345 678"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border-2 border-slate-300 rounded-2xl px-4 py-3 sm:py-3.5 text-base sm:text-lg font-mono text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 focus:outline-none"
                />
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  Dùng để ban tổ chức đối chiếu khi trao giải thưởng bốc thăm may mắn.
                </p>
              </div>

              {/* 4. SỐ NGƯỜI LỚN CÙNG THAM DỰ (Nút bấm to bản dễ bấm) */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Số người lớn cùng đi với Quý khách:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 0, label: 'Đi 1 mình' },
                    { val: 1, label: 'Đi 2 người (+1)' },
                    { val: 2, label: 'Đi 3 người (+2)' },
                    { val: 3, label: 'Đi 4 người (+3)' },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, plusGuests: item.val })}
                      className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition text-center cursor-pointer ${
                        formData.plusGuests === item.val
                          ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. CÓ TRẺ EM ĐI CÙNG KHÔNG? */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-amber-600" />
                    <span>Có trẻ em / em bé đi cùng không?</span>
                  </label>
                  {formData.kidsCount > 0 && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      {formData.kidsCount} bé đi cùng
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 0, label: '❌ Không có bé' },
                    { val: 1, label: '👶 Có 1 bé' },
                    { val: 2, label: '👶 Có 2 bé' },
                    { val: 3, label: '👶 3 bé trở lên' },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, kidsCount: item.val, hasKids: item.val > 0 })}
                      className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition text-center cursor-pointer ${
                        formData.kidsCount === item.val
                          ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs'
                          : 'bg-white border-amber-200/70 text-slate-700 hover:bg-amber-50/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] sm:text-xs text-amber-800/80 mt-1.5">
                  (Thông tin giúp nhà hàng và ban tổ chức chuẩn bị sẵn ghế trẻ em và quà tặng nhỏ chu đáo).
                </p>
              </div>

              {/* 6. KHẨU PHẦN ĂN TIỆC CƯỚI (2 thẻ lớn trực quan) */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-slate-500" />
                  <span>Lựa chọn khẩu phần ăn tiệc:</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVegetarian: false })}
                    className={`py-3.5 sm:py-4 px-3 rounded-2xl border-2 transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      !formData.isVegetarian
                        ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-2 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">🍖</span>
                    <span className="text-sm sm:text-base font-extrabold">Suất Tiệc Mặn</span>
                    <span className="text-[10px] sm:text-xs text-slate-500">Món ngon truyền thống</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVegetarian: true })}
                    className={`py-3.5 sm:py-4 px-3 rounded-2xl border-2 transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      formData.isVegetarian
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">🥗</span>
                    <span className="text-sm sm:text-base font-extrabold">Suất Ăn Chay</span>
                    <span className="text-[10px] sm:text-xs text-slate-500">Thanh đạm, thanh tịnh</span>
                  </button>
                </div>
              </div>

              {/* 7. GỬI LỜI CHÚC MỪNG TRĂM NĂM */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Gửi lời chúc mừng đến cô dâu & chú rể</span>
                  </span>
                  <span className="text-xs text-rose-500 font-semibold">Tấm lòng của bạn</span>
                </label>

                <textarea
                  rows={3}
                  placeholder="Gửi gắm những lời chúc ngọt ngào và tốt đẹp nhất..."
                  value={formData.wishes}
                  onChange={e => setFormData({ ...formData, wishes: e.target.value })}
                  className="w-full bg-white border-2 border-slate-300 rounded-2xl px-4 py-3 text-sm sm:text-base text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 focus:outline-none"
                />

                {/* Các nút gợi ý lời chúc nhanh to, dễ bấm */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sampleWishes.map((txt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, wishes: txt })}
                      className="text-xs sm:text-sm bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 transition font-medium cursor-pointer"
                    >
                      {txt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. NÚT XÁC NHẬN ĐIỂM DANH SIÊU TO */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="w-full mt-4 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white py-4 sm:py-5 px-6 rounded-2xl font-black text-lg sm:text-2xl shadow-xl transition active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Send className="w-6 h-6 shrink-0" />
                <span>
                  {isSubmitting ? 'Đang gửi thông tin...' : 'XÁC NHẬN ĐIỂM DANH & NHẬN SỐ MAY MẮN'}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* Footer Thiệp Cưới */}
        <footer className="text-center text-xs sm:text-sm text-slate-500 pb-6 pt-2">
          <p className="font-semibold text-rose-700">
            Hỷ Sự • Trân trọng từng khoảnh khắc đáng nhớ trong ngày cưới
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Chúc Quý khách có một buổi tiệc thật ngon miệng và tràn ngập niềm vui!
          </p>
        </footer>
      </div>

      {/* ============================================================== */}
      {/* MODAL PHÓNG TO ẢNH (LIGHTBOX) */}
      {/* ============================================================== */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Ảnh cưới phóng to"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
