import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Download,
  QrCode,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Smartphone,
} from 'lucide-react';
import { CoupleProfile } from '../types/wedding';

interface StandeeQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CoupleProfile;
  webhookUrl?: string;
}

export const StandeeQrModal: React.FC<StandeeQrModalProps> = ({
  isOpen,
  onClose,
  profile,
  webhookUrl,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Đường dẫn link check-in độc lập cho khách (Tối ưu độ ngắn để mã QR cực nét, dễ quét)
  const checkInUrl = (() => {
    // Luôn ưu tiên domain chuẩn trên GitHub Pages hoặc origin hiện tại
    const origin = window.location.origin.includes('github.io')
      ? 'https://giangtienphat-nhidong315.github.io/hysu/'
      : `${window.location.origin}${window.location.pathname}`;

    const cleanBase = origin.endsWith('/') ? origin : `${origin}/`;
    const params = new URLSearchParams();
    params.set('mode', 'checkin');

    if (webhookUrl) {
      params.set('sheet', webhookUrl);
    }

    try {
      const pData = {
        groomName: profile.groomName,
        brideName: profile.brideName,
        weddingDate: profile.weddingDate,
        weddingTime: profile.weddingTime,
        venue: profile.venue,
      };
      params.set('p', btoa(unescape(encodeURIComponent(JSON.stringify(pData)))));
    } catch (e) {}

    return `${cleanBase}?${params.toString()}`;
  })();

  // Tạo mã QR chất lượng cao cho Standee
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(checkInUrl, {
      width: 400,
      margin: 1,
      color: {
        dark: '#9f1239', // Màu đỏ rượu sang trọng
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    }).then(setQrDataUrl);
  }, [isOpen, checkInUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Tải ảnh Standee chất lượng cao
  const handleDownloadStandee = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nền trắng viền vàng hồng
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 16;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Tiêu đề
    ctx.fillStyle = '#9f1239';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHÀO MỪNG QUÝ KHÁCH ĐẾN DỰ TIỆC CƯỚI', canvas.width / 2, 170);

    // Tên cô dâu chú rể
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 70px sans-serif';
    ctx.fillText(`${profile.groomName} & ${profile.brideName}`, canvas.width / 2, 280);

    // Hướng dẫn
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('QUÉT MÃ ĐIỂM DANH & NHẬN MÃ MAY MẮN', canvas.width / 2, 400);

    ctx.fillStyle = '#64748b';
    ctx.font = '30px sans-serif';
    ctx.fillText('Gửi lời chúc & Tham gia Mini Game / Bốc Thăm Trúng Thưởng!', canvas.width / 2, 460);

    // Vẽ QR
    const img = new Image();
    img.onload = () => {
      const qrSize = 650;
      ctx.drawImage(img, (canvas.width - qrSize) / 2, 530, qrSize, qrSize);

      ctx.fillStyle = '#9f1239';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('DÙNG CAMERA HOẶC ZALO ĐỂ QUÉT', canvas.width / 2, 1260);

      if (profile.weddingDate) {
        ctx.fillStyle = '#64748b';
        ctx.font = '32px sans-serif';
        ctx.fillText(`Ngày cưới: ${profile.weddingDate} ${profile.weddingTime ? `• ${profile.weddingTime}` : ''}`, canvas.width / 2, 1370);
      }

      if (profile.venue) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '28px sans-serif';
        ctx.fillText(profile.venue, canvas.width / 2, 1440);
      }

      const a = document.createElement('a');
      a.download = `Standee-Diem-Danh-${profile.groomName}-${profile.brideName}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = qrDataUrl;
  };

  return (
    <>
      <div className="modal-overlay print:hidden">
        <div className="modal-box max-w-md p-5 text-center">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-left">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Mã QR Đặt Tại Bàn Đón Khách (Standee)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dành cho khách không mang thiệp hoặc muốn tự điểm danh
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Standee Preview Card */}
          <div className="bg-gradient-to-b from-rose-50/60 to-white border-2 border-rose-300 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="inline-block p-1 bg-rose-100 text-rose-700 rounded-full">
              <Sparkles className="w-4 h-4" />
            </div>

            <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600">
              Điểm Danh & Nhận Mã May Mắn
            </p>

            <h2 className="text-lg font-black text-slate-900">
              {profile.groomName} & {profile.brideName}
            </h2>

            {/* QR Image */}
            <div className="p-3 bg-white rounded-2xl border border-rose-200/80 shadow-inner w-56 h-56 mx-auto flex items-center justify-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Standee" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />
              )}
            </div>

            <p className="text-[11px] text-slate-600 font-medium">
              Quét mã bằng Camera điện thoại hoặc Zalo để gửi lời chúc & nhận mã số bốc thăm quà tặng!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-black text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>In Khổ A4 / A5</span>
            </button>

            <button
              onClick={handleDownloadStandee}
              className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Tải Ảnh Standee</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={handleCopyLink}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép link!' : 'Sao chép link mở trên điện thoại'}</span>
            </button>

            <a
              href={checkInUrl}
              target="_blank"
              rel="noreferrer"
              className="text-rose-600 hover:underline flex items-center gap-0.5 font-bold"
            >
              <span>Mở thử trang khách</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* In Khung Standee Đặt Bàn Khổ A4 / A5 */}
      <div className="hidden print:block print:w-full print:m-0 print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
          }
        `}} />

        <div className="border-4 border-rose-600 rounded-3xl p-10 text-center bg-white flex flex-col justify-between items-center min-h-[90vh]">
          <div className="space-y-3">
            <p className="text-xl font-bold uppercase tracking-widest text-rose-700">
              CHÀO MỪNG QUÝ KHÁCH ĐẾN DỰ TIỆC CƯỚI
            </p>
            <h1 className="text-5xl font-black text-slate-900 mt-2">
              {profile.groomName} & {profile.brideName}
            </h1>
            <p className="text-2xl font-bold text-rose-600 pt-2">
              QUÉT MÃ ĐIỂM DANH & NHẬN MÃ BỐC THĂM MAY MẮN
            </p>
            <p className="text-base text-slate-500">
              Gửi lời chúc mừng đôi uyên ương & Tham gia Mini Game nhận quà
            </p>
          </div>

          <div className="my-6 p-4 border-2 border-rose-300 rounded-3xl">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Standee QR" className="w-96 h-96 object-contain" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-lg font-mono font-bold text-slate-800">
              DÙNG CAMERA ĐIỆN THOẠI HOẶC ZALO ĐỂ QUÉT
            </p>
            {profile.weddingDate && (
              <p className="text-sm text-slate-400">
                {profile.weddingDate} {profile.weddingTime ? `• ${profile.weddingTime}` : ''}
              </p>
            )}
            {profile.venue && (
              <p className="text-sm text-slate-400">{profile.venue}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};