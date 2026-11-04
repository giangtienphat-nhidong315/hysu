import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  Download,
  QrCode,
  Search,
  Users,
  Check,
  UtensilsCrossed,
  Filter,
  Sparkles,
  Share2,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { GuestItem, CoupleProfile } from '../types/wedding';
import { GUEST_GROUP_LABELS } from '../data/categories';
import { useWedding } from '../context/WeddingContext';

interface GuestQrPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: GuestItem[];
  profile: CoupleProfile;
  initialSelectedGuest?: GuestItem | null;
}

export const GuestQrPrintModal: React.FC<GuestQrPrintModalProps> = ({
  isOpen,
  onClose,
  guests,
  profile,
  initialSelectedGuest,
}) => {
  const { sheetConfig } = useWedding();
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [onlyConfirmed, setOnlyConfirmed] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [singleGuestView, setSingleGuestView] = useState<GuestItem | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [labelSize, setLabelSize] = useState<'40x30' | '50x30' | 'A4_grid'>('40x30');

  // Hàm tạo link trang khách tự điền kèm tự điền mã khách
  const buildGuestCheckInUrl = (guest: GuestItem) => {
    const origin = window.location.origin.includes('github.io')
      ? 'https://giangtienphat-nhidong315.github.io/hysu/'
      : `${window.location.origin}${window.location.pathname}`;
    const cleanBase = origin.endsWith('/') ? origin : `${origin}/`;
    const params = new URLSearchParams();
    params.set('mode', 'checkin');
    if (guest.code) {
      params.set('code', guest.code);
    }
    params.set('guest_id', guest.id);
    if (sheetConfig?.webhookUrl) {
      params.set('sheet', sheetConfig.webhookUrl);
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
  };

  const handleCopyGuestLink = (guest: GuestItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = buildGuestCheckInUrl(guest);
    navigator.clipboard.writeText(url);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Cập nhật khi mở với 1 khách cụ thể
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedGuest) {
        setSingleGuestView(initialSelectedGuest);
      }
    } else {
      setSingleGuestView(null);
    }
  }, [isOpen, initialSelectedGuest]);

  // Lấy danh sách tất cả các bàn tiệc
  const allTables = Array.from(
    new Set(guests.map(g => g.tableNumber).filter((t): t is string => Boolean(t && t.trim())))
  );

  // Lọc khách theo điều kiện
  const filteredGuests = guests.filter(g => {
    if (onlyConfirmed && g.invitationStatus === 'declined') return false;
    if (filterGroup !== 'all' && g.group !== filterGroup) return false;
    if (filterTable !== 'all' && (g.tableNumber || 'none') !== filterTable) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCode = g.code ? g.code.toLowerCase().includes(q) : false;
      const matchName = g.name.toLowerCase().includes(q);
      const matchPhone = g.phone ? g.phone.includes(q) : false;
      const matchTable = g.tableNumber ? g.tableNumber.toLowerCase().includes(q) : false;
      if (!matchCode && !matchName && !matchPhone && !matchTable) return false;
    }
    return true;
  });

  // Tự động sinh mã QR cục bộ siêu tốc cho tất cả khách mời
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const generateQrs = async () => {
      const newMap: Record<string, string> = {};

      for (const guest of guests) {
        // Mã QR chứa link trực tiếp tới trang khách tự điền và tự nhận diện mã khách
        const qrPayload = buildGuestCheckInUrl(guest);

        try {
          const url = await QRCode.toDataURL(qrPayload, {
            width: 250,
            margin: 1,
            color: {
              dark: '#000000', // Đen thuần túy để máy in nhiệt in sắc nét tuyệt đối
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
          newMap[guest.id] = url;
        } catch (err) {
          console.error('Error generating QR for', guest.name, err);
        }
      }

      if (isMounted) {
        setQrMap(newMap);
        setIsGenerating(false);
      }
    };

    generateQrs();

    return () => {
      isMounted = false;
    };
  }, [isOpen, guests]);

  if (!isOpen) return null;

  // Lệnh in hàng loạt chuẩn tem nhiệt
  const handlePrint = () => {
    // Tạo cửa sổ in riêng biệt (Popup Print Window) để cô lập 100% chỉ có tem nhiệt
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) {
      window.print();
      return;
    }

    const labelsHtml = filteredGuests
      .map((guest, idx) => {
        const qrUrl = qrMap[guest.id] || '';
        const digits = (guest.code || '').replace(/\D/g, '');
        const codeStr = digits ? digits.padStart(3, '0') : String(idx + 1).padStart(3, '0');

        return `
          <div class="thermal-label">
            ${qrUrl ? `<img class="thermal-qr" src="${qrUrl}" alt="${codeStr}" />` : ''}
            <div class="thermal-code">#${codeStr}</div>
          </div>
        `;
      })
      .join('');

    const pageCss =
      labelSize === '40x30'
        ? `
        @page { size: 40mm 30mm; margin: 0; }
        body { margin: 0; padding: 0; font-family: monospace, sans-serif; background: #fff; }
        .thermal-label {
          width: 40mm;
          height: 30mm;
          page-break-after: always;
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 1.5mm;
        }
        .thermal-qr {
          width: 19mm;
          height: 19mm;
          display: block;
        }
        .thermal-code {
          font-size: 14pt;
          font-weight: 900;
          color: #000;
          line-height: 1.1;
          margin-top: 0.5mm;
          text-align: center;
        }
      `
        : labelSize === '50x30'
        ? `
        @page { size: 50mm 30mm; margin: 0; }
        body { margin: 0; padding: 0; font-family: monospace, sans-serif; background: #fff; }
        .thermal-label {
          width: 50mm;
          height: 30mm;
          page-break-after: always;
          page-break-inside: avoid;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 2mm;
          box-sizing: border-box;
          padding: 1mm;
        }
        .thermal-qr {
          width: 25mm;
          height: 25mm;
          display: block;
        }
        .thermal-code {
          font-size: 18pt;
          font-weight: 900;
          color: #000;
          text-align: center;
        }
      `
        : `
        @page { size: A4 portrait; margin: 8mm; }
        body { margin: 0; padding: 0; font-family: monospace, sans-serif; background: #fff; }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3mm;
        }
        .thermal-label {
          height: 32mm;
          border: 1px dashed #777;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5mm;
          page-break-inside: avoid;
        }
        .thermal-qr {
          width: 20mm;
          height: 20mm;
          display: block;
        }
        .thermal-code {
          font-size: 13pt;
          font-weight: 900;
          color: #000;
          line-height: 1.1;
          margin-top: 1mm;
          text-align: center;
        }
      `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>In Tem Nhiệt - Hỷ Sự</title>
          <style>${pageCss}</style>
        </head>
        <body>
          <div class="${labelSize === 'A4_grid' ? 'grid-container' : ''}">
            ${labelsHtml}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Tải ảnh tem nhiệt đơn lẻ (Chỉ có mã số khách hàng và mã QR điểm danh)
  const handleDownloadSingleCard = (guest: GuestItem) => {
    const qrDataUrl = qrMap[guest.id];
    if (!qrDataUrl) return;

    const digits = (guest.code || '').replace(/\D/g, '');
    const codeStr = digits ? digits.padStart(3, '0') : '001';

    // Tạo canvas kích thước chuẩn tem nhiệt tỉ lệ cao (400x300 px)
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nền trắng tinh khôi
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Đường viền tem đen mảnh
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Tiêu đề: MÃ SỐ KHÁCH HÀNG
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    // Vẽ QR Code lớn ở trung tâm
    const qrImg = new Image();
    qrImg.onload = () => {
      // Đặt mã QR căn giữa
      const qrSize = 190;
      ctx.drawImage(qrImg, (canvas.width - qrSize) / 2, 22, qrSize, qrSize);

      // Mã số khách hàng to, đậm, rõ nét bên dưới
      ctx.fillStyle = '#000000';
      ctx.font = '900 44px monospace, -apple-system, sans-serif';
      ctx.fillText(`#${codeStr}`, canvas.width / 2, 260);

      // Chữ phụ điểm danh nhỏ gọn
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#333333';
      ctx.fillText('ĐIỂM DANH DỰ TIỆC', canvas.width / 2, 282);

      // Tải về
      const a = document.createElement('a');
      a.download = `Tem-QR-${codeStr}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    qrImg.src = qrDataUrl;
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MÀN HÌNH XEM TRÊN APP (MODAL CHÍNH) */}
      {/* ============================================================== */}
      <div className="modal-overlay print:hidden">
        <div className="modal-box max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-900 text-white rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tem Nhiệt QR Điểm Danh Khách Mời
                </h3>
                <p className="text-[11px] text-slate-500">
                  Thiết kế chuẩn tem nhiệt nhỏ gọn: Chỉ gồm mã số khách hàng & mã QR điểm danh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={isGenerating || filteredGuests.length === 0}
                className="bg-slate-900 hover:bg-black disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>In Tem ({filteredGuests.length})</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Toolbar & Print Size Selection */}
          <div className="p-3 bg-white border-b border-slate-100 space-y-2.5 shrink-0">
            {/* Lựa chọn chế độ in tem */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">Khổ tem nhiệt:</span>
                <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLabelSize('40x30')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      labelSize === '40x30'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Tem Nhỏ 40x30mm
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelSize('50x30')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      labelSize === '50x30'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Tem Chuẩn 50x30mm
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelSize('A4_grid')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      labelSize === 'A4_grid'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Giấy A4 (Nhiều tem nhỏ)
                  </button>
                </div>
              </div>

              <span className="text-[11px] text-slate-400">
                Tối ưu cho máy in nhiệt Xprinter, HPRT, Gprinter, Niimbot...
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm khách theo tên, mã số, SĐT..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Group Filter */}
              <select
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">Tất cả nhóm</option>
                {Object.entries(GUEST_GROUP_LABELS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>

              {/* Only Confirmed Checkbox */}
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                <input
                  type="checkbox"
                  checked={onlyConfirmed}
                  onChange={e => setOnlyConfirmed(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                />
                <span>Chỉ khách tham dự</span>
              </label>
            </div>
          </div>

          {/* Cards Grid Preview Area */}
          <div className="p-4 overflow-y-auto flex-1 bg-slate-100/70">
            {isGenerating ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Đang chuẩn bị tem nhiệt điểm danh...</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Không có khách mời nào khớp với bộ lọc</p>
                <p className="text-[11px] text-slate-400 mt-1">Hãy thử xóa từ khóa tìm kiếm hoặc chọn tất cả nhóm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredGuests.map(guest => {
                  const qrUrl = qrMap[guest.id];
                  const digits = (guest.code || '').replace(/\D/g, '');
                  const codeStr = digits ? digits.padStart(3, '0') : '001';

                  return (
                    <div
                      key={guest.id}
                      className="bg-white rounded-xl p-2.5 border-2 border-slate-200 shadow-2xs flex flex-col items-center justify-between hover:border-slate-800 transition group relative"
                    >
                      {/* Tiêu đề ghi chú nhỏ người dùng nhận biết */}
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-full block mb-1">
                        {guest.name}
                      </span>

                      {/* Tem nhiệt preview (Tối giản: chỉ Mã QR + Mã số khách) */}
                      <div className="w-full bg-white border border-slate-900/40 rounded-lg p-2 flex flex-col items-center justify-center">
                        {qrUrl ? (
                          <img
                            src={qrUrl}
                            alt={`Mã QR ${codeStr}`}
                            className="w-24 h-24 object-contain"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-slate-100 rounded animate-pulse" />
                        )}

                        {/* Mã số khách hàng to đậm */}
                        <div className="text-center mt-1">
                          <span className="text-sm font-mono font-black text-slate-950 tracking-wider block">
                            #{codeStr}
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">
                            ĐIỂM DANH
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-1 w-full mt-2">
                        <button
                          onClick={() => setSingleGuestView(guest)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-1 rounded text-[10px] font-bold transition flex items-center justify-center cursor-pointer"
                          title="Xem tem đơn lẻ"
                        >
                          Xem
                        </button>
                        <button
                          onClick={(e) => handleCopyGuestLink(guest, e)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer"
                          title="Sao chép link gửi cho khách"
                        >
                          {copiedId === guest.id ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Share2 className="w-2.5 h-2.5" />}
                          <span>{copiedId === guest.id ? 'Đã chép' : 'Link'}</span>
                        </button>
                        <button
                          onClick={() => handleDownloadSingleCard(guest)}
                          className="bg-slate-900 hover:bg-black text-white py-1 rounded text-[10px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer"
                          title="Tải ảnh tem nhiệt"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>Tải</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Guide & Print action */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <div className="text-slate-600 text-[11px] leading-tight hidden sm:block">
              🏷️ <b>Định dạng tem nhiệt tiêu chuẩn:</b> Chỉ bao gồm mã QR quét điểm danh và Mã định danh (001, 002,...). In trực tiếp bằng máy in tem nhãn dán hoặc máy in hóa đơn.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
              >
                Đóng
              </button>
              <button
                onClick={handlePrint}
                disabled={isGenerating || filteredGuests.length === 0}
                className="flex-1 sm:flex-none bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>In Toàn Bộ Tem Nhiệt ({filteredGuests.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MODAL XEM CHI TIẾT 1 TEM NHIỆT ĐƠN LẺ */}
      {/* ============================================================== */}
      {singleGuestView && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl relative border-2 border-slate-900">
            <button
              onClick={() => setSingleGuestView(null)}
              className="absolute right-3 top-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-bold text-slate-400 block mb-1">
              {singleGuestView.name}
            </span>

            {/* Khung Tem Nhiệt Tiêu Chuẩn */}
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 my-2 shadow-sm flex flex-col items-center">
              {qrMap[singleGuestView.id] && (
                <img
                  src={qrMap[singleGuestView.id]}
                  alt="QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
              )}
              <div className="mt-2 text-center">
                <span className="text-2xl font-mono font-black text-slate-950 tracking-wider block">
                  #{singleGuestView.code || '001'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  ĐIỂM DANH DỰ TIỆC
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCopyGuestLink(singleGuestView)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition cursor-pointer"
                >
                  {copiedId === singleGuestView.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === singleGuestView.id ? 'Đã sao chép link' : 'Sao chép link'}</span>
                </button>
                <button
                  onClick={() => window.open(buildGuestCheckInUrl(singleGuestView), '_blank')}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-indigo-200 transition cursor-pointer"
                  title="Mở giao diện khách tự điền để thử nghiệm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Mở xem thử</span>
                </button>
              </div>

              <button
                onClick={() => handleDownloadSingleCard(singleGuestView)}
                className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Tải Ảnh Tem Nhiệt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. BẢNG IN TEM NHIỆT TIÊU CHUẨN (CHỈ HIỂN THỊ KHI BẤM IN) */}
      {/* ============================================================== */}
      <div className="hidden print:block print:w-full print:m-0 print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            ${labelSize === '40x30' ? `
              @page {
                size: 40mm 30mm;
                margin: 0;
              }
              .thermal-label-item {
                width: 40mm !important;
                height: 30mm !important;
                page-break-after: always;
                page-break-inside: avoid;
                box-sizing: border-box;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 1mm !important;
              }
              .thermal-qr-img {
                width: 19mm !important;
                height: 19mm !important;
              }
              .thermal-code-text {
                font-size: 13pt !important;
                font-weight: 900 !important;
                line-height: 1 !important;
              }
            ` : labelSize === '50x30' ? `
              @page {
                size: 50mm 30mm;
                margin: 0;
              }
              .thermal-label-item {
                width: 50mm !important;
                height: 30mm !important;
                page-break-after: always;
                page-break-inside: avoid;
                box-sizing: border-box;
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 1.5mm !important;
                gap: 2mm !important;
              }
              .thermal-qr-img {
                width: 24mm !important;
                height: 24mm !important;
              }
              .thermal-code-text {
                font-size: 16pt !important;
                font-weight: 900 !important;
                line-height: 1.1 !important;
              }
            ` : `
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              .thermal-grid-a4 {
                display: grid !important;
                grid-template-columns: repeat(5, 1fr) !important;
                gap: 3mm !important;
              }
              .thermal-label-item {
                height: 32mm !important;
                border: 1px dashed #999999 !important;
                box-sizing: border-box;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 1.5mm !important;
                page-break-inside: avoid;
              }
              .thermal-qr-img {
                width: 20mm !important;
                height: 20mm !important;
              }
              .thermal-code-text {
                font-size: 13pt !important;
                font-weight: 900 !important;
                line-height: 1.1 !important;
              }
            `}
          }
        `}} />

        <div className={labelSize === 'A4_grid' ? 'thermal-grid-a4' : ''}>
          {filteredGuests.map((guest, idx) => {
            const qrUrl = qrMap[guest.id];
            const digits = (guest.code || '').replace(/\D/g, '');
            const codeStr = digits ? digits.padStart(3, '0') : String(idx + 1).padStart(3, '0');

            return (
              <div
                key={guest.id}
                className="thermal-label-item bg-white text-black text-center"
              >
                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt={`QR ${codeStr}`}
                    className="thermal-qr-img object-contain"
                  />
                )}
                <div className="text-center">
                  <span className="thermal-code-text font-mono font-black text-black tracking-wider block">
                    #{codeStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
