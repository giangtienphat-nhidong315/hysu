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
} from 'lucide-react';
import { GuestItem, CoupleProfile } from '../types/wedding';
import { GUEST_GROUP_LABELS } from '../data/categories';

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
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [onlyConfirmed, setOnlyConfirmed] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [singleGuestView, setSingleGuestView] = useState<GuestItem | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

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
        // Cấu trúc dữ liệu mã QR định danh khách
        const qrPayload = JSON.stringify({
          app: 'hysu',
          id: guest.id,
          code: guest.code || '',
          name: guest.name,
          table: guest.tableNumber || '',
          plus: guest.plusGuests || 0,
        });

        try {
          const url = await QRCode.toDataURL(qrPayload, {
            width: 220,
            margin: 1,
            color: {
              dark: '#9f1239', // Rose gold / burgundy wedding color
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

  // Lệnh in hàng loạt chuẩn A4
  const handlePrint = () => {
    window.print();
  };

  // Tải ảnh thẻ QR đơn lẻ
  const handleDownloadSingleCard = (guest: GuestItem) => {
    const qrDataUrl = qrMap[guest.id];
    if (!qrDataUrl) return;

    // Tạo canvas để vẽ thẻ đẹp kèm thông tin
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nền trắng viền hồng
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    // Tiêu đề
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HỶ SỰ • THIỆP MỜI DỰ TIỆC', canvas.width / 2, 85);

    // Tên cô dâu chú rể
    ctx.fillStyle = '#475569';
    ctx.font = '22px sans-serif';
    ctx.fillText(`${profile.groomName} & ${profile.brideName}`, canvas.width / 2, 125);

    // Tên khách
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(guest.name, canvas.width / 2, 190);

    // Bàn tiệc
    ctx.fillStyle = '#be123c';
    ctx.font = 'bold 24px sans-serif';
    const tableText = guest.tableNumber ? `BÀN TIỆC: ${guest.tableNumber}` : 'BÀN TIỆC: SẼ XẾP TẠI SẢNH';
    ctx.fillText(tableText, canvas.width / 2, 235);

    // Mã định danh số thứ tự
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`MÃ KHÁCH: ${guest.code || 'KH-001'}`, canvas.width / 2, 268);

    // Người đi cùng
    if (guest.plusGuests && guest.plusGuests > 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.fillText(`(Đi cùng: +${guest.plusGuests} người)`, canvas.width / 2, 298);
    }

    // Vẽ QR Code
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, (canvas.width - 310) / 2, 320, 310, 310);

      // Chú thích cuối
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText('Vui lòng quét mã tại bàn đón khách để điểm danh', canvas.width / 2, 690);

      if (profile.weddingDate) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px sans-serif';
        ctx.fillText(`Ngày cưới: ${profile.weddingDate} ${profile.weddingTime ? `• ${profile.weddingTime}` : ''}`, canvas.width / 2, 730);
      }

      // Tải về
      const a = document.createElement('a');
      a.download = `TheQR-${guest.code || 'KH'}-${guest.name.replace(/\s+/g, '_')}.png`;
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
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Thẻ QR Định Danh Khách Mời & In Hàng Loạt
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tạo thẻ QR cá nhân hóa cho từng khách • In phiếu kẹp thiệp hoặc quét tại bàn tiệc
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={isGenerating || filteredGuests.length === 0}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Hàng Loạt ({filteredGuests.length})</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-3 bg-white border-b border-slate-100 space-y-2 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm khách theo tên, SĐT, bàn..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
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

              {/* Table Filter */}
              {allTables.length > 0 && (
                <select
                  value={filterTable}
                  onChange={e => setFilterTable(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="all">Tất cả bàn</option>
                  <option value="none">Chưa xếp bàn</option>
                  {allTables.map(tbl => (
                    <option key={tbl} value={tbl}>
                      {tbl}
                    </option>
                  ))}
                </select>
              )}

              {/* Only Confirmed Checkbox */}
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                <input
                  type="checkbox"
                  checked={onlyConfirmed}
                  onChange={e => setOnlyConfirmed(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                />
                <span>Chỉ khách tham dự</span>
              </label>
            </div>
          </div>

          {/* Cards Grid Preview Area */}
          <div className="p-4 overflow-y-auto flex-1 bg-slate-100/70">
            {isGenerating ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Đang tạo mã QR định danh cho toàn bộ khách...</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Không có khách mời nào khớp với bộ lọc</p>
                <p className="text-[11px] text-slate-400 mt-1">Hãy thử xóa từ khóa tìm kiếm hoặc chọn tất cả nhóm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredGuests.map(guest => {
                  const qrUrl = qrMap[guest.id];
                  const totalSeats = 1 + (guest.plusGuests || 0);

                  return (
                    <div
                      key={guest.id}
                      className="bg-white rounded-2xl p-3 border border-rose-200/70 shadow-xs flex flex-col justify-between hover:border-rose-400 transition group relative"
                    >
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-1 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono font-extrabold bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded-md">
                            {guest.code || 'KH-000'}
                          </span>
                          <span className="text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-md">
                            {guest.tableNumber ? guest.tableNumber : 'Chưa xếp bàn'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {guest.isVegetarian && (
                            <span className="text-[9px] font-bold bg-teal-50 text-teal-700 px-1 py-0.5 rounded flex items-center gap-0.5">
                              <UtensilsCrossed className="w-2.5 h-2.5" /> Chay
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-bold">
                            {totalSeats} người
                          </span>
                        </div>
                      </div>

                      {/* Guest Name & Wedding subtitle */}
                      <div className="text-center my-1">
                        <h4 className="text-xs font-black text-slate-900 truncate leading-snug">
                          {guest.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {profile.groomName} & {profile.brideName}
                        </p>
                      </div>

                      {/* QR Image */}
                      <div className="bg-rose-50/40 p-2 rounded-xl my-1.5 flex items-center justify-center border border-rose-100/60">
                        {qrUrl ? (
                          <img
                            src={qrUrl}
                            alt={`Mã QR ${guest.name}`}
                            className="w-28 h-28 object-contain rounded-md"
                          />
                        ) : (
                          <div className="w-28 h-28 bg-slate-100 rounded-md animate-pulse" />
                        )}
                      </div>

                      <p className="text-[9px] text-slate-400 text-center italic mb-2">
                        Quét mã tại bàn đón khách
                      </p>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => setSingleGuestView(guest)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <QrCode className="w-3 h-3 text-rose-600" />
                          <span>Xem Thẻ</span>
                        </button>
                        <button
                          onClick={() => handleDownloadSingleCard(guest)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 py-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                          title="Tải ảnh thẻ để gửi Zalo"
                        >
                          <Download className="w-3 h-3" />
                          <span>Lưu Ảnh</span>
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
            <div className="text-slate-500 text-[11px] leading-tight hidden sm:block">
              💡 <b>Mẹo in:</b> Bấm "In Hàng Loạt", chọn kích thước giấy <b>A4</b>, bố cục sẽ tự động dàn đều các phiếu thiệp chuẩn đẹp để cắt kẹp vào thiệp cưới hoặc thẻ đeo bàn tiệc!
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
                className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Toàn Bộ Danh Sách ({filteredGuests.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MODAL XEM CHI TIẾT 1 THẺ ĐƠN LẺ */}
      {/* ============================================================== */}
      {singleGuestView && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl relative border-2 border-rose-300">
            <button
              onClick={() => setSingleGuestView(null)}
              className="absolute right-3 top-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-block p-1 bg-rose-50 text-rose-600 rounded-full mb-2">
              <Sparkles className="w-4 h-4" />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">
              Thẻ Khách Mời Dự Tiệc Cưới
            </span>
            <p className="text-xs text-slate-400 mb-3">
              {profile.groomName} & {profile.brideName}
            </p>

            <h3 className="text-lg font-black text-slate-900 leading-tight">
              {singleGuestView.name}
            </h3>

            <div className="flex items-center justify-center gap-1.5 my-2 flex-wrap">
              <span className="bg-slate-900 text-amber-300 font-mono text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                MÃ: {singleGuestView.code || 'KH-000'}
              </span>
              <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {singleGuestView.tableNumber ? `Bàn: ${singleGuestView.tableNumber}` : 'Bàn: Sẽ xếp tại sảnh'}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {1 + (singleGuestView.plusGuests || 0)} người
              </span>
            </div>

            {/* QR Card Frame */}
            <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-rose-200 my-3 shadow-inner">
              {qrMap[singleGuestView.id] && (
                <img
                  src={qrMap[singleGuestView.id]}
                  alt="QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
              )}
              <p className="text-[10px] text-slate-400 mt-2 italic">
                Xuất trình mã này tại bàn đón khách
              </p>
            </div>

            <button
              onClick={() => handleDownloadSingleCard(singleGuestView)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Tải Ảnh Thẻ (Gửi Qua Zalo)</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. BẢNG IN CHUẨN A4 HÀNG LOẠT (CHỈ HIỂN THỊ KHI BẤM IN) */}
      {/* ============================================================== */}
      <div className="hidden print:block print:w-full print:m-0 print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            .print-page-break {
              page-break-after: always;
            }
          }
        `}} />

        <div className="grid grid-cols-2 gap-4">
          {filteredGuests.map((guest, idx) => {
            const qrUrl = qrMap[guest.id];
            const totalPeople = 1 + (guest.plusGuests || 0);

            return (
              <div
                key={guest.id}
                className="border-2 border-rose-400 rounded-2xl p-4 text-center bg-white flex flex-col justify-between break-inside-avoid relative"
                style={{ height: '240px', borderColor: '#f43f5e' }}
              >
                {/* Outer decorative corners */}
                <div className="flex items-center justify-between border-b border-rose-200 pb-1.5 mb-1 text-[11px] font-bold text-rose-700">
                  <span className="font-mono bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-black tracking-wide">
                    {guest.code || `KH-${String(idx + 1).padStart(3, '0')}`}
                  </span>
                  <span>{profile.groomName} & {profile.brideName}</span>
                </div>

                <div className="my-auto flex items-center justify-between gap-3 px-1">
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Kính mời</span>
                    <h2 className="text-base font-black text-slate-900 leading-tight">
                      {guest.name}
                    </h2>

                    <div className="mt-2 space-y-1">
                      <div className="inline-block bg-rose-50 border border-rose-300 text-rose-800 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                        {guest.tableNumber ? `BÀN: ${guest.tableNumber}` : 'BÀN: Sắp xếp tại sảnh'}
                      </div>
                      <div className="text-[10px] text-slate-600 font-semibold block">
                        Số lượng: <b>{totalPeople} người</b>
                        {guest.isVegetarian && ' (Có suất chay)'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-center">
                    {qrUrl && (
                      <img
                        src={qrUrl}
                        alt="QR Ticket"
                        className="w-24 h-24 object-contain border border-slate-200 p-1 rounded-lg"
                      />
                    )}
                    <span className="text-[8px] text-slate-400 block mt-0.5">Quét điểm danh</span>
                  </div>
                </div>

                <div className="border-t border-rose-100 pt-1 text-[9px] text-slate-400 flex items-center justify-between">
                  <span>Ngày cưới: {profile.weddingDate} {profile.weddingTime ? `(${profile.weddingTime})` : ''}</span>
                  <span>{profile.venue || 'Trung tâm tiệc cưới'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
