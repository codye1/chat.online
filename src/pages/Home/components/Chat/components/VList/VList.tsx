import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./VList.module.css";
import type { Message as MessageType } from "@utils/types";
import { useInView } from "react-intersection-observer";
import {
  useVirtualizer,
  Virtualizer,
  type VirtualItem,
} from "@tanstack/react-virtual";
import ScrollToBottom from "../ScrollToBottom/ScrollToBottom";
import checkIfNearBottom from "@utils/checkIfNearBottom";
import clsx from "clsx";

interface IVList {
  items: MessageType[];
  anchor?: string;
  itemsFetching: boolean;
  unseenItemsCount: number;
  hasMoreUp: boolean;
  hasMoreDown: boolean;
  attachToBottom: boolean;
  listId: string;
  listStyles: string;
  topSentinel?: ReactNode;
  bottomSentinel?: ReactNode;
  onBottomReached: () => void;
  onTopReached: () => void;
  onJumpToLatest?: () => void;
  renderItem: (
    item: VirtualItem,
    items: MessageType[],
    virtualizer: Virtualizer<HTMLDivElement, Element>,
  ) => React.ReactNode;
}

const VList = ({
  items,
  itemsFetching,
  listId,
  hasMoreUp,
  hasMoreDown,
  attachToBottom,
  anchor,
  unseenItemsCount,
  bottomSentinel,
  topSentinel,
  renderItem,
  onBottomReached,
  onTopReached,
  onJumpToLatest,
  listStyles,
}: IVList) => {
  const vlistRef = useRef<HTMLDivElement | null>(null);
  const prevIdRef = useRef("");
  const prevCountRef = useRef(0);
  const prevTotalSizeRef = useRef(0);
  const prevConversationIdRef = useRef(listId);
  const scrollPositionsRef = useRef<Map<string, { offset: number }>>(new Map());
  const canAttachToBottomRef = useRef(false);

  const [itemsBuffer, setItemsBuffer] = useState(items || []);

  const beforeInView = useInView({
    root: vlistRef.current,
    rootMargin: "300px 0px 0px 0px",
  });
  const afterInView = useInView({
    root: vlistRef.current,
    rootMargin: "0px 0px 300px 0px",
  });

  const virtualizer = useVirtualizer({
    count: itemsBuffer?.length || 0,
    getScrollElement: () => vlistRef.current,
    estimateSize: () => 60,
    overscan: 5,
    getItemKey: useCallback(
      (index: number) => itemsBuffer?.[index]?.id || index,
      [itemsBuffer],
    ),
  });

  // handle items change and conversation switch
  useEffect(() => {
    if (items) {
      if (prevConversationIdRef.current !== listId) {
        scrollPositionsRef.current.set(prevConversationIdRef.current, {
          offset: virtualizer.scrollOffset || 0,
        });
        prevConversationIdRef.current = listId;
      }
      canAttachToBottomRef.current = checkIfNearBottom(vlistRef.current!);
      setItemsBuffer(items);
    }
  }, [items, listId, virtualizer.scrollOffset]);

  // Reset refs when conversation changes
  useLayoutEffect(() => {
    if (prevConversationIdRef.current !== listId) {
      prevIdRef.current = "";
      prevCountRef.current = 0;
      prevTotalSizeRef.current = 0;
      isUserInteractedRef.current = false;
    }
  }, [listId]);

  const scrollToBottom = useCallback(() => {
    if (!vlistRef.current || !itemsBuffer.length) return;

    if (hasMoreDown && onJumpToLatest) {
      // Trigger callback to load latest messages
      onJumpToLatest();
    } else {
      // Scroll to the last item in the current buffer
      virtualizer.scrollToIndex(itemsBuffer.length - 1, {
        align: "end",
        behavior: "smooth",
      });
    }
  }, [itemsBuffer?.length, virtualizer, hasMoreDown, onJumpToLatest]);

  useEffect(() => {
    if (beforeInView.inView && hasMoreUp && !itemsFetching) {
      onTopReached();
    }
  }, [beforeInView.inView, hasMoreUp, itemsFetching, onTopReached]);
  useEffect(() => {
    if (afterInView.inView && hasMoreDown && !itemsFetching) {
      onBottomReached();
    }
  }, [
    afterInView.inView,
    hasMoreDown,
    itemsBuffer,
    itemsFetching,
    onBottomReached,
  ]);

  const isUserInteractedRef = useRef(false);

  // Adjust scroll position when new messages are loaded
  // it's important to have it out of effect
  if (itemsBuffer.length > 0) {
    const firstId = itemsBuffer[0].id;
    const addedToTheBeginning = firstId < prevIdRef.current;
    if (addedToTheBeginning && prevCountRef.current > 0) {
      const currentTotalSize = virtualizer.getTotalSize();
      const sizeDifference = currentTotalSize - prevTotalSizeRef.current;
      if (sizeDifference > 0 && virtualizer.scrollOffset !== null) {
        {
          const newOffset = virtualizer.scrollOffset + sizeDifference;
          virtualizer.scrollOffset = newOffset;
          virtualizer.calculateRange();
          virtualizer.scrollToOffset(newOffset, { align: "start" });
        }
      }
    }
    prevTotalSizeRef.current = virtualizer.getTotalSize();
    prevIdRef.current = firstId;
    prevCountRef.current = itemsBuffer.length;
  }

  useEffect(() => {
    // attach to bottom when message is sent
    if (attachToBottom && canAttachToBottomRef.current) {
      virtualizer.scrollToIndex(itemsBuffer.length - 1, {
        align: "end",
      });
      return;
    }

    const savedScrollPosition = scrollPositionsRef.current.get(listId);
    // attach to previous position or to anchor
    if (savedScrollPosition && !isUserInteractedRef.current) {
      requestAnimationFrame(() => {
        virtualizer.scrollToOffset(savedScrollPosition.offset, {
          align: "start",
          behavior: "auto",
        });
      });
    }

    if (!savedScrollPosition && anchor && !isUserInteractedRef.current) {
      requestAnimationFrame(() => {
        const anchorIndex = itemsBuffer.findIndex((msg) => msg.id === anchor);
        if (anchorIndex !== -1) {
          virtualizer.scrollToIndex(anchorIndex, {
            align: "start",
            behavior: "auto",
          });
        }
      });
    }
  }, [itemsBuffer]);
  // Detect user scroll to prevent attaching to anchor
  const handleUserInteraction = () => {
    isUserInteractedRef.current = true;
  };

  return (
    <div
      ref={vlistRef}
      className={clsx(styles.vlist, listStyles)}
      onKeyDown={handleUserInteraction}
      onWheel={handleUserInteraction}
      onTouchMove={handleUserInteraction}
      onPointerDown={handleUserInteraction}
    >
      {hasMoreUp && (
        <div
          ref={beforeInView.ref}
          style={{
            width: "100%",
          }}
        >
          {topSentinel}
        </div>
      )}

      <div>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          <ScrollToBottom
            component={vlistRef.current}
            unreadCount={unseenItemsCount}
            conversationId={listId}
            onClick={scrollToBottom}
          />
          {virtualizer
            .getVirtualItems()
            .map((virtualRow) =>
              renderItem(virtualRow, itemsBuffer, virtualizer),
            )}
        </div>
      </div>

      {hasMoreDown && (
        <div
          ref={afterInView.ref}
          style={{
            width: "100%",
          }}
        >
          {bottomSentinel}
        </div>
      )}
    </div>
  );
};

export default VList;
