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
import ReactionsPicker from "./components/ReactionsPicker/ReactionsPicker";
import replyIcon from "@assets/reply.svg";
import type { Message } from "@utils/types";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import MenuItem from "@components/MenuConstructor/MenuItem/MenuItem";

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
      <MenuContent>
        <MenuItem onClick={onReply} icon={replyIcon} label="Reply" />
        <MenuItem
          onClick={onCopyMessage}
          icon={copyIcon}
          label="Copy message"
        />
        {sentByCurrentUser && (
          <>
            <MenuItem
              onClick={onEditMessage}
              icon={editIcon}
              label="Edit message"
            />
            <MenuItem
              onClick={onDeleteMessage}
              icon={deleteIcon}
              label="Delete message"
            />
            <Separator />
            <MenuItem
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
      </MenuContent>
    </ContextMenu>
  );
};

export default MessageContextMenu;
