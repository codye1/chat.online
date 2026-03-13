import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";

const scrollPositions: Record<string, number> = {};
let savingScrollPositionTimeout: number;

interface IInfiniteScrolling<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onBottomReached: () => void;
  hasMore: boolean;
  dontShowSentinel?: boolean;
  listId: string;
  rootMargin?: string;
  className?: string;
  children?: ReactNode;
}

const InfiniteScrolling = <T,>({
  items,
  renderItem,
  onBottomReached,
  hasMore,
  listId,
  rootMargin = "0px 0px 300px 0px",
  className,
  dontShowSentinel,
  children,
}: IInfiniteScrolling<T>) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const prevListIdRef = useRef(listId);

  const { ref: sentinelRef, inView } = useInView({
    // eslint-disable-next-line react-hooks/refs
    root: rootRef.current,
    rootMargin,
  });

  useEffect(() => {
    if (inView && hasMore) {
      onBottomReached();
    }
  }, [inView, hasMore, onBottomReached]);

  useEffect(() => {
    if (rootRef.current && prevListIdRef.current !== listId) {
      rootRef.current.scrollTop = scrollPositions[listId] ?? 0;
      prevListIdRef.current = listId;
    }
  }, [listId]);

  const onScroll = () => {
    clearTimeout(savingScrollPositionTimeout);
    savingScrollPositionTimeout = setTimeout(() => {
      if (rootRef.current) {
        scrollPositions[listId] = rootRef.current.scrollTop;
      }
    }, 100);
  };

  return (
    <div ref={rootRef} onScroll={onScroll} className={clsx(className)}>
      {children}
      {items.map((item, index) => renderItem(item, index))}
      {hasMore && !dontShowSentinel && <div ref={sentinelRef} />}
    </div>
  );
};

export default InfiniteScrolling;
