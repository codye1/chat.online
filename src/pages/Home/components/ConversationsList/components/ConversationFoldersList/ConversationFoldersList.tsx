import clsx from "clsx";
import styles from "./ConversationFoldersList.module.css";
import { useRef, useState } from "react";
import type { WheelEvent } from "react";
import type { Folder } from "@utils/types";
import ContextMenu from "@components/ContextMenu/ContextMenu";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import MenuItem from "@components/MenuConstructor/MenuItem/MenuItem";
import editIcon from "@assets/edit.svg";
import { useAppDispatch } from "@hooks/hooks";
import { openModal } from "@redux/global";
import deleteIcon from "@assets/trash.svg";
import { useDeleteFolderMutation } from "@api/slices/Chat/chatSlice";
import { updateConversationsState } from "@api/slices/helpers/ConversationsManage";

interface IConversationFoldersList {
  onFolderClick: (Folder: string) => void;
  activeFolder: string;
  folders: Folder[];
}

const ConversationFoldersList = ({
  onFolderClick,
  activeFolder,
  folders,
}: IConversationFoldersList) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [deleteFolder] = useDeleteFolderMutation();

  const handleWheel = (e: WheelEvent<HTMLUListElement>) => {
    if (listRef.current) {
      listRef.current.scrollLeft += e.deltaY;
    }
  };
  const dispatch = useAppDispatch();

  return (
    <ul className={styles.list} ref={listRef} onWheel={handleWheel}>
      <li
        className={clsx(styles.folder, {
          [styles.active]: activeFolder === "ACTIVE",
        })}
        onClick={() => onFolderClick("ACTIVE")}
      >
        All
      </li>
      {folders && (
        <>
          {folders.map((folder) => (
            <li
              key={folder.id}
              className={clsx(styles.folder, {
                [styles.active]: activeFolder === folder.id,
              })}
              onClick={() => onFolderClick(folder.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenuPosition({ x: e.clientX, y: e.clientY });
                setSelectedFolder(folder);
                setShowContextMenu(true);
              }}
            >
              {folder.title}
            </li>
          ))}

          <ContextMenu
            isOpen={showContextMenu}
            position={contextMenuPosition}
            onClose={() => setShowContextMenu(false)}
            className={styles.contextMenu}
          >
            <MenuContent>
              <MenuItem
                label="Edit"
                icon={editIcon}
                className={styles.contextItem}
                onClick={() => {
                  if (selectedFolder) {
                    dispatch(
                      openModal({ type: "editFolder", folder: selectedFolder }),
                    );
                  }
                  setShowContextMenu(false);
                }}
              />
              <MenuItem
                label="Delete"
                icon={deleteIcon}
                className={styles.contextItem}
                onClick={() => {
                  if (selectedFolder) {
                    deleteFolder({ folderId: selectedFolder.id });
                    updateConversationsState((state) => {
                      state.folders = state.folders.filter(
                        (f) => f.id !== selectedFolder.id,
                      );
                    });
                  }
                  setShowContextMenu(false);
                }}
              />
            </MenuContent>
          </ContextMenu>
        </>
      )}
    </ul>
  );
};

export default ConversationFoldersList;
