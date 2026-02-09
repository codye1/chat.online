import type { Message } from "@utils/types";
import { useCallback, useMemo } from "react";
import useObserver from "@hooks/useObserver";

interface IUsePagination {
  rootNode: HTMLDivElement | null;
  messages?: {
    items: Message[];
  };
  setQueryParams: React.Dispatch<
    React.SetStateAction<{
      cursor?: string;
      direction?: "UP" | "DOWN";
      jumpToLatest?: boolean;
    }>
  >;
}

const usePagination = ({
  rootNode,
  messages,
  setQueryParams,
}: IUsePagination) => {
  const handleCursorIntersect = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.target.id === "UP") {
        setQueryParams({
          cursor: messages?.items.length
            ? messages.items[messages.items.length - 1].id
            : undefined,
          direction: "UP",
        });
      }
      if (entry.target.id === "DOWN") {
        setQueryParams({
          cursor: messages?.items.length ? messages.items[0].id : undefined,
          direction: "DOWN",
        });
      }
    },
    [messages, setQueryParams],
  );

  const cursorOptions = useMemo(
    () => ({
      root: rootNode,
      rootMargin: "300px 0px",
    }),
    [rootNode],
  );

  const { setRef: setSentinelRef } = useObserver(
    handleCursorIntersect,
    cursorOptions,
    messages,
  );

  return { setSentinelRef };
};

export default usePagination;
