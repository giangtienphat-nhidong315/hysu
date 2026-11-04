import React, { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { WeddingProvider, useWedding } from './context/WeddingContext';
import { ToastProvider } from './context/ToastContext';
import { HeaderCountdown } from './components/HeaderCountdown';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ExpenseView } from './components/ExpenseView';
import { TaskView } from './components/TaskView';
import { GuestView } from './components/GuestView';
import { ScheduleView } from './components/ScheduleView';
import { ProfileModal } from './components/ProfileModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { ShareModal } from './components/ShareModal';
import { GuestCheckInPage } from './components/GuestCheckInPage';

const WeddingAppContent: React.FC = () => {
  const { sheetConfig } = useWedding();

  // Kiểm tra nếu đang ở chế độ khách tự điểm danh (Self Check-in Form)
  // Hỗ trợ cả query param ?mode=checkin và hash #checkin
  const searchParams = new URLSearchParams(window.location.search);
  const isGuestMode =
    searchParams.get('mode') === 'checkin' ||
    window.location.hash.includes('checkin') ||
    window.location.href.includes('mode=checkin');

  if (isGuestMode) {
    return <GuestCheckInPage />;
  }

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showSyncBanner, setShowSyncBanner] = useState(() => {
    return !localStorage.getItem('hide_sync_banner_v1');
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [guestSubTab, setGuestSubTab] = useState<'invitations' | 'attendance'>('invitations');
  const [scheduleSubTab, setScheduleSubTab] = useState<'schedule' | 'contracts' | 'vendors' | 'music' | 'settings'>('schedule');

  // Desktop Responsive Mode toggle
  const [isWideScreenMode, setIsWideScreenMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('wedding_wide_mode');
    return saved !== null ? saved === 'true' : window.innerWidth >= 768;
  });

  const toggleWideScreenMode = () => {
    setIsWideScreenMode(prev => {
      const next = !prev;
      localStorage.setItem('wedding_wide_mode', String(next));
      return next;
    });
  };

  // Modals for each tab triggered from dashboard or actions
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);

  return (
    <div className={`transition-all duration-300 w-full ${isWideScreenMode ? 'max-w-4xl shadow-2xl rounded-3xl my-0 md:my-4 border border-slate-200/80' : 'max-w-[480px] shadow-xl'} mx-auto min-h-screen bg-white flex flex-col relative`}>
      {/* Top Header with Bride/Groom Name & Live Countdown */}
      <HeaderCountdown
        onOpenEditProfile={() => setIsProfileModalOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        isWideScreen={isWideScreenMode}
        onToggleWideScreen={toggleWideScreenMode}
      />

      {/* Sync Helper Banner when Google Sheets is not yet connected */}
      {!sheetConfig.webhookUrl && showSyncBanner && (
        <div className="mx-3 mt-2 mb-1 p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-medium truncate">
              Đồng bộ dữ liệu giữa Máy tính & Điện thoại?
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-xl text-[10px] shadow-2xs transition active:scale-95 cursor-pointer"
            >
              Đồng bộ ngay
            </button>
            <button
              onClick={() => {
                setShowSyncBanner(false);
                localStorage.setItem('hide_sync_banner_v1', 'true');
              }}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Body Content based on Active Tab */}
      <main className="flex-1 mt-3">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenAddExpense={() => {
              setActiveTab('expenses');
              setIsAddExpenseOpen(true);
            }}
            onOpenAddTask={() => {
              setActiveTab('tasks');
              setIsAddTaskOpen(true);
            }}
            onOpenAddGuest={() => {
              setGuestSubTab('invitations');
              setActiveTab('guests');
              setIsAddGuestOpen(true);
            }}
            onOpenGoogleSheets={() => setIsGoogleSheetModalOpen(true)}
            onOpenAttendance={() => {
              setGuestSubTab('attendance');
              setActiveTab('guests');
            }}
            onOpenContracts={() => {
              setScheduleSubTab('contracts');
              setActiveTab('schedule');
            }}
            onOpenMusic={() => {
              setScheduleSubTab('music');
              setActiveTab('schedule');
            }}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseView
            isAddModalOpen={isAddExpenseOpen}
            setIsAddModalOpen={setIsAddExpenseOpen}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskView
            isAddModalOpen={isAddTaskOpen}
            setIsAddModalOpen={setIsAddTaskOpen}
          />
        )}

        {activeTab === 'guests' && (
          <GuestView
            isAddModalOpen={isAddGuestOpen}
            setIsAddModalOpen={setIsAddGuestOpen}
            defaultSubTab={guestSubTab}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            defaultSubTab={scheduleSubTab}
            onOpenGoogleSheets={() => setIsGoogleSheetModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        isWide={isWideScreenMode}
        setActiveTab={tab => {
          if (tab === 'guests') setGuestSubTab('invitations');
          if (tab === 'schedule') setScheduleSubTab('schedule');
          setActiveTab(tab);
        }}
      />

      {/* Profile & Wedding Info Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Google Sheets Sync Modal */}
      <GoogleSheetModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
      />

      {/* Share App Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onOpenGoogleSheet={() => setIsGoogleSheetModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <WeddingProvider>
        <WeddingAppContent />
      </WeddingProvider>
    </ToastProvider>
  );
}
