import { useCallback, type LiHTMLAttributes, type Ref } from "react";
import styles from "./FoldersListItem.module.css";
import clsx from "clsx";
import { useSortable } from "@dnd-kit/react/sortable";

interface IFoldersListItemBase {
  activeFolder: string;
  folder: {
    id: string;
    title: string;
  };
  onFolderClick: (folderId: string) => void;
  listItemProps?: LiHTMLAttributes<HTMLLIElement>;
  listItemRef?: Ref<HTMLLIElement>;
}

interface IFoldersListItemSortable extends IFoldersListItemBase {
  id: string;
  index: number;
  group: string;
}

const FoldersListItemBase = ({
  activeFolder,
  folder,
  onFolderClick,
  listItemProps,
  listItemRef,
}: IFoldersListItemBase) => {
  const { className, ...restListItemProps } = listItemProps ?? {};
  return (
    <li
      ref={listItemRef}
      className={clsx(
        styles.folder,
        { [styles.active]: activeFolder === folder.id },
        className,
      )}
      onClick={() => onFolderClick(folder.id)}
      {...restListItemProps}
    >
      {folder.title}
    </li>
  );
};

const FoldersListItemSortable = ({
  id,
  index,
  group,
  ...props
}: IFoldersListItemSortable) => {
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
    <FoldersListItemBase
      {...props}
      listItemRef={setRefs}
      listItemProps={props.listItemProps}
    />
  );
};

const FoldersListItem = Object.assign(FoldersListItemBase, {
  Sortable: FoldersListItemSortable,
});

export default FoldersListItem;
