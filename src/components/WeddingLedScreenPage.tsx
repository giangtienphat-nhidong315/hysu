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
  Upload,
  Image as ImageIcon,
  Trash2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ZoomIn,
  Calendar,
  Users,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { useToast } from '../context/ToastContext';
import { resolvePlayableAudioUrl, resolveAudioUrl } from '../utils/weddingAudio';
import { compressImage } from '../utils/imageCompressor';

export type LedTheme = 'galaxy' | 'champagne' | 'ruby' | 'gold' | 'emerald';
export type LedAspectRatio = '16:9' | '21:9' | '9:16';
export type LedFont = 'playfair' | 'cormorant' | 'dancing' | 'cinzel' | 'bevietnam' | 'serif' | 'script' | 'sans';
export type LedMotionPattern = 'tinhtu' | 'saobang' | 'phale' | 'hysu';
export type LedFontSize = 'normal' | 'large' | 'huge';
export type LedTextCase = 'titlecase' | 'uppercase';
export type LedTextColor = 'gold' | 'rosegold' | 'white' | 'silver' | 'ruby' | 'custom';
export type LedDisplayMode = 'static' | 'slideshow';

export interface LedScreenSettings {
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
  customBackgroundUrl?: string;
  bgDarkness?: number;
  bgBlur?: number;
  showMeteors?: boolean;
  showTwinklingStars?: boolean;
  starCenterSafeZone?: boolean;
  starBrightness?: number;
  motionPattern: LedMotionPattern;
  fontSizePreset: LedFontSize;
  nameTextCase: LedTextCase;
  textColorTheme: LedTextColor;
  customTextColor?: string;
  textScale: number;
  displayMode: LedDisplayMode;
  transitionSpeedSeconds: number;
  slideCoupleBadge?: string;
  slideFamilyTitle?: string;
  slideGroomFamilyLabel?: string;
  slideBrideFamilyLabel?: string;
  slideFamilyQuote?: string;
  slideDateTitle?: string;
  slideDateNote?: string;
  slideQuoteTitle?: string;
  slideQuoteEnding?: string;
  enabledSlides?: number[];
}

const STORAGE_KEY_LED = 'wedding_led_screen_config_v1';

// Hàm vẽ Tinh Tú Kim Cương 4 cánh & 8 cánh với tia nhiễu xạ và quầng sáng thiên thể (Đã cân chỉnh độ sáng dịu mát, không chói chữ)
export const drawDiamondStar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
  color: string,
  points: 4 | 8 = 4,
  brightnessFactor: number = 0.7
) => {
  ctx.save();
  ctx.translate(x, y);

  const effectiveAlpha = Math.max(0, Math.min(1, alpha * brightnessFactor));

  // 1. Quầng sáng starlight halo dịu nhẹ
  const haloGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3.6);
  haloGrad.addColorStop(0, color);
  haloGrad.addColorStop(0.3, color);
  haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha * 0.22));
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 3.6, 0, Math.PI * 2);
  ctx.fill();

  // 2. Tia sáng kim cương 4 cánh chính (Diffraction Spikes thanh nhã)
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha * 0.75));
  ctx.fillStyle = color;
  const flareLen = size * 3.8;
  const flareThick = size * 0.42;

  // Tia đứng
  ctx.beginPath();
  ctx.moveTo(0, -flareLen);
  ctx.lineTo(flareThick, 0);
  ctx.lineTo(0, flareLen);
  ctx.lineTo(-flareThick, 0);
  ctx.closePath();
  ctx.fill();

  // Tia ngang
  ctx.beginPath();
  ctx.moveTo(-flareLen, 0);
  ctx.lineTo(0, flareThick);
  ctx.lineTo(flareLen, 0);
  ctx.lineTo(0, -flareThick);
  ctx.closePath();
  ctx.fill();

  // 3. Tia phụ nếu là sao 8 cánh (8-point Diffraction Flare)
  if (points === 8) {
    const subLen = flareLen * 0.52;
    const subThick = flareThick * 0.35;
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -subLen);
    ctx.lineTo(subThick, 0);
    ctx.lineTo(0, subLen);
    ctx.lineTo(-subThick, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-subLen, 0);
    ctx.lineTo(0, subThick);
    ctx.lineTo(subLen, 0);
    ctx.lineTo(0, -subThick);
    ctx.closePath();
    ctx.fill();
  }

  // 4. Nhân sao sáng ở tâm (được tinh chỉnh thanh tao, không lóa mắt)
  ctx.globalAlpha = Math.max(0, Math.min(1, effectiveAlpha * 0.85));
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const WeddingLedScreenPage: React.FC = () => {
  const { profile } = useWedding();
  const toast = useToast();

  // 1. Cấu hình màn hình LED
  const [config, setConfig] = useState<LedScreenSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LED);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          groomName: parsed.groomName || profile.groomName,
          brideName: parsed.brideName || profile.brideName,
          weddingDate: parsed.weddingDate || profile.weddingDate,
          venue: parsed.venue || profile.venue,
          motionPattern: parsed.motionPattern || 'saobang',
          fontSizePreset: parsed.fontSizePreset || 'large',
          nameTextCase: parsed.nameTextCase || 'titlecase',
          fontFamily: parsed.fontFamily || 'playfair',
          textColorTheme: parsed.textColorTheme || 'gold',
          customTextColor: parsed.customTextColor || '#ffd700',
          textScale: parsed.textScale ?? 130,
          displayMode: parsed.displayMode || 'static',
          transitionSpeedSeconds: parsed.transitionSpeedSeconds || 8,
          slideCoupleBadge: parsed.slideCoupleBadge || '✦ TRĂM NĂM HẠNH PHÚC • VẸN NGUYÊN NGHĨA PHU THÊ ✦',
          slideFamilyTitle: parsed.slideFamilyTitle || 'GIA ĐÌNH & ĐẤNG SINH THÀNH',
          slideGroomFamilyLabel: parsed.slideGroomFamilyLabel || '✦ HỌ NHÀ TRAI ✦',
          slideBrideFamilyLabel: parsed.slideBrideFamilyLabel || '✦ HỌ NHÀ GÁI ✦',
          slideFamilyQuote: parsed.slideFamilyQuote || 'Cảm tạ ân sinh thành dưỡng dục • Nguyện trọn đạo hiếu thuận cháu con',
          slideDateTitle: parsed.slideDateTitle || 'NGÀY LÀNH KHỞI ĐẦU HẠNH PHÚC',
          slideDateNote: parsed.slideDateNote || 'Hân hoan chào đón Quý khách quý và Quan viên hai họ',
          slideQuoteTitle: parsed.slideQuoteTitle || 'LỜI NGUYỆN ƯỚC TRĂM NĂM',
          slideQuoteEnding: parsed.slideQuoteEnding || 'Nguyện cùng nhau đi qua năm tháng bình an • Trọn vẹn yêu thương',
          enabledSlides: Array.isArray(parsed.enabledSlides) && parsed.enabledSlides.length > 0 ? parsed.enabledSlides : [0, 1, 2, 3],
          bgDarkness: parsed.bgDarkness ?? 40,
          bgBlur: parsed.bgBlur ?? 0,
          showMeteors: parsed.showMeteors ?? true,
          showTwinklingStars: parsed.showTwinklingStars ?? true,
          starCenterSafeZone: parsed.starCenterSafeZone ?? true,
          starBrightness: parsed.starBrightness ?? 60,
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
      motionPattern: 'saobang',
      starSpeed: 'normal',
      starDensity: 'normal',
      fontFamily: 'playfair',
      fontSizePreset: 'large',
      nameTextCase: 'titlecase',
      textColorTheme: 'gold',
      customTextColor: '#ffd700',
      textScale: 130,
      displayMode: 'static',
      transitionSpeedSeconds: 8,
      slideCoupleBadge: '✦ TRĂM NĂM HẠNH PHÚC • VẸN NGUYÊN NGHĨA PHU THÊ ✦',
      slideFamilyTitle: 'GIA ĐÌNH & ĐẤNG SINH THÀNH',
      slideGroomFamilyLabel: '✦ HỌ NHÀ TRAI ✦',
      slideBrideFamilyLabel: '✦ HỌ NHÀ GÁI ✦',
      slideFamilyQuote: 'Cảm tạ ân sinh thành dưỡng dục • Nguyện trọn đạo hiếu thuận cháu con',
      slideDateTitle: 'NGÀY LÀNH KHỞI ĐẦU HẠNH PHÚC',
      slideDateNote: 'Hân hoan chào đón Quý khách quý và Quan viên hai họ',
      slideQuoteTitle: 'LỜI NGUYỆN ƯỚC TRĂM NĂM',
      slideQuoteEnding: 'Nguyện cùng nhau đi qua năm tháng bình an • Trọn vẹn yêu thương',
      enabledSlides: [0, 1, 2, 3],
      aspectRatio: '16:9',
      showLunarDate: true,
      showParents: false,
      showVenue: true,
      showQuote: true,
      showMonogram: true,
      showTime: true,
      customBackgroundUrl: undefined,
      bgDarkness: 40,
      bgBlur: 0,
      showMeteors: true,
      showTwinklingStars: true,
      starCenterSafeZone: true,
      starBrightness: 60,
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

  // Quản lý Chuyển Cảnh (Slideshow Scenes: 0: Main, 1: Parents, 2: TimeVenue, 3: LoveQuote)
  const [currentScene, setCurrentScene] = useState(0);
  const [isSceneTransitioning, setIsSceneTransitioning] = useState(false);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);
  const [slideEditTab, setSlideEditTab] = useState<number>(0);

  // Danh sách phân cảnh được kích hoạt trong Slideshow
  const activeSlides = config.enabledSlides && config.enabledSlides.length > 0 ? config.enabledSlides : [0, 1, 2, 3];

  const getNextScene = (current: number) => {
    const list = activeSlides;
    const currentIndex = list.indexOf(current);
    if (currentIndex === -1) return list[0];
    return list[(currentIndex + 1) % list.length];
  };

  const getPrevScene = (current: number) => {
    const list = activeSlides;
    const currentIndex = list.indexOf(current);
    if (currentIndex === -1) return list[0];
    return list[(currentIndex - 1 + list.length) % list.length];
  };

  useEffect(() => {
    if (!activeSlides.includes(currentScene)) {
      setCurrentScene(activeSlides[0]);
    }
  }, [activeSlides, currentScene]);

  useEffect(() => {
    if (config.displayMode !== 'slideshow' || isSlideshowPaused) return;
    const timer = setInterval(() => {
      setIsSceneTransitioning(true);
      setTimeout(() => {
        setCurrentScene(prev => getNextScene(prev));
        setIsSceneTransitioning(false);
      }, 450);
    }, (config.transitionSpeedSeconds || 8) * 1000);

    return () => clearInterval(timer);
  }, [config.displayMode, config.transitionSpeedSeconds, isSlideshowPaused, activeSlides]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Xử lý tải ảnh nền tùy chỉnh từ thiết bị
  const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.info('Đang tối ưu ảnh nền...', 'Đang xử lý ảnh sắc nét chuẩn HD cho màn hình LED.');
      const compressed = await compressImage(file, 1920, 0.85);
      setConfig(prev => ({
        ...prev,
        customBackgroundUrl: compressed,
      }));
      toast.success('Đã tải ảnh nền thành công!', 'Ảnh nền mới đã được áp dụng cho màn hình LED.');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải ảnh', 'Không thể đọc tệp ảnh. Vui lòng thử lại với ảnh khác.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveBackground = () => {
    setConfig(prev => ({
      ...prev,
      customBackgroundUrl: undefined,
    }));
    toast.info('Đã xóa ảnh nền tùy chỉnh', 'Màn hình đã chuyển về phông nền ngân hà mặc định.');
  };

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

    // 1. Vùng an toàn chữ & Hệ số độ sáng sao (Giữ chữ luôn nổi bật và không bị chói lóa)
    const safeZoneActive = config.starCenterSafeZone !== false;
    const brightnessMultiplier = (config.starBrightness ?? 60) / 100;
    const cx = width / 2;
    const cy = height * 0.48;
    const safeRx = width * 0.38; // Bán kính ngang vùng an toàn chữ (~76% chiều ngang)
    const safeRy = height * 0.35; // Bán kính dọc vùng an toàn chữ (~70% chiều dọc)

    // Hàm đẩy tọa độ ra xa vùng chữ trung tâm
    const pushOutsideTextZone = (x: number, y: number): { x: number; y: number } => {
      if (!safeZoneActive) return { x, y };
      const dx = (x - cx) / safeRx;
      const dy = (y - cy) / safeRy;
      const normDist = Math.sqrt(dx * dx + dy * dy);
      if (normDist < 1.0) {
        // Đẩy ra ngoài vành elip an toàn kèm góc phân tán tự nhiên
        const angle = Math.atan2(y - cy, x - cx) || (Math.random() * Math.PI * 2);
        const targetDist = 1.08 + Math.random() * 0.42;
        const newX = Math.max(15, Math.min(width - 15, cx + Math.cos(angle) * safeRx * targetDist));
        const newY = Math.max(15, Math.min(height - 15, cy + Math.sin(angle) * safeRy * targetDist));
        return { x: newX, y: newY };
      }
      return { x, y };
    };

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
        size: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.65 + 0.25,
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
    const isTinhTu = config.motionPattern === 'tinhtu';
    const isSaoBang = config.motionPattern === 'saobang';
    const maxMeteors = isTinhTu ? 2 : config.starDensity === 'high' ? (isSaoBang ? 7 : 6) : config.starDensity === 'low' ? 2 : 4;

    const createMeteor = (): Meteor => {
      // Xuất phát từ góc trên hoặc phía trên bên phải
      const startX = Math.random() * (width * 1.2) - width * 0.1;
      const startY = Math.random() * (height * 0.4) - 100;
      const angle = (Math.PI / 4) + (Math.random() * 0.15 - 0.075); // Góc rơi ~45 độ
      const length = isTinhTu ? Math.random() * 90 + 60 : Math.random() * 150 + 90;
      const speed = (Math.random() * 8 + (isTinhTu ? 7 : 12)) * speedMultiplier;
      const isGold = config.theme === 'gold' || config.theme === 'ruby' || Math.random() > 0.4;
      const color = isGold ? '#fef08a' : '#ffffff';

      return {
        x: startX,
        y: startY,
        length,
        speed,
        angle,
        opacity: Math.random() * 0.5 + 0.5,
        width: isTinhTu ? Math.random() * 1.0 + 0.8 : Math.random() * 1.5 + 1.1,
        color,
        active: true,
      };
    };

    for (let i = 0; i < maxMeteors; i++) {
      meteors.push(createMeteor());
    }

    // Mảng Tinh Tú Kim Cương (Diamond Celestial Stars - Đẩy ra xa vùng chữ để tránh che lấp chữ)
    interface DiamondStarItem {
      x: number;
      y: number;
      baseSize: number;
      phase: number;
      pulseSpeed: number;
      points: 4 | 8;
      color: string;
    }
    const diamondStars: DiamondStarItem[] = [];
    const diamondColors = ['#ffffff', '#fef08a', '#e0f2fe', '#fbcfe8', '#fef9c3'];
    const diamondCount = isTinhTu ? 32 : 24;
    for (let i = 0; i < diamondCount; i++) {
      const pos = pushOutsideTextZone(Math.random() * width, Math.random() * height);
      diamondStars.push({
        x: pos.x,
        y: pos.y,
        baseSize: Math.random() * 2.2 + 1.0,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: (Math.random() * 0.025 + 0.01) * speedMultiplier,
        points: Math.random() > 0.65 ? 8 : 4,
        color: diamondColors[Math.floor(Math.random() * diamondColors.length)],
      });
    }

    // Mảng vòng sóng loang ngân hà (Cosmic Ripple Waves cho mẫu "Sao Băng - Đĩa ngân hà loang sóng")
    interface RippleWave {
      radius: number;
      maxRadius: number;
      speed: number;
      color: string;
    }
    const ripples: RippleWave[] = [
      { radius: 100, maxRadius: Math.max(width, height) * 0.8, speed: 1.1 * speedMultiplier, color: '#fef08a' },
      { radius: 280, maxRadius: Math.max(width, height) * 0.8, speed: 1.1 * speedMultiplier, color: '#fde047' },
      { radius: 460, maxRadius: Math.max(width, height) * 0.8, speed: 1.1 * speedMultiplier, color: '#93c5fd' },
      { radius: 640, maxRadius: Math.max(width, height) * 0.8, speed: 1.1 * speedMultiplier, color: '#e0e7ff' },
    ];
    let galaxyAngle = 0;

    // Hạt Bokeh cho mẫu Pha Lê
    interface Bokeh {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speedY: number;
      color: string;
    }
    const bokehs: Bokeh[] = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 20 + 8,
      alpha: (Math.random() * 0.18 + 0.04) * brightnessMultiplier,
      speedY: -Math.random() * 0.3 - 0.1,
      color: Math.random() > 0.4 ? 'rgba(254, 240, 138, ' : 'rgba(253, 230, 138, ',
    }));

    // Vòng lặp vẽ chuyển động
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 0. Nếu là mẫu "Sao Băng (Đĩa ngân hà loang sóng)"
      if (config.motionPattern === 'saobang') {
        // A. Đĩa thiên hà phát sáng elip (tâm trong suốt để bảo vệ chữ)
        galaxyAngle += 0.0012 * speedMultiplier;
        const diskRadius = Math.min(width, height) * 0.48;
        const diskGrad = ctx.createRadialGradient(0, 0, diskRadius * 0.38, 0, 0, diskRadius);
        diskGrad.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Tâm trong suốt để chữ luôn rõ ràng
        diskGrad.addColorStop(0.3, `rgba(217, 119, 6, ${0.08 * brightnessMultiplier})`);
        diskGrad.addColorStop(0.65, `rgba(147, 51, 234, ${0.05 * brightnessMultiplier})`);
        diskGrad.addColorStop(0.9, `rgba(37, 99, 235, ${0.02 * brightnessMultiplier})`);
        diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.16 + Math.sin(galaxyAngle) * 0.04);
        ctx.scale(1, 0.42);
        ctx.fillStyle = diskGrad;
        ctx.beginPath();
        ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // B. Vòng sóng ánh sáng loang dần (Loang sóng ngân hà)
        ripples.forEach(rp => {
          rp.radius += rp.speed;
          if (rp.radius > rp.maxRadius) {
            rp.radius = diskRadius * 0.42;
          }
          const progress = rp.radius / rp.maxRadius;
          const currentAlpha = Math.sin(progress * Math.PI) * 0.22 * brightnessMultiplier;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(-0.16);
          ctx.scale(1, 0.42);

          // Vòng sóng loang ánh sáng vàng kim / thiên hà
          ctx.strokeStyle = rp.color === '#fef08a'
            ? `rgba(254, 240, 138, ${currentAlpha})`
            : `rgba(147, 197, 253, ${currentAlpha * 0.75})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, rp.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Vòng sáng hào quang mờ (Glow halo)
          ctx.strokeStyle = `rgba(253, 224, 71, ${currentAlpha * 0.15})`;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, rp.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        });
      }

      // 0.2 Nếu là mẫu "Pha Lê Ánh Kim" (Bokeh đèn chùm)
      if (config.motionPattern === 'phale') {
        bokehs.forEach(b => {
          b.y += b.speedY * speedMultiplier;
          if (b.y < -50) {
            b.y = height + 50;
            b.x = Math.random() * width;
          }
          ctx.fillStyle = `${b.color}${b.alpha})`;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 1. Vẽ các ngôi sao lấp lánh (nếu được bật)
      if (config.showTwinklingStars !== false) {
        stars.forEach(star => {
          star.alpha += star.flickerSpeed * (isTinhTu ? 0.7 : 1);
          if (star.alpha > 0.95 || star.alpha < 0.2) {
            star.flickerSpeed = -star.flickerSpeed;
          }

          // Khoảng cách tới tâm vùng chữ
          const dx = (star.x - cx) / safeRx;
          const dy = (star.y - cy) / safeRy;
          const normDist = Math.sqrt(dx * dx + dy * dy);

          let effectiveAlpha = star.alpha * brightnessMultiplier;
          let effectiveSize = star.size;

          if (safeZoneActive && normDist < 1.05) {
            // Giảm độ sáng và kích cỡ khi nằm trong vùng chữ để không gây lóa
            const fade = Math.max(0.08, Math.min(1.0, (normDist - 0.25) / 0.8));
            effectiveAlpha *= fade;
            effectiveSize *= 0.75;
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, effectiveAlpha))})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, effectiveSize, 0, Math.PI * 2);
          ctx.fill();

          // Chỉ hiển thị tia sáng phụ cho các ngôi sao ngoài vùng chữ
          if (star.glow && star.alpha > 0.7 && (!safeZoneActive || normDist >= 1.05)) {
            ctx.strokeStyle = `rgba(254, 240, 138, ${effectiveAlpha * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(star.x - star.size * 2.5, star.y);
            ctx.lineTo(star.x + star.size * 2.5, star.y);
            ctx.moveTo(star.x, star.y - star.size * 2.5);
            ctx.lineTo(star.x, star.y + star.size * 2.5);
            ctx.stroke();
          }
        });

        // 2. Vẽ Tinh Tú Kim Cương lấp lánh (Đã được dời ra viền ngoài để không che lấp chữ)
        diamondStars.forEach(dStar => {
          dStar.phase += dStar.pulseSpeed;
          const pulse = 0.5 + 0.5 * Math.sin(dStar.phase);
          const currentAlpha = (0.3 + 0.55 * pulse) * brightnessMultiplier;
          const currentSize = dStar.baseSize * (0.85 + 0.3 * pulse);

          drawDiamondStar(ctx, dStar.x, dStar.y, currentSize, currentAlpha, dStar.color, dStar.points, 1.0);
        });
      }

      // 3. Vẽ các vệt sao băng rơi (Shooting Stars Trail - nếu được bật)
      if (config.showMeteors !== false) {
        meteors.forEach((m, idx) => {
          if (!m.active) {
            // Tạo lại sao băng với thời gian trễ ngẫu nhiên
            if (Math.random() < (isTinhTu ? 0.015 : 0.035) * speedMultiplier) {
              meteors[idx] = createMeteor();
            }
            return;
          }

          const mDx = (m.x - cx) / safeRx;
          const mDy = (m.y - cy) / safeRy;
          const mNormDist = Math.sqrt(mDx * mDx + mDy * mDy);

          let meteorAlpha = (m.opacity || 0.8) * brightnessMultiplier;
          if (safeZoneActive && mNormDist < 1.0) {
            meteorAlpha *= Math.max(0.18, mNormDist / 1.0);
          }

          // Tọa độ đuôi sao băng
          const tailX = m.x - Math.cos(m.angle) * m.length;
          const tailY = m.y - Math.sin(m.angle) * m.length;

          // Gradient vệt sáng từ trong suốt tới đầu sáng rực
          const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.7, m.color === '#fef08a' ? `rgba(254, 240, 138, ${0.35 * meteorAlpha})` : `rgba(219, 234, 254, ${0.35 * meteorAlpha})`);
          grad.addColorStop(1, m.color === '#fef08a' ? `rgba(254, 240, 138, ${0.85 * meteorAlpha})` : `rgba(255, 255, 255, ${0.85 * meteorAlpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = m.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();

          // Đầu phát sáng của sao băng (Glow head)
          ctx.fillStyle = m.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, meteorAlpha));
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.width * 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // Di chuyển sao băng
          m.x += Math.cos(m.angle) * m.speed;
          m.y += Math.sin(m.angle) * m.speed;

          // Biến mất khi bay ra khỏi màn hình
          if (m.y > height + 200 || m.x > width + 200) {
            m.active = false;
          }
        });
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    config.theme,
    config.starSpeed,
    config.starDensity,
    config.showMeteors,
    config.showTwinklingStars,
    config.motionPattern,
    config.starCenterSafeZone,
    config.starBrightness,
  ]);

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
      case 'playfair':
        return 'font-serif tracking-normal';
      case 'cormorant':
        return 'font-serif tracking-wide';
      case 'dancing':
      case 'script':
        return 'font-serif italic tracking-wide';
      case 'cinzel':
        return 'font-serif tracking-widest uppercase';
      case 'bevietnam':
      case 'sans':
        return 'font-sans tracking-normal';
      case 'serif':
      default:
        return 'font-serif tracking-wide';
    }
  };

  const getFontFamilyStyle = (): React.CSSProperties => {
    switch (config.fontFamily) {
      case 'playfair':
        return { fontFamily: "'Playfair Display', Georgia, serif" };
      case 'cormorant':
        return { fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.04em' };
      case 'dancing':
      case 'script':
        return { fontFamily: "'Dancing Script', cursive", fontStyle: 'italic', letterSpacing: '0.02em' };
      case 'cinzel':
        return { fontFamily: "'Cinzel', 'Times New Roman', serif", letterSpacing: '0.08em' };
      case 'bevietnam':
      case 'sans':
        return { fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" };
      case 'serif':
      default:
        return { fontFamily: "'Playfair Display', Georgia, serif" };
    }
  };

  const getFontSizeClass = () => {
    switch (config.fontSizePreset) {
      case 'normal':
        return 'text-2xl sm:text-5xl md:text-6xl lg:text-7xl';
      case 'huge':
        return 'text-4xl sm:text-7xl md:text-8xl lg:text-9xl';
      case 'large':
      default:
        return 'text-3xl sm:text-6xl md:text-7xl lg:text-8xl';
    }
  };

  const formatName = (name: string) => {
    if (!name) return '';
    if (config.nameTextCase === 'uppercase') {
      return name.toUpperCase();
    }
    return name;
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

  // Hệ số phóng đại kích cỡ chữ màn hình 16:9
  const textScaleFactor = (config.textScale || 130) / 100;

  // Helper phối màu chữ và quầng sáng nghệ thuật
  const getTextColorConfig = () => {
    switch (config.textColorTheme) {
      case 'rosegold':
        return {
          nameGradient: 'bg-gradient-to-r from-rose-100 via-pink-200 to-rose-300 bg-clip-text text-transparent',
          dropShadow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] drop-shadow-[0_0_35px_rgba(244,63,94,0.45)]',
          titleGradient: 'bg-gradient-to-r from-rose-200 via-pink-100 to-rose-300 bg-clip-text text-transparent',
          accentText: 'text-rose-300',
          subText: 'text-rose-100/90',
          borderColor: 'border-rose-300/40',
          borderGrad: 'from-transparent to-rose-300/80',
          borderGradL: 'from-transparent to-rose-300/80',
          monogramBg: 'bg-rose-400/10 border-rose-300/80 shadow-[0_0_35px_rgba(244,63,94,0.35)]',
          monogramGrad: 'bg-gradient-to-r from-rose-200 via-pink-100 to-rose-400 bg-clip-text text-transparent',
          monogramHeart: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
        };
      case 'white':
        return {
          nameGradient: 'bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent',
          dropShadow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] drop-shadow-[0_0_35px_rgba(255,255,255,0.4)]',
          titleGradient: 'bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent',
          accentText: 'text-white',
          subText: 'text-slate-100/95',
          borderColor: 'border-white/40',
          borderGrad: 'from-transparent to-white/80',
          borderGradL: 'from-transparent to-white/80',
          monogramBg: 'bg-white/10 border-white/80 shadow-[0_0_35px_rgba(255,255,255,0.35)]',
          monogramGrad: 'bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent',
          monogramHeart: 'text-rose-300',
          badgeBg: 'bg-white/20 text-white border-white/40',
        };
      case 'silver':
        return {
          nameGradient: 'bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-200 bg-clip-text text-transparent',
          dropShadow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] drop-shadow-[0_0_35px_rgba(165,180,252,0.45)]',
          titleGradient: 'bg-gradient-to-r from-indigo-200 via-blue-100 to-indigo-300 bg-clip-text text-transparent',
          accentText: 'text-indigo-200',
          subText: 'text-blue-100/90',
          borderColor: 'border-indigo-300/40',
          borderGrad: 'from-transparent to-indigo-300/80',
          borderGradL: 'from-transparent to-indigo-300/80',
          monogramBg: 'bg-indigo-400/10 border-indigo-300/80 shadow-[0_0_35px_rgba(165,180,252,0.35)]',
          monogramGrad: 'bg-gradient-to-r from-indigo-200 via-blue-100 to-indigo-300 bg-clip-text text-transparent',
          monogramHeart: 'text-indigo-300',
          badgeBg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40',
        };
      case 'ruby':
        return {
          nameGradient: 'bg-gradient-to-r from-yellow-200 via-rose-300 to-red-400 bg-clip-text text-transparent',
          dropShadow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] drop-shadow-[0_0_35px_rgba(239,68,68,0.5)]',
          titleGradient: 'bg-gradient-to-r from-yellow-200 via-rose-200 to-red-300 bg-clip-text text-transparent',
          accentText: 'text-yellow-300',
          subText: 'text-rose-100/90',
          borderColor: 'border-yellow-400/50',
          borderGrad: 'from-transparent to-yellow-400/80',
          borderGradL: 'from-transparent to-yellow-400/80',
          monogramBg: 'bg-red-500/10 border-amber-300/80 shadow-[0_0_35px_rgba(239,68,68,0.35)]',
          monogramGrad: 'bg-gradient-to-r from-yellow-200 via-rose-200 to-amber-300 bg-clip-text text-transparent',
          monogramHeart: 'text-yellow-400',
          badgeBg: 'bg-rose-500/20 text-yellow-200 border-yellow-400/40',
        };
      case 'custom':
        return {
          nameGradient: '',
          dropShadow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]',
          titleGradient: '',
          accentText: '',
          subText: 'text-white/95',
          borderColor: 'border-white/30',
          borderGrad: 'from-transparent to-white/70',
          borderGradL: 'from-transparent to-white/70',
          monogramBg: 'bg-white/10 border-white/60 shadow-[0_0_30px_rgba(255,255,255,0.3)]',
          monogramGrad: '',
          monogramHeart: 'text-rose-400',
          badgeBg: 'bg-white/15 text-white border-white/30',
        };
      case 'gold':
      default:
        return {
          nameGradient: 'bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent',
          dropShadow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] drop-shadow-[0_0_35px_rgba(251,191,36,0.5)]',
          titleGradient: 'bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-300 bg-clip-text text-transparent',
          accentText: 'text-amber-300',
          subText: 'text-amber-100/90',
          borderColor: 'border-amber-300/40',
          borderGrad: 'from-transparent to-amber-300/80',
          borderGradL: 'from-transparent to-amber-300/80',
          monogramBg: 'bg-amber-400/5 border-amber-300/80 shadow-[0_0_35px_rgba(251,191,36,0.35)]',
          monogramGrad: 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent',
          monogramHeart: 'text-amber-400',
          badgeBg: 'bg-amber-400/20 text-amber-200 border-amber-400/40',
        };
    }
  };

  const textColorCfg = getTextColorConfig();
  const customColorVal = config.customTextColor || '#ffd700';
  const customStyle: React.CSSProperties = config.textColorTheme === 'custom' ? {
    color: customColorVal,
    textShadow: `0 0 35px ${customColorVal}99, 0 4px 30px ${customColorVal}66`,
    background: 'none',
    WebkitTextFillColor: 'initial',
  } : {};

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none flex items-center justify-center bg-black ${
        !controlsVisible && !isSettingsOpen ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* 1. Lớp Ảnh Nền Tùy Chỉnh (Custom Background Image) */}
      {config.customBackgroundUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
          style={{
            backgroundImage: `url(${config.customBackgroundUrl})`,
            filter: `blur(${config.bgBlur || 0}px)`,
            transform: config.bgBlur ? 'scale(1.05)' : 'scale(1)',
          }}
        />
      ) : (
        /* Lớp nền Theme Gradient với Tinh Vân Vũ Trụ đa tầng */
        <div className={`absolute inset-0 ${getThemeBackground()} pointer-events-none`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.22),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(244,63,94,0.18),transparent_60%)]" />
        </div>
      )}

      {/* 2. Lớp phủ tối điều chỉnh được (Darkness Overlay 0-85%) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundColor: '#000000',
          opacity: (config.bgDarkness ?? 40) / 100,
        }}
      />

      {/* 3. Audio element phát nhạc cưới */}
      <audio
        ref={audioRef}
        src={resolveAudioUrl(profile.musicUrl || '/audio/romantic-wedding-piano.mp3')}
        loop
        preload="auto"
      />

      {/* 4. Canvas Bầu Trời Sao Rơi & Mưa Sao Băng */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* 5. Lớp bảo vệ độ tương phản & Đẩy sáng ra xa vùng chữ (Text Clarity Protection - Chống chói lóa) */}
      <div
        className="absolute inset-0 pointer-events-none z-1 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse 72% 62% at 50% 50%, rgba(2, 6, 23, 0.76) 0%, rgba(2, 6, 23, 0.48) 45%, rgba(2, 6, 23, 0.12) 75%, transparent 100%)',
        }}
      />

      {/* ============================================================== */}
      {/* KHUNG NỘI DUNG SÂN KHẤU CHÍNH (STAGE CENTERPIECE - 16:9 / FULL) */}
      {/* ============================================================== */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-center transition-all duration-500 ${
          config.aspectRatio === '9:16'
            ? 'max-w-[600px] aspect-[9/16]'
            : config.aspectRatio === '21:9'
            ? 'max-w-[96vw] aspect-[21/9]'
            : 'max-w-[96vw] aspect-[16/9]'
        }`}
      >
        {/* ============================================================== */}
        {/* CÁCH HIỂN THỊ: TĨNH (CỐ ĐỊNH TRỌN VẸN TRÊN SÂN KHẤU) */}
        {/* ============================================================== */}
        {config.displayMode === 'static' ? (
          <div className="w-full flex flex-col items-center justify-center space-y-3 sm:space-y-5 animate-in fade-in duration-700">
            {/* Monogram Lồng Chữ Vàng Kim */}
            {config.showMonogram && (
              <div className="animate-in fade-in zoom-in-90 duration-1000">
                <div
                  className={`relative inline-flex items-center justify-center rounded-full border-2 backdrop-blur-xs transition-all ${textColorCfg.monogramBg}`}
                  style={{
                    width: `calc(clamp(3.8rem, 6.5vw, 6.8rem) * ${Math.min(1.3, textScaleFactor)})`,
                    height: `calc(clamp(3.8rem, 6.5vw, 6.8rem) * ${Math.min(1.3, textScaleFactor)})`,
                    ...(config.textColorTheme === 'custom' ? { borderColor: `${customColorVal}99` } : {}),
                  }}
                >
                  <span
                    className={`font-serif font-black drop-shadow-md transition-all ${textColorCfg.monogramGrad}`}
                    style={{
                      fontSize: `calc(clamp(1.4rem, 2.5vw, 2.8rem) * ${Math.min(1.3, textScaleFactor)})`,
                      ...(config.textColorTheme === 'custom' ? { color: customColorVal } : {}),
                    }}
                  >
                    {monogramGroom}{' '}
                    <span className={`${textColorCfg.monogramHeart} font-light`} style={config.textColorTheme === 'custom' ? { color: customColorVal } : {}}>♥</span>{' '}
                    {monogramBride}
                  </span>
                </div>
              </div>
            )}

            {/* Tiêu Đề Buổi Lễ (LỄ THÀNH HÔN / LỄ VU QUY) */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className={`w-8 sm:w-24 h-px bg-gradient-to-r ${textColorCfg.borderGrad}`} />
              <h2
                className={`font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] drop-shadow-sm transition-all ${textColorCfg.titleGradient}`}
                style={{
                  fontSize: `calc(clamp(1.1rem, 2vw, 2.5rem) * ${textScaleFactor})`,
                  ...(config.textColorTheme === 'custom' ? { color: customColorVal } : {}),
                }}
              >
                {config.ceremonyTitle}
              </h2>
              <div className={`w-8 sm:w-24 h-px bg-gradient-to-l ${textColorCfg.borderGradL}`} />
            </div>

            {/* Tên Cô Dâu & Chú Rể (Nổi Bật Nhất Trên Sân Khấu 16:9) */}
            <div className="my-1 sm:my-3">
              <h1
                className={`font-black leading-tight transition-all duration-300 ${textColorCfg.nameGradient} ${textColorCfg.dropShadow} ${getFontFamily()}`}
                style={{
                  ...getFontFamilyStyle(),
                  ...(config.textColorTheme === 'custom' ? customStyle : {}),
                  fontSize: `calc(clamp(3.2rem, 7vw, 9.2rem) * ${textScaleFactor})`,
                }}
              >
                {formatName(config.groomName)}
                <span
                  className={`inline-block mx-3 sm:mx-6 font-serif font-light drop-shadow-lg ${textColorCfg.accentText}`}
                  style={{
                    fontSize: `calc(clamp(2.4rem, 5.2vw, 6.8rem) * ${textScaleFactor})`,
                    ...(config.textColorTheme === 'custom' ? { color: customColorVal } : {}),
                  }}
                >
                  &
                </span>
                {formatName(config.brideName)}
              </h1>
            </div>

            {/* Thông tin Gia Đình Hai Bên (Tùy chọn) */}
            {config.showParents && (
              <div
                className={`grid grid-cols-2 gap-4 sm:gap-8 my-2 font-medium ${textColorCfg.subText}`}
                style={{ fontSize: `calc(clamp(0.9rem, 1.5vw, 1.8rem) * ${textScaleFactor})` }}
              >
                <div className={`text-right border-r ${textColorCfg.borderColor} pr-4 sm:pr-8`}>
                  <span className={`block uppercase tracking-widest font-bold opacity-80 ${textColorCfg.accentText}`} style={{ fontSize: `calc(clamp(0.7rem, 1.1vw, 1.2rem) * ${textScaleFactor})` }}>Họ Nhà Trai</span>
                  <span>{config.groomParents}</span>
                </div>
                <div className="text-left pl-4 sm:pl-8">
                  <span className={`block uppercase tracking-widest font-bold opacity-80 ${textColorCfg.accentText}`} style={{ fontSize: `calc(clamp(0.7rem, 1.1vw, 1.2rem) * ${textScaleFactor})` }}>Họ Nhà Gái</span>
                  <span>{config.brideParents}</span>
                </div>
              </div>
            )}

            {/* Ngày Cưới (Dương Lịch & Âm Lịch) */}
            <div className="space-y-1">
              <div
                className={`flex items-center justify-center gap-2 sm:gap-4 font-extrabold tracking-widest drop-shadow-md ${textColorCfg.subText}`}
                style={{ fontSize: `calc(clamp(1.2rem, 2.4vw, 2.8rem) * ${textScaleFactor})` }}
              >
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
                    <span className={textColorCfg.accentText}>•</span>
                    <span>{config.weddingTime}</span>
                  </>
                )}
              </div>

              {config.showLunarDate && config.lunarDate && (
                <p
                  className={`font-serif italic tracking-wider opacity-85 ${textColorCfg.subText}`}
                  style={{ fontSize: `calc(clamp(0.9rem, 1.4vw, 1.6rem) * ${textScaleFactor})` }}
                >
                  ({config.lunarDate})
                </p>
              )}
            </div>

            {/* Địa Điểm & Sảnh Tiệc */}
            {config.showVenue && config.venue && (
              <div
                className={`font-medium tracking-wide ${textColorCfg.subText}`}
                style={{ fontSize: `calc(clamp(0.95rem, 1.6vw, 1.9rem) * ${textScaleFactor})` }}
              >
                <span>{config.venue}</span>
                {config.hallName && (
                  <span
                    className={`block font-bold mt-0.5 ${textColorCfg.accentText}`}
                    style={{ fontSize: `calc(clamp(0.85rem, 1.3vw, 1.5rem) * ${textScaleFactor})` }}
                  >
                    ✦ {config.hallName} ✦
                  </span>
                )}
              </div>
            )}

            {/* Câu Chúc / Châm Ngôn Tình Yêu */}
            {config.showQuote && config.loveQuote && (
              <div className={`mt-2 pt-2 border-t ${textColorCfg.borderColor} max-w-2xl mx-auto`}>
                <p
                  className={`font-serif italic tracking-widest drop-shadow-sm opacity-90 ${textColorCfg.subText}`}
                  style={{ fontSize: `calc(clamp(0.9rem, 1.4vw, 1.7rem) * ${textScaleFactor})` }}
                >
                  "{config.loveQuote}"
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* CÁCH HIỂN THỊ: CHUYỂN CẢNH (SLIDESHOW CÁC PHÂN CẢNH SÂN KHẤU) */
          /* ============================================================== */
          <div
            className={`w-full flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
              isSceneTransitioning ? 'opacity-0 scale-95 blur-xs' : 'opacity-100 scale-100 blur-0'
            }`}
          >
            {/* PHÂN CẢNH 0: CẶP ĐÔI UYÊN ƯƠNG (MAIN COUPLE SHOWCASE) */}
            {currentScene === 0 && (
              <div className="space-y-4 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Monogram Lớn */}
                {config.showMonogram && (
                  <div className="flex justify-center">
                    <div
                      className={`relative inline-flex items-center justify-center rounded-full border-2 backdrop-blur-xs transition-all ${textColorCfg.monogramBg}`}
                      style={{
                        width: `calc(clamp(4.5rem, 8vw, 8rem) * ${Math.min(1.4, textScaleFactor)})`,
                        height: `calc(clamp(4.5rem, 8vw, 8rem) * ${Math.min(1.4, textScaleFactor)})`,
                        ...(config.textColorTheme === 'custom' ? { borderColor: `${customColorVal}99` } : {}),
                      }}
                    >
                      <span
                        className={`font-serif font-black drop-shadow-md transition-all ${textColorCfg.monogramGrad}`}
                        style={{
                          fontSize: `calc(clamp(1.8rem, 3.5vw, 3.8rem) * ${Math.min(1.4, textScaleFactor)})`,
                          ...(config.textColorTheme === 'custom' ? { color: customColorVal } : {}),
                        }}
                      >
                        {monogramGroom}{' '}
                        <span className={`${textColorCfg.monogramHeart} font-light`}>♥</span>{' '}
                        {monogramBride}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tiêu đề buổi lễ */}
                <div className="flex items-center justify-center gap-3 sm:gap-6">
                  <div className={`w-12 sm:w-32 h-px bg-gradient-to-r ${textColorCfg.borderGrad}`} />
                  <h2
                    className={`font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] drop-shadow-sm transition-all ${textColorCfg.titleGradient}`}
                    style={{
                      fontSize: `calc(clamp(1.2rem, 2.4vw, 2.8rem) * ${textScaleFactor})`,
                      ...(config.textColorTheme === 'custom' ? { color: customColorVal } : {}),
                    }}
                  >
                    {config.ceremonyTitle}
                  </h2>
                  <div className={`w-12 sm:w-32 h-px bg-gradient-to-l ${textColorCfg.borderGradL}`} />
                </div>

                {/* Tên Cực Đại Cho Màn Hình 16:9 */}
                <div>
                  <h1
                    className={`font-black leading-tight transition-all duration-300 ${textColorCfg.nameGradient} ${textColorCfg.dropShadow} ${getFontFamily()}`}
                    style={{
                      ...getFontFamilyStyle(),
                      ...(config.textColorTheme === 'custom' ? customStyle : {}),
                      fontSize: `calc(clamp(3.8rem, 8vw, 10.5rem) * ${textScaleFactor})`,
                    }}
                  >
                    {formatName(config.groomName)}
                    <span
                      className={`inline-block mx-3 sm:mx-8 font-serif font-light drop-shadow-lg ${textColorCfg.accentText}`}
                      style={{
                        fontSize: `calc(clamp(2.8rem, 6vw, 8rem) * ${textScaleFactor})`,
                        ...(config.textColorTheme === 'custom' ? { color: customColorVal } : {}),
                      }}
                    >
                      &
                    </span>
                    {formatName(config.brideName)}
                  </h1>
                </div>

                {/* Huy hiệu chúc phúc */}
                <div className="flex items-center justify-center gap-3">
                  <span
                    className={`px-4 sm:px-6 py-1.5 rounded-full border text-xs sm:text-base font-bold tracking-widest backdrop-blur-xs ${textColorCfg.badgeBg}`}
                  >
                    {config.slideCoupleBadge || '✦ TRĂM NĂM HẠNH PHÚC • VẸN NGUYÊN NGHĨA PHU THÊ ✦'}
                  </span>
                </div>
              </div>
            )}

            {/* PHÂN CẢNH 1: GIA ĐÌNH HAI BÊN (PARENTS & FAMILIES) */}
            {currentScene === 1 && (
              <div className="w-full max-w-5xl space-y-6 sm:space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-center gap-3 sm:gap-6">
                  <div className={`w-8 sm:w-20 h-px bg-gradient-to-r ${textColorCfg.borderGrad}`} />
                  <span
                    className={`font-black uppercase tracking-[0.25em] ${textColorCfg.titleGradient}`}
                    style={{ fontSize: `calc(clamp(1.1rem, 2.2vw, 2.4rem) * ${textScaleFactor})` }}
                  >
                    {config.ceremonyTitle}
                  </span>
                  <div className={`w-8 sm:w-20 h-px bg-gradient-to-l ${textColorCfg.borderGradL}`} />
                </div>

                <h2
                  className={`font-black uppercase tracking-wider ${textColorCfg.nameGradient} ${textColorCfg.dropShadow}`}
                  style={{
                    fontSize: `calc(clamp(2rem, 4vw, 4.5rem) * ${textScaleFactor})`,
                    ...(config.textColorTheme === 'custom' ? customStyle : {}),
                  }}
                >
                  {config.slideFamilyTitle || 'GIA ĐÌNH & ĐẤNG SINH THÀNH'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 text-center">
                  {/* Cột Họ Nhà Trai */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border bg-black/40 backdrop-blur-md shadow-xl ${textColorCfg.borderColor} space-y-3`}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-widest">
                      {config.slideGroomFamilyLabel || '✦ HỌ NHÀ TRAI ✦'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm uppercase tracking-wider text-slate-300 font-semibold">Thân Phụ & Thân Mẫu</p>
                      <h4
                        className={`font-bold ${textColorCfg.subText}`}
                        style={{ fontSize: `calc(clamp(1.3rem, 2.4vw, 2.6rem) * ${textScaleFactor})` }}
                      >
                        {config.groomParents}
                      </h4>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-xs text-slate-400">Chú Rể:</span>
                      <p
                        className={`font-black ${textColorCfg.accentText}`}
                        style={{ fontSize: `calc(clamp(1.4rem, 2.8vw, 3rem) * ${textScaleFactor})` }}
                      >
                        {formatName(config.groomName)}
                      </p>
                    </div>
                  </div>

                  {/* Cột Họ Nhà Gái */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border bg-black/40 backdrop-blur-md shadow-xl ${textColorCfg.borderColor} space-y-3`}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-rose-400/20 text-rose-300 text-xs sm:text-sm font-bold uppercase tracking-widest">
                      {config.slideBrideFamilyLabel || '✦ HỌ NHÀ GÁI ✦'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm uppercase tracking-wider text-slate-300 font-semibold">Thân Phụ & Thân Mẫu</p>
                      <h4
                        className={`font-bold ${textColorCfg.subText}`}
                        style={{ fontSize: `calc(clamp(1.3rem, 2.4vw, 2.6rem) * ${textScaleFactor})` }}
                      >
                        {config.brideParents}
                      </h4>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-xs text-slate-400">Cô Dâu:</span>
                      <p
                        className={`font-black ${textColorCfg.accentText}`}
                        style={{ fontSize: `calc(clamp(1.4rem, 2.8vw, 3rem) * ${textScaleFactor})` }}
                      >
                        {formatName(config.brideName)}
                      </p>
                    </div>
                  </div>
                </div>

                <p
                  className={`font-serif italic tracking-widest text-center ${textColorCfg.subText}`}
                  style={{ fontSize: `calc(clamp(1rem, 1.6vw, 1.8rem) * ${textScaleFactor})` }}
                >
                  "{config.slideFamilyQuote || 'Cảm tạ ân sinh thành dưỡng dục • Nguyện trọn đạo hiếu thuận cháu con'}"
                </p>
              </div>
            )}

            {/* PHÂN CẢNH 2: NGÀY LÀNH & SẢNH TIỆC (DATE, TIME & VENUE) */}
            {currentScene === 2 && (
              <div className="w-full max-w-4xl space-y-6 sm:space-y-9 animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-2">
                  <p
                    className={`font-serif italic tracking-widest ${textColorCfg.accentText}`}
                    style={{ fontSize: `calc(clamp(1.1rem, 2vw, 2.2rem) * ${textScaleFactor})` }}
                  >
                    {formatName(config.groomName)} ♥ {formatName(config.brideName)}
                  </p>
                  <h2
                    className={`font-black uppercase tracking-[0.25em] ${textColorCfg.titleGradient}`}
                    style={{ fontSize: `calc(clamp(1.3rem, 2.5vw, 3rem) * ${textScaleFactor})` }}
                  >
                    {config.slideDateTitle || 'NGÀY LÀNH KHỞI ĐẦU HẠNH PHÚC'}
                  </h2>
                </div>

                {/* Ngày Dương Lịch Khổng Lồ */}
                <div className="p-6 sm:p-10 rounded-3xl bg-black/40 backdrop-blur-md border border-white/15 shadow-2xl space-y-3">
                  <div
                    className={`font-black tracking-widest drop-shadow-lg ${textColorCfg.nameGradient}`}
                    style={{
                      fontSize: `calc(clamp(2.4rem, 5vw, 6.2rem) * ${textScaleFactor})`,
                      ...(config.textColorTheme === 'custom' ? customStyle : {}),
                    }}
                  >
                    {new Date(config.weddingDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>

                  {config.showTime && (
                    <div
                      className={`font-bold tracking-widest ${textColorCfg.accentText}`}
                      style={{ fontSize: `calc(clamp(1.6rem, 3.4vw, 4rem) * ${textScaleFactor})` }}
                    >
                      HOÀNG ĐẠO • {config.weddingTime}
                    </div>
                  )}

                  {config.showLunarDate && config.lunarDate && (
                    <p
                      className={`font-serif italic tracking-wider text-slate-300 pt-2 border-t border-white/10`}
                      style={{ fontSize: `calc(clamp(1.1rem, 2vw, 2.4rem) * ${textScaleFactor})` }}
                    >
                      ({config.lunarDate})
                    </p>
                  )}
                </div>

                {/* Địa Điểm & Sảnh Tiệc */}
                {config.showVenue && config.venue && (
                  <div className="space-y-1">
                    <p
                      className={`font-bold ${textColorCfg.subText}`}
                      style={{ fontSize: `calc(clamp(1.3rem, 2.4vw, 2.8rem) * ${textScaleFactor})` }}
                    >
                      {config.venue}
                    </p>
                    {config.hallName && (
                      <p
                        className={`font-black tracking-widest ${textColorCfg.accentText}`}
                        style={{ fontSize: `calc(clamp(1.2rem, 2.2vw, 2.5rem) * ${textScaleFactor})` }}
                      >
                        ✦ {config.hallName} ✦
                      </p>
                    )}
                    {config.slideDateNote && (
                      <p
                        className={`font-serif italic tracking-wide pt-1 opacity-90 ${textColorCfg.accentText}`}
                        style={{ fontSize: `calc(clamp(0.9rem, 1.4vw, 1.6rem) * ${textScaleFactor})` }}
                      >
                        ✦ {config.slideDateNote} ✦
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PHÂN CẢNH 3: LỜI THỀ NGUYỆN & CHÂM NGÔN TÌNH YÊU (VOWS & QUOTES) */}
            {currentScene === 3 && (
              <div className="w-full max-w-4xl space-y-6 sm:space-y-9 animate-in fade-in zoom-in-95 duration-500">
                {/* Monogram */}
                {config.showMonogram && (
                  <div className="flex justify-center">
                    <div
                      className={`relative inline-flex items-center justify-center rounded-full border-2 backdrop-blur-xs transition-all ${textColorCfg.monogramBg}`}
                      style={{
                        width: `calc(clamp(4.2rem, 7.5vw, 7.5rem) * ${Math.min(1.3, textScaleFactor)})`,
                        height: `calc(clamp(4.2rem, 7.5vw, 7.5rem) * ${Math.min(1.3, textScaleFactor)})`,
                      }}
                    >
                      <span
                        className={`font-serif font-black drop-shadow-md transition-all ${textColorCfg.monogramGrad}`}
                        style={{
                          fontSize: `calc(clamp(1.7rem, 3.2vw, 3.4rem) * ${Math.min(1.3, textScaleFactor)})`,
                        }}
                      >
                        {monogramGroom} <span className={textColorCfg.monogramHeart}>♥</span> {monogramBride}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                    <div className={`w-8 sm:w-20 h-px bg-gradient-to-r ${textColorCfg.borderGrad}`} />
                    <span
                      className={`font-black uppercase tracking-[0.3em] ${textColorCfg.titleGradient}`}
                      style={{ fontSize: `calc(clamp(1.1rem, 2.2vw, 2.4rem) * ${textScaleFactor})` }}
                    >
                      {config.slideQuoteTitle || 'LỜI NGUYỆN ƯỚC TRĂM NĂM'}
                    </span>
                    <div className={`w-8 sm:w-20 h-px bg-gradient-to-l ${textColorCfg.borderGradL}`} />
                  </div>

                  {/* Lời chúc khổng lồ */}
                  <div className="p-6 sm:p-10 rounded-3xl bg-black/40 backdrop-blur-md border border-white/15 shadow-2xl">
                    <h3
                      className={`font-serif italic font-medium leading-relaxed drop-shadow-lg ${textColorCfg.nameGradient}`}
                      style={{
                        ...getFontFamilyStyle(),
                        fontSize: `calc(clamp(1.7rem, 3.8vw, 4.8rem) * ${textScaleFactor})`,
                        ...(config.textColorTheme === 'custom' ? customStyle : {}),
                      }}
                    >
                      "{config.loveQuote || 'Trăm năm tình viên mãn • Bạc đầu nghĩa phu thê'}"
                    </h3>
                  </div>

                  <p
                    className={`font-bold tracking-widest ${textColorCfg.accentText}`}
                    style={{ fontSize: `calc(clamp(1.3rem, 2.6vw, 3rem) * ${textScaleFactor})` }}
                  >
                    {formatName(config.groomName)} ♥ {formatName(config.brideName)}
                  </p>
                  <p className="text-xs sm:text-base text-slate-400 font-serif italic">
                    "{config.slideQuoteEnding || 'Nguyện cùng nhau đi qua năm tháng bình an • Trọn vẹn yêu thương'}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* THANH ĐIỀU HƯỚNG PHÂN CẢNH KHI Ở CHẾ ĐỘ CHUYỂN CẢNH (SLIDESHOW SCENE CONTROLS) */}
      {config.displayMode === 'slideshow' && (
        <div
          className={`fixed top-6 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-300 ${
            controlsVisible || isSettingsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
          }`}
        >
          <button
            onClick={() => setCurrentScene(prev => getPrevScene(prev))}
            className="p-1.5 rounded-full hover:bg-white/15 text-white transition cursor-pointer"
            title="Cảnh trước đó"
          >
            <SkipBack className="w-4 h-4 text-amber-300" />
          </button>

          <div className="flex items-center gap-1.5 mx-1">
            {[
              { idx: 0, label: 'Cặp Đôi' },
              { idx: 1, label: 'Hai Họ' },
              { idx: 2, label: 'Ngày & Sảnh' },
              { idx: 3, label: 'Lời Chúc' },
            ].map(sc => {
              const isEnabled = activeSlides.includes(sc.idx);
              return (
                <button
                  key={sc.idx}
                  onClick={() => setCurrentScene(sc.idx)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    currentScene === sc.idx
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : isEnabled
                      ? 'bg-white/10 text-white/80 hover:bg-white/20'
                      : 'bg-white/5 text-slate-500 opacity-60'
                  }`}
                  title={isEnabled ? sc.label : `${sc.label} (Đang tắt trong Slideshow)`}
                >
                  <span>{sc.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentScene(prev => getNextScene(prev))}
            className="p-1.5 rounded-full hover:bg-white/15 text-white transition cursor-pointer"
            title="Cảnh kế tiếp"
          >
            <SkipForward className="w-4 h-4 text-amber-300" />
          </button>

          <div className="w-px h-4 bg-white/20 mx-0.5" />

          <button
            onClick={() => setIsSlideshowPaused(p => !p)}
            className="p-1.5 rounded-full hover:bg-white/15 text-white transition cursor-pointer"
            title={isSlideshowPaused ? 'Tiếp tục tự động chuyển cảnh' : 'Tạm dừng chuyển cảnh'}
          >
            {isSlideshowPaused ? (
              <Play className="w-4 h-4 text-emerald-400" />
            ) : (
              <Pause className="w-4 h-4 text-amber-300" />
            )}
          </button>
        </div>
      )}

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

            {/* ============================================================== */}
            {/* 1. CÁCH HIỂN THỊ: TĨNH vs CHUYỂN CẢNH (DISPLAY MODE) */}
            {/* ============================================================== */}
            <div className="space-y-2.5 pb-3 border-b border-white/10">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cách Hiển Thị Màn Hình LED:</span>
                </span>
                <span className="text-[11px] text-amber-200/80 font-normal">
                  {config.displayMode === 'static' ? '✦ Đang ở chế độ Tĩnh' : '✦ Đang ở chế độ Chuyển Cảnh'}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Lựa chọn 1: Tĩnh */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, displayMode: 'static' }))}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    config.displayMode === 'static'
                      ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30 shadow-md'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-0.5">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">Tĩnh (Cố định toàn diện)</h4>
                      {config.displayMode === 'static' && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-200/90 font-bold mt-0.5">
                      Trang trọng · Tất cả thông tin trên 1 màn hình
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                      Hiển thị trọn vẹn Tên cô dâu chú rể, Ngày cưới, Địa điểm tiệc và Lời chúc cùng lúc. Phù hợp làm phông sân khấu chụp ảnh và làm lễ chính.
                    </p>
                  </div>
                </div>

                {/* Lựa chọn 2: Chuyển cảnh */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, displayMode: 'slideshow' }))}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    config.displayMode === 'slideshow'
                      ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30 shadow-md'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-indigo-400/20 text-indigo-300 shrink-0 mt-0.5">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">Chuyển Cảnh (Slideshow tự động)</h4>
                      {config.displayMode === 'slideshow' && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                      )}
                    </div>
                    <p className="text-[11px] text-indigo-200/90 font-bold mt-0.5">
                      Hoành tráng · Luân chuyển 4 phân cảnh sân khấu
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                      Tự động chuyển cảnh: [1. Cặp Đôi Uyên Ương Cực Đại] ➜ [2. Gia Đình Hai Họ] ➜ [3. Ngày Lành & Sảnh Tiệc] ➜ [4. Lời Nguyện Ước Trăm Năm].
                    </p>
                  </div>
                </div>
              </div>

              {/* Tốc độ chuyển cảnh nếu chọn chế độ Slideshow */}
              {config.displayMode === 'slideshow' && (
                <div className="pt-2 flex items-center justify-between gap-2 p-3 bg-white/5 border border-amber-300/20 rounded-2xl animate-in fade-in">
                  <div className="text-xs">
                    <span className="font-bold text-amber-200 block">Thời gian hiển thị mỗi cảnh:</span>
                    <span className="text-[10px] text-slate-400">Tự động chuyển tiếp sau số giây được chọn</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { sec: 5, label: '5 giây' },
                      { sec: 8, label: '8 giây (Khuyên dùng)' },
                      { sec: 12, label: '12 giây' },
                      { sec: 15, label: '15 giây' },
                    ].map(speed => (
                      <button
                        key={speed.sec}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, transitionSpeedSeconds: speed.sec }))}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          (config.transitionSpeedSeconds || 8) === speed.sec
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                            : 'bg-white/10 text-slate-300 border-white/15 hover:bg-white/20'
                        }`}
                      >
                        {speed.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* 2. PHÓNG TO CỠ CHỮ SÂN KHẤU 16:9 (TEXT SCALE SLIDER) */}
            {/* ============================================================== */}
            <div className="space-y-2.5 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Phóng To Cỡ Chữ Sân Khấu 16:9 (Chống Nhỏ Chữ):</span>
                </label>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-400/40">
                  {config.textScale ?? 130}%
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="80"
                  max="220"
                  step="5"
                  value={config.textScale ?? 130}
                  onChange={e => setConfig(prev => ({ ...prev, textScale: Number(e.target.value) }))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-white/20 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>80% (Gọn)</span>
                  <span>100% (Tiêu chuẩn)</span>
                  <span>130% (Rõ nét 16:9)</span>
                  <span>160% (Lớn)</span>
                  <span>220% (Cực đại)</span>
                </div>
              </div>

              {/* Nút bấm nhanh các mức phóng đại */}
              <div className="flex gap-2">
                {[
                  { scale: 100, label: '100% Tiêu chuẩn' },
                  { scale: 130, label: '130% Rõ nét 16:9' },
                  { scale: 160, label: '160% Lớn nổi bật' },
                  { scale: 200, label: '200% Cực đại LED' },
                ].map(item => (
                  <button
                    key={item.scale}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, textScale: item.scale }))}
                    className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      (config.textScale ?? 130) === item.scale
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-xs'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. MÀU SẮC CHỮ SÂN KHẤU NGHỆ THUẬT (TEXT COLOR THEMES) */}
            {/* ============================================================== */}
            <div className="space-y-2.5 pb-3 border-b border-white/10">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Màu Sắc Chữ Nghệ Thuật:</span>
                </span>
                <span className="text-[11px] text-amber-200/80 font-normal">
                  {config.textColorTheme === 'gold' && '✦ Hoàng Gia Ánh Kim'}
                  {config.textColorTheme === 'rosegold' && '✦ Vàng Hồng Lãng Mạn (Rose Gold)'}
                  {config.textColorTheme === 'white' && '✦ Trắng Ngọc Trai Thuần Khiết'}
                  {config.textColorTheme === 'silver' && '✦ Ánh Trăng Bạc Tinh Khôi'}
                  {config.textColorTheme === 'ruby' && '✦ Đỏ Ruby Ánh Kim'}
                  {config.textColorTheme === 'custom' && `✦ Mã màu tùy chọn (${config.customTextColor || '#ffd700'})`}
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'gold',
                    name: 'Hoàng Gia Ánh Kim',
                    desc: 'Vàng kim quý phái rực rỡ',
                    preview: 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400',
                  },
                  {
                    id: 'rosegold',
                    name: 'Vàng Hồng (Rose Gold)',
                    desc: 'Ngọt ngào lãng mạn cao cấp',
                    preview: 'bg-gradient-to-r from-rose-200 via-pink-100 to-rose-400',
                  },
                  {
                    id: 'white',
                    name: 'Trắng Ngọc Trai',
                    desc: 'Thuần khiết & sáng rõ trên mọi nền',
                    preview: 'bg-gradient-to-r from-white via-slate-100 to-slate-300',
                  },
                  {
                    id: 'silver',
                    name: 'Ánh Trăng Bạc',
                    desc: 'Thanh lịch tinh khôi hoàng gia',
                    preview: 'bg-gradient-to-r from-slate-200 via-blue-100 to-indigo-300',
                  },
                  {
                    id: 'ruby',
                    name: 'Đỏ Ruby Ánh Kim',
                    desc: 'May mắn tài lộc rực rỡ',
                    preview: 'bg-gradient-to-r from-yellow-200 via-rose-300 to-red-500',
                  },
                  {
                    id: 'custom',
                    name: 'Tùy Chọn Màu Riêng',
                    desc: 'Chọn mã màu bất kỳ bạn muốn',
                    preview: 'bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300',
                  },
                ].map(col => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, textColorTheme: col.id as any }))}
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      config.textColorTheme === col.id
                        ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30 shadow-xs'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className={`h-4 rounded-lg mb-1.5 ${col.preview}`} />
                      <span className="text-xs font-bold text-white block">{col.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{col.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bảng chọn mã màu tùy chọn nếu chọn chế độ custom */}
              {config.textColorTheme === 'custom' && (
                <div className="p-3 rounded-2xl bg-white/5 border border-amber-300/30 flex items-center gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.customTextColor || '#ffd700'}
                      onChange={e => setConfig(prev => ({ ...prev, customTextColor: e.target.value }))}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-white/20 bg-transparent p-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Chọn màu chữ theo ý thích:</span>
                      <span className="text-[10px] text-slate-400">Click vào ô màu để chọn hoặc nhập mã HEX</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={config.customTextColor || '#ffd700'}
                    onChange={e => setConfig(prev => ({ ...prev, customTextColor: e.target.value }))}
                    placeholder="#ffd700"
                    className="w-28 bg-slate-800 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white text-center ml-auto"
                  />
                </div>
              )}
            </div>

            {/* MẪU PHÔNG NỀN ĐỘNG (MOTION PATTERN) */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mẫu Phông Nền Động (Hiệu Ứng Sân Khấu):</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Mẫu 1: Tinh Tú */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'tinhtu' }))}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    config.motionPattern === 'tinhtu'
                      ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">Tinh Tú</h4>
                      {config.motionPattern === 'tinhtu' && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-200/90 font-bold mt-0.5">
                      Sao rơi · Nhẹ nhàng & lãng mạn
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Bầu trời đêm sao thở êm đềm, tinh tú kim cương lấp lánh đa giác lãng mạn
                    </p>
                  </div>
                </div>

                {/* Mẫu 2: Sao Băng */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'saobang' }))}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    config.motionPattern === 'saobang'
                      ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300 shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">Sao Băng</h4>
                      {config.motionPattern === 'saobang' && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                      )}
                    </div>
                    <p className="text-[11px] text-cyan-200/90 font-bold mt-0.5">
                      Sao băng rơi · Đĩa ngân hà loang sóng
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Đĩa thiên hà xoay tròn & vòng sóng hào quang lan tỏa, mưa sao băng rực rỡ
                    </p>
                  </div>
                </div>

                {/* Mẫu 3: Pha Lê Ánh Kim */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'phale' }))}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    config.motionPattern === 'phale'
                      ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-yellow-400/20 text-yellow-300 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">Pha Lê Ánh Kim</h4>
                      {config.motionPattern === 'phale' && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-200/90 font-bold mt-0.5">
                      Bokeh pha lê · Đèn chùm tiệc cưới 5 sao
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Hạt sáng lung linh ánh vàng ấm áp sang trọng như sảnh tiệc hoàng gia
                    </p>
                  </div>
                </div>

                {/* Mẫu 4: Hỷ Sự Cát Tường */}
                <div
                  onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'hysu' }))}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                    config.motionPattern === 'hysu'
                      ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-rose-400/20 text-rose-300 shrink-0 mt-0.5">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">Hỷ Sự Cát Tường</h4>
                      {config.motionPattern === 'hysu' && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                      )}
                    </div>
                    <p className="text-[11px] text-rose-200/90 font-bold mt-0.5">
                      Đỏ Ruby nhung · Bụi hoa đăng chúc phúc
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tông màu may mắn truyền thống kết hợp ánh vàng kim quý phái
                    </p>
                  </div>
                </div>
              </div>
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

            {/* TÙY CHỌN ẢNH NỀN TẢI LÊN (CUSTOM BACKGROUND) */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Ảnh Nền Sân Khấu (Tải Lên / Tùy Chỉnh):</span>
                </label>
                {config.customBackgroundUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold cursor-pointer transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa ảnh & Về nền gốc</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadBackground}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Tải Nền Sao / Ảnh Sân Khấu Của Bạn (JPG / PNG)</span>
                </button>
              </div>

              {/* Nếu có ảnh nền tùy chỉnh đang hoạt động */}
              {config.customBackgroundUrl ? (
                <div className="bg-white/5 border border-amber-400/30 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-20 h-14 rounded-xl bg-cover bg-center border border-amber-300 shrink-0 shadow-md"
                      style={{ backgroundImage: `url(${config.customBackgroundUrl})` }}
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-amber-200 truncate">Ảnh nền của bạn đang hiển thị</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Chỉnh thanh trượt dưới đây để tên cô dâu chú rể sáng rõ và không bị chìm.
                      </p>
                    </div>
                  </div>

                  {/* Thanh trượt Độ Tối Nền */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                      <span>Độ tối lớp phủ (Để chữ vàng kim nổi bật):</span>
                      <span className="text-amber-300 font-mono font-bold">{config.bgDarkness ?? 40}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="85"
                      step="5"
                      value={config.bgDarkness ?? 40}
                      onChange={e => setConfig(prev => ({ ...prev, bgDarkness: Number(e.target.value) }))}
                      className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                    />
                  </div>

                  {/* Thanh trượt Độ Mờ Nền */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                      <span>Độ mờ hậu cảnh (Làm mịn / Xóa phông Bokeh):</span>
                      <span className="text-amber-300 font-mono font-bold">{config.bgBlur ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={config.bgBlur ?? 0}
                      onChange={e => setConfig(prev => ({ ...prev, bgBlur: Number(e.target.value) }))}
                      className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                    />
                  </div>

                  {/* Bật / Tắt Sao Băng Trên Nền Ảnh */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-slate-300">Cho mưa sao băng rơi trên nền ảnh của bạn:</span>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, showMeteors: !(prev.showMeteors ?? true) }))}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                        (config.showMeteors ?? true)
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {(config.showMeteors ?? true) ? 'Bật Sao Băng' : 'Tắt Sao Băng'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  💡 Bạn có thể tải bất kỳ hình nền 3D sảnh tiệc, phông sao đêm 4K hoặc ảnh cưới nghệ thuật từ máy tính/điện thoại để chiếu lên sân khấu!
                </p>
              )}
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

            {/* BẢO VỆ CHỮ & ĐỘ SÁNG SAO (TRÁNH LÓA CHỮ) */}
            <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-300/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Vùng An Toàn Cho Chữ & Độ Sáng Sao:
                  </span>
                </div>
                <span className="text-[11px] text-amber-200/90 font-medium">
                  ✦ Giữ chữ luôn sắc nét & không bị chói lóa
                </span>
              </div>

              {/* Tùy chọn 1: Đẩy sao ra xa vùng chữ */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">Đẩy các ngôi sao ra xa vùng chữ (Khuyên dùng):</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Tự động tạo vùng an toàn trung tâm, dời các tinh tú kim cương và vệt sáng ra viền màn hình để chữ cô dâu chú rể luôn nổi bật rõ ràng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, starCenterSafeZone: !(prev.starCenterSafeZone ?? true) }))}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition cursor-pointer ${
                    (config.starCenterSafeZone ?? true)
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-white/10 text-slate-400 hover:bg-white/20'
                  }`}
                >
                  {(config.starCenterSafeZone ?? true) ? '✓ Đang Bật (Đẩy ra viền)' : 'Tắt (Rải đều)'}
                </button>
              </div>

              {/* Tùy chọn 2: Điều chỉnh độ sáng sao */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Độ sáng & dịu của sao:</span>
                  <span className="font-mono font-bold text-amber-300">{config.starBrightness ?? 60}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={config.starBrightness ?? 60}
                  onChange={e => setConfig(prev => ({ ...prev, starBrightness: Number(e.target.value) }))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                />
                <div className="flex gap-2 pt-1">
                  {[
                    { val: 40, label: '40% Dịu nhẹ' },
                    { val: 60, label: '60% Chuẩn tiệc cưới' },
                    { val: 85, label: '85% Rực rỡ' },
                  ].map(b => (
                    <button
                      key={b.val}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, starBrightness: b.val }))}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        (config.starBrightness ?? 60) === b.val
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CHỈNH FONT CHỮ & KIỂU CHỮ NGHỆ THUẬT */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  <span>Chỉnh Font Chữ & Kiểu Hiển Thị:</span>
                </label>
                <span className="text-[11px] text-amber-200/90 font-serif italic">
                  {config.fontFamily === 'playfair' && '✦ Playfair Display (Hoàng Gia)'}
                  {config.fontFamily === 'cormorant' && '✦ Cormorant Garamond (Quý Tộc)'}
                  {config.fontFamily === 'dancing' && '✦ Dancing Script (Thư Pháp)'}
                  {config.fontFamily === 'cinzel' && '✦ Cinzel (La Mã Uy Nghi)'}
                  {config.fontFamily === 'bevietnam' && '✦ Be Vietnam Pro (Hiện Đại)'}
                  {config.fontFamily === 'serif' && '✦ Serif Classic'}
                </span>
              </div>

              {/* Danh sách 6 Font chữ nghệ thuật */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'playfair', name: 'Playfair Display', desc: 'Hoàng Gia Cổ Điển', sample: 'Quốc Bảo & Mai Linh', font: "'Playfair Display', serif" },
                  { id: 'cormorant', name: 'Cormorant Garamond', desc: 'Quý Tộc Thanh Lịch', sample: 'Quốc Bảo & Mai Linh', font: "'Cormorant Garamond', serif" },
                  { id: 'dancing', name: 'Dancing Script', desc: 'Thư Pháp Bay Bổng', sample: 'Quốc Bảo & Mai Linh', font: "'Dancing Script', cursive" },
                  { id: 'cinzel', name: 'Cinzel Roman', desc: 'La Mã Trang Trọng', sample: 'QUỐC BẢO & MAI LINH', font: "'Cinzel', serif" },
                  { id: 'bevietnam', name: 'Be Vietnam Pro', desc: 'Hiện Đại Sắc Nét', sample: 'Quốc Bảo & Mai Linh', font: "'Be Vietnam Pro', sans-serif" },
                  { id: 'serif', name: 'Serif Classic', desc: 'Mực Thước Truyền Thống', sample: 'Quốc Bảo & Mai Linh', font: "Georgia, serif" },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, fontFamily: f.id as any }))}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      config.fontFamily === f.id
                        ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30 shadow-xs'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span
                      className="text-xs sm:text-sm font-bold text-amber-200 block truncate"
                      style={{ fontFamily: f.font }}
                    >
                      {f.sample}
                    </span>
                    <span className="text-[11px] font-bold block text-white mt-1 truncate">{f.name}</span>
                    <span className="text-[9px] text-slate-400 block truncate">{f.desc}</span>
                  </button>
                ))}
              </div>

              {/* Tùy chỉnh Cỡ Chữ & Viết Hoa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-300 font-semibold block mb-1">Cỡ chữ Tên Cô Dâu Chú Rể:</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'normal', label: 'Vừa phải' },
                      { id: 'large', label: 'Lớn nổi bật' },
                      { id: 'huge', label: 'Khổng lồ 4K' },
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, fontSizePreset: sz.id as any }))}
                        className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          config.fontSizePreset === sz.id
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-300 font-semibold block mb-1">Kiểu chữ Tên:</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'titlecase', label: 'Chữ hoa đầu từ' },
                      { id: 'uppercase', label: 'IN HOA TOÀN BỘ' },
                    ].map(tc => (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, nameTextCase: tc.id as any }))}
                        className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl border transition cursor-pointer truncate ${
                          config.nameTextCase === tc.id
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {tc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* TÙY CHỈNH NỘI DUNG TỪNG SLIDE TRÌNH CHIẾU & CHUYỂN CẢNH */}
            {/* ============================================================== */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tùy Chỉnh Nội Dung Từng Slide Chuyển Cảnh:</span>
                </label>
                <span className="text-[11px] text-amber-200/80 italic font-serif">
                  ✦ Bấm vào từng slide để chỉnh sửa chữ & lời chúc
                </span>
              </div>

              {/* 4 Nút Tab chuyển đổi phân cảnh để chỉnh sửa */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { idx: 0, title: 'Slide 1', desc: 'Cặp Đôi', icon: Heart },
                  { idx: 1, title: 'Slide 2', desc: 'Gia Đình', icon: Users },
                  { idx: 2, title: 'Slide 3', desc: 'Ngày & Sảnh', icon: Calendar },
                  { idx: 3, title: 'Slide 4', desc: 'Lời Nguyện Ước', icon: Sparkles },
                ].map(tab => {
                  const isEnabled = activeSlides.includes(tab.idx);
                  const isSelected = slideEditTab === tab.idx;
                  return (
                    <button
                      key={tab.idx}
                      type="button"
                      onClick={() => setSlideEditTab(tab.idx)}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer relative ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/20 text-white ring-2 ring-amber-400/30 shadow-md'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-amber-300">{tab.title}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isEnabled ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                          title={isEnabled ? 'Đang bật chiếu' : 'Đang tắt'}
                        />
                      </div>
                      <span className="text-xs font-bold block text-white truncate">{tab.desc}</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {isEnabled ? 'Đang bật chiếu' : 'Tắt chiếu'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Thanh điều khiển nhanh cho Slide đang chọn */}
              <div className="p-3 rounded-2xl bg-white/5 border border-amber-300/20 flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={activeSlides.includes(slideEditTab)}
                    onChange={() => {
                      const current = activeSlides;
                      let next: number[];
                      if (current.includes(slideEditTab)) {
                        if (current.length === 1) {
                          toast.warning('Cần giữ ít nhất 1 slide!', 'Bạn không thể tắt toàn bộ các slide trong slideshow.');
                          return;
                        }
                        next = current.filter(s => s !== slideEditTab);
                        toast.info(`Đã tắt Slide ${slideEditTab + 1} khỏi Slideshow`);
                      } else {
                        next = [...current, slideEditTab].sort((a, b) => a - b);
                        toast.success(`Đã bật Slide ${slideEditTab + 1} vào Slideshow`);
                      }
                      setConfig(prev => ({ ...prev, enabledSlides: next }));
                    }}
                    className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    Bật chiếu Slide {slideEditTab + 1} trong Slideshow tự động
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentScene(slideEditTab);
                    toast.info(`Đang chuyển màn hình xem thử Slide ${slideEditTab + 1}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer ml-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Xem thử Slide {slideEditTab + 1} ngay</span>
                </button>
              </div>

              {/* CHI TIẾT CÁC Ô NHẬP NỘI DUNG TỪNG SLIDE */}
              {/* SLIDE 0: CẶP ĐÔI UYÊN ƯƠNG */}
              {slideEditTab === 0 && (
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-amber-300">
                      Nội dung Phân cảnh 1: Cặp Đôi Uyên Ương
                    </span>
                    <span className="text-[11px] text-slate-400">Tên CD-CR phóng lớn cực đại</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
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

                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block mb-1">
                        Dòng chữ huy hiệu / Lời chúc phúc dưới tên:
                      </span>
                      <input
                        type="text"
                        value={config.slideCoupleBadge || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideCoupleBadge: e.target.value }))}
                        placeholder="✦ TRĂM NĂM HẠNH PHÚC • VẸN NGUYÊN NGHĨA PHU THÊ ✦"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 1: GIA ĐÌNH & ĐẤNG SINH THÀNH */}
              {slideEditTab === 1 && (
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-amber-300">
                      Nội dung Phân cảnh 2: Gia Đình & Đấng Sinh Thành
                    </span>
                    <span className="text-[11px] text-slate-400">Cha mẹ hai bên & Lời tri ân</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block mb-1">Tiêu đề lớn phân cảnh:</span>
                      <input
                        type="text"
                        value={config.slideFamilyTitle || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideFamilyTitle: e.target.value }))}
                        placeholder="GIA ĐÌNH & ĐẤNG SINH THÀNH"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Cột Nhà Trai */}
                    <div className="p-3 rounded-xl bg-white/5 border border-amber-300/20 space-y-2">
                      <div>
                        <span className="text-[10px] text-amber-300 font-bold uppercase block mb-1">
                          Tiêu đề khung Nhà Trai:
                        </span>
                        <input
                          type="text"
                          value={config.slideGroomFamilyLabel || ''}
                          onChange={e => setConfig(prev => ({ ...prev, slideGroomFamilyLabel: e.target.value }))}
                          placeholder="✦ HỌ NHÀ TRAI ✦"
                          className="w-full bg-slate-800 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Thân phụ & Thân mẫu (Nhà Trai):
                        </span>
                        <input
                          type="text"
                          value={config.groomParents}
                          onChange={e => setConfig(prev => ({ ...prev, groomParents: e.target.value }))}
                          placeholder="Ông Nguyễn Văn A & Bà Trần Thị B"
                          className="w-full bg-slate-800 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Cột Nhà Gái */}
                    <div className="p-3 rounded-xl bg-white/5 border border-rose-300/20 space-y-2">
                      <div>
                        <span className="text-[10px] text-rose-300 font-bold uppercase block mb-1">
                          Tiêu đề khung Nhà Gái:
                        </span>
                        <input
                          type="text"
                          value={config.slideBrideFamilyLabel || ''}
                          onChange={e => setConfig(prev => ({ ...prev, slideBrideFamilyLabel: e.target.value }))}
                          placeholder="✦ HỌ NHÀ GÁI ✦"
                          className="w-full bg-slate-800 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">
                          Thân phụ & Thân mẫu (Nhà Gái):
                        </span>
                        <input
                          type="text"
                          value={config.brideParents}
                          onChange={e => setConfig(prev => ({ ...prev, brideParents: e.target.value }))}
                          placeholder="Ông Lê Văn C & Bà Phạm Thị D"
                          className="w-full bg-slate-800 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block mb-1">
                        Lời cảm tạ tri ân đấng sinh thành ở chân slide:
                      </span>
                      <input
                        type="text"
                        value={config.slideFamilyQuote || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideFamilyQuote: e.target.value }))}
                        placeholder="Cảm tạ ân sinh thành dưỡng dục • Nguyện trọn đạo hiếu thuận cháu con"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs italic text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: NGÀY LÀNH & SẢNH TIỆC */}
              {slideEditTab === 2 && (
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-amber-300">
                      Nội dung Phân cảnh 3: Ngày Lành & Sảnh Tiệc
                    </span>
                    <span className="text-[11px] text-slate-400">Thời khắc hôn lễ & Địa điểm sảnh</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block mb-1">Tiêu đề phân cảnh:</span>
                      <input
                        type="text"
                        value={config.slideDateTitle || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideDateTitle: e.target.value }))}
                        placeholder="NGÀY LÀNH KHỞI ĐẦU HẠNH PHÚC"
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
                      <span className="text-[11px] text-slate-400 block mb-1">Giờ hoàng đạo:</span>
                      <input
                        type="text"
                        value={config.weddingTime}
                        onChange={e => setConfig(prev => ({ ...prev, weddingTime: e.target.value }))}
                        placeholder="11:00 hoặc 18:00"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block mb-1">Ngày âm lịch:</span>
                      <input
                        type="text"
                        value={config.lunarDate}
                        onChange={e => setConfig(prev => ({ ...prev, lunarDate: e.target.value }))}
                        placeholder="Ví dụ: Nhằm ngày 12 tháng 10 năm Bính Ngọ"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Địa điểm / Trung tâm tiệc cưới:</span>
                      <input
                        type="text"
                        value={config.venue}
                        onChange={e => setConfig(prev => ({ ...prev, venue: e.target.value }))}
                        placeholder="Trung Tâm Tiệc Cưới White Palace"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Tên sảnh tiệc:</span>
                      <input
                        type="text"
                        value={config.hallName}
                        onChange={e => setConfig(prev => ({ ...prev, hallName: e.target.value }))}
                        placeholder="Sảnh Grand Ballroom"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block mb-1">
                        Thông điệp đón khách ở chân slide:
                      </span>
                      <input
                        type="text"
                        value={config.slideDateNote || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideDateNote: e.target.value }))}
                        placeholder="Hân hoan chào đón Quý khách quý và Quan viên hai họ"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs italic text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: LỜI NGUYỆN ƯỚC TRĂM NĂM */}
              {slideEditTab === 3 && (
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-amber-300">
                      Nội dung Phân cảnh 4: Lời Nguyện ƯỚc Trăm Năm
                    </span>
                    <span className="text-[11px] text-slate-400">Lời thề tình yêu & Thông điệp trăm năm</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Tiêu đề phân cảnh:</span>
                      <input
                        type="text"
                        value={config.slideQuoteTitle || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideQuoteTitle: e.target.value }))}
                        placeholder="LỜI NGUYỆN ƯỚC TRĂM NĂM"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">
                        Câu chúc / Lời thề tình yêu trung tâm (Cực đại):
                      </span>
                      <textarea
                        rows={2}
                        value={config.loveQuote}
                        onChange={e => setConfig(prev => ({ ...prev, loveQuote: e.target.value }))}
                        placeholder="Trăm năm tình viên mãn • Bạc đầu nghĩa phu thê"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs italic font-serif text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">
                        Câu chúc kết màn ở chân slide:
                      </span>
                      <input
                        type="text"
                        value={config.slideQuoteEnding || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideQuoteEnding: e.target.value }))}
                        placeholder="Nguyện cùng nhau đi qua năm tháng bình an • Trọn vẹn yêu thương"
                        className="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs italic text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}
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
