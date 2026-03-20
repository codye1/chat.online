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
import deleteMessage from "@utils/socket/actions/messageActions/deleteMessage";

interface IMessageContextMenu {
  mediaForContextMenu?: MessageMedia;
  setMediaForContextMenu: (media?: MessageMedia) => void;
  message: Message & { sentByCurrentUser: boolean };
}

const MessageContextMenu = ({
  message,
  mediaForContextMenu,
  setMediaForContextMenu,
}: IMessageContextMenu) => {
  const dispatch = useAppDispatch();
  const onDeleteMessage = () => {
    deleteMessage(message.id, message.conversationId);
  };

  const onEditMessage = () => {
    dispatch(
      setMessageToEdit({ ...message, mediaToEdit: mediaForContextMenu }),
    );
    setMediaForContextMenu(undefined);
  };

  const onCopyMessage = () => {
    navigator.clipboard.writeText(message.text);
  };

  const onReply = () => {
    dispatch(
      setReplyMessage({
        id: message.id,
        text: message.text,
        sender: message.sender,
      }),
    );
  };

  return (
    <>
      <ReactionsPicker
        messageId={message.id}
        setIsContextMenuOpen={() => {}}
        conversationId={message.conversationId}
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
                }}
                icon={heart}
                label="Reactors"
              />
            )}
          </>
        )}
      </MenuContent>
    </>
  );
};

export default MessageContextMenu;
