import InputWithLabel from "@components/InputWithLabel/InputWithLabel";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import styles from "./EditFolder.module.css";
import type { Folder } from "@utils/types";
import Button from "@components/Button/Button";
import { useState } from "react";
import { useRenameFolderMutation } from "@api/slices/Chat/chatSlice";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import { updateConversationsState } from "@api/slices/helpers/ConversationsManage";
import getErorMessage from "@utils/helpers/getErrorMessage";
interface IEditFolder {
  folder: Folder;
}

const EditFolder = ({ folder }: IEditFolder) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(folder.title);
  const [renameFolder, { isLoading, error }] = useRenameFolderMutation();
  return (
    <Modal
      onClickOutside={() => {
        dispatch(closeModal());
      }}
      closeButton
    >
      <MenuContent className={styles.content}>
        <h2>Edit folder</h2>
        <InputWithLabel
          label="Folder name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          name="title"
          errors={getErorMessage(error)}
        />

        <Button
          onClick={async () => {
            await renameFolder({ folderId: folder.id, newTitle: title });
            updateConversationsState((state) => {
              const folderToUpdate = state.folders.find(
                (f) => f.id === folder.id,
              );
              if (folderToUpdate) {
                folderToUpdate.title = title;
              }
            });
            dispatch(closeModal());
          }}
          disabled={title === folder.title || title.trim() === ""}
          isLoading={isLoading}
        >
          Save
        </Button>
      </MenuContent>
    </Modal>
  );
};

export default EditFolder;
export type { IEditFolder };
