import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LAYOUT_AREA_SIZE,
  layoutAreaSizeOptions,
  type LayoutAreaHeight,
  type LayoutAreaSize,
} from '@/builders/layout/layout-area-size-options';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentLayoutProps {
  navigation: ReactNode;
  content: ReactNode;
  navigationSize?: LayoutAreaSize;
  navigationMinSize?: LayoutAreaSize;
  navigationMaxSize?: LayoutAreaSize;
  navigationHeight?: LayoutAreaHeight;
  contentHeight?: LayoutAreaHeight;
  navigationResizable?: boolean;
  className?: string;
}

export function ContentLayout({
  navigation,
  content,
  navigationSize = DEFAULT_LAYOUT_AREA_SIZE,
  navigationMinSize = 'sm',
  navigationMaxSize = 'xl',
  navigationHeight = 'fit',
  contentHeight = 'fit',
  navigationResizable = false,
  className,
}: ContentLayoutProps) {
  const [customNavigationWidth, setCustomNavigationWidth] = useState<
    number | null
  >(null);
  const [isResizingNavigation, setIsResizingNavigation] = useState(false);
  const navigationAreaRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{
    clientX: number;
    widthRem: number;
    rootFontSize: number;
  } | null>(null);
  const navigationSizeOption = layoutAreaSizeOptions.find(
    (option) => option.value === navigationSize,
  );
  const navigationAreaClassName = customNavigationWidth
    ? 'lg:w-[var(--content-layout-navigation-width)]'
    : (navigationSizeOption?.className ?? 'lg:w-64');
  const minWidthRem =
    layoutAreaSizeOptions.find((option) => option.value === navigationMinSize)
      ?.widthRem ?? 14;
  const maxWidthRem =
    layoutAreaSizeOptions.find((option) => option.value === navigationMaxSize)
      ?.widthRem ?? 24;

  useEffect(() => {
    setCustomNavigationWidth(null);
  }, [
    navigationMaxSize,
    navigationMinSize,
    navigationResizable,
    navigationSize,
  ]);

  const handleResizePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!navigationResizable || !navigationAreaRef.current) return;

    event.preventDefault();
    const rootFontSize =
      Number.parseFloat(
        window.getComputedStyle(document.documentElement).fontSize,
      ) || 16;
    const widthRem =
      navigationAreaRef.current.getBoundingClientRect().width / rootFontSize;

    resizeStartRef.current = {
      clientX: event.clientX,
      widthRem,
      rootFontSize,
    };
    setIsResizingNavigation(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleResizePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isResizingNavigation || !resizeStartRef.current) return;

    const { clientX, rootFontSize, widthRem } = resizeStartRef.current;
    const nextWidthRem = Math.min(
      maxWidthRem,
      Math.max(
        minWidthRem,
        widthRem + (event.clientX - clientX) / rootFontSize,
      ),
    );

    setCustomNavigationWidth(Number(nextWidthRem.toFixed(2)));
  };

  const handleResizePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    resizeStartRef.current = null;
    setIsResizingNavigation(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-5 lg:flex-row',
        contentHeight === 'fill' && 'h-full',
        className,
      )}
    >
      <div
        ref={navigationAreaRef}
        className={cn(
          'relative min-h-0 w-full shrink-0',
          navigationHeight === 'fill' && 'lg:h-full',
          navigationAreaClassName,
        )}
        style={
          customNavigationWidth
            ? ({
                '--content-layout-navigation-width': `${customNavigationWidth}rem`,
              } as CSSProperties)
            : undefined
        }
      >
        {navigation}
        {navigationResizable && (
          <button
            type="button"
            aria-label="Thay đổi kích thước vùng điều hướng"
            className="absolute inset-y-0 -end-2 z-10 hidden w-4 touch-none cursor-col-resize lg:block"
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />
        )}
      </div>

      {contentHeight === 'fill' ? (
        <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden pe-2">
          {content}
        </div>
      ) : (
        <ScrollArea className="min-h-0 min-w-0 flex-1">
          <div className="min-w-0 pb-2 pe-2">{content}</div>
        </ScrollArea>
      )}
    </div>
  );
}
