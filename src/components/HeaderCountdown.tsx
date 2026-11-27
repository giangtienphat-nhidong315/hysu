import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Sparkles,
  Edit3,
  FileSpreadsheet,
  Share2,
  Monitor,
  Smartphone,
  RefreshCw,
  Tv,
  Palette,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';

interface HeaderCountdownProps {
  onOpenEditProfile: () => void;
  onOpenGoogleSheets: () => void;
  onOpenShare: () => void;
  isWideScreen?: boolean;
  onToggleWideScreen?: () => void;
}

export type HeaderThemeOption = 'white_card' | 'ruby_dark' | 'navy_gold' | 'emerald_luxury';

const HEADER_THEMES: Record<
  HeaderThemeOption,
  {
    name: string;
    shortName: string;
    outerBg: string;
    isLightCard: boolean;
  }
> = {
  white_card: {
    name: '1. Thẻ Trắng Chữ Đậm (Rõ nét nhất)',
    shortName: 'Thẻ Trắng',
    outerBg: 'bg-gradient-to-br from-rose-800 via-rose-700 to-pink-800',
    isLightCard: true,
  },
  ruby_dark: {
    name: '2. Đỏ Rượu Vang Trầm & Vàng Kim',
    shortName: 'Đỏ Trầm',
    outerBg: 'bg-gradient-to-br from-rose-950 via-red-950 to-rose-900',
    isLightCard: false,
  },
  navy_gold: {
    name: '3. Xanh Navy Hoàng Gia & Ánh Kim',
    shortName: 'Xanh Navy',
    outerBg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
    isLightCard: false,
  },
  emerald_luxury: {
    name: '4. Xanh Lục Bảo Trầm Sang Trọng',
    shortName: 'Xanh Ngọc',
    outerBg: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900',
    isLightCard: false,
  },
};

const HEADER_THEME_STORAGE_KEY = 'wedding_header_theme_v1';

export const HeaderCountdown: React.FC<HeaderCountdownProps> = ({
  onOpenEditProfile,
  onOpenGoogleSheets,
  onOpenShare,
  isWideScreen = false,
  onToggleWideScreen,
}) => {
  const { profile, triggerConfetti, sheetConfig, isSyncing, pullFromGoogleSheets } = useWedding();

  const [headerTheme, setHeaderTheme] = useState<HeaderThemeOption>(() => {
    const saved = localStorage.getItem(HEADER_THEME_STORAGE_KEY) as HeaderThemeOption | null;
    return saved && HEADER_THEMES[saved] ? saved : 'white_card';
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleSelectTheme = (themeKey: HeaderThemeOption) => {
    setHeaderTheme(themeKey);
    localStorage.setItem(HEADER_THEME_STORAGE_KEY, themeKey);
    setShowThemeMenu(false);
  };

  const currentTheme = HEADER_THEMES[headerTheme] || HEADER_THEMES.white_card;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const targetStr = `${profile.weddingDate}T${profile.weddingTime || '11:00'}:00`;
      const target = new Date(targetStr).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [profile.weddingDate, profile.weddingTime]);

  const formattedDate = new Date(profile.weddingDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={`relative overflow-hidden ${currentTheme.outerBg} text-white pt-4 pb-5 px-3.5 sm:px-5 rounded-b-3xl shadow-lg transition-colors duration-300`}>
      {/* Decorative subtle glow */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-black/15 rounded-full blur-xl pointer-events-none" />

      {/* Top action row - High contrast buttons */}
      <div className="flex items-center justify-between gap-2 mb-3.5 relative z-20 flex-wrap">
        <div className="flex items-center gap-1.5 text-white bg-black/35 border border-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Hỷ Sự • Ngày Hạnh Phúc</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Nút trạng thái Google Sheets & Tự động đồng bộ 2 chiều */}
          <button
            onClick={onOpenGoogleSheets}
            title={
              isSyncing
                ? 'Đang tự động đồng bộ dữ liệu...'
                : sheetConfig.webhookUrl
                ? `Google Sheet đang kết nối. Lần cuối: ${sheetConfig.lastSyncedAt || ''}`
                : 'Bấm để kết nối Google Sheet'
            }
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer font-bold border ${
              sheetConfig.webhookUrl
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-xs'
                : 'bg-black/40 hover:bg-black/55 text-white border-white/25'
            }`}
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-white' : 'text-emerald-200'}`} />
            <span className="text-[11px] font-bold">
              {isSyncing ? 'Đang lưu...' : sheetConfig.webhookUrl ? 'Đồng bộ 2 chiều' : 'Chưa kết nối'}
            </span>
            {sheetConfig.webhookUrl && !isSyncing && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
            )}
          </button>

          {/* Nút Làm mới ngay lập tức */}
          {sheetConfig.webhookUrl && (
            <button
              onClick={() => pullFromGoogleSheets(undefined, false)}
              disabled={isSyncing}
              title="Lấy dữ liệu mới nhất từ thiết bị khác ngay lập tức"
              className="flex items-center gap-1 text-xs bg-black/35 hover:bg-black/50 text-white border border-white/25 px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer disabled:opacity-50 font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-300' : 'text-amber-300'}`} />
              <span className="text-[11px] hidden sm:inline">Làm mới</span>
            </button>
          )}

          {/* Nút Mở bảng Đồng bộ / Ghép đôi thiết bị */}
          <button
            onClick={onOpenShare}
            title="Đồng bộ dữ liệu PC & Điện thoại, quét mã ghép đôi"
            className="flex items-center gap-1 text-xs bg-black/35 hover:bg-black/50 text-white border border-white/25 px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer font-bold"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] hidden sm:inline">Ghép đôi</span>
          </button>

          {/* Nút Mở Màn hình LED Sân khấu */}
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('mode', 'led');
              window.open(url.toString(), '_blank');
            }}
            title="Mở Màn Hình LED Sân Khấu (Hiệu ứng sao rơi chiếu tiệc cưới)"
            className="flex items-center gap-1 text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer shadow-xs font-extrabold"
          >
            <Tv className="w-3.5 h-3.5 text-slate-900" />
            <span className="text-[11px] hidden sm:inline">Màn LED</span>
          </button>

          {/* Nút Đổi Tông Màu Nền Header (4 Phương Án Dễ Nhìn) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowThemeMenu(prev => !prev)}
              title="Đổi phong cách màu nền & chữ cho dễ nhìn"
              className="flex items-center gap-1 text-xs bg-white text-slate-900 hover:bg-rose-50 px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer shadow-xs font-extrabold"
            >
              <Palette className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-[11px]">{currentTheme.shortName}</span>
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Chọn giao diện hiển thị rõ chữ
                </div>
                {(Object.keys(HEADER_THEMES) as HeaderThemeOption[]).map(key => {
                  const item = HEADER_THEMES[key];
                  const active = headerTheme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectTheme(key)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        active
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{item.name}</span>
                      {active && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md">Đang dùng</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {onToggleWideScreen && (
            <button
              onClick={onToggleWideScreen}
              title={isWideScreen ? 'Chuyển sang khung điện thoại nhỏ' : 'Mở rộng giao diện máy tính (PC)'}
              className="flex items-center gap-1 text-xs bg-black/35 hover:bg-black/50 text-white border border-white/25 px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer font-bold"
            >
              {isWideScreen ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden md:inline text-[11px]">Khung ĐT</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden md:inline text-[11px]">Bản PC</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onOpenEditProfile}
            className="flex items-center gap-1 text-xs bg-black/35 hover:bg-black/50 text-white border border-white/25 px-2.5 py-1 rounded-full transition active:scale-95 cursor-pointer font-bold"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline text-[11px]">Chỉnh sửa</span>
          </button>
        </div>
      </div>

      {/* PHƯƠNG ÁN 1: THẺ NỀN TRẮNG SÁNG - CHỮ ĐẬM SẮC NÉT TUYỆT ĐỐI (MẶC ĐỊNH) */}
      {currentTheme.isLightCard ? (
        <div className="bg-white text-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-xl border border-rose-100 space-y-3 relative z-10">
          {/* Tên Cặp Đôi chữ đậm rõ nét trên nền trắng */}
          <div
            className="text-center cursor-pointer group"
            onClick={() => triggerConfetti()}
          >
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-2.5 flex-wrap">
              <span>{profile.groomName.trim()}</span>
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 fill-rose-600 shrink-0 animate-pulse" />
              <span>{profile.brideName.trim()}</span>
            </h1>
          </div>

          {/* Ngày giờ & Địa điểm tương phản cao */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2 text-xs font-extrabold flex-wrap">
              <div className="flex items-center gap-1.5 bg-rose-50 text-rose-900 border border-rose-200 px-3 py-1.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-950 border border-amber-200 px-3 py-1.5 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-mono">{profile.weddingTime || '11:00'}</span>
              </div>
            </div>

            {profile.venue && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-700 font-bold px-2">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="line-clamp-1">{profile.venue}</span>
              </div>
            )}
          </div>

          {/* Khối Đếm Ngược Tương Phản Cao */}
          <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-inner">
            <div className="text-[10px] text-center font-bold text-amber-300 uppercase tracking-widest mb-2">
              {timeLeft.isPast ? '🎉 Chúc Mừng Ngày Trọng Đại! 🎉' : '⏳ Đếm ngược đến ngày chung đôi'}
            </div>
            {!timeLeft.isPast ? (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/10 border border-white/15 rounded-xl py-2 px-1">
                  <span className="block text-2xl font-black text-white leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold mt-1 block">Ngày</span>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-xl py-2 px-1">
                  <span className="block text-2xl font-black text-white leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold mt-1 block">Giờ</span>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-xl py-2 px-1">
                  <span className="block text-2xl font-black text-white leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold mt-1 block">Phút</span>
                </div>
                <div className="bg-amber-400/20 border border-amber-400/40 rounded-xl py-2 px-1">
                  <span className="block text-2xl font-black text-amber-300 leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-amber-200 font-bold mt-1 block">Giây</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-1.5 text-amber-300 font-bold text-sm">
                Hôm nay là ngày hạnh phúc trăm năm của hai bạn! 💍✨
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PHƯƠNG ÁN 2, 3, 4: NỀN ĐẬM HOÀNG GIA (ĐỎ RƯỢU TRẦM / XANH NAVY / XANH LỤC BẢO) & CHỮ TRẮNG - VÀNG KIM SẮC NÉT */
        <div className="relative z-10 space-y-3">
          <div
            className="text-center my-1 cursor-pointer group"
            onClick={() => triggerConfetti()}
          >
            <h1 className="text-2xl sm:text-3xl font-black tracking-normal text-white flex items-center justify-center gap-2.5 flex-wrap drop-shadow-md">
              <span>{profile.groomName.trim()}</span>
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-rose-500 shrink-0 animate-pulse" />
              <span>{profile.brideName.trim()}</span>
            </h1>
          </div>

          <div className="bg-black/45 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-sm text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-white font-bold text-xs tracking-wide flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-white capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-amber-300 font-mono font-extrabold">{profile.weddingTime || '11:00'}</span>
              </div>
            </div>

            {profile.venue && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-white font-semibold px-2 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="line-clamp-1">{profile.venue}</span>
              </div>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-inner">
            <div className="text-[11px] text-center font-bold text-amber-300 uppercase tracking-wider mb-2">
              {timeLeft.isPast ? '🎉 Chúc Mừng Ngày Trọng Đại! 🎉' : 'Đếm ngược đến ngày chung đôi'}
            </div>
            {!timeLeft.isPast ? (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/15 border border-white/15 rounded-xl py-2 px-1">
                  <span className="block text-2xl font-black text-white leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] text-white/90 font-bold mt-1 block">Ngày</span>
                </div>
                <div className="bg-white/15 border border-white/15 rounded-xl py-2 px-1">
                  <span className="block text-2xl font-black text-white leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-white/90 font-bold mt-1 block">Giờ</span>
                </div>
                <div className="bg-white/15 border border-white/15 rounded-xl py-2 px-1">
                  <span className="block text-2xl font-black text-white leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-white/90 font-bold mt-1 block">Phút</span>
                </div>
                <div className="bg-amber-400/20 border border-amber-300/40 rounded-xl py-2 px-1">
                  <span className="block text-2xl font-black text-amber-300 leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-amber-200 font-bold mt-1 block">Giây</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-amber-300 font-bold text-sm">
                Hôm nay là ngày hạnh phúc trăm năm của hai bạn! 💍✨
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
