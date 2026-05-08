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
import {
  useDeleteFolderMutation,
  useUpdateFolderPositionMutation,
} from "@api/slices/Chat/chatSlice";
import { updateConversationsState } from "@api/slices/helpers/ConversationsManage";
import FoldersListItem from "./components/FoldersListItem/FoldersListItem";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
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
  const [updateFolderPosition] = useUpdateFolderPositionMutation();
  const handleWheel = (e: WheelEvent<HTMLUListElement>) => {
    if (listRef.current) {
      listRef.current.scrollLeft += e.deltaY;
    }
  };
  const dispatch = useAppDispatch();

  const handleDragEnd = ({ operation }: DragEndEvent) => {
    if (!isSortableOperation(operation)) return;

    const source = operation.source;
    if (!source) return;

    const sortableIndex = source.sortable.index;
    const initialIndex = source.sortable.initialIndex;

    if (!Number.isInteger(sortableIndex) || sortableIndex === initialIndex) {
      return;
    }

    updateConversationsState(async (state) => {
      const total = state.folders.length;
      if (
        initialIndex < 0 ||
        initialIndex >= total ||
        sortableIndex < 0 ||
        sortableIndex >= total
      ) {
        return;
      }

      const [moved] = state.folders.splice(initialIndex, 1);
      state.folders.splice(sortableIndex, 0, moved);
      state.folders.forEach((folder, index) => {
        folder.position = index;
      });

      await updateFolderPosition({
        folderId: moved.id,
        position: sortableIndex,
      });
    });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <ul className={styles.list} ref={listRef} onWheel={handleWheel}>
        <FoldersListItem
          activeFolder={activeFolder}
          onFolderClick={() => onFolderClick("ACTIVE")}
          folder={{ id: "ACTIVE", title: "All" }}
        />
        {folders && (
          <>
            {folders.map((folder, index) => (
              <FoldersListItem.Sortable
                key={folder.id}
                activeFolder={activeFolder}
                folder={folder}
                onFolderClick={onFolderClick}
                listItemProps={{
                  onContextMenu: (e) => {
                    e.preventDefault();
                    setContextMenuPosition({ x: e.clientX, y: e.clientY });
                    setSelectedFolder(folder);
                    setShowContextMenu(true);
                  },
                }}
                id={folder.id}
                index={index}
                group="folders"
              />
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
                        openModal({
                          type: "editFolder",
                          folder: selectedFolder,
                        }),
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
    </DragDropProvider>
  );
};

export default ConversationFoldersList;
