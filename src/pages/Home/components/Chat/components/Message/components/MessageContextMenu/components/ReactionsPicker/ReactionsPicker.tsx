import { addReaction } from "@utils/socket";
import styles from "./ReactionsPicker.module.css";

interface IReactionsPicker {
  messageId: string;
  setIsContextMenuOpen: (isOpen: boolean) => void;
}

const ReactionsPicker = ({
  messageId,
  setIsContextMenuOpen,
}: IReactionsPicker) => {
  return (
    <ul className={styles.list}>
      <li>
        <button
          className={styles.reactionButton}
          onClick={() => {
            addReaction({ messageId, content: "👍" });
            setIsContextMenuOpen(false);
          }}
        >
          👍
        </button>
      </li>
      <li>
        <button
          className={styles.reactionButton}
          onClick={() => {
            addReaction({ messageId, content: "❤️" });
            setIsContextMenuOpen(false);
          }}
        >
          ❤️
        </button>
      </li>
      <li>
        <button
          className={styles.reactionButton}
          onClick={() => {
            addReaction({ messageId, content: "😂" });
            setIsContextMenuOpen(false);
          }}
        >
          😂
        </button>
      </li>
      <li>
        <button
          className={styles.reactionButton}
          onClick={() => {
            addReaction({ messageId, content: "😮" });
            setIsContextMenuOpen(false);
          }}
        >
          😮
        </button>
      </li>
    </ul>
  );
};

export default ReactionsPicker;
