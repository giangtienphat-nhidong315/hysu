import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Heart, Sparkles, Edit3, FileSpreadsheet, Share2, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';

interface HeaderCountdownProps {
  onOpenEditProfile: () => void;
  onOpenGoogleSheets: () => void;
  onOpenShare: () => void;
  isWideScreen?: boolean;
  onToggleWideScreen?: () => void;
}

export const HeaderCountdown: React.FC<HeaderCountdownProps> = ({
  onOpenEditProfile,
  onOpenGoogleSheets,
  onOpenShare,
  isWideScreen = false,
  onToggleWideScreen,
}) => {
  const { profile, triggerConfetti, sheetConfig, isSyncing, pullFromGoogleSheets } = useWedding();

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
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white pt-6 pb-6 px-4 rounded-b-3xl shadow-lg">
      {/* Decorative background circles */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

      {/* Top action row */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-1.5 text-rose-100 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
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
                ? `Google Sheet đang kết nối (Tự động kéo dữ liệu mỗi 4s). Lần cuối: ${sheetConfig.lastSyncedAt || ''}`
                : 'Bấm để kết nối Google Sheet'
            }
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition backdrop-blur-md active:scale-95 cursor-pointer ${
              sheetConfig.webhookUrl
                ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-xs'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-white' : 'text-emerald-200'}`} />
            <span className="text-[11px] font-bold">
              {isSyncing ? 'Đang lưu...' : sheetConfig.webhookUrl ? 'Đồng bộ 2 chiều' : 'Chưa kết nối'}
            </span>
            {sheetConfig.webhookUrl && !isSyncing && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </button>

          {/* Nút Làm mới ngay lập tức */}
          {sheetConfig.webhookUrl && (
            <button
              onClick={() => pullFromGoogleSheets(undefined, false)}
              disabled={isSyncing}
              title="Lấy dữ liệu mới nhất từ thiết bị khác ngay lập tức"
              className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full transition backdrop-blur-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-300' : 'text-yellow-300'}`} />
              <span className="text-[11px] font-bold hidden sm:inline">Làm mới</span>
            </button>
          )}

          {/* Nút Mở bảng Đồng bộ / Ghép đôi thiết bị */}
          <button
            onClick={onOpenShare}
            title="Đồng bộ dữ liệu PC & Điện thoại, quét mã ghép đôi"
            className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full transition backdrop-blur-md active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-[11px] font-bold hidden sm:inline">Ghép đôi</span>
          </button>

          {onToggleWideScreen && (
            <button
              onClick={onToggleWideScreen}
              title={isWideScreen ? 'Chuyển sang khung điện thoại nhỏ' : 'Mở rộng giao diện máy tính (PC)'}
              className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full transition backdrop-blur-md active:scale-95"
            >
              {isWideScreen ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-cyan-200" />
                  <span className="hidden md:inline">Khung ĐT</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-cyan-200" />
                  <span className="hidden md:inline">Bản PC</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onOpenEditProfile}
            className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full transition backdrop-blur-md active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </button>
        </div>
      </div>

      {/* Couple Names - Fixed kerning & natural spacing with/without accents */}
      <div
        className="text-center my-2 cursor-pointer group"
        onClick={() => {
          triggerConfetti();
        }}
      >
        <h1 className="text-2xl font-extrabold tracking-normal text-white flex items-center justify-center gap-2 flex-wrap drop-shadow-md">
          <span>{profile.groomName.trim()}</span>
          <Heart className="w-5 h-5 text-yellow-300 fill-rose-300 shrink-0 animate-pulse" />
          <span>{profile.brideName.trim()}</span>
        </h1>
      </div>

      {/* Wedding Date, Time & Venue Badge - High Contrast, Clear & Readable */}
      <div className="bg-black/35 backdrop-blur-md rounded-2xl p-2.5 my-3 border border-white/20 shadow-sm text-center space-y-1.5">
        <div className="flex items-center justify-center gap-2 text-white font-bold text-xs tracking-wide flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-xl shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="text-white drop-shadow-xs capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-xl shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="text-white drop-shadow-xs font-mono">{profile.weddingTime || '11:00'}</span>
          </div>
        </div>

        {profile.venue && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-100 font-medium px-2 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span className="line-clamp-1">{profile.venue}</span>
          </div>
        )}
      </div>

      {/* Countdown Timer Block */}
      <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-inner">
        <div className="text-[11px] text-center font-medium text-rose-100 uppercase tracking-wider mb-2">
          {timeLeft.isPast ? '🎉 Chúc Mừng Ngày Trọng Đại! 🎉' : 'Đếm ngược đến ngày chung đôi'}
        </div>
        {!timeLeft.isPast ? (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/20 rounded-xl py-2 px-1 backdrop-blur-sm">
              <span className="block text-2xl font-extrabold text-white leading-none">
                {timeLeft.days}
              </span>
              <span className="text-[10px] text-rose-100 font-medium">Ngày</span>
            </div>
            <div className="bg-white/20 rounded-xl py-2 px-1 backdrop-blur-sm">
              <span className="block text-2xl font-extrabold text-white leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-rose-100 font-medium">Giờ</span>
            </div>
            <div className="bg-white/20 rounded-xl py-2 px-1 backdrop-blur-sm">
              <span className="block text-2xl font-extrabold text-white leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-rose-100 font-medium">Phút</span>
            </div>
            <div className="bg-white/20 rounded-xl py-2 px-1 backdrop-blur-sm">
              <span className="block text-2xl font-extrabold text-yellow-300 leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-rose-100 font-medium">Giây</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-white font-medium text-sm">
            Hôm nay là ngày hạnh phúc trăm năm của hai bạn! 💍✨
          </div>
        )}
      </div>
    </div>
  );
};
