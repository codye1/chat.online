import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import MenuItem from "@components/MenuConstructor/MenuItem/MenuItem";
import folderArrowIcon from "@assets/folderArrow.svg";
import pinIcon from "@assets/pin.svg";
import unpinIcon from "@assets/unpin.svg";
import archiveArrowDownIcon from "@assets/archiveArrowDown.svg";
import archiveArrowUpIcon from "@assets/archiveArrowUp.svg";
import folderPlusIcon from "@assets/folderPlus.svg";
import folderIcon from "@assets/folder.svg";
import checkIcon from "@assets/check.svg";
import type { ConversationPreview, ConversationsState } from "@utils/types";
import styles from "./ConversationContextMenu.module.css";
import trashIcon from "@assets/trash.svg";
import useGetContextActions from "./useGetContextActions";
import resetUnreadMessagesCount from "@utils/helpers/resetUnreadMessagesCount";
import markAsReadIcon from "@assets/messageWitchCheck.svg";
import markMessageAsRead from "@utils/socket/actions/messageActions/marckMessageAsRead";

interface IConversationContextMenu {
  conversation: ConversationPreview;
  isPinned: boolean;
  nextPinPosition: number;
  activeFolderId: string;
  conversationsState: ConversationsState;
  foldersWhereConversationIs: ConversationsState["folders"];
}

const ConversationContextMenu = ({
  conversation,
  isPinned,
  nextPinPosition,
  activeFolderId,
  conversationsState,
  foldersWhereConversationIs,
}: IConversationContextMenu) => {
  const {
    onPinClick,
    onArchiveClick,
    onFolderClick,
    onDeleteClick,
    onCreateFolderClick,
  } = useGetContextActions({
    conversation,
    isPinned,
    nextPinPosition,
    activeFolderId,
  });
  return (
    <MenuContent>
      <MenuItem
        label={isPinned ? "Unpin" : "Pin"}
        icon={isPinned ? unpinIcon : pinIcon}
        onClick={onPinClick}
      />
      <MenuItem
        label={conversation.isArchived ? "Unarchive" : "Archive"}
        icon={
          conversation.isArchived ? archiveArrowUpIcon : archiveArrowDownIcon
        }
        onClick={onArchiveClick}
      />
      {conversation.unreadMessages > 0 && (
        <MenuItem
          label="Mark as Read"
          icon={markAsReadIcon}
          onClick={() => {
            if (!conversation.lastMessage) return;
            resetUnreadMessagesCount(conversation.id);
            markMessageAsRead(conversation.id, conversation.lastMessage.id);
          }}
        />
      )}
      <MenuItem
        label="Add to folder"
        icon={folderArrowIcon}
        subContent={
          <MenuContent className={styles.contextMenu}>
            {conversationsState.folders.map((folder) => {
              const isInFolder = foldersWhereConversationIs.some(
                (f) => f.id === folder.id,
              );
              return (
                <MenuItem
                  key={folder.id}
                  label={folder.title}
                  icon={folderIcon}
                  onClick={(event) =>
                    onFolderClick({ event, isInFolder, folderId: folder.id })
                  }
                >
                  {isInFolder && (
                    <img
                      src={checkIcon}
                      alt="Check icon"
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </MenuItem>
              );
            })}
            <MenuItem
              key="create-folder"
              label="Create Folder"
              icon={folderPlusIcon}
              onClick={onCreateFolderClick}
            />
          </MenuContent>
        }
      />
      <MenuItem label="Delete" icon={trashIcon} onClick={onDeleteClick} />
    </MenuContent>
  );
};

export default ConversationContextMenu;
