import ContextMenu from "@components/ContextMenu/ContextMenu";
import { addReaction, deleteMessage } from "@utils/socket";
import deleteIcon from "@assets/delete.svg";
import editIcon from "@assets/edit.svg";
import copyIcon from "@assets/copy.svg";
import heart from "@assets/heart.svg";
import styles from "./MessageContextMenu.module.css";
import { useAppDispatch } from "@hooks/hooks";
import { openModal, setEditingMessage } from "@redux/global";
import Separator from "@components/Separator/Separator";
import getMessage from "@utils/getMessage";

interface IMessageContextMenu {
  isContextMenuOpen: boolean;
  setIsContextMenuOpen: (open: boolean) => void;
  mousePosition: { x: number; y: number };
  messageId: string;
  sentByCurrentUser: boolean;
  text: string;
  conversationId: string;
}

const MessageContextMenu = ({
  isContextMenuOpen,
  setIsContextMenuOpen,
  mousePosition,
  messageId,
  sentByCurrentUser,
  text,
  conversationId,
}: IMessageContextMenu) => {
  const dispatch = useAppDispatch();

  const onDeleteMessage = () => {
    deleteMessage(messageId);
  };

  const onEditMessage = () => {
    dispatch(setEditingMessage({ id: messageId, text }));
    setIsContextMenuOpen(false);
  };

  const onCopyMessage = () => {
    navigator.clipboard.writeText(text);
    setIsContextMenuOpen(false);
  };

  return (
    <ContextMenu
      isOpen={isContextMenuOpen}
      onClose={() => setIsContextMenuOpen(false)}
      position={mousePosition}
    >
      <ul className={styles.reactionsList}>
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
      <ul className={styles.content}>
        <li>
          <button onClick={onCopyMessage}>
            <img src={copyIcon} alt="Copy message" />
            <h3>Copy</h3>
          </button>
        </li>
        {sentByCurrentUser && (
          <>
            <li>
              <button onClick={onEditMessage}>
                <img src={editIcon} alt="Edit message" />
                <h3>Edit</h3>
              </button>
            </li>
            <li>
              <button onClick={onDeleteMessage}>
                <img src={deleteIcon} alt="Delete message" />
                <h3>Delete</h3>
              </button>
            </li>
            <Separator />
            <li>
              <button
                onClick={() => {
                  const message = getMessage({ messageId, conversationId });
                  if (message) {
                    dispatch(
                      openModal({
                        type: "reactorsList",
                        props: {
                          messageId,
                          conversationId,
                          groupedReactions: message.reactions,
                        },
                      }),
                    );
                  }
                  setIsContextMenuOpen(false);
                }}
              >
                <img src={heart} alt="Reaction icon" />
                <h3>Reactions</h3>
              </button>
            </li>
          </>
        )}
      </ul>
    </ContextMenu>
  );
};

export default MessageContextMenu;
