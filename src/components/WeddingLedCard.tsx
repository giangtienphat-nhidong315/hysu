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
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { useToast } from '../context/ToastContext';
import { LedTheme, LedFont, LedMotionPattern, LedFontSize, LedTextCase } from './WeddingLedScreenPage';
import { compressImage } from '../utils/imageCompressor';

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
          weddingDate: parsed.weddingDate || profile.weddingDate,
          venue: parsed.venue || profile.venue,
          motionPattern: (parsed.motionPattern || 'saobang') as LedMotionPattern,
          fontSizePreset: (parsed.fontSizePreset || 'large') as LedFontSize,
          nameTextCase: (parsed.nameTextCase || 'titlecase') as LedTextCase,
          fontFamily: (parsed.fontFamily || 'playfair') as LedFont,
          bgDarkness: parsed.bgDarkness ?? 40,
          bgBlur: parsed.bgBlur ?? 0,
          showMeteors: parsed.showMeteors ?? true,
        };
      } catch (e) {}
    }
    return {
      ceremonyTitle: 'LỄ THÀNH HÔN',
      groomName: profile.groomName || 'Quốc Bảo',
      brideName: profile.brideName || 'Mai Linh',
      weddingDate: profile.weddingDate || '2026-11-20',
      lunarDate: 'Nhằm ngày 12 tháng 10 năm Bính Ngọ',
      weddingTime: profile.weddingTime || '11:00',
      venue: profile.venue || 'Trung Tâm Tiệc Cưới White Palace, TP. Hồ Chí Minh',
      hallName: 'Sảnh Grand Ballroom',
      loveQuote: 'Trăm năm tình viên mãn • Bạc đầu nghĩa phu thê',
      theme: 'galaxy' as LedTheme,
      motionPattern: 'saobang' as LedMotionPattern,
      starSpeed: 'normal' as 'slow' | 'normal' | 'fast',
      starDensity: 'normal' as 'low' | 'normal' | 'high',
      fontFamily: 'playfair' as LedFont,
      fontSizePreset: 'large' as LedFontSize,
      nameTextCase: 'titlecase' as LedTextCase,
      showLunarDate: true,
      showVenue: true,
      showQuote: true,
      showMonogram: true,
      customBackgroundUrl: undefined as string | undefined,
      bgDarkness: 40,
      bgBlur: 0,
      showMeteors: true,
    };
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFontFamilyStyle = (): React.CSSProperties => {
    switch (config.fontFamily) {
      case 'playfair':
        return { fontFamily: "'Playfair Display', Georgia, serif" };
      case 'cormorant':
        return { fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.04em' };
      case 'dancing':
      case 'script':
        return { fontFamily: "'Dancing Script', cursive", fontStyle: 'italic' };
      case 'cinzel':
        return { fontFamily: "'Cinzel', 'Times New Roman', serif", letterSpacing: '0.06em' };
      case 'bevietnam':
      case 'sans':
        return { fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" };
      case 'serif':
      default:
        return { fontFamily: "'Playfair Display', Georgia, serif" };
    }
  };

  const formatName = (name: string) => {
    if (!name) return '';
    if (config.nameTextCase === 'uppercase') {
      return name.toUpperCase();
    }
    return name;
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

  // Canvas hiệu ứng sao rơi mini cho khung xem trước (Preview)
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const w = (canvas.width = canvas.parentElement?.clientWidth || 400);
    const h = (canvas.height = canvas.parentElement?.clientHeight || 225);

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      flicker: (Math.random() - 0.5) * 0.04,
    }));

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

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Nếu là mẫu "Sao Băng (Đĩa ngân hà loang sóng)"
      if (config.motionPattern === 'saobang') {
        const cx = w / 2;
        const cy = h * 0.46;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.16);
        ctx.scale(1, 0.42);

        // Đĩa thiên hà
        const diskGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, w * 0.45);
        diskGrad.addColorStop(0, 'rgba(254, 240, 138, 0.2)');
        diskGrad.addColorStop(0.35, 'rgba(217, 119, 6, 0.12)');
        diskGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.07)');
        diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = diskGrad;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Vòng sóng loang
        miniRipples.forEach(r => {
          r.rad += 0.8;
          if (r.rad > w * 0.6) r.rad = 15;
          const progress = r.rad / (w * 0.6);
          const a = Math.sin(progress * Math.PI) * 0.35;
          ctx.strokeStyle = `rgba(254, 240, 138, ${a})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(0, 0, r.rad, 0, Math.PI * 2);
          ctx.stroke();
        });

        ctx.restore();
      }

      // Vẽ sao lấp lánh
      stars.forEach(s => {
        s.alpha += s.flicker * (config.motionPattern === 'tinhtu' ? 0.7 : 1);
        if (s.alpha > 0.95 || s.alpha < 0.2) s.flicker = -s.flicker;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, s.alpha))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
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

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [config.theme, config.starSpeed, config.motionPattern]);

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
    switch (config.theme) {
      case 'champagne': return 'from-[#220715] to-[#0c0207]';
      case 'ruby': return 'from-[#29030c] to-[#0d0104]';
      case 'gold': return 'from-[#261a04] to-[#0d0801]';
      case 'emerald': return 'from-[#03241a] to-[#010e0a]';
      default: return 'from-[#060c21] to-[#020512]';
    }
  };

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
                Màn Hình LED Đám Cưới Hiệu Ứng Sao Rơi
              </h3>
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
          Tạo phông nền sân khấu LED chuyển động sang trọng với hiệu ứng mưa sao băng rơi lung linh, tên cô dâu chú rể lồng chữ vàng kim, ngày cưới và lời chúc hạnh phúc.
        </p>
      </div>

      {/* KHUNG XEM TRƯỚC TRỰC QUAN (LIVE MINI PREVIEW) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Màn Hình Xem Trước (Trực Quan):</span>
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
          <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-black/50 pointer-events-none z-1" />

          {/* Nội dung chữ mô phỏng */}
          <div className="relative z-10 text-center space-y-1 pointer-events-none">
            {config.showMonogram && (
              <div className="inline-block px-2.5 py-0.5 rounded-full border border-amber-300/60 bg-amber-400/10 text-amber-200 text-[10px] font-serif font-black tracking-widest mb-0.5">
                {config.groomName.slice(-1)} ♥ {config.brideName.slice(-1)}
              </div>
            )}
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-200">
              {config.ceremonyTitle}
            </p>
            <h4
              className="text-base sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 transition-all"
              style={getFontFamilyStyle()}
            >
              {formatName(config.groomName)} <span className="font-light text-amber-300">&</span> {formatName(config.brideName)}
            </h4>
            <p className="text-[10px] sm:text-xs text-amber-100 font-bold">
              {new Date(config.weddingDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {config.showLunarDate && config.lunarDate && (
              <p className="text-[9px] text-amber-200/80 italic font-serif">
                ({config.lunarDate})
              </p>
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
        {/* MẪU PHÔNG NỀN ĐỘNG (MOTION PATTERN) */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Mẫu phông nền động (Hiệu ứng sân khấu):</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Mẫu 1: Tinh Tú */}
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
                  <h4 className="font-bold text-xs text-slate-800">Tinh Tú</h4>
                  {config.motionPattern === 'tinhtu' && (
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-md">Đang chọn</span>
                  )}
                </div>
                <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                  Sao rơi · Nhẹ nhàng & lãng mạn
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Bầu trời đêm sao thở êm đềm, bụi tiên vàng bay bồng bềnh lãng mạn
                </p>
              </div>
            </div>

            {/* Mẫu 2: Sao Băng */}
            <div
              onClick={() => setConfig(prev => ({ ...prev, motionPattern: 'saobang' }))}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                config.motionPattern === 'saobang'
                  ? 'border-cyan-500 bg-cyan-50/80 ring-2 ring-cyan-400/30'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-cyan-100 text-cyan-600 shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">Sao Băng</h4>
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

            {/* Mẫu 3: Pha Lê Ánh Kim */}
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
                  <h4 className="font-bold text-xs text-slate-800">Pha Lê Ánh Kim</h4>
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

            {/* Mẫu 4: Hỷ Sự Cát Tường */}
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
                  <h4 className="font-bold text-xs text-slate-800">Hỷ Sự Cát Tường</h4>
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
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-rose-600" />
            <span>Chọn tông màu phông nền LED:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'galaxy', label: 'Dạ Tiệc Ngân Hà', color: 'from-blue-900 to-slate-950' },
              { id: 'champagne', label: 'Hồng Champagne', color: 'from-pink-900 to-slate-950' },
              { id: 'ruby', label: 'Đỏ Hỷ Sự', color: 'from-red-900 to-slate-950' },
              { id: 'gold', label: 'Hoàng Gia Ánh Kim', color: 'from-amber-900 to-slate-950' },
              { id: 'emerald', label: 'Xanh Lục Bảo', color: 'from-emerald-900 to-slate-950' },
            ].map(th => (
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
