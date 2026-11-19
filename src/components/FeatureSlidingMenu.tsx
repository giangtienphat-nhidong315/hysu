import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, X } from 'lucide-react';

export interface FeatureMenuItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  description?: string;
  highlight?: boolean;
}

interface FeatureSlidingMenuProps {
  items: FeatureMenuItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
  showAllDrawer?: boolean;
}

export const FeatureSlidingMenu: React.FC<FeatureSlidingMenuProps> = ({
  items,
  activeId,
  onSelect,
  className = '',
  showAllDrawer = true,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);

  // Kiểm tra vị trí cuộn để hiện/ẩn nút điều hướng & hiệu ứng mờ 2 cạnh
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [items]);

  // Tự động cuộn con trượt đưa tính năng đang chọn ra chính giữa màn hình
  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      setTimeout(updateScrollState, 350);
    }
  }, [activeId]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 220;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
    setTimeout(updateScrollState, 250);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Khung chứa Menu Trượt */}
      <div className="relative flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Nút bấm trượt sang trái khi danh sách dài */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-1 z-20 w-7 h-7 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-rose-600 transition active:scale-95 cursor-pointer"
            title="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Hiệu ứng mờ cạnh trái khi có nội dung cuộn */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 via-slate-100/80 to-transparent pointer-events-none rounded-l-2xl z-10 transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Danh sách các nút menu trượt ngang */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-0.5"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map(item => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                ref={isActive ? activeBtnRef : null}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm shadow-rose-500/25 font-black scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'scale-110 text-white' : 'text-slate-500'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hiệu ứng mờ cạnh phải khi còn nội dung cuộn */}
        <div
          className={`absolute right-10 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 via-slate-100/80 to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Nút bấm trượt sang phải khi danh sách dài */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-11 z-20 w-7 h-7 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-rose-600 transition active:scale-95 cursor-pointer"
            title="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Nút mở toàn bộ tính năng dạng Lưới (Grid Overview) - giải quyết triệt để khi có nhiều tính năng */}
        {showAllDrawer && (
          <div className="pl-1 border-l border-slate-200/80 shrink-0 relative z-20">
            <button
              type="button"
              onClick={() => setIsGridOpen(true)}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 transition active:scale-95 shadow-2xs flex items-center justify-center cursor-pointer"
              title="Xem tất cả tính năng trong danh mục"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* MODAL MỞ TẤT CẢ TÍNH NĂNG (FEATURE DRAWER GRID) */}
      {isGridOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Tất Cả Tiện Ích & Tính Năng</h3>
                  <p className="text-[11px] text-slate-500">
                    Chọn nhanh bất kỳ phân mục nào bạn muốn truy cập ({items.length} tính năng)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGridOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lưới các tính năng */}
            <div className="grid grid-cols-2 gap-2.5 overflow-y-auto no-scrollbar py-1">
              {items.map(item => {
                const Icon = item.icon;
                const isActive = activeId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.id);
                      setIsGridOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 active:scale-95 ${
                      isActive
                        ? 'border-rose-500 bg-rose-50/80 text-rose-950 ring-2 ring-rose-400/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`p-2 rounded-xl transition ${
                          isActive ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                      {item.description && (
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 line-clamp-2">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center shrink-0">
              <button
                type="button"
                onClick={() => setIsGridOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Đóng Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
