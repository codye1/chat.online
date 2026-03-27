import clsx from "clsx";
import styles from "./PreviewItem.module.css";
import Avatar from "@components/Avatar/Avatar";
import { Children, isValidElement, useState, type ReactNode } from "react";
import ContextMenu, {
  ContextMenuSlot,
} from "@components/ContextMenu/ContextMenu";
import pinIcon from "@assets/pin.svg";
import ListItem from "@components/ListItem/ListItem";
import ListItemInfo from "@components/ListItem/ListItemInfo";

interface IPreviewItem {
  avatarUrl: string | null;

  title: string;
  description: string;
  meta?: {
    lastMessageTime: string;
    unreadMessagesCount: number;
  };
  isPinned?: boolean;
  isMuted?: boolean;
  onClick?: () => void;
  onMouseDown?: () => void;
  isActive?: boolean;
  isArchived?: boolean;
  children?: ReactNode;
}

const PreviewItem = ({
  avatarUrl,
  title,
  description,
  meta,
  onClick,
  onMouseDown,
  isActive,
  isPinned,
  isMuted,
  children,
}: IPreviewItem) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  return (
    <ListItem
      className={clsx({ [styles.active]: isActive })}
      onClick={onClick}
      onContextMenu={(el) => {
        const hasContextMenu = Children.toArray(children).some(
          (child) => isValidElement(child) && child.type === ContextMenuSlot,
        );
        if (!hasContextMenu) return;
        el.preventDefault();
        setShowContextMenu(true);
        setContextMenuPosition({ x: el.clientX, y: el.clientY });
      }}
      onMouseDown={onMouseDown}
    >
      <Avatar avatarUrl={avatarUrl} />
      <ListItemInfo title={title} subtitle={description} />
      {meta && (
        <div className={styles.meta}>
          <p>
            {new Date(meta.lastMessageTime).toLocaleString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {meta.unreadMessagesCount > 0 && (
            <span
              className={clsx(styles.unreadCount, { [styles.muted]: isMuted })}
            >
              {meta.unreadMessagesCount}
            </span>
          )}

          {isPinned && meta.unreadMessagesCount === 0 && (
            <span className={styles.pinnedIcon}>
              <img src={pinIcon} alt="Pinned" />
            </span>
          )}
        </div>
      )}
      {children &&
        Children.map(children, (child) => {
          if (
            isValidElement<{ children: ReactNode }>(child) &&
            child.type === ContextMenuSlot
          ) {
            if (showContextMenu) {
              return (
                <ContextMenu
                  isOpen={showContextMenu}
                  onClose={() => setShowContextMenu(false)}
                  position={contextMenuPosition}
                >
                  {child}
                </ContextMenu>
              );
            }
            return null;
          }
          return child;
        })}
    </ListItem>
  );
};

export default PreviewItem;
