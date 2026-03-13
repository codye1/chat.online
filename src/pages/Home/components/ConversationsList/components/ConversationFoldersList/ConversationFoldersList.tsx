import clsx from "clsx";
import styles from "./ConversationFoldersList.module.css";
import { useRef } from "react";
import type { WheelEvent } from "react";
import type { Folder } from "@utils/types";

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

  const handleWheel = (e: WheelEvent<HTMLUListElement>) => {
    if (listRef.current) {
      listRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <ul className={styles.list} ref={listRef} onWheel={handleWheel}>
      <li
        className={clsx(styles.folder, {
          [styles.active]: activeFolder === "ACTIVE",
        })}
        onClick={() => onFolderClick("ACTIVE")}
      >
        All <div className={styles.count}>5</div>
      </li>
      {folders &&
        folders.map((folder) => (
          <li
            key={folder.id}
            className={clsx(styles.folder, {
              [styles.active]: activeFolder === folder.id,
            })}
            onClick={() => onFolderClick(folder.id)}
          >
            {folder.title}{" "}
            <div className={styles.count}>
              {folder.pinnedConversationIds.length +
                folder.unpinnedConversationIds.length}
            </div>
          </li>
        ))}
    </ul>
  );
};

export default ConversationFoldersList;
