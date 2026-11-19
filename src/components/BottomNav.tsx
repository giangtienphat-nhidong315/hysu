import React from 'react';
import { Home, Wallet, CheckSquare, Users, CalendarClock } from 'lucide-react';
import { useWedding } from '../context/WeddingContext';

export type TabType = 'dashboard' | 'expenses' | 'tasks' | 'guests' | 'schedule';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isWide?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isWide = false }) => {
  const { tasks, guests } = useWedding();

  const pendingTasks = tasks.filter(t => !t.isCompleted).length;
  const guestCount = guests.length;

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'expenses', label: 'Chi tiêu', icon: Wallet },
    { id: 'tasks', label: 'Kế hoạch', icon: CheckSquare, badge: pendingTasks > 0 ? pendingTasks : undefined },
    { id: 'guests', label: 'Khách mời', icon: Users, badge: guestCount > 0 ? guestCount : undefined },
    { id: 'schedule', label: 'Lịch trình', icon: CalendarClock },
  ];

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <div className={`w-full ${isWide ? 'max-w-4xl' : 'max-w-[480px]'} transition-all duration-300 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-1.5 pointer-events-auto safe-area-bottom relative`}>
        {/* HIỆU ỨNG CON TRƯỢT MENU THÔNG MINH (ANIMATED SLIDING PILL) */}
        <div
          className="absolute top-1.5 bottom-1.5 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] px-1"
          style={{
            left: `${(activeIndex >= 0 ? activeIndex : 0) * 20}%`,
            width: '20%',
          }}
        >
          <div className="w-full h-full bg-gradient-to-b from-rose-50 to-pink-50/80 border border-rose-200/90 rounded-2xl shadow-xs" />
        </div>

        <div className="flex items-center justify-around relative z-10">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-rose-600 font-bold -translate-y-0.5'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'scale-110 text-rose-600 drop-shadow-xs' : 'text-slate-400'
                    }`}
                  />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs animate-pulse">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] mt-1 tracking-tight transition-all duration-200 ${isActive ? 'font-bold text-rose-600 scale-105' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 bg-rose-600 rounded-full mt-0.5 shadow-xs animate-in zoom-in-50 duration-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
