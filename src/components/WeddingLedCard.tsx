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
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { useToast } from '../context/ToastContext';
import { LedTheme, LedFont } from './WeddingLedScreenPage';

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
      starSpeed: 'normal' as 'slow' | 'normal' | 'fast',
      starDensity: 'normal' as 'low' | 'normal' | 'high',
      fontFamily: 'serif' as LedFont,
      showLunarDate: true,
      showVenue: true,
      showQuote: true,
      showMonogram: true,
    };
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Vẽ sao lấp lánh
      stars.forEach(s => {
        s.alpha += s.flicker;
        if (s.alpha > 0.95 || s.alpha < 0.2) s.flicker = -s.flicker;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, s.alpha))})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Vẽ sao băng
      meteors.forEach((m, i) => {
        if (!m.active) {
          if (Math.random() < 0.04) {
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
  }, [config.theme, config.starSpeed]);

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
          className={`relative aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-b ${getThemeBgClass()} shadow-inner cursor-pointer group flex flex-col items-center justify-center p-4 border border-amber-300/30`}
        >
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
            <h4 className="text-base sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 font-serif">
              {config.groomName} <span className="font-light text-amber-300">&</span> {config.brideName}
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
