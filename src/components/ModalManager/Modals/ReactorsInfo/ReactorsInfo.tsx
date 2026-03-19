import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import type { GroupedReactions as GroupedReactionsType } from "@utils/types";
import styles from "./ReactorsInfo.module.css";
import { useMemo, useState } from "react";
import ReactorsList from "./components/ReactorsList/ReactorsList";
import GroupedReactions from "./components/GroupedReactions/GroupedReactions";
import { useGetReactorsQuery } from "@api/slices/Chat/chatSlice";
import close from "@assets/close.svg";

interface IReactorsInfo {
  messageId: string;
  conversationId: string;
  groupedReactions: GroupedReactionsType;
}

const ReactorsInfo = ({
  messageId,
  conversationId,
  groupedReactions,
}: IReactorsInfo) => {
  const dispatch = useAppDispatch();
  const [reactionContent, setReactionContent] = useState<string>("all");
  const [cursors, setCursors] = useState<Record<string, string | undefined>>(
    {},
  );
  const cursor = cursors[reactionContent];

  const {
    data: reactors,
    isLoading,
    isFetching,
  } = useGetReactorsQuery(
    { messageId, conversationId, reactionContent, cursor },
    { refetchOnMountOrArgChange: true },
  );

  const allReactionsCount = useMemo(() => {
    return Object.values(groupedReactions).reduce(
      (sum, group) => sum + group.count,
      0,
    );
  }, [groupedReactions]);

  const onBottomReached = () => {
    if (reactors?.hasMore) {
      const nextCursor = reactors.items[reactors.items.length - 1].reaction.id;
      setCursors((prev) => ({ ...prev, [reactionContent]: nextCursor }));
    }
  };

  const onTabClick = (tab: string) => {
    if (reactors) {
      const nextCursor = reactors.items[reactors.items.length - 1].reaction.id;
      setCursors((prev) => ({
        ...prev,
        [reactionContent]: nextCursor,
      }));
    }

    setReactionContent(tab);
  };

  return (
    <Modal
      onClickOutside={() => {
        dispatch(closeModal());
      }}
    >
      <menu className={styles.content}>
        <div className={styles.header}>
          <button
            className={styles.closeButton}
            onClick={() => dispatch(closeModal())}
          >
            <img src={close} alt="Close" />
          </button>
          <h2 className={styles.title}>Reactions</h2>
        </div>
        {allReactionsCount > 5 && (
          <GroupedReactions
            groupedReactions={groupedReactions}
            onTabClick={onTabClick}
            selectedTab={reactionContent}
            allReactionsCount={allReactionsCount}
          />
        )}
        <ReactorsList
          tab={reactionContent}
          reactors={reactors?.items}
          isLoading={isLoading || (isFetching && !cursor)}
          onBottomReached={onBottomReached}
          hasMore={!!reactors?.hasMore}
        />
      </menu>
    </Modal>
  );
};

export default ReactorsInfo;
export type { IReactorsInfo };
