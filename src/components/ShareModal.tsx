import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Globe,
  Smartphone,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Users,
  Monitor,
  Laptop,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { profile, exportDataJSON, sheetConfig } = useWedding();
  const [copied, setCopied] = useState(false);
  const [copiedPaired, setCopiedPaired] = useState(false);
  const [activeTab, setActiveTab] = useState<'pc' | 'link' | 'cloud' | 'apk' | 'sync'>('pc');

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    currentUrl
  )}&color=be185d`;

  // Đường link đồng bộ tự động 1 chạm có kèm theo mã kết nối Google Sheet
  const cleanBase = `${window.location.origin}${window.location.pathname}`;
  const pairedUrl = sheetConfig.webhookUrl
    ? `${cleanBase}?sheet=${encodeURIComponent(sheetConfig.webhookUrl)}`
    : currentUrl;

  const pairedQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    pairedUrl
  )}&color=059669`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPairedLink = () => {
    navigator.clipboard.writeText(pairedUrl);
    setCopiedPaired(true);
    setTimeout(() => setCopiedPaired(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Hỷ Sự - Kế Hoạch Cưới ${profile.groomName} & ${profile.brideName}`,
        text: 'Ứng dụng kế hoạch cưới và quản lý chi tiêu Hỷ Sự',
        url: currentUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Chia Sẻ Ứng Dụng Hỷ Sự</h3>
              <p className="text-[11px] text-slate-500">Cho vợ/chồng, gia đình hoặc người phụ trách</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-[11px] font-bold text-slate-600 gap-1 mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'pc' ? 'bg-white text-rose-600 shadow-xs' : ''
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Dùng Trên Máy Tính (PC)</span>
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'link' ? 'bg-white text-rose-600 shadow-xs' : ''
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mã QR & Link</span>
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'cloud' ? 'bg-white text-rose-600 shadow-xs' : ''
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Đưa Lên Mạng (Miễn Phí)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'apk' ? 'bg-white text-rose-600 shadow-xs' : ''
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Xuất File APK</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'sync' ? 'bg-white text-rose-600 shadow-xs' : ''
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dữ Liệu Vợ/Chồng</span>
          </button>
        </div>

        {/* TAB 0: HƯỚNG DẪN DÙNG TRÊN MÁY TÍNH (PC / LAPTOP) */}
        {activeTab === 'pc' && (
          <div className="space-y-3.5 text-xs">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/70 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Trải Nghiệm Đầy Đủ Trên Máy Tính</h4>
                  <p className="text-[11px] text-slate-500">Màn hình rộng, gõ phím nhanh, dễ kiểm soát ngân sách</p>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-indigo-100">
                <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs space-y-1">
                  <span className="font-bold text-indigo-700 flex items-center gap-1">
                    💻 Cách 1: Mở trực tiếp trên Trình duyệt Web
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Mở trình duyệt (Chrome, Edge, Cốc Cốc, Firefox) và truy cập địa chỉ:
                  </p>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg font-mono text-[11px] text-slate-800">
                    <span className="flex-1 font-bold">http://localhost:5173/</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('http://localhost:5173/');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      {copied ? 'Đã chép!' : 'Sao chép'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs space-y-1.5">
                  <span className="font-bold text-indigo-700 flex items-center gap-1">
                    🚀 Cách 2: Bấm 1 click mở nhanh bằng file .BAT
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Trong thư mục ứng dụng trên máy tính, bạn chỉ cần nhấp đúp vào file:
                  </p>
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold">
                    📁 Chay-Ung-Dung-May-Tinh.bat
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Hệ thống sẽ tự động bật máy chủ và mở sẵn trình duyệt cho bạn mà không cần gõ lệnh.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs space-y-1.5">
                  <span className="font-bold text-indigo-700 flex items-center gap-1">
                    ⭐ Cách 3: Cài đặt thành App Windows (Desktop App độc lập)
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Khi đang mở ứng dụng trên Chrome hoặc Microsoft Edge:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>
                      Nhìn lên góc phải thanh nhập link có biểu tượng <b>Cài đặt ứng dụng / Install app</b> (hoặc bấm Menu 3 chấm ➔ <b>Ứng dụng</b> ➔ <b>Cài đặt Hỷ Sự</b>).
                    </li>
                    <li>
                      App sẽ tạo ngay icon <b>"Hỷ Sự"</b> ngoài màn hình Desktop và ghim được xuống thanh Taskbar máy tính, mở ra cửa sổ riêng không vướng viền trình duyệt!
                    </li>
                  </ul>
                </div>
              </div>

              {/* Wide mode switch info */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-950 space-y-1">
                <span className="font-bold text-xs flex items-center gap-1 text-emerald-800">
                  🖥️ Nút Chuyển Giao Diện PC & Mobile:
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Ở góc trên thanh tiêu đề ứng dụng có nút biểu tượng <b>Màn hình máy tính</b>. Bấm vào đó để phóng rộng không gian hiển thị (dạng 2 cột bảng biểu rộng rãi trên PC) hoặc thu gọn khung điện thoại tùy ý!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MÃ QR & LINK TRUY CẬP NHANH */}
        {activeTab === 'link' && (
          <div className="space-y-3.5 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-3">
              <div className="inline-block p-2 bg-white rounded-2xl shadow-sm border border-slate-200">
                <img
                  src={qrCodeUrl}
                  alt="QR Code ứng dụng"
                  className="w-40 h-40 object-contain mx-auto rounded-lg"
                />
              </div>

              <div>
                <p className="font-bold text-slate-800 text-xs">
                  Quét mã QR bằng Camera điện thoại
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mở trực tiếp trên điện thoại Android hoặc iPhone (khi kết nối cùng mạng WiFi)
                </p>
              </div>
            </div>

            {/* URL Box */}
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-transparent text-xs text-slate-700 px-2 font-mono outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="bg-white hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-2xs transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Native share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Gửi Qua Zalo / Tin Nhắn</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: ĐƯA LÊN MẠNG (GITHUB PAGES / VERCEL / NETLIFY) */}
        {activeTab === 'cloud' && (
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 rounded-2xl">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Đưa Lên Mạng Miễn Phí Với GitHub Pages</span>
              </h4>
              <p className="text-[11px] text-emerald-900/90">
                Bạn có thể đưa ứng dụng lên mạng hoàn toàn miễn phí bằng <b>GitHub Pages</b> (đường link dạng <code className="bg-emerald-100/80 px-1 rounded text-emerald-900">https://ten-ban.github.io/hy-su/</code>) hoặc kết nối qua <b>Vercel</b> chỉ bằng 1 tài khoản GitHub.
              </p>
            </div>

            {/* GitHub Pages Setup */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                <span>🐙 Cách triển khai trực tiếp lên GitHub Pages:</span>
              </h5>
              <ol className="list-decimal pl-4 space-y-2 text-[11px] text-slate-700">
                <li>
                  <b>Bước 1: Tạo kho chứa (Repository) mới trên GitHub</b>
                  <p className="text-slate-500">
                    Vào <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-rose-600 font-bold underline inline-flex items-center gap-0.5">github.com/new <ExternalLink className="w-2.5 h-2.5" /></a> ➔ Đặt tên kho (ví dụ: <code className="bg-slate-200 px-1 rounded">hy-su</code>) ➔ Chọn <b>Public</b> ➔ Bấm <b>Create repository</b>.
                  </p>
                </li>
                <li>
                  <b>Bước 2: Đẩy mã nguồn từ máy lên GitHub</b>
                  <p className="text-slate-500 mb-1">
                    Mở PowerShell/Terminal tại thư mục này và chạy các lệnh:
                  </p>
                  <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[10px] leading-relaxed select-all overflow-x-auto">
                    git init&#10;git add .&#10;git commit -m "Khoi tao ung dung Hy Su"&#10;git branch -M main&#10;git remote add origin https://github.com/TEN-TAI-KHOAN/hy-su.git&#10;git push -u origin main
                  </pre>
                </li>
                <li>
                  <b>Bước 3: Bật tính năng Pages trên GitHub</b>
                  <p className="text-slate-500">
                    Trên trang repository của bạn tại GitHub: Vào <b>Settings</b> ➔ chọn <b>Pages</b> (ở cột bên trái) ➔ Tại mục <b>Source</b>, chọn <b>GitHub Actions</b>.
                  </p>
                </li>
                <li>
                  <b>Bước 4: Hoàn thành!</b>
                  <p className="text-slate-500">
                    Dự án đã có sẵn file quy trình tự động <code className="bg-slate-200 px-1 rounded">.github/workflows/deploy.yml</code>. GitHub sẽ tự động build và cấp cho bạn link trang web sau ~1 phút!
                  </p>
                </li>
              </ol>
            </div>

            {/* Vercel Option */}
            <div className="bg-indigo-50/70 border border-indigo-200 p-3 rounded-2xl space-y-1">
              <span className="font-bold text-indigo-900 text-xs">
                ⚡ Hoặc đăng nhập Vercel bằng GitHub (Cực nhanh):
              </span>
              <p className="text-[11px] text-indigo-800">
                Sau khi đã đẩy code lên GitHub, bạn chỉ cần vào <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-rose-600 font-bold underline">vercel.com</a> chọn <i>Continue with GitHub</i> ➔ chọn kho <i>hy-su</i> ➔ Bấm <i>Deploy</i>. Vercel sẽ tự cấp link .vercel.app bảo mật HTTPS miễn phí vĩnh viễn!
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: XUẤT FILE CÀI ĐẶT APK ANDROID */}
        {activeTab === 'apk' && (
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3.5 rounded-2xl">
              <h4 className="font-bold text-blue-950 flex items-center gap-1.5 mb-1">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Xuất file .APK gửi qua Zalo / Google Drive</span>
              </h4>
              <p className="text-[11px] text-blue-900/90">
                Dự án đã có sẵn mã nguồn <b>Android Studio</b> hoàn chỉnh trong thư mục <code className="bg-blue-100 text-blue-800 px-1 rounded">android/</code>.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <h5 className="font-bold text-slate-800 text-xs">Cách tạo file .APK:</h5>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600">
                <li>
                  Trên máy tính, mở terminal chạy lệnh:
                  <div className="bg-slate-900 text-emerald-400 p-2 rounded-xl font-mono text-[11px] my-1 select-all">
                    npm.cmd run cap:open
                  </div>
                  Lệnh này sẽ tự động khởi động <b>Android Studio</b>.
                </li>
                <li>
                  Trong Android Studio, trên thanh menu chọn: <br />
                  <b>Build</b> ➡️ <b>Build Bundle(s) / APK(s)</b> ➡️ <b>Build APK(s)</b>.
                </li>
                <li>
                  Sau khoảng 1-2 phút, Android Studio sẽ thông báo và cung cấp file <code className="bg-slate-200 px-1 rounded font-bold">app-debug.apk</code>.
                </li>
                <li>
                  Bạn chỉ cần gửi file <code className="bg-slate-200 px-1 rounded font-bold">.apk</code> này qua Zalo hoặc đưa lên Google Drive, người nhận chỉ cần bấm vào là cài đặt trực tiếp lên điện thoại Android!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 4: CHIA SẺ VÀ ĐỒNG BỘ DỮ LIỆU VỢ / CHỒNG */}
        {activeTab === 'sync' && (
          <div className="space-y-3.5 text-xs leading-relaxed">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3.5 rounded-2xl">
              <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Đồng Bộ 2 Chiều: Vợ / Chồng & Mọi Thiết Bị</span>
              </h4>
              <p className="text-[11px] text-emerald-900/90">
                Khi bất kỳ ai thay đổi tên cô dâu, chú rể, ngân sách hay thêm khách mời, dữ liệu sẽ được tự động lưu lên Google Sheet và truyền ngay sang các thiết bị còn lại!
              </p>
            </div>

            {/* 1-Touch QR Code Pairing */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-3">
              <div className="inline-block p-2 bg-white rounded-2xl shadow-sm border border-emerald-200">
                <img
                  src={pairedQrCode}
                  alt="Mã QR kết nối vợ chồng"
                  className="w-40 h-40 object-contain mx-auto rounded-lg"
                />
              </div>

              <div>
                <p className="font-bold text-slate-900 text-xs flex items-center justify-center gap-1">
                  <span>📱 Quét mã này trên điện thoại Vợ / Chồng</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mở Camera điện thoại quét mã QR. Ứng dụng sẽ tự động kết nối và tải toàn bộ thông tin tiệc cưới về máy mới trong 1 giây mà không cần cài đặt gì thêm!
                </p>
              </div>

              {/* Copy paired link */}
              <button
                onClick={handleCopyPairedLink}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 text-xs"
              >
                {copiedPaired ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Đã Sao Chép Link Kết Nối Vợ Chồng!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao Chép Link Kết Nối Gửi Qua Zalo</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: JSON Backup */}
            <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs space-y-2">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sao Lưu & Khôi Phục Thủ Công (File .json)</span>
              </h5>
              <p className="text-[11px] text-slate-500">
                Nếu không dùng mạng, bạn có thể tải về file sao lưu (.json) gửi qua Zalo để người kia nhập vào máy:
              </p>
              <button
                onClick={exportDataJSON}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải File Dữ Liệu Dự Phòng</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
