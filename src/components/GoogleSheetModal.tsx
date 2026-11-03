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
} from 'lucide-react';
import { useWedding } from '../context/WeddingContext';
import { generateAppsScriptCode } from '../services/googleSheets';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ isOpen, onClose }) => {
  const { sheetConfig, updateSheetConfig, syncWithGoogleSheets, pullFromGoogleSheets, isSyncing } = useWedding();

  const [urlInput, setUrlInput] = useState(sheetConfig.webhookUrl || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndSync = async () => {
    if (!urlInput.trim()) {
      setFeedback({ text: 'Vui lòng nhập đường dẫn Web App URL của Google Sheets', isError: true });
      return;
    }

    updateSheetConfig({ webhookUrl: urlInput.trim() });
    setFeedback({ text: 'Đang kết nối và đồng bộ lên Google Sheets...' });

    const result = await syncWithGoogleSheets();
    if (result.success) {
      setFeedback({ text: result.message || 'Đồng bộ Google Sheets thành công!' });
    } else {
      setFeedback({ text: result.message || 'Đồng bộ thất bại. Vui lòng kiểm tra lại URL.', isError: true });
    }
  };

  const handlePullData = async () => {
    if (!urlInput.trim()) {
      setFeedback({ text: 'Vui lòng nhập đường dẫn Web App URL của Google Sheets', isError: true });
      return;
    }

    updateSheetConfig({ webhookUrl: urlInput.trim() });
    setFeedback({ text: 'Đang tải dữ liệu từ Google Sheets về máy này...' });

    const result = await pullFromGoogleSheets(urlInput.trim(), false);
    if (result.success) {
      setFeedback({ text: result.message || 'Tải dữ liệu thành công!' });
    } else {
      setFeedback({ text: result.message || 'Tải thất bại. Vui lòng kiểm tra lại mã script và URL.', isError: true });
    }
  };

  const handleCopyCode = () => {
    const code = generateAppsScriptCode();
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150 shadow-2xl">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleSaveAndSync}
              disabled={isSyncing}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang gửi...' : 'Đẩy Lên Google Sheet (Gửi đi)'}</span>
            </button>

            <button
              onClick={handlePullData}
              disabled={isSyncing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 text-xs"
            >
              <Download className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang tải...' : 'Kéo Từ Sheet Về Máy Này'}</span>
            </button>
          </div>

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
                      <li>Ai có quyền truy cập: <b>Bất kỳ ai (Anyone)</b></li>
                    </ul>
                  </li>
                  <li>
                    Bấm <b>Triển khai (Deploy)</b>, cấp quyền và copy link <b>Web App URL</b> dán vào ô trên!
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
