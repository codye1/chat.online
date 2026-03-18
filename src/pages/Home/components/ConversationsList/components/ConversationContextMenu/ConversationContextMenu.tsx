import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import MenuItem from "@components/MenuConstructor/MenuItem/MenuItem";
import folderArrowIcon from "@assets/folderArrow.svg";
import pinIcon from "@assets/pin.svg";
import unpinIcon from "@assets/unpin.svg";
import {
  addToFolder,
  removeFromFolder,
  updateConversationSettings,
  updatePinnedPositions,
} from "@api/slices/helpers/ConversationsManage";
import archiveArrowDownIcon from "@assets/archiveArrowDown.svg";
import archiveArrowUpIcon from "@assets/archiveArrowUp.svg";
import folderPlusIcon from "@assets/folderPlus.svg";
import folderIcon from "@assets/folder.svg";
import checkIcon from "@assets/check.svg";
import type { ConversationPreview, ConversationsState } from "@utils/types";
import styles from "./ConversationContextMenu.module.css";
import { openModal } from "@redux/global";
import { useAppDispatch } from "@hooks/hooks";

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
  const dispatch = useAppDispatch();
  return (
    <MenuContent>
      <MenuItem
        label={isPinned ? "Unpin" : "Pin"}
        icon={isPinned ? unpinIcon : pinIcon}
        onClick={() => {
          const newPinnedPosition = isPinned ? null : nextPinPosition;
          updatePinnedPositions(activeFolderId, [
            {
              conversationId: conversation.id,
              newPinnedPosition,
            },
          ]);
        }}
      />
      <MenuItem
        label={conversation.isArchived ? "Unarchive" : "Archive"}
        icon={
          conversation.isArchived ? archiveArrowUpIcon : archiveArrowDownIcon
        }
        onClick={() => {
          updateConversationSettings(conversation.id, {
            isArchived: !conversation.isArchived,
          });
        }}
      />
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
                  onClick={(event) => {
                    event.stopPropagation();
                    if (isInFolder) {
                      removeFromFolder(conversation.id, folder.id);
                    } else {
                      addToFolder(conversation.id, folder.id);
                    }
                  }}
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
              onClick={() => {
                dispatch(
                  openModal({
                    type: "createFolder",
                    selectedConversation: conversation.id,
                  }),
                );
              }}
            />
          </MenuContent>
        }
      />
    </MenuContent>
  );
};

export default ConversationContextMenu;
