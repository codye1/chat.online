import { useCallback, useMemo } from "react";

const useObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  const observer = useMemo(() => {
    return new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback(entry);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 1 },
    );
  }, [callback]);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      if (node !== null) {
        observer.observe(node);
      }
    },
    [observer],
  );

  return { setRef };
};

export default useObserver;
