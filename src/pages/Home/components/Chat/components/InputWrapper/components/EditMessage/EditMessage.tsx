import useEditMessage from "../../hook/useEditMessage";
import styles from "./EditMessage.module.css";
import checkIcon from "@assets/check.svg";
import Button from "@components/Button/Button";
import editIcon from "@assets/edit.svg";
import { useAppDispatch } from "@hooks/hooks";
import InputHeader from "../InputHeader/InputHeader";
import Textarea from "@components/Textarea/Textarea";
import editMediaIcon from "@assets/change.svg";
import clsx from "clsx";
import { openModal, setMessageToEdit, type MessageToEdit } from "@redux/global";
import Popover from "@components/Popover/Popover";
import { useRef, useState } from "react";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import MenuItem from "@components/MenuConstructor/MenuItem/MenuItem";
import photoIcon from "@assets/photo.svg";
import InputFile from "@components/InputFile/InputFile";
import clipIcon from "@assets/clip.svg";

let timeoutId: number;
const EditMessage = ({
  messageToEdit,
  nickname,
  conversationId,
}: {
  messageToEdit: MessageToEdit;
  nickname: string;
  conversationId: string;
}) => {
  const {
    editingValue,
    handleEditingValue,
    onConfirmEdit,
    handleEnterKey,
    setEditingValue,
  } = useEditMessage({ messageToEdit, nickname, conversationId });
  const dispatch = useAppDispatch();

  const [showPopover, setShowPopover] = useState(false);
  const editMediaButtonRef = useRef<HTMLButtonElement>(null);

  const onCancelEdit = () => {
    dispatch(setMessageToEdit(null));
  };

  return (
    <div className={styles.inputContainer}>
      <InputHeader
        icon={editIcon}
        label="Edit Message"
        description={messageToEdit.text}
        onCancel={onCancelEdit}
      />
      <div className={styles.textareaContainer}>
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

        <Button
          className={clsx(styles.buttonIcon, styles.mediaButton)}
          ref={editMediaButtonRef}
          onMouseEnter={() => {
            clearTimeout(timeoutId);
            setShowPopover(true);
          }}
          onMouseLeave={() => {
            timeoutId = window.setTimeout(() => setShowPopover(false), 200);
          }}
        >
          {messageToEdit.mediaToEdit ? (
            <img src={editMediaIcon} alt="Edit media" />
          ) : (
            <img src={clipIcon} alt="Add media" />
          )}
          <Popover
            anchorRef={editMediaButtonRef}
            isOpen={showPopover}
            onClose={() => setShowPopover(false)}
            placement="top"
          >
            <MenuContent>
              <MenuItem label="Photo and Video" icon={photoIcon}>
                <InputFile
                  allow={["image", "video"]}
                  multiple
                  onLoaded={(files) => {
                    dispatch(
                      openModal({
                        type: "preUploadMediaPreview",
                        files,
                        initialCaption: editingValue,
                      }),
                    );
                    setShowPopover(false);
                    setEditingValue("");
                  }}
                />
              </MenuItem>
            </MenuContent>
          </Popover>
        </Button>
      </div>
      <Button
        onClick={onConfirmEdit}
        disabled={!editingValue.trim() || editingValue === messageToEdit.text}
        className={styles.buttonIcon}
      >
        <img src={checkIcon} alt="Check" />
      </Button>
    </div>
  );
};

export default EditMessage;
