import type { LoadedFile } from "@components/InputFile";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import styles from "./PreUploadMediaPreview.module.css";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { closeModal } from "@redux/global";
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
import { sendMessage } from "@utils/socket";

interface IPreUploadMediaPreview {
  files: LoadedFile[];
}

const PreUploadMediaPreview = ({ files }: IPreUploadMediaPreview) => {
  const dispatch = useAppDispatch();
  const [caption, setCaption] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const optionsAnchorRef = useRef<HTMLButtonElement>(null);
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>(files);
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const { conversationId } = useAppSelector((state) => state.global);

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
            <h2>Send media</h2>
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
            className={styles.sendButton}
            isLoading={isUploading}
            disabled={isUploading || loadedFiles.length === 0}
            onClick={() => {
              uploadMedia(loadedFiles.map((f) => f.file))
                .unwrap()
                .then((results) => {
                  sendMessage({
                    conversationId: conversationId!,
                    text: caption,
                    media: results,
                  });
                  dispatch(closeModal());
                });
            }}
          >
            Send
          </Button>
        </div>
      </MenuContent>
    </Modal>
  );
};

export default PreUploadMediaPreview;
export type { IPreUploadMediaPreview };
