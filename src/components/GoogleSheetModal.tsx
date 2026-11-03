import React, { useState } from 'react';
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
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { generateAppsScriptCode } from '../services/googleSheets';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ isOpen, onClose }) => {
  const { profile, sheetConfig, updateSheetConfig, syncWithGoogleSheets, pullFromGoogleSheets, isSyncing } = useWedding();

  const [urlInput, setUrlInput] = useState(sheetConfig.webhookUrl || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  // Tải dữ liệu từ Sheet về máy an toàn (Khuyên dùng khi kết nối Sheet đã có sẵn)
  const handlePullData = async () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setFeedback({ text: 'Vui lòng nhập đường dẫn Web App URL của Google Sheets', isError: true });
      return;
    }

    updateSheetConfig({ webhookUrl: cleanUrl });
    setFeedback({ text: 'Đang kết nối và tải dữ liệu từ Google Sheets về máy...' });

    const result = await pullFromGoogleSheets(cleanUrl, false, true);
    if (result.success) {
      setFeedback({ text: result.message || 'Tải dữ liệu từ Google Sheet về máy thành công!' });
    } else {
      setFeedback({ text: result.message || 'Tải thất bại. Vui lòng kiểm tra lại URL và quyền truy cập Web App.', isError: true });
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
    const code = generateAppsScriptCode();
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg p-4 sm:p-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Kết Nối & Đồng Bộ Google Sheet</h2>
              <p className="text-[11px] text-slate-500">Tự động sao lưu Chi tiêu, Khách mời & Kế hoạch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Status Alert */}
          {sheetConfig.lastSyncedAt && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px]">
                  Lần đồng bộ gần nhất: <b>{sheetConfig.lastSyncedAt}</b>
                </span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-200/60 px-2 py-0.5 rounded-md">
                Đã kết nối
              </span>
            </div>
          )}

          {feedback && (
            <div
              className={`p-3 rounded-2xl flex items-center gap-2 text-[11px] font-medium ${
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
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Web App URL Input */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Google Apps Script Web App URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Dán đường dẫn Web App được cấp từ Google Sheets Apps Script vào đây.
            </p>
          </div>

          {/* Auto-Sync Toggle Switch */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="pr-2">
              <span className="font-bold text-slate-800 text-xs block">
                Tự động đồng bộ khi thay đổi dữ liệu
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">
                Tự động sao lưu ngầm lên Google Sheet sau 2 giây khi bạn thêm/sửa chi tiêu, khách mời, hợp đồng
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
                  <span className="bg-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full font-normal">Khuyên Dùng</span>
                </div>
                <div className="text-[10px] text-emerald-100 font-normal">
                  Kéo dữ liệu đã có trên Google Sheet về máy này an toàn, không sợ bị mất dữ liệu
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
              Mở trang Google Sheets ➔ Bấm menu <b>Tệp (File)</b> ➔ <b>Lịch sử phiên bản (Version history)</b> ➔ <b>Xem lịch sử phiên bản</b> (hoặc nhấn phím tắt <code>Ctrl + Alt + Shift + H</code>) ➔ Chọn mốc thời gian trước thời điểm bị xóa và bấm <b>Khôi phục phiên bản này</b>.
            </p>
          </div>

          {/* Đồng Bộ Tức Thì Sang Điện Thoại (Quét QR 1 chạm) */}
          {sheetConfig.webhookUrl && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Đồng Bộ Sang Điện Thoại (Quét 1 Giây Xong Ngay)
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Chuyển toàn bộ dữ liệu & tự động kết nối Google Sheet trên điện thoại
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                {(() => {
                  let pairUrl = `${window.location.origin}${window.location.pathname}?sheet=${encodeURIComponent(sheetConfig.webhookUrl)}`;
                  try {
                    const encodedProfile = encodeURIComponent(
                      btoa(unescape(encodeURIComponent(JSON.stringify(profile))))
                    );
                    pairUrl = `${window.location.origin}${window.location.pathname}?p=${encodedProfile}&sheet=${encodeURIComponent(sheetConfig.webhookUrl)}`;
                  } catch (e) {}

                  return (
                    <>
                      <div className="p-2 bg-white rounded-2xl border border-emerald-200 shadow-2xs shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                            pairUrl
                          )}&color=059669`}
                          alt="QR Đồng Bộ Điện Thoại"
                          className="w-28 h-28 object-contain"
                        />
                      </div>
                      <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                        <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                          👉 Dùng Camera điện thoại quét mã QR này, điện thoại sẽ tự động mở app, cập nhật ngay tên cô dâu chú rể, ngày cưới và đồng bộ toàn bộ dữ liệu từ Google Sheet về máy trong 1 giây!
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pairUrl);
                            setFeedback({ text: '✅ Đã sao chép link đồng bộ! Hãy gửi link này qua Zalo để mở trên điện thoại.' });
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao Chép Link Đồng Bộ Gửi Zalo</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 1-Click Copy Code & Guide Toggle */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Mã nguồn đồng bộ Google Apps Script</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã Sao Chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Code</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'Ẩn hướng dẫn cài đặt' : 'Xem hướng dẫn cài đặt trong 30 giây'}</span>
            </button>

            {showGuide && (
              <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-2 leading-relaxed">
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>
                    Mở một trang Google Sheet mới (bấm vào nút{' '}
                    <a
                      href="https://sheet.new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 font-bold inline-flex items-center gap-0.5 hover:underline"
                    >
                      sheet.new <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    ).
                  </li>
                  <li>
                    Trên thanh menu của Google Sheet, bấm <b>Tiện ích mở rộng (Extensions)</b> ➡️{' '}
                    <b>Apps Script</b>.
                  </li>
                  <li>
                    Xóa sạch code mặc định trong file, bấm nút <b>"Sao Chép Code"</b> ở trên rồi dán vào.
                  </li>
                  <li>
                    Bấm <b>Triển khai (Deploy)</b> ➡️ <b>Triển khai mới (New deployment)</b>:
                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-slate-500">
                      <li>Loại: <b>Ứng dụng web (Web app)</b></li>
                      <li>Thực thi dưới dạng: <b>Tôi (Me)</b></li>
                      <li>Ai có quyền truy cập: <b>Bất kỳ ai (Anyone)</b> (Bắt buộc để điện thoại đồng bộ được)</li>
                    </ul>
                  </li>
                  <li>
                    Bấm <b>Triển khai (Deploy)</b>, cấp quyền và copy link <b>Web App URL</b> dán vào ô trên!
                  </li>
                  <li className="pt-1 text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    💡 <b>Nếu bạn đã cài đặt từ trước (Cập nhật lên bản đồng bộ 2 chiều):</b>
                    <p className="font-normal text-slate-700 mt-0.5">
                      Mở Apps Script trên Google Sheet ➔ Xóa hết code cũ, dán mã mới vừa sao chép ➔ Bấm <b>Lưu 💾</b> ➔ Bấm <b>Triển khai</b> ➔ <b>Quản lý bản triển khai (Manage deployments)</b> ➔ Bấm biểu tượng <b>Cây bút ✏️ (Chỉnh sửa)</b> ➔ Tại mục <b>Phiên bản (Version)</b> chọn <b>"Phiên bản mới"</b> ➔ Bấm <b>Triển khai</b> là xong!
                    </p>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
