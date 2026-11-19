import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Maximize,
  Share2,
  Copy,
  Check,
  Palette,
  Sparkles,
  Layers,
  Type,
  ExternalLink,
  Volume2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Heart,
  ZoomIn,
  Maximize2,
  Play,
  Users,
  Calendar,
  Music,
  Wind,
  Waves,
  Crown,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { useToast } from '../context/ToastContext';
import {
  LedTheme,
  LedFont,
  LedMotionPattern,
  LedFontSize,
  LedTextCase,
  LedTextColor,
  LedDisplayMode,
  drawDiamondStar,
} from './WeddingLedScreenPage';
import {
  drawSilkBackdrop,
  drawGlowingPlanet,
  drawMilkyWayNebula,
  createMilkyWayStarfield,
  sampleMilkyWayPoint,
  isSilkPattern,
  createSilkMotes,
  SilkMote,
} from '../utils/weddingLedCanvas';
import { compressImage } from '../utils/imageCompressor';
import { splitParents, PRESET_WEDDING_SONGS } from '../utils/weddingAudio';

const STORAGE_KEY_LED = 'wedding_led_screen_config_v1';

export const WeddingLedCard: React.FC = () => {
  const { profile } = useWedding();
  const toast = useToast();

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LED);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          groomName: parsed.groomName || profile.groomName,
          brideName: parsed.brideName || profile.brideName,
          groomParents: parsed.groomParents || 'Ông Nguyễn Văn A & Bà Trần Thị B',
          brideParents: parsed.brideParents || 'Ông Lê Văn C & Bà Phạm Thị D',
          weddingDate: parsed.weddingDate || profile.weddingDate,
          venue: parsed.venue || profile.venue,
          hallName: parsed.hallName || 'Sảnh Grand Ballroom',
          motionPattern: (parsed.motionPattern === 'remsankhau' ? 'lua_xeply' : (parsed.motionPattern === 'lua' ? 'lua_song' : (parsed.motionPattern || 'lua_song'))) as LedMotionPattern,
          fontSizePreset: (parsed.fontSizePreset || 'large') as LedFontSize,
          nameTextCase: (parsed.nameTextCase || 'titlecase') as LedTextCase,
          fontFamily: (parsed.fontFamily || 'playfair') as LedFont,
          textColorTheme: (parsed.textColorTheme || 'gold') as LedTextColor,
          customTextColor: parsed.customTextColor || '#ffd700',
          textScale: parsed.textScale ?? 130,
          displayMode: (parsed.displayMode || 'static') as LedDisplayMode,
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
          slideScales: parsed.slideScales || { 0: 100, 1: 85, 2: 95, 3: 100 },
          slideColorThemes: parsed.slideColorThemes || {},
          slideCustomColors: parsed.slideCustomColors || {},
          bgDarkness: parsed.bgDarkness ?? 40,
          bgBlur: parsed.bgBlur ?? 0,
          showMeteors: parsed.showMeteors ?? true,
          starCenterSafeZone: parsed.starCenterSafeZone ?? true,
          starBrightness: parsed.starBrightness ?? 60,
        };
      } catch (e) {}
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
      theme: 'ruby' as LedTheme,
      motionPattern: 'lua_song' as LedMotionPattern,
      starSpeed: 'normal' as 'slow' | 'normal' | 'fast',
      starDensity: 'normal' as 'low' | 'normal' | 'high',
      fontFamily: 'playfair' as LedFont,
      fontSizePreset: 'large' as LedFontSize,
      nameTextCase: 'titlecase' as LedTextCase,
      textColorTheme: 'gold' as LedTextColor,
      customTextColor: '#ffd700',
      textScale: 130,
      displayMode: 'static' as LedDisplayMode,
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
      slideScales: { 0: 100, 1: 85, 2: 95, 3: 100 },
      slideColorThemes: {},
      slideCustomColors: {},
      showLunarDate: true,
      showVenue: true,
      showQuote: true,
      showMonogram: true,
      customBackgroundUrl: undefined as string | undefined,
      bgDarkness: 40,
      bgBlur: 0,
      showMeteors: true,
      starCenterSafeZone: true,
      starBrightness: 60,
    };
  });

  const [slideEditTab, setSlideEditTab] = useState<number>(0);
  const activeSlides = config.enabledSlides && config.enabledSlides.length > 0 ? config.enabledSlides : [0, 1, 2, 3];

  const getSlideScale = (slideIdx: number): number => {
    if (config.slideScales && typeof config.slideScales[slideIdx] === 'number') {
      return config.slideScales[slideIdx];
    }
    if (slideIdx === 1) return 85;
    if (slideIdx === 2) return 95;
    return 100;
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFontFamilyStyle = (): React.CSSProperties => {
    switch (config.fontFamily) {
      case 'playfair':
        return { fontFamily: "'Playfair Display', 'Times New Roman', serif" };
      case 'cormorant':
        return { fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontWeight: 700, letterSpacing: '0.03em' };
      case 'dancing':
      case 'script':
        return { fontFamily: "'Dancing Script', cursive", fontStyle: 'normal', fontWeight: 700, letterSpacing: '0em' };
      case 'cinzel':
        return { fontFamily: "'Playfair Display SC', 'Playfair Display', 'Times New Roman', serif", fontStyle: 'normal', letterSpacing: '0.06em' };
      case 'bevietnam':
      case 'sans':
        return { fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" };
      case 'serif':
      default:
        return { fontFamily: "'Playfair Display', 'Times New Roman', serif" };
    }
  };

  const formatName = (name: string) => {
    if (!name) return '';
    const clean = name.normalize('NFC').replace(/\s+/g, ' ').trim();
    if (config.nameTextCase === 'uppercase') {
      return clean.toLocaleUpperCase('vi-VN');
    }
    return clean;
  };
  const lastInitial = (name: string, fallback: string) => {
    const n = (name || '').normalize('NFC').trim();
    return n.charAt(n.lastIndexOf(' ') + 1) || fallback;
  };

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
      toast.success('Đã tải ảnh nền thành công!', 'Ảnh nền mới đã được áp dụng.');
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

  // Lưu cấu hình
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LED, JSON.stringify(config));
  }, [config]);

  const getSlideColorTheme = (slideIdx: number): LedTextColor => {
    return config.slideColorThemes?.[slideIdx] || config.textColorTheme || 'gold';
  };

  const getSlideCustomColor = (slideIdx: number): string => {
    return config.slideCustomColors?.[slideIdx] || config.customTextColor || '#ffd700';
  };

  // Helper phối màu chữ nghệ thuật
  const getTextColorConfig = (themeOverride?: LedTextColor) => {
    const theme = themeOverride || config.textColorTheme;
    switch (theme) {
      case 'rosegold':
        return {
          gradient: 'bg-gradient-to-r from-rose-200 via-pink-100 to-rose-400 bg-clip-text text-transparent',
          accent: 'text-rose-300',
          sub: 'text-rose-100',
          border: 'border-rose-300/40',
        };
      case 'white':
        return {
          gradient: 'bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent',
          accent: 'text-white',
          sub: 'text-slate-100',
          border: 'border-white/40',
        };
      case 'silver':
        return {
          gradient: 'bg-gradient-to-r from-slate-200 via-blue-100 to-indigo-300 bg-clip-text text-transparent',
          accent: 'text-indigo-200',
          sub: 'text-blue-100',
          border: 'border-indigo-300/40',
        };
      case 'ruby':
        return {
          gradient: 'bg-gradient-to-r from-yellow-200 via-rose-300 to-red-400 bg-clip-text text-transparent',
          accent: 'text-yellow-300',
          sub: 'text-rose-100',
          border: 'border-yellow-400/40',
        };
      case 'custom':
        return {
          gradient: '',
          accent: '',
          sub: 'text-white',
          border: 'border-white/40',
        };
      case 'gold':
      default:
        return {
          gradient: 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent',
          accent: 'text-amber-300',
          sub: 'text-amber-100',
          border: 'border-amber-300/40',
        };
    }
  };

  // Canvas hiệu ứng sao rơi mini cho khung xem trước (Preview)
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const w = (canvas.width = canvas.parentElement?.clientWidth || 400);
    const h = (canvas.height = canvas.parentElement?.clientHeight || 225);

    const safeZoneActive = config.starCenterSafeZone !== false;
    const brightnessMultiplier = (config.starBrightness ?? 60) / 100;
    const cx = w / 2;
    const cy = h * 0.48;
    const safeRx = w * 0.38;
    const safeRy = h * 0.35;

    const pushOutsideTextZone = (x: number, y: number): { x: number; y: number } => {
      if (!safeZoneActive) return { x, y };
      const dx = (x - cx) / safeRx;
      const dy = (y - cy) / safeRy;
      const normDist = Math.sqrt(dx * dx + dy * dy);
      if (normDist < 1.0) {
        const angle = Math.atan2(y - cy, x - cx) || (Math.random() * Math.PI * 2);
        const targetDist = 1.08 + Math.random() * 0.4;
        const newX = Math.max(10, Math.min(w - 10, cx + Math.cos(angle) * safeRx * targetDist));
        const newY = Math.max(10, Math.min(h - 10, cy + Math.sin(angle) * safeRy * targetDist));
        return { x: newX, y: newY };
      }
      return { x, y };
    };

    const isTinhTu = config.motionPattern === 'tinhtu';
    const starCount = isTinhTu ? 170 : 45;
    // Lớp hàng ngàn vì sao Ngân Hà dựng sẵn cho khung xem trước (mật độ bù cho khung nhỏ)
    const miniMilkyLayer = isTinhTu ? createMilkyWayStarfield(w, h, config.theme, 2.2) : null;

    const stars = Array.from({ length: starCount }, () => {
      let sx = Math.random() * w;
      let sy = Math.random() * h;
      if (isTinhTu && Math.random() < 0.85) {
        const p = sampleMilkyWayPoint(w, h);
        sx = p.x;
        sy = p.y;
      }
      return {
        x: sx,
        y: sy,
        size: isTinhTu ? Math.random() * 1.0 + 0.35 : Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        flicker: (Math.random() - 0.5) * 0.04,
      };
    });

    // Tinh tú kim cương & Hành tinh mini (Dày đặc ở đỉnh và đáy khi là Tinh Tú)
    const diamondColors = ['#ffffff', '#fef08a', '#e0f2fe', '#fbcfe8', '#fef9c3', '#fde047'];
    const miniDiamondCount = isTinhTu ? 34 : 12;
    const miniDiamondStars = Array.from({ length: miniDiamondCount }, () => {
      let rawX = Math.random() * w;
      let rawY = Math.random() * h;

      let kind: 'diamond4' | 'diamond8' | 'planet' | 'planet_ring' | 'pulsar' = 'diamond4';
      if (isTinhTu) {
        if (Math.random() < 0.60) {
          rawY = Math.random() * (h * 0.24) + 6;
        } else if (Math.random() < 0.95) {
          rawY = h - (Math.random() * (h * 0.23) + 8);
        }
        const kRoll = Math.random();
        if (kRoll < 0.06) kind = 'planet_ring';
        else if (kRoll < 0.16) kind = 'planet';
        else if (kRoll < 0.50) kind = 'diamond8';
        else if (kRoll < 0.75) kind = 'pulsar';
        else kind = 'diamond4';
      } else {
        kind = Math.random() > 0.6 ? 'diamond8' : 'diamond4';
      }

      const pos = pushOutsideTextZone(rawX, rawY);
      const baseSize = kind === 'planet' || kind === 'planet_ring'
        ? Math.random() * 2.0 + 1.8
        : kind === 'diamond8'
        ? Math.random() * 1.8 + 1.1
        : Math.random() * 1.4 + 0.7;

      return {
        x: pos.x,
        y: pos.y,
        size: baseSize,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: kind === 'pulsar' ? Math.random() * 0.05 + 0.03 : Math.random() * 0.03 + 0.015,
        color: diamondColors[Math.floor(Math.random() * diamondColors.length)],
        points: (kind === 'diamond8' ? 8 : 4) as (4 | 8),
        kind,
        hasRing: kind === 'planet_ring',
      };
    });

    interface MiniMeteor {
      x: number;
      y: number;
      len: number;
      spd: number;
      active: boolean;
    }
    const meteors: MiniMeteor[] = [
      { x: Math.random() * w, y: 0, len: 60, spd: 8, active: true },
      { x: Math.random() * w, y: 0, len: 75, spd: 11, active: true },
    ];

    const miniRipples = [
      { rad: 20 },
      { rad: 70 },
      { rad: 120 },
      { rad: 170 },
    ];

    const miniSilkMotes = createSilkMotes(20, w, h);
    let miniFrameTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      miniFrameTime += 16.6;

      // 1. CÁC MẪU MÀN HÌNH LỤA SATIN
      if (isSilkPattern(config.motionPattern)) {
        drawSilkBackdrop(ctx, w, h, miniFrameTime, config.theme, 1.0, brightnessMultiplier, miniSilkMotes, config.motionPattern as any);
        if (miniDiamondStars.length > 0) {
          miniDiamondStars.slice(0, 4).forEach(ds => {
            ds.phase += ds.pulseSpeed;
            const pulse = 0.5 + 0.5 * Math.sin(ds.phase);
            drawDiamondStar(ctx, ds.x, ds.y, ds.size * 0.7, (0.2 + 0.3 * pulse) * brightnessMultiplier, ds.color, 4, 0.7);
          });
        }
      }
      // 2. CÁC MẪU SAO BĂNG, TINH TÚ, PHA LÊ, HỶ SỰ
      else {
        // Nếu là mẫu "Sao Băng (Đĩa ngân hà loang sóng)"
        if (config.motionPattern === 'saobang') {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(-0.16);
          ctx.scale(1, 0.42);

          // Đĩa thiên hà (tâm trong suốt để bảo vệ chữ)
          const diskGrad = ctx.createRadialGradient(0, 0, w * 0.18, 0, 0, w * 0.45);
          diskGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          diskGrad.addColorStop(0.3, `rgba(217, 119, 6, ${0.08 * brightnessMultiplier})`);
          diskGrad.addColorStop(0.7, `rgba(147, 51, 234, ${0.05 * brightnessMultiplier})`);
          diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = diskGrad;
          ctx.beginPath();
          ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
          ctx.fill();

          // Vòng sóng loang
          miniRipples.forEach(r => {
            r.rad += 0.8;
            if (r.rad > w * 0.6) r.rad = w * 0.2;
            const progress = r.rad / (w * 0.6);
            const a = Math.sin(progress * Math.PI) * 0.25 * brightnessMultiplier;
            ctx.strokeStyle = `rgba(254, 240, 138, ${a})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(0, 0, r.rad, 0, Math.PI * 2);
            ctx.stroke();
          });

          ctx.restore();
        }

        // Vẽ dải ngân hà mini nếu là Tinh Tú
        if (isTinhTu) {
          drawMilkyWayNebula(ctx, w, h, miniFrameTime, config.theme, brightnessMultiplier);
          if (miniMilkyLayer) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, 0.45 + brightnessMultiplier * 0.75);
            ctx.drawImage(miniMilkyLayer, 0, 0, w, h);
            ctx.restore();
          }
        }

        // Vẽ sao lấp lánh (giảm độ sáng trong vùng chữ)
        stars.forEach(s => {
          s.alpha += s.flicker * (config.motionPattern === 'tinhtu' ? 0.7 : 1);
          if (s.alpha > 0.95 || s.alpha < 0.2) s.flicker = -s.flicker;

          const dx = (s.x - cx) / safeRx;
          const dy = (s.y - cy) / safeRy;
          const normDist = Math.sqrt(dx * dx + dy * dy);

          let effectiveAlpha = s.alpha * brightnessMultiplier;
          let effectiveSize = s.size;
          if (safeZoneActive && normDist < 1.05) {
            effectiveAlpha *= Math.max(0.08, Math.min(1.0, (normDist - 0.25) / 0.8));
            effectiveSize *= 0.75;
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, effectiveAlpha))})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, effectiveSize, 0, Math.PI * 2);
          ctx.fill();
        });

        // Vẽ Tinh Tú Kim Cương & Hành Tinh mini
        miniDiamondStars.forEach(ds => {
          ds.phase += ds.pulseSpeed;
          let pulse = 0.5 + 0.5 * Math.sin(ds.phase);
          if (ds.kind === 'pulsar') pulse = Math.pow(pulse, 2.2);
          const currentAlpha = (0.35 + 0.55 * pulse) * brightnessMultiplier;
          const currentSize = ds.size * (0.8 + 0.3 * pulse);

          if (ds.kind === 'planet' || ds.kind === 'planet_ring') {
            drawGlowingPlanet(ctx, ds.x, ds.y, currentSize, currentAlpha, ds.color, ds.hasRing, 1.0);
          } else {
            drawDiamondStar(ctx, ds.x, ds.y, currentSize, currentAlpha, ds.color, ds.points, 1.0);
          }
        });

        // Vẽ sao băng
        meteors.forEach((m, i) => {
          if (!m.active) {
            if (Math.random() < (config.motionPattern === 'tinhtu' ? 0.02 : 0.04)) {
              meteors[i] = { x: Math.random() * (w * 1.3), y: -20, len: Math.random() * 50 + 50, spd: Math.random() * 5 + 7, active: true };
            }
            return;
          }

          const angle = Math.PI / 4;
          const tailX = m.x - Math.cos(angle) * m.len;
          const tailY = m.y - Math.sin(angle) * m.len;

          const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(1, '#fef08a');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();

          m.x += Math.cos(angle) * m.spd;
          m.y += Math.sin(angle) * m.spd;

          if (m.y > h + 50 || m.x > w + 50) m.active = false;
        });
      }

      // 4. KHUNG RÈM SÂN KHẤU NẾU ĐƯỢC BẬT
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [config.theme, config.starSpeed, config.motionPattern, config.starCenterSafeZone, config.starBrightness]);

  const getLedUrl = () => {
    const origin = window.location.origin.includes('github.io')
      ? 'https://giangtienphat-nhidong315.github.io/hysu/'
      : window.location.origin;
    return `${origin.replace(/\/$/, '')}/?mode=led`;
  };

  const handleOpenLedScreen = () => {
    window.open(getLedUrl(), '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getLedUrl());
    setCopiedLink(true);
    toast.success('Đã sao chép link LED!', 'Link màn hình LED sao rơi đã được sao chép vào bộ nhớ tạm.');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const getThemeBgClass = () => {
    if (isSilkPattern(config.motionPattern)) {
      switch (config.theme) {
        case 'ruby': return 'from-[#38040d] to-[#1a0105]';
        case 'champagne': return 'from-[#291817] to-[#140b0a]';
        case 'gold': return 'from-[#331f04] to-[#140b01]';
        case 'emerald': return 'from-[#03261a] to-[#01120c]';
        default: return 'from-[#0e1538] to-[#05081c]';
      }
    }
    switch (config.theme) {
      case 'champagne': return 'from-[#220715] to-[#0c0207]';
      case 'ruby': return 'from-[#29030c] to-[#0d0104]';
      case 'gold': return 'from-[#261a04] to-[#0d0801]';
      case 'emerald': return 'from-[#03241a] to-[#010e0a]';
      default: return 'from-[#060c21] to-[#020512]';
    }
  };

  const textColorCfg = getTextColorConfig();

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 border border-amber-500/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-400/20 text-amber-300 rounded-2xl">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                Sân Khấu & Màn Hình Tiệc Cưới
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Màn Hình LED Sân Khấu Tiệc Cưới
              </h3>
              <p className="text-[11px] text-amber-200/80">
                Phông Nền Sóng Lụa Satin · Dòng Chảy Lụa Mềm · Mưa Sao Băng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
              <span>{copiedLink ? 'Đã chép' : 'Sao chép link'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenLedScreen}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>Phát Màn Hình LED (F11)</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Tạo phông nền sân khấu LED chuyển động sang trọng với hiệu ứng mưa sao băng rơi lung linh, tinh tú kim cương, tên cô dâu chú rể lồng chữ vàng kim, ngày cưới và lời chúc hạnh phúc.
        </p>
      </div>

      {/* KHUNG XEM TRƯỚC TRỰC QUAN (LIVE MINI PREVIEW) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Màn Hình Xem Trước (Trực Quan):</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
              {config.displayMode === 'slideshow' ? 'Chuyển cảnh (Slideshow)' : 'Tĩnh (Cố định)'} • Cỡ chữ {config.textScale ?? 130}%
            </span>
            <button
              type="button"
              onClick={handleOpenLedScreen}
              className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Mở toàn màn hình</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Khung mô phỏng màn hình LED 16:9 */}
        <div
          onClick={handleOpenLedScreen}
          className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black shadow-inner cursor-pointer group flex flex-col items-center justify-center p-4 border border-amber-300/30"
        >
          {/* Lớp nền ảnh tùy chỉnh nếu có */}
          {config.customBackgroundUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-500"
              style={{
                backgroundImage: `url(${config.customBackgroundUrl})`,
                filter: `blur(${config.bgBlur || 0}px)`,
                transform: config.bgBlur ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-b ${getThemeBgClass()} pointer-events-none`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.15),transparent_70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.2),transparent_60%)]" />
            </div>
          )}

          {/* Lớp phủ tối */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: '#000000',
              opacity: (config.bgDarkness ?? 40) / 100,
            }}
          />

          {/* Canvas sao rơi mini */}
          <canvas ref={previewCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
          
          {/* Lớp bảo vệ độ tương phản & Đẩy sáng ra xa vùng chữ (Text Clarity Safe Zone) */}
          <div
            className="absolute inset-0 pointer-events-none z-1"
            style={{
              background: 'radial-gradient(ellipse 72% 62% at 50% 50%, rgba(2, 6, 23, 0.75) 0%, rgba(2, 6, 23, 0.48) 45%, rgba(2, 6, 23, 0.12) 75%, transparent 100%)',
            }}
          />

          {/* Nội dung chữ mô phỏng */}
          <div className="relative z-10 text-center space-y-1 pointer-events-none px-4 w-full">
            {config.displayMode === 'slideshow' && slideEditTab === 1 ? (
              /* Slide 2: Gia Đình */
              <div className="space-y-1 animate-in fade-in">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${textColorCfg.accent}`}>
                  {config.slideFamilyTitle || 'GIA ĐÌNH & ĐẤNG SINH THÀNH'}
                </p>
                <div className="grid grid-cols-2 gap-2 text-left pt-1">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-amber-300/20 text-center">
                    <span className="text-[8px] font-bold text-amber-300 block mb-0.5">{config.slideGroomFamilyLabel || '✦ HỌ NHÀ TRAI ✦'}</span>
                    <div className="space-y-0.5">
                      {splitParents(config.groomParents).map((p, idx) => (
                        <span key={idx} className={`text-[8.5px] font-semibold block leading-snug text-balance ${textColorCfg.sub}`}>{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-rose-300/20 text-center">
                    <span className="text-[8px] font-bold text-rose-300 block mb-0.5">{config.slideBrideFamilyLabel || '✦ HỌ NHÀ GÁI ✦'}</span>
                    <div className="space-y-0.5">
                      {splitParents(config.brideParents).map((p, idx) => (
                        <span key={idx} className={`text-[8.5px] font-semibold block leading-snug text-balance ${textColorCfg.sub}`}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className={`text-[10px] sm:text-[11px] font-bold italic font-serif opacity-95 pt-1.5 vn-multiline ${textColorCfg.accent}`}>
                  ✦ {config.slideFamilyQuote || 'Cảm tạ ân sinh thành dưỡng dục'} ✦
                </p>
              </div>
            ) : config.displayMode === 'slideshow' && slideEditTab === 2 ? (
              /* Slide 3: Ngày Lành */
              (() => {
                const s3Theme = getSlideColorTheme(2);
                const s3Cfg = getTextColorConfig(s3Theme);
                const isCustom = s3Theme === 'custom';
                const customCol = getSlideCustomColor(2);
                return (
                  <div className="space-y-1 animate-in fade-in" style={{ transform: `scale(${getSlideScale(2) / 100})`, transformOrigin: 'center' }}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${s3Cfg.accent}`} style={isCustom ? { color: customCol } : {}}>
                      {config.slideDateTitle || 'NGÀY LÀNH KHỞI ĐẦU HẠNH PHÚC'}
                    </p>
                    <h4 className={`text-sm sm:text-base font-black ${isCustom ? '' : s3Cfg.gradient}`} style={{ ...getFontFamilyStyle(), ...(isCustom ? { color: customCol } : {}) }}>
                      {new Date(config.weddingDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h4>
                    <p className={`text-[9px] font-bold ${s3Cfg.accent}`} style={isCustom ? { color: customCol } : {}}>
                      GIỜ LÀNH NHẬP TIỆC: {config.weddingTime || '11:00'} • {config.hallName || 'Sảnh Tiệc'}
                    </p>
                    <p className={`text-[9.5px] sm:text-[10.5px] font-bold italic font-serif pt-1 vn-multiline ${s3Cfg.accent}`} style={isCustom ? { color: customCol } : {}}>
                      ✦ {config.slideDateNote || config.venue} ✦
                    </p>
                  </div>
                );
              })()
            ) : config.displayMode === 'slideshow' && slideEditTab === 3 ? (
              /* Slide 4: Lời Nguyện Ước */
              (() => {
                const s4Theme = getSlideColorTheme(3);
                const s4Cfg = getTextColorConfig(s4Theme);
                const isCustom = s4Theme === 'custom';
                const customCol = getSlideCustomColor(3);
                return (
                  <div className="space-y-1 animate-in fade-in" style={{ transform: `scale(${getSlideScale(3) / 100})`, transformOrigin: 'center' }}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${s4Cfg.accent}`} style={isCustom ? { color: customCol } : {}}>
                      {config.slideQuoteTitle || 'LỜI NGUYỆN ƯỚC TRĂM NĂM'}
                    </p>
                    <h4 className={`text-xs sm:text-sm italic font-serif font-bold vn-multiline ${isCustom ? '' : s4Cfg.gradient}`} style={{ ...getFontFamilyStyle(), ...(isCustom ? { color: customCol } : {}) }}>
                      "{config.loveQuote}"
                    </h4>
                  </div>
                );
              })()
            ) : (
              /* Slide 1 hoặc Static */
              <div className="space-y-1 animate-in fade-in">
                {config.showMonogram && (
                  <div className={`inline-block px-2.5 py-0.5 rounded-full border bg-amber-400/10 text-[10px] font-serif font-black tracking-widest mb-0.5 ${textColorCfg.accent} ${textColorCfg.border}`}>
                    {lastInitial(config.groomName, 'B')} ♥ {lastInitial(config.brideName, 'L')}
                  </div>
                )}
                <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${textColorCfg.accent}`}>
                  {config.ceremonyTitle}
                </p>
                <h4
                  className={`text-base sm:text-2xl font-black leading-snug transition-all flex flex-wrap items-center justify-center gap-x-1.5 ${
                    config.textColorTheme === 'custom' ? '' : textColorCfg.gradient
                  }`}
                  style={{
                    ...getFontFamilyStyle(),
                    ...(config.textColorTheme === 'custom' ? { color: config.customTextColor || '#ffd700' } : {}),
                  }}
                >
                  <span className="whitespace-nowrap">{formatName(config.groomName)}</span> <span className={`font-light ${textColorCfg.accent}`}>&</span> <span className="whitespace-nowrap">{formatName(config.brideName)}</span>
                </h4>
                {config.displayMode === 'slideshow' && config.slideCoupleBadge ? (
                  <p className={`text-[8px] sm:text-[9px] font-bold tracking-wider vn-multiline ${textColorCfg.sub}`}>
                    {config.slideCoupleBadge}
                  </p>
                ) : (
                  <>
                    <p className={`text-[10px] sm:text-xs font-bold ${textColorCfg.sub}`}>
                      {new Date(config.weddingDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {config.showLunarDate && config.lunarDate && (
                      <p className={`text-[9px] italic font-serif opacity-80 vn-multiline ${textColorCfg.sub}`}>
                        ({config.lunarDate})
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 backdrop-blur-2xs">
            <span className="px-4 py-2 bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5">
              <Maximize className="w-3.5 h-3.5" />
              <span>Bấm để phát toàn màn hình F11</span>
            </span>
          </div>
        </div>
      </div>

      {/* CÁC TÙY CHỌN CÀI ĐẶT NHANH */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* ============================================================== */}
        {/* 1. CÁCH HIỂN THỊ (DISPLAY MODE) */}
        {/* ============================================================== */}
        <div className="space-y-2.5 pb-3 border-b border-slate-100">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-rose-600" />
              <span>Cách hiển thị màn hình LED:</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              {config.displayMode === 'static' ? '✦ Đang chọn: Tĩnh' : '✦ Đang chọn: Chuyển Cảnh'}
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Tĩnh */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, displayMode: 'static' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.displayMode === 'static'
                  ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                <Tv className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Tĩnh (Cố định toàn diện)</h4>
                  {config.displayMode === 'static' && (
                    <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                  Trang trọng · Tất cả thông tin trên 1 màn hình
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Tên cô dâu chú rể, ngày cưới, sảnh tiệc và lời chúc hiển thị cố định sang trọng suốt buổi tiệc.
                </p>
              </div>
            </div>

            {/* Chuyển cảnh */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, displayMode: 'slideshow' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.displayMode === 'slideshow'
                  ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Chuyển Cảnh (Slideshow tự động)</h4>
                  {config.displayMode === 'slideshow' && (
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-indigo-700 font-bold mt-0.5">
                  Hoành tráng · Luân chuyển 4 phân cảnh
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  [1. Cặp Đôi Cực Đại] ➜ [2. Gia Đình Hai Họ] ➜ [3. Ngày Lành & Sảnh Tiệc] ➜ [4. Lời Nguyện Ước].
                </p>
              </div>
            </div>
          </div>

          {/* Tốc độ chuyển cảnh */}
          {config.displayMode === 'slideshow' && (
            <div className="pt-2 flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-700">Thời gian hiển thị mỗi cảnh:</span>
              <div className="flex gap-1.5">
                {[
                  { sec: 5, label: '5s' },
                  { sec: 8, label: '8s (Khuyên dùng)' },
                  { sec: 12, label: '12s' },
                  { sec: 15, label: '15s' },
                ].map(speed => (
                  <button
                    key={speed.sec}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, transitionSpeedSeconds: speed.sec }))}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                      (config.transitionSpeedSeconds || 8) === speed.sec
                        ? 'bg-rose-600 text-white border-rose-600 font-black'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TÙY CHỈNH NỘI DUNG TỪNG SLIDE TRONG SLIDESHOW */}
          {config.displayMode === 'slideshow' && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tùy chỉnh nội dung từng Slide chuyển cảnh:</span>
                </label>
                <span className="text-[11px] text-indigo-600 italic font-medium">
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
                      className={`p-2.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative active:scale-95 ${
                        isSelected
                          ? 'border-indigo-600 bg-white text-indigo-900 ring-2 ring-indigo-500/30 shadow-md scale-[1.02]'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-indigo-600">{tab.title}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={isEnabled ? 'Đang bật chiếu' : 'Đang tắt'}
                        />
                      </div>
                      <span className="text-xs font-bold block truncate">{tab.desc}</span>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate">{isEnabled ? 'Đang bật' : 'Tắt'}</span>
                        <span className="font-mono text-indigo-700 font-bold">{getSlideScale(tab.idx)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Thanh điều khiển nhanh cho Slide đang chọn */}
              <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 flex items-center justify-between flex-wrap gap-2">
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
                    className="rounded text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Bật chiếu Slide {slideEditTab + 1} trong Slideshow tự động
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleOpenLedScreen}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer ml-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Trình chiếu F11 ngay</span>
                </button>
              </div>

              {/* ĐIỀU CHỈNH KÍCH THƯỚC & THU PHÓNG RIÊNG CHO SLIDE NÀY (TRÁNH MẤT HIỂN THỊ) */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-indigo-700" />
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                      Kích Thước & Thu Phóng Slide {slideEditTab + 1}:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                      (Chống tràn / mất chữ sân khấu)
                    </span>
                    <span className="text-xs font-mono font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                      {getSlideScale(slideEditTab)}%
                    </span>
                  </div>
                </div>

                {/* Thanh trượt điều chỉnh */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">50%</span>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    step="5"
                    value={getSlideScale(slideEditTab)}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        slideScales: { ...(prev.slideScales || {}), [slideEditTab]: val },
                      }));
                    }}
                    className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 font-mono">160%</span>
                </div>

                {/* Các nút bấm chọn nhanh */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: '60% Rất gọn', scale: 60 },
                    { label: '75% Thu nhỏ', scale: 75 },
                    { label: '85% Vừa vặn', scale: 85 },
                    { label: '100% Chuẩn', scale: 100 },
                    { label: '115% Lớn', scale: 115 },
                    { label: '130% Phóng to', scale: 130 },
                  ].map(item => (
                    <button
                      key={item.scale}
                      type="button"
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          slideScales: { ...(prev.slideScales || {}), [slideEditTab]: item.scale },
                        }));
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                        getSlideScale(slideEditTab) === item.scale
                          ? 'bg-indigo-600 text-white border-indigo-600 font-black shadow-xs scale-105'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-600 italic">
                  💡 <b>Mẹo chống mất hiển thị:</b> Với slide có nhiều dòng nội dung như <b>Gia Đình (Slide 2)</b> hoặc <b>Ngày & Sảnh (Slide 3)</b>, hãy chọn mức <strong className="text-indigo-700 font-bold">80% - 90%</strong> để nội dung không bị tràn mép dưới hoặc mất các câu chúc phúc trên màn hình LED.
                </p>
              </div>

              {/* CHI TIẾT CÁC Ô NHẬP NỘI DUNG TỪNG SLIDE */}
              {/* SLIDE 0: CẶP ĐÔI UYÊN ƯƠNG */}
              {slideEditTab === 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-indigo-700">
                      Nội dung Phân cảnh 1: Cặp Đôi Uyên Ương
                    </span>
                    <span className="text-[11px] text-slate-500">Tên CD-CR phóng lớn cực đại</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Tiêu đề buổi lễ:</span>
                      <select
                        value={config.ceremonyTitle}
                        onChange={e => setConfig(prev => ({ ...prev, ceremonyTitle: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
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
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Tên Chú Rể:</span>
                      <input
                        type="text"
                        value={config.groomName}
                        onChange={e => setConfig(prev => ({ ...prev, groomName: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Tên Cô Dâu:</span>
                      <input
                        type="text"
                        value={config.brideName}
                        onChange={e => setConfig(prev => ({ ...prev, brideName: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">
                        Dòng chữ huy hiệu / Lời chúc phúc dưới tên:
                      </span>
                      <input
                        type="text"
                        value={config.slideCoupleBadge || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideCoupleBadge: e.target.value }))}
                        placeholder="✦ TRĂM NĂM HẠNH PHÚC • VẸN NGUYÊN NGHĨA PHU THÊ ✦"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 1: GIA ĐÌNH & ĐẤNG SINH THÀNH */}
              {slideEditTab === 1 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-indigo-700">
                      Nội dung Phân cảnh 2: Gia Đình & Đấng Sinh Thành
                    </span>
                    <span className="text-[11px] text-slate-500">Cha mẹ hai bên & Lời tri ân</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Tiêu đề lớn phân cảnh:</span>
                      <input
                        type="text"
                        value={config.slideFamilyTitle || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideFamilyTitle: e.target.value }))}
                        placeholder="GIA ĐÌNH & ĐẤNG SINH THÀNH"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Cột Nhà Trai */}
                    <div className="p-3 rounded-xl bg-white border border-amber-300/40 space-y-2 shadow-2xs">
                      <div>
                        <span className="text-[10px] text-amber-700 font-bold uppercase block mb-1">
                          Tiêu đề khung Nhà Trai:
                        </span>
                        <input
                          type="text"
                          value={config.slideGroomFamilyLabel || ''}
                          onChange={e => setConfig(prev => ({ ...prev, slideGroomFamilyLabel: e.target.value }))}
                          placeholder="✦ HỌ NHÀ TRAI ✦"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-1">
                          Thân phụ & Thân mẫu (Nhà Trai):
                        </span>
                        <textarea
                          rows={2}
                          value={config.groomParents || ''}
                          onChange={e => setConfig(prev => ({ ...prev, groomParents: e.target.value }))}
                          placeholder="Dòng 1: Ông Nguyễn Văn A&#10;Dòng 2: Bà Trần Thị B"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                        />
                        <span className="text-[9.5px] text-indigo-600 block mt-0.5 italic">
                          💡 Gõ Enter xuống dòng để tách riêng tên Cha và Mẹ hiển thị cân đối
                        </span>
                      </div>
                    </div>

                    {/* Cột Nhà Gái */}
                    <div className="p-3 rounded-xl bg-white border border-rose-300/40 space-y-2 shadow-2xs">
                      <div>
                        <span className="text-[10px] text-rose-700 font-bold uppercase block mb-1">
                          Tiêu đề khung Nhà Gái:
                        </span>
                        <input
                          type="text"
                          value={config.slideBrideFamilyLabel || ''}
                          onChange={e => setConfig(prev => ({ ...prev, slideBrideFamilyLabel: e.target.value }))}
                          placeholder="✦ HỌ NHÀ GÁI ✦"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-1">
                          Thân phụ & Thân mẫu (Nhà Gái):
                        </span>
                        <textarea
                          rows={2}
                          value={config.brideParents || ''}
                          onChange={e => setConfig(prev => ({ ...prev, brideParents: e.target.value }))}
                          placeholder="Dòng 1: Ông Lê Văn C&#10;Dòng 2: Bà Phạm Thị D"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                        />
                        <span className="text-[9.5px] text-rose-600 block mt-0.5 italic">
                          💡 Gõ Enter xuống dòng để tách riêng tên Cha và Mẹ hiển thị cân đối
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">
                        Lời cảm tạ tri ân đấng sinh thành ở chân slide:
                      </span>
                      <input
                        type="text"
                        value={config.slideFamilyQuote || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideFamilyQuote: e.target.value }))}
                        placeholder="Cảm tạ ân sinh thành dưỡng dục • Nguyện trọn đạo hiếu thuận cháu con"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs italic text-indigo-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: NGÀY LÀNH & SẢNH TIỆC (PHÂN CẢNH 3) */}
              {slideEditTab === 2 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-indigo-700">
                      Nội dung Phân cảnh 3: Ngày Lành & Sảnh Tiệc
                    </span>
                    <span className="text-[11px] text-slate-500">Thời khắc hôn lễ & Địa điểm sảnh</span>
                  </div>

                  {/* Tùy chỉnh Kích thước chữ & Màu sắc riêng cho Phân cảnh 3 */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                        Kích thước chữ Phân cảnh 3:
                      </span>
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                        {getSlideScale(2)}%
                      </span>
                    </div>
                    {/* Slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">50%</span>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        step="5"
                        value={getSlideScale(2)}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setConfig(prev => ({
                            ...prev,
                            slideScales: { ...(prev.slideScales || {}), 2: val },
                          }));
                        }}
                        className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">160%</span>
                    </div>
                    {/* Nút chọn nhanh */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: '70% Gọn', scale: 70 },
                        { label: '85% Vừa vặn', scale: 85 },
                        { label: '95% Chuẩn', scale: 95 },
                        { label: '110% Lớn', scale: 110 },
                        { label: '125% Phóng to', scale: 125 },
                      ].map(item => (
                        <button
                          key={item.scale}
                          type="button"
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              slideScales: { ...(prev.slideScales || {}), 2: item.scale },
                            }));
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            getSlideScale(2) === item.scale
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Màu sắc chữ riêng cho Phân cảnh 3 */}
                    <div className="pt-2.5 border-t border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-indigo-600" />
                          Màu sắc chữ Phân cảnh 3:
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (Độc lập từng phân cảnh)
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {[
                          { id: 'gold', name: 'Vàng Kim', preview: 'from-amber-200 to-yellow-400' },
                          { id: 'rosegold', name: 'Vàng Hồng', preview: 'from-rose-200 to-pink-400' },
                          { id: 'white', name: 'Trắng Sáng', preview: 'from-white to-slate-300' },
                          { id: 'silver', name: 'Ánh Bạc', preview: 'from-slate-200 to-indigo-300' },
                          { id: 'ruby', name: 'Đỏ Ruby', preview: 'from-yellow-200 to-red-500' },
                          { id: 'custom', name: 'Tự chọn màu', preview: 'from-cyan-300 to-emerald-300' },
                        ].map(c => {
                          const currentTheme = getSlideColorTheme(2);
                          const isSelected = currentTheme === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setConfig(prev => ({
                                  ...prev,
                                  slideColorThemes: { ...(prev.slideColorThemes || {}), 2: c.id as LedTextColor },
                                }));
                              }}
                              className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-600 bg-white text-indigo-900 ring-2 ring-indigo-500/30 shadow-xs font-black'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`h-3 rounded-md mb-1 bg-gradient-to-r ${c.preview} border border-slate-200`} />
                              <span className="text-[10px] font-bold block truncate">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {getSlideColorTheme(2) === 'custom' && (
                        <div className="p-2.5 rounded-xl bg-white border border-indigo-200 flex items-center gap-3 animate-in fade-in">
                          <input
                            type="color"
                            value={getSlideCustomColor(2)}
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => ({
                                ...prev,
                                slideCustomColors: { ...(prev.slideCustomColors || {}), 2: val },
                              }));
                            }}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 bg-transparent p-0"
                          />
                          <div className="flex-1">
                            <span className="text-[11px] font-bold text-slate-800 block">Chọn màu chữ theo ý thích:</span>
                            <span className="text-[9.5px] text-slate-500">Click vào ô màu hoặc nhập mã HEX</span>
                          </div>
                          <input
                            type="text"
                            value={getSlideCustomColor(2)}
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => ({
                                ...prev,
                                slideCustomColors: { ...(prev.slideCustomColors || {}), 2: val },
                              }));
                            }}
                            placeholder="#ffd700"
                            className="w-24 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono text-indigo-700 uppercase focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Tiêu đề phân cảnh:</span>
                      <input
                        type="text"
                        value={config.slideDateTitle || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideDateTitle: e.target.value }))}
                        placeholder="NGÀY LÀNH KHỞI ĐẦU HẠNH PHÚC"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Ngày cưới dương lịch:</span>
                      <input
                        type="date"
                        value={config.weddingDate}
                        onChange={e => setConfig(prev => ({ ...prev, weddingDate: e.target.value }))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Giờ lành nhập tiệc:</span>
                      <input
                        type="text"
                        value={config.weddingTime || '11:00'}
                        onChange={e => setConfig(prev => ({ ...prev, weddingTime: e.target.value }))}
                        placeholder="11:00 hoặc 18:00"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Ngày âm lịch:</span>
                      <input
                        type="text"
                        value={config.lunarDate}
                        onChange={e => setConfig(prev => ({ ...prev, lunarDate: e.target.value }))}
                        placeholder="Ví dụ: Nhằm ngày 12 tháng 10 năm Bính Ngọ"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Địa điểm / Trung tâm tiệc cưới:</span>
                      <input
                        type="text"
                        value={config.venue}
                        onChange={e => setConfig(prev => ({ ...prev, venue: e.target.value }))}
                        placeholder="Trung Tâm Tiệc Cưới White Palace"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Tên sảnh tiệc:</span>
                      <input
                        type="text"
                        value={config.hallName || 'Sảnh Grand Ballroom'}
                        onChange={e => setConfig(prev => ({ ...prev, hallName: e.target.value }))}
                        placeholder="Sảnh Grand Ballroom"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">
                        Thông điệp đón khách ở chân slide:
                      </span>
                      <input
                        type="text"
                        value={config.slideDateNote || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideDateNote: e.target.value }))}
                        placeholder="Hân hoan chào đón Quý khách quý và Quan viên hai họ"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs italic text-indigo-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: LỜI NGUYỆN ƯỚC TRĂM NĂM (PHÂN CẢNH 4) */}
              {slideEditTab === 3 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-indigo-700">
                      Nội dung Phân cảnh 4: Lời Nguyện ƯỚc Trăm Năm
                    </span>
                    <span className="text-[11px] text-slate-500">Lời thề tình yêu & Thông điệp trăm năm</span>
                  </div>

                  {/* Tùy chỉnh Kích thước chữ & Màu sắc riêng cho Phân cảnh 4 */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                        Kích thước chữ Phân cảnh 4:
                      </span>
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                        {getSlideScale(3)}%
                      </span>
                    </div>
                    {/* Slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">50%</span>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        step="5"
                        value={getSlideScale(3)}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setConfig(prev => ({
                            ...prev,
                            slideScales: { ...(prev.slideScales || {}), 3: val },
                          }));
                        }}
                        className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">160%</span>
                    </div>
                    {/* Nút chọn nhanh */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: '75% Thu nhỏ', scale: 75 },
                        { label: '85% Vừa vặn', scale: 85 },
                        { label: '100% Chuẩn', scale: 100 },
                        { label: '115% Lớn', scale: 115 },
                        { label: '130% Phóng to', scale: 130 },
                      ].map(item => (
                        <button
                          key={item.scale}
                          type="button"
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              slideScales: { ...(prev.slideScales || {}), 3: item.scale },
                            }));
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            getSlideScale(3) === item.scale
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Màu sắc chữ riêng cho Phân cảnh 4 */}
                    <div className="pt-2.5 border-t border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-indigo-600" />
                          Màu sắc chữ Phân cảnh 4:
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (Độc lập từng phân cảnh)
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {[
                          { id: 'gold', name: 'Vàng Kim', preview: 'from-amber-200 to-yellow-400' },
                          { id: 'rosegold', name: 'Vàng Hồng', preview: 'from-rose-200 to-pink-400' },
                          { id: 'white', name: 'Trắng Sáng', preview: 'from-white to-slate-300' },
                          { id: 'silver', name: 'Ánh Bạc', preview: 'from-slate-200 to-indigo-300' },
                          { id: 'ruby', name: 'Đỏ Ruby', preview: 'from-yellow-200 to-red-500' },
                          { id: 'custom', name: 'Tự chọn màu', preview: 'from-cyan-300 to-emerald-300' },
                        ].map(c => {
                          const currentTheme = getSlideColorTheme(3);
                          const isSelected = currentTheme === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setConfig(prev => ({
                                  ...prev,
                                  slideColorThemes: { ...(prev.slideColorThemes || {}), 3: c.id as LedTextColor },
                                }));
                              }}
                              className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-600 bg-white text-indigo-900 ring-2 ring-indigo-500/30 shadow-xs font-black'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`h-3 rounded-md mb-1 bg-gradient-to-r ${c.preview} border border-slate-200`} />
                              <span className="text-[10px] font-bold block truncate">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {getSlideColorTheme(3) === 'custom' && (
                        <div className="p-2.5 rounded-xl bg-white border border-indigo-200 flex items-center gap-3 animate-in fade-in">
                          <input
                            type="color"
                            value={getSlideCustomColor(3)}
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => ({
                                ...prev,
                                slideCustomColors: { ...(prev.slideCustomColors || {}), 3: val },
                              }));
                            }}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 bg-transparent p-0"
                          />
                          <div className="flex-1">
                            <span className="text-[11px] font-bold text-slate-800 block">Chọn màu chữ theo ý thích:</span>
                            <span className="text-[9.5px] text-slate-500">Click vào ô màu hoặc nhập mã HEX</span>
                          </div>
                          <input
                            type="text"
                            value={getSlideCustomColor(3)}
                            onChange={e => {
                              const val = e.target.value;
                              setConfig(prev => ({
                                ...prev,
                                slideCustomColors: { ...(prev.slideCustomColors || {}), 3: val },
                              }));
                            }}
                            placeholder="#ffd700"
                            className="w-24 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono text-indigo-700 uppercase focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Tiêu đề phân cảnh:</span>
                      <input
                        type="text"
                        value={config.slideQuoteTitle || ''}
                        onChange={e => setConfig(prev => ({ ...prev, slideQuoteTitle: e.target.value }))}
                        placeholder="LỜI NGUYỆN ƯỚC TRĂM NĂM"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">
                        Câu chúc / Lời thề tình yêu trung tâm (Cực đại):
                      </span>
                      <textarea
                        rows={2}
                        value={config.loveQuote}
                        onChange={e => setConfig(prev => ({ ...prev, loveQuote: e.target.value }))}
                        placeholder="Trăm năm tình viên mãn • Bạc đầu nghĩa phu thê"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs italic font-serif text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] text-indigo-700 italic pt-1">
                        💡 Phân cảnh 4 làm nổi bật Logo chữ lồng Monogram & Câu thề nguyện trung tâm cực đại, câu kết chân slide đã được gỡ bỏ để sân khấu thoáng đãng.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 2. PHÓNG TO CỠ CHỮ SÂN KHẤU 16:9 (TEXT SCALE SLIDER) */}
        {/* ============================================================== */}
        <div className="space-y-2 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-rose-600" />
              <span>Phóng to cỡ chữ sân khấu 16:9 (Chống nhỏ chữ):</span>
            </label>
            <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
              {config.textScale ?? 130}%
            </span>
          </div>

          <input
            type="range"
            min="80"
            max="220"
            step="5"
            value={config.textScale ?? 130}
            onChange={e => setConfig(prev => ({ ...prev, textScale: Number(e.target.value) }))}
            className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

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
                    ? 'bg-rose-600 text-white border-rose-600 font-black shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. MÀU SẮC CHỮ SÂN KHẤU (TEXT COLOR THEMES) */}
        {/* ============================================================== */}
        <div className="space-y-2 pb-3 border-b border-slate-100">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-600" />
              <span>Màu sắc chữ sân khấu:</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              {config.textColorTheme === 'gold' && 'Hoàng Gia Ánh Kim'}
              {config.textColorTheme === 'rosegold' && 'Vàng Hồng (Rose Gold)'}
              {config.textColorTheme === 'white' && 'Trắng Ngọc Trai'}
              {config.textColorTheme === 'silver' && 'Ánh Trăng Bạc'}
              {config.textColorTheme === 'ruby' && 'Đỏ Ruby Ánh Kim'}
              {config.textColorTheme === 'custom' && `Tùy chọn (${config.customTextColor || '#ffd700'})`}
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'gold', name: 'Hoàng Gia Ánh Kim', grad: 'from-amber-400 to-yellow-500' },
              { id: 'rosegold', name: 'Vàng Hồng (Rose Gold)', grad: 'from-pink-400 to-rose-500' },
              { id: 'white', name: 'Trắng Ngọc Trai', grad: 'from-slate-100 to-slate-400' },
              { id: 'silver', name: 'Ánh Trăng Bạc', grad: 'from-blue-200 to-indigo-400' },
              { id: 'ruby', name: 'Đỏ Ruby Ánh Kim', grad: 'from-yellow-400 to-red-500' },
              { id: 'custom', name: 'Tùy Chọn Màu Riêng', grad: 'from-emerald-400 to-cyan-500' },
            ].map(col => (
              <button
                key={col.id}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, textColorTheme: col.id as any }))}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  config.textColorTheme === col.id
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400/30'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`h-4 rounded-md mb-1 bg-gradient-to-r ${col.grad}`} />
                <span className="text-[11px] font-bold block truncate">{col.name}</span>
              </button>
            ))}
          </div>

          {config.textColorTheme === 'custom' && (
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <input
                type="color"
                value={config.customTextColor || '#ffd700'}
                onChange={e => setConfig(prev => ({ ...prev, customTextColor: e.target.value }))}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 bg-transparent p-0"
              />
              <span className="text-xs text-slate-700 font-bold">Mã màu chữ:</span>
              <input
                type="text"
                value={config.customTextColor || '#ffd700'}
                onChange={e => setConfig(prev => ({ ...prev, customTextColor: e.target.value }))}
                className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-center ml-auto"
              />
            </div>
          )}
        </div>

        {/* MẪU PHÔNG NỀN ĐỘNG (MOTION PATTERN) */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Mẫu phông nền động (Hiệu ứng sân khấu):</span>
            </span>
            <span className="text-[11px] text-amber-600 font-bold">7 Mẫu Phong Cách Tiệc Cưới</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* Mẫu 1: Sóng Lụa Dập Dềnh (Satin Ripple Waves) */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'lua_song' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.motionPattern === 'lua_song' || config.motionPattern === 'lua'
                  ? 'border-pink-500 bg-pink-50/80 ring-2 ring-pink-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-pink-100 text-pink-600 shrink-0 mt-0.5">
                <Wind className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Sóng Lụa Dập Dềnh</h4>
                  {(config.motionPattern === 'lua_song' || config.motionPattern === 'lua') && (
                    <span className="text-[10px] bg-pink-600 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-pink-700 font-bold mt-0.5">
                  Sóng lụa satin bồng bềnh · Ánh xà cừ óng ả
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Mặt sóng lụa liên hoàn dập dềnh phủ kín toàn màn hình, đỉnh sóng bắt sáng óng ánh
                </p>
              </div>
            </div>

            {/* Mẫu 2: Dòng Chảy Lụa Mềm (Cascading Fluid Silk) */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'lua_dongchay' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.motionPattern === 'lua_dongchay'
                  ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                <Waves className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Dòng Chảy Lụa Mềm</h4>
                  {config.motionPattern === 'lua_dongchay' && (
                    <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                  Dải lụa satin bay lướt · Uốn lượn đa tầng
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Các dải lụa satin khổ lớn uốn lượn bay lướt ngang màn hình theo đường cong tự nhiên đa tầng
                </p>
              </div>
            </div>

            {/* Mẫu 3: Lụa Rủ Xếp Nếp Gợn Sóng (Organic Draped Silk) */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'lua_xeply' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.motionPattern === 'lua_xeply'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Lụa Rủ Xếp Nếp</h4>
                  {config.motionPattern === 'lua_xeply' && (
                    <span className="text-[10px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-amber-800 font-bold mt-0.5">
                  Vải lụa buông rủ · Gợn sóng nhấp nhô tự nhiên
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Tấm rèm lụa satin buông rủ xếp nếp mềm mại, đung đưa và gợn sóng nhịp nhàng
                </p>
              </div>
            </div>

            {/* Mẫu 4: Phông Nền Sao Băng */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'saobang' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.motionPattern === 'saobang'
                  ? 'border-cyan-500 bg-cyan-50/80 ring-2 ring-cyan-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-cyan-100 text-cyan-600 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Phông Nền Sao Băng</h4>
                  {config.motionPattern === 'saobang' && (
                    <span className="text-[10px] bg-cyan-600 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-cyan-700 font-bold mt-0.5">
                  Sao băng rơi · Đĩa ngân hà loang sóng
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Đĩa thiên hà xoay tròn & vòng sóng hào quang lan tỏa, mưa sao băng rực rỡ
                </p>
              </div>
            </div>

            {/* Mẫu 5: Phông Nền Tinh Tú */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'tinhtu' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.motionPattern === 'tinhtu'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Phông Nền Tinh Tú</h4>
                  {config.motionPattern === 'tinhtu' && (
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                  Dải Ngân Hà lấp lánh · Hành tinh chớp chớp
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Dải mây Ngân Hà uốn lượn ở đỉnh & đáy, quy tụ mật độ cao hành tinh có vành đai và tinh tú chớp chớp huyền ảo
                </p>
              </div>
            </div>

            {/* Mẫu 6: Phông Nền Pha Lê Ánh Kim */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'phale' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.motionPattern === 'phale'
                  ? 'border-yellow-500 bg-yellow-50/80 ring-2 ring-yellow-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-yellow-100 text-yellow-600 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Phông Nền Pha Lê Ánh Kim</h4>
                  {config.motionPattern === 'phale' && (
                    <span className="text-[10px] bg-yellow-600 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-yellow-700 font-bold mt-0.5">
                  Bokeh pha lê · Đèn chùm tiệc cưới 5 sao
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Hạt sáng lung linh ánh vàng ấm áp sang trọng như sảnh tiệc hoàng gia
                </p>
              </div>
            </div>

            {/* Mẫu 7: Phông Nền Hỷ Sự Cát Tường */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'hysu' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.motionPattern === 'hysu'
                  ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                <Heart className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Phông Nền Hỷ Sự Cát Tường</h4>
                  {config.motionPattern === 'hysu' && (
                    <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                  Đỏ Ruby nhung · Bụi hoa đăng chúc phúc
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Tông màu may mắn truyền thống kết hợp ánh vàng kim quý phái
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chọn Tông Màu Theme */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-600" />
              <span>
                {isSilkPattern(config.motionPattern)
                  ? 'Chất liệu & màu vải lụa Satin:'
                  : 'Chọn tông màu phông nền LED:'}
              </span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">5 Phối màu</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(isSilkPattern(config.motionPattern)
              ? [
                  { id: 'ruby', label: 'Lụa Đỏ Son Hỷ Sự', color: 'from-rose-800 to-rose-950' },
                  { id: 'champagne', label: 'Lụa Trắng Ngà Ngọc Trai', color: 'from-amber-100 to-stone-400' },
                  { id: 'gold', label: 'Lụa Vàng Champagne', color: 'from-amber-600 to-amber-950' },
                  { id: 'emerald', label: 'Lụa Xanh Lục Bảo', color: 'from-emerald-700 to-emerald-950' },
                  { id: 'galaxy', label: 'Lụa Xanh Sapphire', color: 'from-blue-700 to-slate-950' },
                ]
              : [
                  { id: 'galaxy', label: 'Dạ Tiệc Ngân Hà', color: 'from-blue-900 to-slate-950' },
                  { id: 'champagne', label: 'Hồng Champagne', color: 'from-pink-900 to-slate-950' },
                  { id: 'ruby', label: 'Đỏ Hỷ Sự', color: 'from-red-900 to-slate-950' },
                  { id: 'gold', label: 'Hoàng Gia Ánh Kim', color: 'from-amber-900 to-slate-950' },
                  { id: 'emerald', label: 'Xanh Lục Bảo', color: 'from-emerald-900 to-slate-950' },
                ]
            ).map(th => (
              <button
                key={th.id}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, theme: th.id as LedTheme }))}
                className={`p-2 rounded-xl border text-center transition cursor-pointer font-bold text-xs ${
                  config.theme === th.id
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`h-5 rounded-md mb-1 bg-gradient-to-r ${th.color}`} />
                <span className="text-[11px] block truncate">{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TÙY CHỌN ẢNH NỀN TẢI LÊN */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Ảnh nền sân khấu (Tùy chỉnh):</span>
            </label>
            {config.customBackgroundUrl && (
              <button
                type="button"
                onClick={handleRemoveBackground}
                className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 font-bold cursor-pointer transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa ảnh & Về nền gốc</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
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

          {config.customBackgroundUrl ? (
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-10 rounded-lg bg-cover bg-center border border-amber-300 shrink-0 shadow-xs"
                  style={{ backgroundImage: `url(${config.customBackgroundUrl})` }}
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-amber-950 truncate">Đang dùng ảnh nền của bạn</p>
                  <p className="text-[10px] text-amber-800/80 mt-0.5">
                    Kéo thanh trượt để chữ vàng kim nổi bật trên sân khấu
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700 font-semibold mb-1">
                  <span>Độ tối lớp phủ (Chống lóa chữ):</span>
                  <span className="font-mono font-bold text-amber-600">{config.bgDarkness ?? 40}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="85"
                  step="5"
                  value={config.bgDarkness ?? 40}
                  onChange={e => setConfig(prev => ({ ...prev, bgDarkness: Number(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700 font-semibold mb-1">
                  <span>Độ mờ hậu cảnh (Bokeh xóa phông):</span>
                  <span className="font-mono font-bold text-amber-600">{config.bgBlur ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={config.bgBlur ?? 0}
                  onChange={e => setConfig(prev => ({ ...prev, bgBlur: Number(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              💡 Bạn có thể chọn bất kỳ ảnh sao đêm 4K, ảnh sảnh tiệc 3D hoặc ảnh cưới để làm phông nền chiếu sân khấu.
            </p>
          )}
        </div>

        {/* VÙNG AN TOÀN CHO CHỮ & ĐỘ SÁNG SAO (TRÁNH LÓA CHỮ) */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Vùng An Toàn Cho Chữ & Độ Sáng Sao:
              </span>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              ✦ Giữ chữ luôn sắc nét & không bị chói lóa
            </span>
          </div>

          {/* Tùy chọn 1: Đẩy sao ra xa vùng chữ */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">Đẩy các ngôi sao ra xa vùng chữ (Khuyên dùng):</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Tự động tạo vùng an toàn trung tâm, dời các tinh tú kim cương và vệt sáng ra viền màn hình để chữ cô dâu chú rể luôn nổi bật rõ ràng.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, starCenterSafeZone: !(prev.starCenterSafeZone ?? true) }))}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition cursor-pointer ${
                (config.starCenterSafeZone ?? true)
                  ? 'bg-rose-600 text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {(config.starCenterSafeZone ?? true) ? '✓ Đang Bật (Đẩy ra viền)' : 'Tắt (Rải đều)'}
            </button>
          </div>

          {/* Tùy chọn 2: Điều chỉnh độ sáng sao */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">Độ sáng & dịu của sao:</span>
              <span className="font-mono font-bold text-amber-700">{config.starBrightness ?? 60}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={config.starBrightness ?? 60}
              onChange={e => setConfig(prev => ({ ...prev, starBrightness: Number(e.target.value) }))}
              className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
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
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CHỈNH FONT CHỮ & KIỂU CHỮ NGHỆ THUẬT */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-rose-600" />
              <span>Chỉnh Font Chữ & Kiểu Hiển Thị:</span>
            </label>
            <span className="text-[11px] text-amber-700 font-serif italic">
              {config.fontFamily === 'playfair' && '✦ Playfair Display (Hoàng Gia)'}
              {config.fontFamily === 'cormorant' && '✦ Cormorant Garamond (Quý Tộc)'}
              {config.fontFamily === 'dancing' && '✦ Dancing Script (Thư Pháp)'}
              {config.fontFamily === 'cinzel' && '✦ Playfair SC (La Mã Uy Nghi)'}
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
              { id: 'cinzel', name: 'Playfair SC Roman', desc: 'La Mã Trang Trọng', sample: 'QUỐC BẢO & MAI LINH', font: "'Playfair Display SC', 'Playfair Display', serif" },
              { id: 'bevietnam', name: 'Be Vietnam Pro', desc: 'Hiện Đại Sắc Nét', sample: 'Quốc Bảo & Mai Linh', font: "'Be Vietnam Pro', sans-serif" },
              { id: 'serif', name: 'Serif Classic', desc: 'Mực Thước Truyền Thống', sample: 'Quốc Bảo & Mai Linh', font: "Georgia, serif" },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, fontFamily: f.id as any }))}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  config.fontFamily === f.id
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400/30 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span
                  className="text-xs sm:text-sm font-bold text-slate-900 block truncate"
                  style={{ fontFamily: f.font }}
                >
                  {f.sample}
                </span>
                <span className="text-[11px] font-bold block text-slate-800 mt-1 truncate">{f.name}</span>
                <span className="text-[9px] text-slate-400 block truncate">{f.desc}</span>
              </button>
            ))}
          </div>

          {/* Tùy chỉnh Cỡ Chữ & Viết Hoa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[11px] text-slate-600 font-semibold block mb-1">Cỡ chữ Tên Cô Dâu Chú Rể:</span>
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
                        ? 'bg-rose-600 text-white border-rose-600 font-black shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-600 font-semibold block mb-1">Kiểu chữ Tên:</span>
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
                        ? 'bg-rose-600 text-white border-rose-600 font-black shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin hiển thị */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-600 block mb-1">Nghi thức buổi lễ:</span>
            <select
              value={config.ceremonyTitle}
              onChange={e => setConfig(prev => ({ ...prev, ceremonyTitle: e.target.value }))}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
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
            <span className="text-[11px] font-bold text-slate-600 block mb-1">Ngày âm lịch:</span>
            <input
              type="text"
              value={config.lunarDate}
              onChange={e => setConfig(prev => ({ ...prev, lunarDate: e.target.value }))}
              placeholder="Nhằm ngày 12 tháng 10 năm Bính Ngọ..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="sm:col-span-2">
            <span className="text-[11px] font-bold text-slate-600 block mb-1">Câu chúc ý nghĩa trên sân khấu:</span>
            <input
              type="text"
              value={config.loveQuote}
              onChange={e => setConfig(prev => ({ ...prev, loveQuote: e.target.value }))}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Hướng Dẫn Kỹ Thuật Viên Sân Khấu */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-amber-600" />
            <span>Cách phát lên màn hình LED tại sảnh tiệc cưới:</span>
          </p>
          <p>• <b>Bước 1:</b> Bấm nút <b>"Sao chép link"</b> và gửi link cho người phụ trách âm thanh ánh sáng/màn hình LED của nhà hàng.</p>
          <p>• <b>Bước 2:</b> Trên máy tính kết nối màn hình LED, mở link bằng Google Chrome hoặc Cốc Cốc và nhấn <b>F11</b> để phóng to toàn màn hình.</p>
          <p>• <b>Bước 3:</b> Chuột và các nút điều khiển sẽ tự động ẩn đi sau 3 giây để màn hình chạy êm đềm suốt buổi tiệc cưới!</p>
        </div>
      </div>
    </div>
  );
};
