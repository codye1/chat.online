import addReaction from "@utils/socket/actions/reactionActions/addReaction";
import styles from "./ReactionsPicker.module.css";

const reactions = ["👍", "❤️", "😂", "😮"];

interface IReactionsPicker {
  messageId: string;
  setIsContextMenuOpen: (isOpen: boolean) => void;
  conversationId: string;
}

const ReactionsPicker = ({
  messageId,
  setIsContextMenuOpen,
  conversationId,
}: IReactionsPicker) => {
  return (
    <ul className={styles.list}>
      {reactions.map((reaction) => (
        <li key={reaction}>
          <button
            className={styles.reactionButton}
            onClick={() => {
              addReaction({
                messageId,
                content: reaction,
                conversationId: conversationId,
              });
              setIsContextMenuOpen(false);
            }}
          >
            {reaction}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ReactionsPicker;
