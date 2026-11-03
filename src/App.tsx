import React, { useState } from 'react';
import { WeddingProvider } from './context/WeddingContext';
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

const WeddingAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [guestSubTab, setGuestSubTab] = useState<'invitations' | 'attendance'>('invitations');
  const [scheduleSubTab, setScheduleSubTab] = useState<'schedule' | 'contracts' | 'vendors' | 'settings'>('schedule');

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
      />
    </div>
  );
};

export default function App() {
  return (
    <WeddingProvider>
      <WeddingAppContent />
    </WeddingProvider>
  );
}
