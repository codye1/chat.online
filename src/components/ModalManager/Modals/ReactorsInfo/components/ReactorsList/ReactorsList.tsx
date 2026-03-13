import Avatar from "@components/Avatar/Avatar";
import styles from "./ReactorsList.module.css";
import getDisplayName from "@utils/getDisplayName";
import formatDate from "@utils/formatDate";
import type { ReactorListItem } from "@utils/types";
import InfiniteScrolling from "@components/InfinteScrolling/InfinteScrolling";

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
  hasMore,
}: IReactorsList) => {
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
    <InfiniteScrolling
      items={reactors}
      className={styles.reactorsList}
      renderItem={(reactor) => (
        <li className={styles.reactor} key={reactor.reaction.id}>
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
      )}
      listId={tab}
      hasMore={hasMore}
      onBottomReached={onBottomReached ?? (() => {})}
    />
  );
};

export default ReactorsList;
