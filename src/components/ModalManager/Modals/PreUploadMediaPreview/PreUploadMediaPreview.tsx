import type { LoadedFile } from "@components/InputFile";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import styles from "./PreUploadMediaPreview.module.css";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { closeModal, setReplyMessage } from "@redux/global";
import closeIcon from "@assets/close.svg";
import { useRef, useState } from "react";
import Textarea from "@components/Textarea/Textarea";
import Button from "@components/Button/Button";
import threePointsIcon from "@assets/threePointLeader.svg";
import Popover from "@components/Popover/Popover";
import MenuItem from "@components/MenuConstructor/MenuItem/MenuItem";
import plus from "@assets/plus.svg";
import InputFile from "@components/InputFile";
import { useUploadMediaMutation } from "@api/slices/mediaSlice";
import { editMessage, sendMessage } from "@utils/socket";

interface IPreUploadMediaPreview {
  files: LoadedFile[];
  initialCaption: string;
}

const PreUploadMediaPreview = ({
  files,
  initialCaption,
}: IPreUploadMediaPreview) => {
  const { replyMessage, messageToEdit } = useAppSelector(
    (state) => state.global,
  );
  const dispatch = useAppDispatch();
  const [caption, setCaption] = useState(initialCaption || "");
  const [showOptions, setShowOptions] = useState(false);
  const optionsAnchorRef = useRef<HTMLButtonElement>(null);
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>(files);
  const [uploadMedia, { isLoading: isUploading, error }] =
    useUploadMediaMutation();
  const { conversationId } = useAppSelector((state) => state.global);

  const onReplaceMedia = () => {
    if (messageToEdit === null) return;

    uploadMedia(loadedFiles.map((f) => f.file))
      .unwrap()
      .then((results) => {
        editMessage({
          conversationId: conversationId!,
          newText: caption,
          messageId: messageToEdit!.id,
          replaceMedia: {
            oldMediaId: messageToEdit.mediaToEdit?.id,
            newMedia: results[0],
          },
        });
        dispatch(closeModal());
        dispatch(setReplyMessage(null));
      });
  };

  const onSendMessage = () => {
    uploadMedia(loadedFiles.map((f) => f.file))
      .unwrap()
      .then((results) => {
        sendMessage({
          conversationId: conversationId!,
          text: caption,
          media: results,
          replyToMessageId: replyMessage ? replyMessage.id : undefined,
        });
        dispatch(closeModal());
        dispatch(setReplyMessage(null));
      });
  };

  return (
    <Modal
      onClickOutside={() => {
        dispatch(closeModal());
      }}
    >
      <MenuContent className={styles.content}>
        <div className={styles.header}>
          <span>
            <button
              className={styles.icon}
              onClick={() => {
                dispatch(closeModal());
              }}
            >
              <img src={closeIcon} alt="Close" />
            </button>
            {messageToEdit?.mediaToEdit ? (
              <h2>Replace media</h2>
            ) : (
              <h2>Send media</h2>
            )}
          </span>
          <button
            ref={optionsAnchorRef}
            className={styles.icon}
            onClick={() => setShowOptions((prev) => !prev)}
          >
            <img src={threePointsIcon} alt="Options" />
          </button>
          <Popover
            anchorRef={optionsAnchorRef}
            isOpen={showOptions}
            onClose={() => setShowOptions(false)}
          >
            <MenuContent>
              <MenuItem label="Add" onClick={() => {}} icon={plus}>
                <InputFile
                  allow={["image", "video"]}
                  multiple
                  onLoaded={(files) => {
                    setLoadedFiles((prev) => [...prev, ...files]);
                    setShowOptions(false);
                  }}
                />
              </MenuItem>
            </MenuContent>
          </Popover>
        </div>
        <div className={styles.mediaPreview}>
          {loadedFiles.map((file) => (
            <div key={file.src}>
              {file.type === "image" ? (
                <img src={file.src} alt="preview" />
              ) : (
                <video src={file.src} controls />
              )}
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <div className={styles.captionAndSend}>
            <div className={styles.captionInput}>
              <Textarea
                trackValue={{
                  value: caption,
                  onChange: (e) => setCaption(e.target.value),
                }}
                name="caption"
                placeholder="Add a caption..."
              />
            </div>
            <Button
              className={styles.button}
              isLoading={isUploading}
              disabled={
                isUploading || loadedFiles.length === 0 || caption.trim() === ""
              }
              onClick={messageToEdit ? onReplaceMedia : onSendMessage}
            >
              Save
            </Button>
          </div>

          {error && (
            <div className={styles.error}>
              Error uploading media. Please try again.
            </div>
          )}
        </div>
      </MenuContent>
    </Modal>
  );
};

export default PreUploadMediaPreview;
export type { IPreUploadMediaPreview };
