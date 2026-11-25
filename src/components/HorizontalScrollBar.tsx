import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Minimize2 } from 'lucide-react';

interface HorizontalScrollBarProps {
  children: React.ReactNode;
  className?: string;
  showWrapToggle?: boolean;
  defaultWrapped?: boolean;
  itemCount?: number;
}

export const HorizontalScrollBar: React.FC<HorizontalScrollBarProps> = ({
  children,
  className = '',
  showWrapToggle = true,
  defaultWrapped = false,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isWrapped, setIsWrapped] = useState(defaultWrapped);

  // Trạng thái kéo chuột trượt ngang (Drag to scroll trên máy tính)
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isWrapped) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, [isWrapped]);

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => updateScrollButtons());
      ro.observe(el);
    }
    window.addEventListener('resize', updateScrollButtons);
    const timer = setTimeout(updateScrollButtons, 150);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateScrollButtons);
      clearTimeout(timer);
    };
  }, [children, isWrapped, updateScrollButtons]);

  const handleSlide = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(200, Math.round(el.clientWidth * 0.65));
    el.scrollBy({
      left: dir === 'left' ? -step : step,
      behavior: 'smooth',
    });
    setTimeout(updateScrollButtons, 280);
  };

  // Lăn chuột dọc trên thanh danh mục sẽ tự động trượt ngang
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || isWrapped) return;
    if (el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      updateScrollButtons();
    }
  };

  // Giữ chuột trái kéo trượt ngang mượt mà trên PC
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || isWrapped) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || isWrapped) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
      el.scrollLeft = scrollLeftStartRef.current - walk * 1.2;
      updateScrollButtons();
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  if (isWrapped) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {children}
          {showWrapToggle && (
            <button
              type="button"
              onClick={() => setIsWrapped(false)}
              className="px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-slate-800 text-white hover:bg-slate-900 transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
              title="Chuyển về thanh trượt ngang 1 dòng"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Thu về thanh trượt</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center gap-1 w-full ${className}`}>
      {/* Nút bấm trượt sang trái */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleSlide('left')}
          className="shrink-0 z-20 w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300 shadow-sm flex items-center justify-center transition active:scale-90 cursor-pointer"
          title="Trượt sang trái để xem danh mục trước"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Vùng trượt ngang hỗ trợ kéo chuột, lăn chuột và vuốt cảm ứng */}
      <div className="relative flex-1 min-w-0 overflow-hidden">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-1 w-5 bg-gradient-to-r from-slate-100/90 to-transparent pointer-events-none z-10" />
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleClickCapture}
          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
          }}
        >
          {children}
        </div>

        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-slate-100/90 to-transparent pointer-events-none z-10" />
        )}
      </div>

      {/* Nút bấm trượt sang phải */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleSlide('right')}
          className="shrink-0 z-20 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 shadow-sm flex items-center justify-center transition active:scale-90 cursor-pointer animate-pulse"
          title="Trượt sang phải để xem tiếp các danh mục bị ẩn"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Nút bung tất cả danh mục ra nhiều dòng để nhìn thấy hết 100% */}
      {showWrapToggle && (canScrollLeft || canScrollRight) && (
        <button
          type="button"
          onClick={() => setIsWrapped(true)}
          className="shrink-0 z-20 px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
          title="Mở xem tất cả danh mục cùng lúc không cần trượt"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Hiện hết</span>
        </button>
      )}
    </div>
  );
};
