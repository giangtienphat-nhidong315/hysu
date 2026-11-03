import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Download,
  Smartphone,
  QrCode,
  Code2,
  Heart,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { generateAppsScriptCode } from '../services/googleSheets';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    sheetConfig,
    updateSheetConfig,
    syncWithGoogleSheets,
    pullFromGoogleSheets,
    isSyncing,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'sync' | 'code' | 'phone'>('sync');
  const [urlInput, setUrlInput] = useState(sheetConfig.webhookUrl || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Cập nhật lại urlInput khi sheetConfig thay đổi hoặc khi mở modal
  useEffect(() => {
    if (sheetConfig.webhookUrl) {
      setUrlInput(sheetConfig.webhookUrl);
    }
  }, [sheetConfig.webhookUrl, isOpen]);

  if (!isOpen) return null;

  const scriptCode = generateAppsScriptCode();

  // Tải dữ liệu từ Sheet về máy an toàn (Khuyên dùng khi kết nối Sheet đã có sẵn)
  const handlePullData = async () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setFeedback({ text: 'Vui lòng nhập đường dẫn Web App URL của Google Sheets', isError: true });
      return;
    }

    if (cleanUrl.includes('docs.google.com/spreadsheets')) {
      setFeedback({
        text: 'Bạn đang dán link trang tính. Vui lòng chuyển sang tab "Mã Apps Script" để xem hướng dẫn lấy Web App URL (bắt đầu bằng https://script.google.com/...)!',
        isError: true,
      });
      return;
    }

    updateSheetConfig({ webhookUrl: cleanUrl });
    setFeedback({ text: 'Đang kết nối và tải thông tin dâu rể, dữ liệu từ Google Sheets về máy...' });

    const result = await pullFromGoogleSheets(cleanUrl, false, true);
    if (result.success) {
      setFeedback({ text: result.message || 'Tải dữ liệu từ Google Sheet về máy thành công!' });
    } else {
      setFeedback({
        text: result.message || 'Tải thất bại. Vui lòng kiểm tra lại URL và quyền truy cập Web App.',
        isError: true,
      });
    }
  };

  // Đẩy dữ liệu từ máy lên Sheet (Có cảnh báo xác nhận để chống vô tình xóa mất dữ liệu trên Sheet)
  const handlePushData = async () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setFeedback({ text: 'Vui lòng nhập đường dẫn Web App URL của Google Sheets', isError: true });
      return;
    }

    const confirmMsg =
      '⚠️ CẢNH BÁO BẢO VỆ DỮ LIỆU:\n\n' +
      'Thao tác này sẽ GHI ĐÈ toàn bộ dữ liệu hiện có trên Google Sheet bằng dữ liệu trên máy bạn!\n\n' +
      '👉 Nếu bạn muốn giữ lại dữ liệu cũ trên Google Sheet, hãy chọn HỦY (Cancel) và bấm "Tải Dữ Liệu Từ Sheet Về Máy".\n\n' +
      'Bạn có CHẮC CHẮN muốn ghi đè dữ liệu lên Google Sheet không?';

    if (!window.confirm(confirmMsg)) {
      return;
    }

    updateSheetConfig({ webhookUrl: cleanUrl });
    setFeedback({ text: 'Đang ghi đè dữ liệu lên Google Sheets...' });

    const result = await syncWithGoogleSheets(false, true);
    if (result.success) {
      setFeedback({ text: result.message || 'Đồng bộ Google Sheets thành công!' });
    } else {
      setFeedback({ text: result.message || 'Đồng bộ thất bại. Vui lòng kiểm tra lại URL.', isError: true });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setFeedback({ text: '✅ Đã sao chép toàn bộ mã Google Apps Script vào bộ nhớ tạm!' });
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-xl p-4 sm:p-5 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Kết Nối & Đồng Bộ Google Sheet</h2>
              <p className="text-[11px] text-slate-500">
                Tự động đồng bộ 2 chiều: Thông tin dâu rể, Chi tiêu, Khách mời, Kế hoạch
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-3.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'sync'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cài Đặt Kết Nối</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'code'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mã Apps Script</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
              v2.0
            </span>
          </button>

          <button
            onClick={() => setActiveTab('phone')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'phone'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Quét QR ĐT</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl flex items-center gap-2 text-[11px] font-medium mb-3.5 ${
              feedback.isError
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}
          >
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            )}
            <span className="flex-1">{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: CÀI ĐẶT KẾT NỐI & ĐỒNG BỘ */}
        {activeTab === 'sync' && (
          <div className="space-y-3.5 text-xs">
            {/* Status Alert with Current Profile Info */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                sheetConfig.webhookUrl
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {sheetConfig.webhookUrl ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
                    <span>
                      {profile.groomName} & {profile.brideName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({profile.weddingDate})
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {sheetConfig.lastSyncedAt
                      ? `Lần đồng bộ gần nhất: ${sheetConfig.lastSyncedAt}`
                      : sheetConfig.webhookUrl
                      ? 'Đã cấu hình link, sẵn sàng đồng bộ 2 chiều'
                      : 'Chưa kết nối Google Sheet'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                  sheetConfig.webhookUrl
                    ? 'bg-emerald-200/70 text-emerald-800'
                    : 'bg-amber-200/70 text-amber-800'
                }`}
              >
                {sheetConfig.webhookUrl ? 'Đang kết nối' : 'Chưa kết nối'}
              </span>
            </div>

            {/* Web App URL Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">
                  Google Apps Script Web App URL <span className="text-rose-500">*</span>
                </label>
                <button
                  onClick={() => setActiveTab('code')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] inline-flex items-center gap-0.5 hover:underline"
                >
                  <Code2 className="w-3 h-3" />
                  <span>Lấy mã Apps Script</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handlePullData();
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono pr-8"
                />
                {urlInput && (
                  <button
                    onClick={() => setUrlInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Xóa URL"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {urlInput.includes('docs.google.com/spreadsheets') && (
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <b>Lưu ý:</b> Đây là link bảng tính Google Sheet (docs.google.com). Để đồng bộ, bạn cần dùng Web App URL (bắt đầu bằng <code>https://script.google.com/...</code>).
                    <button
                      onClick={() => setActiveTab('code')}
                      className="ml-1 text-emerald-700 font-bold underline"
                    >
                      Bấm vào đây để xem cách lấy link
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 mt-1">
                Dán đường dẫn Web App được cấp sau khi bấm "Triển khai" trong Google Apps Script vào đây.
              </p>
            </div>

            {/* Auto-Sync Toggle Switch */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="pr-2">
                <span className="font-bold text-slate-800 text-xs block">
                  Tự động đồng bộ ngầm khi sửa dữ liệu
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                  Tự động sao lưu lên Google Sheet sau 1.5 giây khi bạn thêm/sửa chi tiêu, khách mời, hợp đồng
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={sheetConfig.autoSync !== false}
                  onChange={e => updateSheetConfig({ autoSync: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* 2-Way Sync Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handlePullData}
                disabled={isSyncing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 text-xs cursor-pointer"
              >
                <Download className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <div className="text-left flex-1">
                  <div className="flex items-center gap-1.5">
                    <span>Tải Dữ Liệu Từ Sheet Về Máy</span>
                    <span className="bg-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full font-normal">
                      Khuyên Dùng
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-100 font-normal">
                    Đồng bộ thông tin cô dâu chú rể, ngày cưới và danh sách từ Google Sheet về máy an toàn
                  </div>
                </div>
              </button>

              <button
                onClick={handlePushData}
                disabled={isSyncing}
                className="w-full bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-slate-700 disabled:opacity-50 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-98 text-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Ghi Đè Dữ Liệu Máy Này Lên Sheet (Yêu cầu xác nhận)</span>
              </button>
            </div>

            {/* Mẹo Khôi Phục Dữ Liệu Bị Mất */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Bị mất dữ liệu trên Google Sheet? Cách khôi phục lại 100%:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900/90 pl-5">
                Mở Google Sheets ➔ Menu <b>Tệp (File)</b> ➔ <b>Lịch sử phiên bản</b> (hoặc phím tắt{' '}
                <code>Ctrl + Alt + Shift + H</code>) ➔ Chọn mốc thời gian trước đó và bấm{' '}
                <b>Khôi phục phiên bản này</b>.
              </p>
            </div>

            {/* Banner chuyển sang tab Mã Code */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Chưa có mã Google Apps Script?
                </span>
                <span className="text-[10px] text-slate-500">
                  Xem toàn bộ mã nguồn và hướng dẫn cài đặt trong 30 giây
                </span>
              </div>
              <button
                onClick={() => setActiveTab('code')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0"
              >
                <span>Xem Mã Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MÃ GOOGLE APPS SCRIPT & HƯỚNG DẪN */}
        {activeTab === 'code' && (
          <div className="space-y-3.5 text-xs">
            {/* Header Action Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span className="font-bold text-sm">Mã Nguồn Google Apps Script v2.0</span>
                </div>
                <p className="text-[11px] text-emerald-100 mt-0.5">
                  Đọc & ghi 2 chiều thời gian thực • Tự động nhận diện Chú Rể & Cô Dâu
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="bg-white hover:bg-emerald-50 text-emerald-800 py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Đã Sao Chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Toàn Bộ Mã</span>
                    </>
                  )}
                </button>
                <a
                  href="https://sheet.new"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-800/80 hover:bg-emerald-800 text-white py-2 px-2.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1 transition"
                  title="Mở Google Sheet mới"
                >
                  <span>sheet.new</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Hướng Dẫn 4 Bước Cực Nhanh */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Hướng Dẫn Cài Đặt Trong 30 Giây:</span>
              </h4>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                <li>
                  Mở một Google Sheet mới (gõ nhanh{' '}
                  <a
                    href="https://sheet.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-bold inline-flex items-center gap-0.5 underline"
                  >
                    sheet.new <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  ).
                </li>
                <li>
                  Trên menu Google Sheet: chọn <b>Tiện ích mở rộng (Extensions)</b> ➔{' '}
                  <b>Apps Script</b>.
                </li>
                <li>
                  Xóa sạch đoạn code mặc định trong file, bấm nút <b>"Sao Chép Toàn Bộ Mã"</b> ở trên rồi dán vào.
                </li>
                <li>
                  Bấm <b>Triển khai (Deploy)</b> ➔ <b>Triển khai mới (New deployment)</b>:
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-slate-500">
                    <li>
                      Loại: <b>Ứng dụng web (Web app)</b>
                    </li>
                    <li>
                      Thực thi dưới dạng: <b>Tôi (Me)</b>
                    </li>
                    <li>
                      Ai có quyền truy cập: <b>Bất kỳ ai (Anyone)</b> (Bắt buộc để đồng bộ được)
                    </li>
                  </ul>
                </li>
                <li>
                  Bấm <b>Triển khai</b>, cấp quyền Google và sao chép <b>Web App URL</b> dán sang tab{' '}
                  <b>"Cài Đặt Kết Nối"</b>!
                </li>
              </ol>
            </div>

            {/* Khung Hiển Thị Mã Code Hoàn Chỉnh (Có thể cuộn và xem trực tiếp) */}
            <div>
              <div className="flex items-center justify-between pb-1.5">
                <span className="font-bold text-slate-700 text-xs">
                  Xem và sao chép mã nguồn Apps Script:
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedScript ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                </button>
              </div>

              <div className="relative group">
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-64 sm:max-h-72 overflow-y-auto leading-relaxed border border-slate-800 shadow-inner select-all">
                  <code>{scriptCode}</code>
                </pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-700 shadow-xs transition"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mẹo Cập Nhật Cho Người Đang Dùng Bản Cũ */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-emerald-900 space-y-1">
              <span className="font-bold text-xs block text-emerald-800">
                💡 Cập nhật lên bản mới (Nếu bạn đã cài script từ trước):
              </span>
              <p className="text-[11px] leading-relaxed text-emerald-900/90">
                Mở Apps Script ➔ Xóa code cũ, dán code mới ➔ Bấm <b>Lưu 💾</b> ➔ Bấm <b>Triển khai</b> ➔{' '}
                <b>Quản lý bản triển khai (Manage deployments)</b> ➔ Bấm biểu tượng <b>Cây bút ✏️ (Chỉnh sửa)</b> ➔{' '}
                Tại mục <b>Phiên bản</b> chọn <b>"Phiên bản mới"</b> ➔ Bấm <b>Triển khai</b> là xong!
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: ĐỒNG BỘ SANG ĐIỆN THOẠI (QUÉT QR) */}
        {activeTab === 'phone' && (
          <div className="space-y-3.5 text-xs">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Đồng Bộ Tức Thì Sang Điện Thoại (Quét 1 Giây Xong Ngay)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Mở app trên điện thoại với đầy đủ tên cô dâu chú rể và tự động kết nối Google Sheet
                  </p>
                </div>
              </div>

              {(() => {
                const sheetParam = sheetConfig.webhookUrl || urlInput.trim();
                let pairUrl = `${window.location.origin}${window.location.pathname}?sheet=${encodeURIComponent(
                  sheetParam
                )}`;
                try {
                  const encodedProfile = encodeURIComponent(
                    btoa(unescape(encodeURIComponent(JSON.stringify(profile))))
                  );
                  pairUrl = `${window.location.origin}${window.location.pathname}?p=${encodedProfile}&sheet=${encodeURIComponent(
                    sheetParam
                  )}`;
                } catch (e) {}

                return (
                  <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
                    <div className="p-2.5 bg-white rounded-2xl border border-emerald-200 shadow-xs shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          pairUrl
                        )}&color=059669`}
                        alt="QR Đồng Bộ Điện Thoại"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                      <div className="bg-white/80 border border-emerald-200/60 p-2.5 rounded-xl text-[11px] text-emerald-900 leading-relaxed font-medium">
                        👉 Dùng Camera điện thoại hoặc Zalo quét mã QR này, điện thoại sẽ tự động mở ứng dụng, nhận ngay thông tin cặp đôi <b>{profile.groomName} & {profile.brideName}</b> và đồng bộ dữ liệu từ Sheet trong 1 giây!
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pairUrl);
                          setFeedback({
                            text: '✅ Đã sao chép link đồng bộ! Hãy gửi link này qua Zalo để mở trên điện thoại.',
                          });
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao Chép Link Đồng Bộ Gửi Zalo</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
