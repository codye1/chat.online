import ContextMenu from "@components/ContextMenu/ContextMenu";
import { deleteMessage } from "@utils/socket";
import deleteIcon from "@assets/delete.svg";
import editIcon from "@assets/edit.svg";
import copyIcon from "@assets/copy.svg";
import heart from "@assets/heart.svg";
import { useAppDispatch } from "@hooks/hooks";
import { openModal, setEditingMessage, setReplyMessage } from "@redux/global";
import Separator from "@components/Separator/Separator";
import getMessage from "@utils/getMessage";
import ContextMenuItem from "@components/ContextMenu/components/ContentMenuItem/ContextMenuItem";
import ContextMenuContent from "@components/ContextMenu/components/ContentMenuContent/ContextMenuContent";
import ReactionsPicker from "./components/ReactionsPicker/ReactionsPicker";
import replyIcon from "@assets/reply.svg";
import type { Message } from "@utils/types";

interface IMessageContextMenu {
  isContextMenuOpen: boolean;
  setIsContextMenuOpen: (open: boolean) => void;
  mousePosition: { x: number; y: number };
  message: Message & { sentByCurrentUser: boolean };
}

const MessageContextMenu = ({
  isContextMenuOpen,
  setIsContextMenuOpen,
  mousePosition,
  message: { id: messageId, text, conversationId, sender, sentByCurrentUser },
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

  const onReply = () => {
    dispatch(setReplyMessage({ id: messageId, text, sender }));
    setIsContextMenuOpen(false);
  };

  return (
    <ContextMenu
      isOpen={isContextMenuOpen}
      onClose={() => setIsContextMenuOpen(false)}
      position={mousePosition}
    >
      <ReactionsPicker
        messageId={messageId}
        setIsContextMenuOpen={setIsContextMenuOpen}
      />
      <ContextMenuContent>
        <ContextMenuItem onClick={onReply} icon={replyIcon} label="Reply" />
        <ContextMenuItem
          onClick={onCopyMessage}
          icon={copyIcon}
          label="Copy message"
        />
        {sentByCurrentUser && (
          <>
            <ContextMenuItem
              onClick={onEditMessage}
              icon={editIcon}
              label="Edit message"
            />
            <ContextMenuItem
              onClick={onDeleteMessage}
              icon={deleteIcon}
              label="Delete message"
            />
            <Separator />
            <ContextMenuItem
              onClick={() => {
                const message = getMessage({ messageId, conversationId });
                if (message) {
                  dispatch(
                    openModal({
                      type: "reactorsInfo",
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
              icon={heart}
              label="Reactors"
            />
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MessageContextMenu;
