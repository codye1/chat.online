import useEditMessage from "../../hook/useEditMessage";
import styles from "./EditMessage.module.css";
import checkIcon from "@assets/check.svg";
import Button from "@components/Button/Button";
import editIcon from "@assets/edit.svg";
import { useAppDispatch } from "@hooks/hooks";
import { setEditingMessage } from "@redux/global";
import InputHeader from "../InputHeader/InputHeader";
import Textarea from "@components/Textarea/Textarea";

const EditMessage = ({
  editingMessage,
  nickname,
  conversationId,
}: {
  editingMessage: { id: string; text: string };
  nickname: string;
  conversationId: string;
}) => {
  const { editingValue, handleEditingValue, onConfirmEdit, handleEnterKey } =
    useEditMessage({ editingMessage, nickname, conversationId });

  const dispatch = useAppDispatch();

  const onCancelEdit = () => {
    dispatch(setEditingMessage(null));
  };

  return (
    <div className={styles.inputContainer}>
      <InputHeader
        icon={editIcon}
        label="Edit Message"
        description={editingMessage.text}
        onCancel={onCancelEdit}
      />
      <div>
        <Textarea
          trackValue={{
            value: editingValue,
            onChange: handleEditingValue,
          }}
          onKeyDown={handleEnterKey}
          placeholder="Edit your message..."
          name="editedMessage"
          className={styles.textarea}
        />
      </div>
      <Button
        onClick={onConfirmEdit}
        disabled={!editingValue.trim() || editingValue === editingMessage.text}
      >
        <img className={styles.checkIcon} src={checkIcon} alt="Check" />
      </Button>
    </div>
  );
};

export default EditMessage;
