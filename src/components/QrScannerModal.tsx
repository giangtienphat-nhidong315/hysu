import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  UserCheck,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  SwitchCamera,
} from 'lucide-react';
import { GuestItem } from '../types/wedding';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: GuestItem[];
  onCheckInGuest: (guestId: string) => { success: boolean; guest?: GuestItem; alreadyCheckedIn?: boolean };
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  guests,
  onCheckInGuest,
}) => {
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedResult, setScannedResult] = useState<{
    guest: GuestItem;
    isNew: boolean;
    time: string;
  } | null>(null);
  const [unknownCode, setUnknownCode] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Âm thanh báo điểm danh thành công
  const playSuccessBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio not permitted without gesture
    }
  };

  // Xử lý chuỗi mã QR quét được
  const handleDecodeSuccess = (decodedText: string) => {
    // Chống quét liên tục cùng 1 mã trong 2.5 giây
    const now = Date.now();
    if (now - lastScanTimeRef.current < 2500) return;
    lastScanTimeRef.current = now;

    let targetGuestId: string | null = null;

    // 1. Thử parse dạng JSON chuẩn Hỷ Sự: { app: 'hysu', id: '...', code: '...' }
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed && (parsed.id || parsed.code)) {
        targetGuestId = parsed.id || parsed.code;
      }
    } catch {
      // Không phải JSON
    }

    // 2. Thử parse tiền tố HYSU:GUEST:id
    if (!targetGuestId && decodedText.startsWith('HYSU:GUEST:')) {
      targetGuestId = decodedText.replace('HYSU:GUEST:', '').trim();
    }

    // 3. Thử tìm theo Mã định danh (ví dụ: KH-001 hoặc số 001)
    if (!targetGuestId) {
      const clean = decodedText.trim().toLowerCase();
      const matchedByCode = guests.find(
        g => g.code && (g.code.toLowerCase() === clean || g.code.toLowerCase().replace(/^[a-z]+-/, '') === clean.replace(/^[a-z]+-/, ''))
      );
      if (matchedByCode) targetGuestId = matchedByCode.id;
    }

    // 4. Thử tìm trực tiếp theo ID trong danh sách
    if (!targetGuestId) {
      const matchedById = guests.find(g => g.id === decodedText.trim());
      if (matchedById) targetGuestId = matchedById.id;
    }

    // 5. Thử tìm theo Tên hoặc Số điện thoại (nếu quét thiệp mời tùy chỉnh)
    if (!targetGuestId) {
      const clean = decodedText.trim().toLowerCase();
      const matchedByName = guests.find(
        g => g.name.toLowerCase() === clean || (g.phone && g.phone === clean)
      );
      if (matchedByName) targetGuestId = matchedByName.id;
    }

    if (targetGuestId) {
      const checkInResult = onCheckInGuest(targetGuestId);
      if (checkInResult.success && checkInResult.guest) {
        playSuccessBeep();

        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#ec4899'],
        });

        const timeStr =
          checkInResult.guest.checkInTime ||
          new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        setScannedResult({
          guest: checkInResult.guest,
          isNew: !checkInResult.alreadyCheckedIn,
          time: timeStr,
        });
        setUnknownCode(null);
        return;
      }
    }

    // Nếu không khớp với khách nào
    setUnknownCode(decodedText);
    setScannedResult(null);
  };

  // Khởi động Camera quét QR
  useEffect(() => {
    if (!isOpen) {
      // Dọn dẹp scanner khi đóng modal
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        scannerRef.current = null;
      }
      setScannerActive(false);
      setScannedResult(null);
      setUnknownCode(null);
      return;
    }

    let isMounted = true;
    setCameraError(null);

    const startCamera = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader-video');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode },
          {
            fps: 12,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              handleDecodeSuccess(decodedText);
            }
          },
          () => {
            // bỏ qua frame không có QR
          }
        );

        if (isMounted) {
          setScannerActive(true);
        }
      } catch (err: any) {
        console.error('Lỗi khởi động camera quét QR:', err);
        if (isMounted) {
          setCameraError(
            err.message || 'Không thể mở Camera. Hãy cấp quyền truy cập máy ảnh cho trang web.'
          );
          setScannerActive(false);
        }
      }
    };

    // Đợi 200ms để DOM modal render container xong
    const timer = setTimeout(() => {
      startCamera();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        scannerRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  // Đổi camera Trước / Sau
  const toggleCameraFacing = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Quét từ ảnh chụp tải lên
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = scannerRef.current || new Html5Qrcode('qr-reader-video');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleDecodeSuccess(decodedText);
    } catch {
      alert('Không tìm thấy mã QR trong bức ảnh này. Vui lòng thử chụp lại rõ nét hơn.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-md">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileScan}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Quét Mã QR Điểm Danh Khách</h3>
              <p className="text-[11px] text-slate-300">Bàn đón tiệc • Nhận diện khách & xếp bàn tức thì</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {/* Container for html5-qrcode video */}
          <div id="qr-reader-video" className="w-full h-full [&_video]:object-cover" />

          {/* Animated Laser Scanner Line */}
          {scannerActive && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-emerald-400/80 rounded-3xl relative shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                {/* 4 corner brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                {/* Laser scan animation */}
                <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
              <p className="text-xs text-slate-200">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Quét Từ Ảnh Có Sẵn</span>
              </button>
            </div>
          )}

          {/* Controls Bar at bottom of viewfinder */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
            <button
              onClick={toggleCameraFacing}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>Đổi Camera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Ảnh Mã QR</span>
            </button>
          </div>
        </div>

        {/* Result Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          {scannedResult ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 shadow-sm animate-in slide-in-from-bottom duration-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{scannedResult.isNew ? 'ĐIỂM DANH THÀNH CÔNG!' : 'KHÁCH ĐÃ ĐẾN TRƯỚC ĐÓ'}</span>
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-mono text-xs font-black bg-slate-900 text-amber-300 px-2 py-0.5 rounded-md">
                      {scannedResult.guest.code || 'KH-000'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 leading-tight">
                      {scannedResult.guest.name}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Thời gian đến:</span>
                  <span className="text-xs font-bold text-emerald-700">{scannedResult.time}</span>
                </div>
              </div>

              {/* Table & plus-ones detail */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-200/60">
                <div className="bg-white/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Xếp bàn số:</span>
                  <span className="font-black text-rose-700 text-sm">
                    {scannedResult.guest.tableNumber || 'Chưa xếp bàn'}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Số người dự:</span>
                  <span className="font-bold text-slate-900">
                    {1 + (scannedResult.guest.plusGuests || 0)} người
                    {scannedResult.guest.isVegetarian && ' (Ăn chay)'}
                  </span>
                </div>
              </div>

              {scannedResult.guest.notes && (
                <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-xl border border-emerald-100">
                  Ghi chú: {scannedResult.guest.notes}
                </p>
              )}

              <button
                onClick={() => setScannedResult(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <span>Quét Khách Tiếp Theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : unknownCode ? (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-center space-y-2">
              <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
              <p className="text-xs font-bold text-amber-900">Mã QR này không khớp với khách mời nào!</p>
              <p className="text-[11px] text-amber-700 truncate font-mono bg-white p-1 rounded border border-amber-200">
                {unknownCode}
              </p>
              <button
                onClick={() => setUnknownCode(null)}
                className="bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-4 rounded-xl text-xs font-bold transition"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="text-center py-2 text-slate-500 text-xs">
              Hướng camera về phía mã QR trên thiệp mời hoặc màn hình điện thoại của khách để điểm danh tự động.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
