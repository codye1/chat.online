import Popover from "@components/Popover/Popover";
import styles from "./MessagePopover.module.css";
import deleteIcon from "@assets/delete.svg";
import editIcon from "@assets/edit.svg";
import { deleteMessage } from "@utils/socket";
import copyIcon from "@assets/copy.svg";
import { useAppDispatch } from "@hooks/hooks";
import { setEditingMessage } from "@redux/global";

interface IMessagePopover {
  anchorRef: React.RefObject<HTMLElement | null>;
  isPopoverOpen: boolean;
  setIsPopoverOpen: (open: boolean) => void;
  mousePosition: { x: number; y: number };
  messageId: string;
  sentByCurrentUser: boolean;
  text: string;
}

const MessagePopover = ({
  anchorRef,
  isPopoverOpen,
  setIsPopoverOpen,
  mousePosition,
  messageId,
  text,
  sentByCurrentUser,
}: IMessagePopover) => {
  const dispatch = useAppDispatch();

  const onDeleteMessage = () => {
    deleteMessage(messageId);
  };

  const onEditMessage = () => {
    dispatch(setEditingMessage({ id: messageId, text }));
    setIsPopoverOpen(false);
  };

  const onCopyMessage = () => {
    navigator.clipboard.writeText(text);
    setIsPopoverOpen(false);
  };

  return (
    <>
      {isPopoverOpen && (
        <Popover
          anchorRef={anchorRef}
          isOpen={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          placement="mouse"
          mousePosition={mousePosition}
        >
          <menu className={styles.popoverContent}>
            {sentByCurrentUser && (
              <>
                <button onClick={onDeleteMessage}>
                  <img src={deleteIcon} alt="Delete message" />
                  <h3>Delete</h3>
                </button>
                <button onClick={onEditMessage}>
                  <img src={editIcon} alt="Edit message" />
                  <h3>Edit</h3>
                </button>
              </>
            )}
            <button onClick={onCopyMessage}>
              <img src={copyIcon} alt="Copy message" />
              <h3>Copy</h3>
            </button>
          </menu>
        </Popover>
      )}
    </>
  );
};

export default MessagePopover;
