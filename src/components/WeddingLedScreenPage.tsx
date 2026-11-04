import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Settings,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Music,
  Heart,
  Palette,
  Layers,
  Sliders,
  Type,
  X,
  Tv,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { useToast } from '../context/ToastContext';
import { resolvePlayableAudioUrl, resolveAudioUrl } from '../utils/weddingAudio';

export type LedTheme = 'galaxy' | 'champagne' | 'ruby' | 'gold' | 'emerald';
export type LedAspectRatio = '16:9' | '21:9' | '9:16';
export type LedFont = 'serif' | 'script' | 'sans';

interface LedScreenSettings {
  ceremonyTitle: string;
  groomName: string;
  brideName: string;
  groomParents: string;
  brideParents: string;
  weddingDate: string;
  lunarDate: string;
  weddingTime: string;
  venue: string;
  hallName: string;
  loveQuote: string;
  theme: LedTheme;
  starSpeed: 'slow' | 'normal' | 'fast';
  starDensity: 'low' | 'normal' | 'high';
  fontFamily: LedFont;
  aspectRatio: LedAspectRatio;
  showLunarDate: boolean;
  showParents: boolean;
  showVenue: boolean;
  showQuote: boolean;
  showMonogram: boolean;
  showTime: boolean;
}

const STORAGE_KEY_LED = 'wedding_led_screen_config_v1';

export const WeddingLedScreenPage: React.FC = () => {
  const { profile } = useWedding();
  const toast = useToast();

  // 1. Cấu hình màn hình LED
  const [config, setConfig] = useState<LedScreenSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LED);
    if (saved) {
      try {
        return {
          ...JSON.parse(saved),
          groomName: JSON.parse(saved).groomName || profile.groomName,
          brideName: JSON.parse(saved).brideName || profile.brideName,
          weddingDate: JSON.parse(saved).weddingDate || profile.weddingDate,
          venue: JSON.parse(saved).venue || profile.venue,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      ceremonyTitle: 'LỄ THÀNH HÔN',
      groomName: profile.groomName || 'Quốc Bảo',
      brideName: profile.brideName || 'Mai Linh',
      groomParents: 'Ông Nguyễn Văn A & Bà Trần Thị B',
      brideParents: 'Ông Lê Văn C & Bà Phạm Thị D',
      weddingDate: profile.weddingDate || '2026-11-20',
      lunarDate: 'Nhằm ngày 12 tháng 10 năm Bính Ngọ',
      weddingTime: profile.weddingTime || '11:00',
      venue: profile.venue || 'Trung Tâm Tiệc Cưới White Palace, TP. Hồ Chí Minh',
      hallName: 'Sảnh Grand Ballroom',
      loveQuote: 'Trăm năm tình viên mãn • Bạc đầu nghĩa phu thê',
      theme: 'galaxy',
      starSpeed: 'normal',
      starDensity: 'normal',
      fontFamily: 'serif',
      aspectRatio: '16:9',
      showLunarDate: true,
      showParents: false,
      showVenue: true,
      showQuote: true,
      showMonogram: true,
      showTime: true,
    };
  });

  // Tự động lưu cấu hình LED vào localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LED, JSON.stringify(config));
  }, [config]);

  // 2. Trạng thái giao diện điều khiển
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 3. Tự động ẩn thanh điều khiển sau 3.5 giây không di chuột
  useEffect(() => {
    const handleMouseMove = () => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isSettingsOpen) {
          setControlsVisible(false);
        }
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isSettingsOpen]);

  // 4. Quản lý toàn màn hình (Fullscreen)
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Lỗi bật/tắt toàn màn hình:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 5. Quản lý âm thanh nền
  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingMusic) {
      audio.pause();
      setIsPlayingMusic(false);
    } else {
      audio.play().then(() => setIsPlayingMusic(true)).catch(err => console.warn(err));
    }
  };

  // 6. Hiệu ứng Canvas Bầu Trời Sao Rơi & Mưa Sao Băng (Meteor Shower Canvas Engine)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mật độ sao
    const starCount = config.starDensity === 'high' ? 240 : config.starDensity === 'low' ? 90 : 160;

    // Tốc độ sao rơi
    const speedMultiplier = config.starSpeed === 'fast' ? 1.6 : config.starSpeed === 'slow' ? 0.6 : 1.0;

    // Mảng ngôi sao lấp lánh (Twinkling Stars)
    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
      flickerSpeed: number;
      glow: boolean;
    }

    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.05 + 0.01,
        flickerSpeed: Math.random() * 0.03 + 0.005,
        glow: Math.random() > 0.8,
      });
    }

    // Mảng sao băng rơi (Meteors / Shooting Stars)
    interface Meteor {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      width: number;
      color: string;
      active: boolean;
    }

    const meteors: Meteor[] = [];
    const maxMeteors = config.starDensity === 'high' ? 6 : config.starDensity === 'low' ? 2 : 4;

    const createMeteor = (): Meteor => {
      // Xuất phát từ góc trên hoặc phía trên bên phải
      const startX = Math.random() * (width * 1.2) - width * 0.1;
      const startY = Math.random() * (height * 0.4) - 100;
      const angle = (Math.PI / 4) + (Math.random() * 0.15 - 0.075); // Góc rơi ~45 độ
      const length = Math.random() * 140 + 80;
      const speed = (Math.random() * 10 + 12) * speedMultiplier;
      const isGold = config.theme === 'gold' || config.theme === 'ruby' || Math.random() > 0.4;
      const color = isGold ? '#fef08a' : '#ffffff';

      return {
        x: startX,
        y: startY,
        length,
        speed,
        angle,
        opacity: Math.random() * 0.5 + 0.5,
        width: Math.random() * 1.5 + 1.2,
        color,
        active: true,
      };
    };

    for (let i = 0; i < maxMeteors; i++) {
      meteors.push(createMeteor());
    }

    // Bụi tiên vàng kim trôi lơ lửng (Golden Stardust)
    interface Dust {
      x: number;
      y: number;
      size: number;
      alpha: number;
      vx: number;
      vy: number;
    }
    const dustParticles: Dust[] = [];
    for (let i = 0; i < 50; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
      });
    }

    // Vòng lặp vẽ chuyển động
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Vẽ các ngôi sao lấp lánh
      stars.forEach(star => {
        star.alpha += star.flickerSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.2) {
          star.flickerSpeed = -star.flickerSpeed;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, star.alpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Hiệu ứng tia sáng cho các ngôi sao lớn
        if (star.glow && star.alpha > 0.7) {
          ctx.strokeStyle = `rgba(254, 240, 138, ${star.alpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 3, star.y);
          ctx.lineTo(star.x + star.size * 3, star.y);
          ctx.moveTo(star.x, star.y - star.size * 3);
          ctx.lineTo(star.x, star.y + star.size * 3);
          ctx.stroke();
        }
      });

      // 2. Vẽ bụi sao lấp lánh trôi nhẹ (Floating Stardust)
      dustParticles.forEach(dust => {
        dust.x += dust.vx;
        dust.y += dust.vy;

        if (dust.y < -10) {
          dust.y = height + 10;
          dust.x = Math.random() * width;
        }
        if (dust.x < -10) dust.x = width + 10;
        if (dust.x > width + 10) dust.x = -10;

        ctx.fillStyle = `rgba(253, 224, 71, ${dust.alpha})`;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Vẽ các vệt sao băng rơi (Shooting Stars Trail)
      meteors.forEach((m, idx) => {
        if (!m.active) {
          // Tạo lại sao băng với thời gian trễ ngẫu nhiên
          if (Math.random() < 0.03 * speedMultiplier) {
            meteors[idx] = createMeteor();
          }
          return;
        }

        // Tọa độ đuôi sao băng
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        // Gradient vệt sáng từ trong suốt tới đầu sáng rực
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, m.color === '#fef08a' ? 'rgba(254, 240, 138, 0.4)' : 'rgba(219, 234, 254, 0.4)');
        grad.addColorStop(1, m.color === '#fef08a' ? 'rgba(254, 240, 138, 0.95)' : 'rgba(255, 255, 255, 0.95)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Đầu phát sáng của sao băng (Glow head)
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Di chuyển sao băng
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        // Biến mất khi bay ra khỏi màn hình
        if (m.y > height + 200 || m.x > width + 200) {
          m.active = false;
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [config.theme, config.starSpeed, config.starDensity]);

  // Bộ màu nền sang trọng (Themes)
  const getThemeBackground = () => {
    switch (config.theme) {
      case 'champagne':
        return 'bg-gradient-to-b from-[#1f0913] via-[#330f21] to-[#12030a]';
      case 'ruby':
        return 'bg-gradient-to-b from-[#24030a] via-[#400613] to-[#150206]';
      case 'gold':
        return 'bg-gradient-to-b from-[#1c1303] via-[#382607] to-[#110a01]';
      case 'emerald':
        return 'bg-gradient-to-b from-[#021c14] via-[#053627] to-[#01120d]';
      case 'galaxy':
      default:
        return 'bg-gradient-to-b from-[#030712] via-[#0b1329] to-[#020617]';
    }
  };

  // Font chữ nghệ thuật
  const getFontFamily = () => {
    switch (config.fontFamily) {
      case 'script':
        return 'font-serif italic tracking-wide';
      case 'sans':
        return 'font-sans tracking-normal';
      case 'serif':
      default:
        return 'font-serif tracking-widest';
    }
  };

  // Sao chép link trình chiếu
  const handleCopyLedLink = () => {
    const origin = window.location.origin.includes('github.io')
      ? 'https://giangtienphat-nhidong315.github.io/hysu/'
      : window.location.origin;
    const url = `${origin.replace(/\/$/, '')}/?mode=led`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Đã sao chép link màn hình LED!', 'Bạn có thể gửi link này cho kỹ thuật viên âm thanh ánh sáng tại sảnh tiệc cưới.');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Chữ cái Monogram (Ví dụ: B & L)
  const monogramGroom = config.groomName.trim().charAt(config.groomName.trim().lastIndexOf(' ') + 1) || 'B';
  const monogramBride = config.brideName.trim().charAt(config.brideName.trim().lastIndexOf(' ') + 1) || 'L';

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none flex items-center justify-center ${getThemeBackground()} ${
        !controlsVisible && !isSettingsOpen ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* Audio element phát nhạc cưới */}
      <audio
        ref={audioRef}
        src={resolveAudioUrl(profile.musicUrl || '/audio/romantic-wedding-piano.mp3')}
        loop
        preload="auto"
      />

      {/* Canvas Bầu Trời Sao Rơi & Mưa Sao Băng */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Hiệu ứng tia sáng trung tâm (Radial Spotlight Glow) */}
      <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-black/60 pointer-events-none z-1" />

      {/* KHUNG NỘI DUNG SÂN KHẤU CHÍNH (STAGE CENTERPIECE) */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center transition-all duration-500 ${
          config.aspectRatio === '9:16'
            ? 'max-w-[540px] aspect-[9/16]'
            : config.aspectRatio === '21:9'
            ? 'max-w-[1400px] aspect-[21/9]'
            : 'max-w-[1200px] aspect-[16/9]'
        }`}
      >
        {/* Monogram Lồng Chữ Vàng Kim */}
        {config.showMonogram && (
          <div className="mb-4 sm:mb-6 animate-in fade-in zoom-in-90 duration-1000">
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-amber-300/80 shadow-[0_0_35px_rgba(251,191,36,0.35)] backdrop-blur-xs bg-amber-400/5">
              <span className="font-serif text-2xl sm:text-4xl font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent drop-shadow-md">
                {monogramGroom} <span className="text-amber-400 text-lg sm:text-2xl font-light">♥</span> {monogramBride}
              </span>
            </div>
          </div>
        )}

        {/* Tiêu Đề Buổi Lễ (LỄ THÀNH HÔN / LỄ VU QUY) */}
        <div className="flex items-center gap-3 sm:gap-6 mb-3 sm:mb-5">
          <div className="w-8 sm:w-20 h-px bg-gradient-to-r from-transparent to-amber-300/80" />
          <h2 className="text-sm sm:text-xl md:text-2xl font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-300 bg-clip-text text-transparent drop-shadow-sm">
            {config.ceremonyTitle}
          </h2>
          <div className="w-8 sm:w-20 h-px bg-gradient-to-l from-transparent to-amber-300/80" />
        </div>

        {/* Tên Cô Dâu & Chú Rể (Nổi Bật Nhất Trên Sân Khấu) */}
        <div className="my-2 sm:my-5 space-y-1">
          <h1
            className={`text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight drop-shadow-[0_4px_25px_rgba(251,191,36,0.45)] bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent ${getFontFamily()}`}
          >
            {config.groomName}
            <span className="inline-block mx-3 sm:mx-6 text-2xl sm:text-5xl md:text-6xl font-serif text-amber-300/90 font-light drop-shadow-lg">
              &
            </span>
            {config.brideName}
          </h1>
        </div>

        {/* Thông tin Gia Đình Hai Bên (Tùy chọn) */}
        {config.showParents && (
          <div className="grid grid-cols-2 gap-4 sm:gap-8 my-3 text-xs sm:text-base text-amber-100/90 font-medium">
            <div className="text-right border-r border-amber-300/30 pr-4 sm:pr-8">
              <span className="block text-[10px] sm:text-xs text-amber-300/70 uppercase tracking-widest font-bold">Họ Nhà Trai</span>
              <span>{config.groomParents}</span>
            </div>
            <div className="text-left pl-4 sm:pl-8">
              <span className="block text-[10px] sm:text-xs text-amber-300/70 uppercase tracking-widest font-bold">Họ Nhà Gái</span>
              <span>{config.brideParents}</span>
            </div>
          </div>
        )}

        {/* Ngày Cưới (Dương Lịch & Âm Lịch) */}
        <div className="mt-3 sm:mt-6 space-y-1 sm:space-y-2">
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-base sm:text-2xl md:text-3xl font-extrabold tracking-widest text-amber-100 drop-shadow-md">
            <span>
              {new Date(config.weddingDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {config.showTime && (
              <>
                <span className="text-amber-400">•</span>
                <span>{config.weddingTime}</span>
              </>
            )}
          </div>

          {config.showLunarDate && config.lunarDate && (
            <p className="text-xs sm:text-base md:text-lg text-amber-200/80 font-serif italic tracking-wider">
              ({config.lunarDate})
            </p>
          )}
        </div>

        {/* Địa Điểm & Sảnh Tiệc */}
        {config.showVenue && config.venue && (
          <div className="mt-3 sm:mt-5 text-xs sm:text-base md:text-lg text-amber-100/90 font-medium tracking-wide">
            <span>{config.venue}</span>
            {config.hallName && (
              <span className="block text-[11px] sm:text-sm text-amber-300/80 font-bold mt-0.5">
                ✦ {config.hallName} ✦
              </span>
            )}
          </div>
        )}

        {/* Câu Chúc / Châm Ngôn Tình Yêu */}
        {config.showQuote && config.loveQuote && (
          <div className="mt-4 sm:mt-8 pt-3 sm:pt-5 border-t border-amber-300/20 max-w-xl mx-auto">
            <p className="text-xs sm:text-sm md:text-base text-amber-200/90 font-serif italic tracking-widest drop-shadow-sm">
              "{config.loveQuote}"
            </p>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* THANH ĐIỀU KHIỂN NỔI (FLOATING CONTROLS TOOLBAR - TỰ ĐỘNG ẨN) */}
      {/* ============================================================== */}
      <div
        className={`fixed bottom-6 z-40 flex items-center gap-2 p-2 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/30 shadow-2xl transition-all duration-300 ${
          controlsVisible || isSettingsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Nút Quay lại ứng dụng */}
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = window.location.pathname;
            }
          }}
          className="p-2.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          title="Quay lại ứng dụng quản lý"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
        </button>

        <div className="w-px h-5 bg-white/20" />

        {/* Nút Toàn màn hình F11 */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          title={isFullscreen ? 'Thu nhỏ màn hình' : 'Mở toàn màn hình sân khấu (F11)'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          ) : (
            <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          )}
        </button>

        {/* Nút Bật/tắt nhạc cưới */}
        <button
          onClick={toggleMusic}
          className={`p-2.5 rounded-full transition cursor-pointer ${
            isPlayingMusic ? 'bg-amber-400 text-slate-900 shadow-md' : 'hover:bg-white/10 text-white'
          }`}
          title={isPlayingMusic ? 'Tắt nhạc cưới' : 'Bật nhạc cưới lãng mạn'}
        >
          {isPlayingMusic ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          )}
        </button>

        {/* Nút Sao chép link trình chiếu */}
        <button
          onClick={handleCopyLedLink}
          className="p-2.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          title="Sao chép link màn hình LED cho nhà hàng"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          ) : (
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          )}
        </button>

        <div className="w-px h-5 bg-white/20" />

        {/* Nút Tùy chỉnh giao diện & nội dung */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Tùy Chỉnh LED</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODAL TÙY CHỈNH MÀN HÌNH LED (SETTINGS DRAWER) */}
      {/* ============================================================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-300/30 text-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-5 shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Tùy Chỉnh Màn Hình LED Sân Khấu
                  </h3>
                  <p className="text-xs text-amber-200/70">
                    Cài đặt hiệu ứng sao rơi, tông màu và nội dung chữ hiển thị
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chọn Theme Tông Màu Nền */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Tông Màu Màn Hình LED (Theme):</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'galaxy', label: 'Dạ Tiệc Ngân Hà', color: 'from-blue-900 via-indigo-950 to-slate-950' },
                  { id: 'champagne', label: 'Hồng Champagne', color: 'from-pink-900 via-rose-950 to-slate-950' },
                  { id: 'ruby', label: 'Đỏ Hỷ Sự', color: 'from-red-900 via-rose-950 to-slate-950' },
                  { id: 'gold', label: 'Hoàng Gia Ánh Kim', color: 'from-amber-900 via-yellow-950 to-slate-950' },
                  { id: 'emerald', label: 'Xanh Lục Bảo', color: 'from-emerald-900 via-teal-950 to-slate-950' },
                ].map(th => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, theme: th.id as LedTheme }))}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer font-bold text-xs ${
                      config.theme === th.id
                        ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-6 rounded-lg mb-1.5 bg-gradient-to-r ${th.color}`} />
                    <span className="text-[11px] leading-tight block truncate">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tốc độ & Mật độ Sao Rơi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tốc Độ Mưa Sao Băng:</span>
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'slow', label: 'Chậm êm dịu' },
                    { id: 'normal', label: 'Tiêu chuẩn' },
                    { id: 'fast', label: 'Mưa rực rỡ' },
                  ].map(sp => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, starSpeed: sp.id as any }))}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        config.starSpeed === sp.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Mật Độ Sao Rơi:</span>
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'low', label: 'Thoáng nhẹ' },
                    { id: 'normal', label: 'Vừa phải' },
                    { id: 'high', label: 'Dày đặc' },
                  ].map(den => (
                    <button
                      key={den.id}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, starDensity: den.id as any }))}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        config.starDensity === den.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {den.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tùy chỉnh Nội Dung Văn Bản */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                <span>Nội Dung Chữ Trên Màn Hình:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Tiêu đề buổi lễ:</span>
                  <select
                    value={config.ceremonyTitle}
                    onChange={e => setConfig(prev => ({ ...prev, ceremonyTitle: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="LỄ THÀNH HÔN">LỄ THÀNH HÔN</option>
                    <option value="LỄ VU QUY">LỄ VU QUY</option>
                    <option value="LỄ TÂN HÔN">LỄ TÂN HÔN</option>
                    <option value="LỄ ĐÍNH HÔN">LỄ ĐÍNH HÔN</option>
                    <option value="LỄ BÁO HỶ">LỄ BÁO HỶ</option>
                    <option value="TIỆC CƯỚI TRĂM NĂM HẠNH PHÚC">TIỆC CƯỚI TRĂM NĂM HẠNH PHÚC</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Kiểu font chữ:</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'serif', label: 'Serif Quý Phái' },
                      { id: 'script', label: 'Thư Pháp Mềm Mại' },
                      { id: 'sans', label: 'Hiện Đại' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, fontFamily: f.id as any }))}
                        className={`flex-1 py-2 px-1 text-[11px] font-bold rounded-xl border transition cursor-pointer truncate ${
                          config.fontFamily === f.id
                            ? 'bg-amber-400 text-slate-950 border-amber-400'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Tên Chú Rể:</span>
                  <input
                    type="text"
                    value={config.groomName}
                    onChange={e => setConfig(prev => ({ ...prev, groomName: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Tên Cô Dâu:</span>
                  <input
                    type="text"
                    value={config.brideName}
                    onChange={e => setConfig(prev => ({ ...prev, brideName: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Ngày cưới dương lịch:</span>
                  <input
                    type="date"
                    value={config.weddingDate}
                    onChange={e => setConfig(prev => ({ ...prev, weddingDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Ngày âm lịch:</span>
                  <input
                    type="text"
                    value={config.lunarDate}
                    onChange={e => setConfig(prev => ({ ...prev, lunarDate: e.target.value }))}
                    placeholder="Ví dụ: Nhằm ngày 12 tháng 10 năm Bính Ngọ"
                    className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-400 block mb-1">Địa điểm & Trung tâm tiệc cưới:</span>
                  <input
                    type="text"
                    value={config.venue}
                    onChange={e => setConfig(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-400 block mb-1">Câu chúc ý nghĩa:</span>
                  <input
                    type="text"
                    value={config.loveQuote}
                    onChange={e => setConfig(prev => ({ ...prev, loveQuote: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs italic text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Bật / Tắt các thành phần phụ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
              <label className="flex items-center gap-2 p-2 bg-white/5 rounded-xl text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showMonogram}
                  onChange={e => setConfig(prev => ({ ...prev, showMonogram: e.target.checked }))}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Logo chữ lồng</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white/5 rounded-xl text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showLunarDate}
                  onChange={e => setConfig(prev => ({ ...prev, showLunarDate: e.target.checked }))}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Ngày âm lịch</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white/5 rounded-xl text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showVenue}
                  onChange={e => setConfig(prev => ({ ...prev, showVenue: e.target.checked }))}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Địa điểm tiệc</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white/5 rounded-xl text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showQuote}
                  onChange={e => setConfig(prev => ({ ...prev, showQuote: e.target.checked }))}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Câu chúc tình yêu</span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyLedLink}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-300" />
                <span>Sao Chép Link Chiếu</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  toast.success('Đã lưu cấu hình màn hình LED!');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg transition cursor-pointer"
              >
                Hoàn Tất & Xem Màn Hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
