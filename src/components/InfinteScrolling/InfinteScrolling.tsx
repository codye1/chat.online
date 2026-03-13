import clsx from "clsx";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const rootRef = useRef<HTMLDivElement | null>(null); // for imperative DOM ops
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null); // for useInView
  const prevListIdRef = useRef(listId);

  const { ref: sentinelRef, inView } = useInView({
    root: rootEl,
    rootMargin,
  });

  // Callback ref — updates both ref and state
  const setRoot = (el: HTMLDivElement | null) => {
    rootRef.current = el;
    setRootEl(el);
  };

  useEffect(() => {
    if (inView && hasMore) {
      onBottomReached();
    }
  }, [inView, hasMore, onBottomReached]);

  useEffect(() => {
    // ✅ use ref for imperative scroll, not state
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
    <div ref={setRoot} onScroll={onScroll} className={clsx(className)}>
      {children}
      {items.map((item, index) => renderItem(item, index))}
      {hasMore && !dontShowSentinel && <div ref={sentinelRef} />}
    </div>
  );
};

export default InfiniteScrolling;
