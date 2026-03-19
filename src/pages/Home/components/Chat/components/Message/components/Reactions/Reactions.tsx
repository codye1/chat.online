import type { GroupedReactions } from "@utils/types";
import styles from "./Reactions.module.css";
import clsx from "clsx";
import removeReaction from "@utils/socket/actions/reactionActions/removeReaction";
import addReaction from "@utils/socket/actions/reactionActions/addReaction";

const Reactions = ({
  reactions,
  messageId,
}: {
  reactions: GroupedReactions;
  messageId: string;
}) => {
  return (
    <>
      {Object.keys(reactions).length > 0 && (
        <div className={styles.reactions}>
          {Object.entries(reactions).map(([key, group]) => (
            <button
              key={key}
              className={clsx(styles.groupReactions, {
                [styles.chosen]: group.isActive,
              })}
              onClick={() => {
                if (group.isActive) {
                  removeReaction({ messageId });
                } else {
                  addReaction({ messageId, content: key });
                }
              }}
            >
              <div>{key}</div>
              <div className={styles.count}>{group.count}</div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Reactions;
