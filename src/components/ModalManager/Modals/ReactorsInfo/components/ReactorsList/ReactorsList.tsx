import Avatar from "@components/Avatar/Avatar";
import styles from "./ReactorsList.module.css";
import getDisplayName from "@utils/getDisplayName";
import formatDate from "@utils/formatDate";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef, useState } from "react";
import type { ReactorListItem } from "@utils/types";

let savingScrollPositionTimeout: number;

interface IReactorsList {
  tab: string;
  reactors: ReactorListItem[] | undefined;
  onBottomReached?: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const SKELETON_COUNT = 3;

const ReactorSkeleton = () => (
  <li className={styles.reactor}>
    <div className={styles.skeletonAvatar} />
    <div className={styles.skeletonInfo}>
      <div className={styles.skeletonLineName} />
      <div className={styles.skeletonLineDate} />
    </div>
  </li>
);

const ReactorsList = ({
  reactors,
  isLoading,
  onBottomReached,
  tab,
}: IReactorsList) => {
  const [rootEl, setRootEl] = useState<HTMLUListElement | null>(null);
  const scrollPositions = useRef<Record<string, number>>({});
  const prevTabRef = useRef<string>(tab);
  const { ref, inView } = useInView({
    root: rootEl,
    rootMargin: "0px 0px 300px 0px",
  });

  useEffect(() => {
    if (inView && onBottomReached) {
      onBottomReached();
    }
  }, [inView, onBottomReached]);

  const onScroll = () => {
    clearTimeout(savingScrollPositionTimeout);
    savingScrollPositionTimeout = setTimeout(() => {
      if (rootEl) {
        scrollPositions.current[tab] = rootEl.scrollTop;
        console.log("saving for", tab, scrollPositions.current[tab]);
      }
    }, 100);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      if (rootEl) {
        if (prevTabRef.current !== tab) {
          console.log("restoring for", tab, scrollPositions.current[tab]);
          rootEl.scrollTop = scrollPositions.current[tab] ?? 0;
          prevTabRef.current = tab;
        }
      }
    });
  }, [reactors, rootEl]);

  if (isLoading) {
    return (
      <ul className={styles.reactorsList}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ReactorSkeleton key={i} />
        ))}
      </ul>
    );
  }

  if (!reactors) {
    return <div>No reactors available</div>;
  }
  return (
    <ul className={styles.reactorsList} ref={setRootEl} onScroll={onScroll}>
      {reactors.map((reactor) => (
        <li className={styles.reactor} key={reactor.id}>
          <Avatar
            avatarUrl={reactor.avatarUrl}
            width={"50px"}
            height={"50px"}
          />
          <div className={styles.info}>
            <h3 className={styles.displayName}>{getDisplayName(reactor)}</h3>
            <h4>{formatDate(reactor.reaction.createdAt)}</h4>
          </div>
          <div className={styles.reactionContent}>
            {reactor.reaction.content}
          </div>
        </li>
      ))}
      <div ref={ref} />
    </ul>
  );
};

export default ReactorsList;
