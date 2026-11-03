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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className={`w-full ${isWide ? 'max-w-4xl' : 'max-w-[480px]'} transition-all duration-300 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl flex items-center justify-around py-2 px-1 pointer-events-auto safe-area-bottom`}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-rose-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-rose-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
