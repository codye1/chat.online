import type { Reaction } from "@utils/types";
import styles from "./Reactions.module.css";

const Reactions = ({ reactions }: { reactions: Reaction[] }) => {
  return (
    <>
      {reactions.length > 0 && (
        <div className={styles.reactions}>
          {reactions.map((reaction) => (
            <span key={reaction.id} className={styles.reaction}>
              {reaction.content}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default Reactions;
