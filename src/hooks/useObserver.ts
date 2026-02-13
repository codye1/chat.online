import { useCallback, useEffect, useRef } from "react";

const useObserver = <T>(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit,
  follow?: T,
) => {
  const callbackRef = useRef(callback);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callbackRef.current(entry);
        }
      });
    }, options);

    elementsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [options, follow]);

  const setRef = useCallback((node: Element | null) => {
    if (!node) return;

    elementsRef.current.add(node);

    observerRef.current?.observe(node);
  }, []);

  return { setRef };
};

export default useObserver;
