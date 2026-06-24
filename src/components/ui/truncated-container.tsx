import {
  Children,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type RenderTruncator<T = unknown> = (
  hiddenChildren: ReactNode[],
  hiddenItems?: T[],
) => ReactNode;

interface TruncatedContainerProps<T = unknown> {
  children: ReactNode;
  items?: T[];
  renderTruncator?: RenderTruncator<T>;
  gap?: number;
  className?: string;
}

export function TruncatedContainer<T = unknown>({
  children,
  items,
  renderTruncator,
  gap = 8,
  className,
}: TruncatedContainerProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef<Array<HTMLElement | null>>([]);
  const truncatorRef = useRef<HTMLElement | null>(null);
  const childArray = useMemo(() => Children.toArray(children), [children]);
  const [visibleCount, setVisibleCount] = useState(childArray.length);

  const compute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const widths = childArray.map(
      (_, index) => measureRefs.current[index]?.offsetWidth ?? 0,
    );
    const truncatorWidth = truncatorRef.current?.offsetWidth ?? 0;

    let used = 0;
    let fit = 0;
    for (let index = 0; index < widths.length; index += 1) {
      const itemWidth = widths[index];
      const needed = (fit > 0 ? gap : 0) + itemWidth;
      const remaining = widths.length - (fit + 1);
      const totalNeeded =
        used + needed + (remaining > 0 ? gap + truncatorWidth : 0);

      if (totalNeeded <= containerWidth) {
        used += needed;
        fit += 1;
      } else {
        break;
      }
    }

    setVisibleCount(Math.max(0, fit));
  }, [childArray, gap]);

  useLayoutEffect(() => {
    compute();

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(compute);
    observer.observe(container);
    window.addEventListener('resize', compute);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [compute]);

  const hiddenChildren = childArray.slice(visibleCount);
  const hiddenItems = items ? items.slice(visibleCount) : undefined;

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        style={{
          display: 'flex',
          gap,
          alignItems: 'center',
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {childArray.slice(0, visibleCount)}

        {hiddenChildren.length > 0 && (
          <span data-truncator>
            {renderTruncator
              ? renderTruncator(hiddenChildren, hiddenItems)
              : `+${hiddenChildren.length}`}
          </span>
        )}
      </div>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          visibility: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {childArray.map((child, index) => (
          <span
            key={index}
            ref={(element) => {
              measureRefs.current[index] = element;
            }}
            style={{
              display: 'inline-block',
              marginRight: index === childArray.length - 1 ? 0 : gap,
            }}
          >
            {child}
          </span>
        ))}

        <span
          ref={(element) => {
            truncatorRef.current = element;
          }}
          style={{ display: 'inline-block' }}
        >
          {renderTruncator
            ? renderTruncator(
                childArray.slice(-1),
                items ? items.slice(-1) : undefined,
              )
            : `+${childArray.length}`}
        </span>
      </div>
    </>
  );
}
