import clsx from "clsx";
import styles from "./PreviewItem.module.css";
import Avatar from "@components/Avatar/Avatar";
import {
  Children,
  isValidElement,
  useCallback,
  useState,
  type LiHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import ContextMenu, {
  ContextMenuSlot,
} from "@components/ContextMenu/ContextMenu";
import pinIcon from "@assets/pin.svg";
import ListItem from "@components/ListItem/ListItem";
import ListItemInfo from "@components/ListItem/ListItemInfo";
import { useSortable } from "@dnd-kit/react/sortable";

interface IPreviewItem extends LiHTMLAttributes<HTMLLIElement> {
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
  listItemProps?: LiHTMLAttributes<HTMLLIElement>;
  listItemRef?: Ref<HTMLLIElement>;
}

const PreviewItemBase = ({
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
  listItemProps,
  listItemRef,
}: IPreviewItem) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  return (
    <ListItem
      ref={listItemRef}
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
      {...listItemProps}
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

interface IPreviewItemSortable extends IPreviewItem {
  id: string;
  index: number;
  group?: string;
}

const PreviewItemSortable = ({
  id,
  index,
  group,
  ...props
}: IPreviewItemSortable) => {
  const { ref, sourceRef, targetRef } = useSortable({ id, index, group });
  const setRefs = useCallback(
    (element: Element | null) => {
      ref(element);
      sourceRef(element);
      targetRef(element);
    },
    [ref, sourceRef, targetRef],
  );

  return (
    <PreviewItemBase
      {...props}
      listItemRef={setRefs}
      listItemProps={props.listItemProps}
    />
  );
};

const PreviewItem = Object.assign(PreviewItemBase, {
  Sortable: PreviewItemSortable,
});

export default PreviewItem;
