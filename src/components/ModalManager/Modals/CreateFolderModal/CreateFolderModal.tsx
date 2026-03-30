import InputWithLabel from "@components/InputWithLabel/InputWithLabel";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import { useState } from "react";
import styles from "./CreateFolderModal.module.css";
import Button from "@components/Button/Button";
import {
  useCreateFolderMutation,
  useConversationsQuery,
} from "@api/slices/Chat/chatSlice";

interface ICreateFolderModal {
  selectedConversation?: string;
}

const CreateFolderModal = ({ selectedConversation }: ICreateFolderModal) => {
  const dispatch = useAppDispatch();
  const [createFolder, { isLoading, error }] = useCreateFolderMutation();
  const [title, setTitle] = useState("");
  const { data: conversationsState } = useConversationsQuery();
  return (
    <Modal onClickOutside={() => dispatch(closeModal())}>
      <MenuContent className={styles.content}>
        <form>
          <h2>Create Folder</h2>
          <InputWithLabel
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            name="folder.title"
          />
        </form>
        <div className={styles.twoButtons}>
          <Button onClick={() => dispatch(closeModal())}>Cancel</Button>
          <Button
            onClick={async () => {
              await createFolder({
                title: title,
                conversations: selectedConversation
                  ? [selectedConversation]
                  : [],
                position: conversationsState.folders.length,
              });

              dispatch(closeModal());
            }}
            disabled={title.trim().length === 0}
            isLoading={isLoading}
          >
            Create
          </Button>
        </div>
        {error && (
          <div className={styles.error}>
            Error creating folder. Please try again.
          </div>
        )}
      </MenuContent>
    </Modal>
  );
};

export default CreateFolderModal;
export type { ICreateFolderModal };
