import Avatar from "@components/Avatar/Avatar";
import styles from "./ReactorsList.module.css";
import formatDate from "@utils/helpers/formatDate";
import type { ReactorListItem } from "@utils/types";
import InfiniteScrolling from "@components/InfiniteScrolling/InfiniteScrolling";
import Skeleton from "react-loading-skeleton";
import getDisplayName from "@utils/helpers/getDisplayName";
import ListItem from "@components/ListItem/ListItem";
import ListItemInfo from "@components/ListItem/ListItemInfo";
import { useAppDispatch } from "@hooks/hooks";
import { pushModal } from "@redux/global";

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
    <Skeleton
      className={styles.skeletonAvatar}
      baseColor="var(--c-light-x2)"
      highlightColor="var(--c-light-x3)"
    />
    <div className={styles.skeletonInfo}>
      <Skeleton className={styles.skeletonLineName} />
      <Skeleton className={styles.skeletonLineDate} />
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
  const dispatch = useAppDispatch();

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
        <ListItem
          className={styles.reactor}
          key={reactor.reaction.id}
          onClick={() => {
            dispatch(pushModal({ type: "otherUser", userPreview: reactor }));
          }}
        >
          <Avatar
            avatarUrl={reactor.avatarUrl}
            width={"50px"}
            height={"50px"}
          />
          <ListItemInfo
            title={getDisplayName(reactor)}
            subtitle={formatDate(reactor.reaction.createdAt)}
          />
          <div className={styles.reactionContent}>
            {reactor.reaction.content}
          </div>
        </ListItem>
      )}
      listId={tab}
      hasMore={hasMore}
      onBottomReached={onBottomReached ?? (() => {})}
    />
  );
};

export default ReactorsList;
