import ContextMenu from "@components/ContextMenu/ContextMenu";
import { deleteMessage } from "@utils/socket";
import deleteIcon from "@assets/delete.svg";
import editIcon from "@assets/edit.svg";
import copyIcon from "@assets/copy.svg";
import heart from "@assets/heart.svg";
import { useAppDispatch } from "@hooks/hooks";
import { openModal, setMessageToEdit, setReplyMessage } from "@redux/global";
import Separator from "@components/Separator/Separator";
import ReactionsPicker from "./components/ReactionsPicker/ReactionsPicker";
import replyIcon from "@assets/reply.svg";
import type { Message, MessageMedia } from "@utils/types";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import MenuItem from "@components/MenuConstructor/MenuItem/MenuItem";

interface IMessageContextMenu {
  isContextMenuOpen: boolean;
  setIsContextMenuOpen: (open: boolean) => void;
  mousePosition: { x: number; y: number };
  message: Message & { sentByCurrentUser: boolean };
  mediaForContextMenu?: MessageMedia;
  setMediaForContextMenu: (media?: MessageMedia) => void;
}

const MessageContextMenu = ({
  isContextMenuOpen,
  setIsContextMenuOpen,
  mousePosition,
  message,
  mediaForContextMenu,
  setMediaForContextMenu,
}: IMessageContextMenu) => {
  const dispatch = useAppDispatch();

  const onDeleteMessage = () => {
    deleteMessage(message.id);
  };

  const onEditMessage = () => {
    dispatch(
      setMessageToEdit({ ...message, mediaToEdit: mediaForContextMenu }),
    );
    setIsContextMenuOpen(false);
    setMediaForContextMenu(undefined);
  };

  const onCopyMessage = () => {
    navigator.clipboard.writeText(message.text);
    setIsContextMenuOpen(false);
  };

  const onReply = () => {
    dispatch(
      setReplyMessage({
        id: message.id,
        text: message.text,
        sender: message.sender,
      }),
    );
    setIsContextMenuOpen(false);
  };

  return (
    <ContextMenu
      isOpen={isContextMenuOpen}
      onClose={() => setIsContextMenuOpen(false)}
      position={mousePosition}
    >
      <ReactionsPicker
        messageId={message.id}
        setIsContextMenuOpen={setIsContextMenuOpen}
      />
      <MenuContent>
        <MenuItem onClick={onReply} icon={replyIcon} label="Reply" />
        <MenuItem
          onClick={onCopyMessage}
          icon={copyIcon}
          label="Copy message"
        />
        {message.sentByCurrentUser && (
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
            {Object.keys(message.reactions).length > 0 && (
              <MenuItem
                onClick={() => {
                  dispatch(
                    openModal({
                      type: "reactorsInfo",
                      props: {
                        messageId: message.id,
                        conversationId: message.conversationId,
                        groupedReactions: message.reactions,
                      },
                    }),
                  );
                  setIsContextMenuOpen(false);
                }}
                icon={heart}
                label="Reactors"
              />
            )}
          </>
        )}
      </MenuContent>
    </ContextMenu>
  );
};

export default MessageContextMenu;
