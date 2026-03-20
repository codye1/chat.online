import styles from "./WriteMessage.module.css";
import Button from "@components/Button/Button";
import sendIcon from "@assets/send.svg";
import useWriteMessage from "../../hook/useWriteMessage";
import InputHeader from "../InputHeader/InputHeader";
import replyIcon from "@assets/reply.svg";
import { useAppDispatch } from "@hooks/hooks";
import { openModal, setReplyMessage } from "@redux/global";
import Textarea from "@components/Textarea/Textarea";
import clipIcon from "@assets/clip.svg";
import { useRef, useState } from "react";
import Popover from "@components/Popover/Popover";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import MenuItem from "@components/MenuConstructor/MenuItem/MenuItem";
import photo from "@assets/photo.svg";
import InputFile from "@components/InputFile";
import clsx from "clsx";
let timeoutId: number;

const WriteMessage = () => {
  const {
    message,
    handleWriteMessage,
    onSendMessage,
    handleEnterKey,
    replyMessage,
    setMessage,
  } = useWriteMessage();
  const dispatch = useAppDispatch();
  const clipButtonRef = useRef<HTMLButtonElement>(null);
  const [showPopover, setShowPopover] = useState(false);
  return (
    <div className={styles.inputContainer}>
      {replyMessage && (
        <InputHeader
          icon={replyIcon}
          label="Replying to message"
          description={replyMessage.text}
          onCancel={() => {
            dispatch(setReplyMessage(null));
          }}
        />
      )}
      <div className={styles.textareaContainer}>
        <Textarea
          trackValue={{
            value: message,
            onChange: handleWriteMessage,
          }}
          onKeyDown={handleEnterKey}
          placeholder="Type your message..."
          name="message"
          className={styles.textarea}
        />
        <Button
          className={clsx(styles.buttonIcon, styles.clip)}
          ref={clipButtonRef}
          onMouseEnter={() => {
            clearTimeout(timeoutId);
            setShowPopover(true);
          }}
          onMouseLeave={() => {
            timeoutId = window.setTimeout(() => setShowPopover(false), 200);
          }}
        >
          <img src={clipIcon} alt="Clip" className={styles.sendIcon} />
          <Popover
            anchorRef={clipButtonRef}
            isOpen={showPopover}
            onClose={() => setShowPopover(false)}
            placement="top"
          >
            <MenuContent>
              <MenuItem label="Photo and Video" icon={photo}>
                <InputFile
                  allow={["image", "video"]}
                  multiple
                  onLoaded={(files) => {
                    dispatch(
                      openModal({
                        type: "preUploadMediaPreview",
                        files,
                        initialCaption: message,
                      }),
                    );
                    setShowPopover(false);
                    setMessage("");
                  }}
                />
              </MenuItem>
            </MenuContent>
          </Popover>
        </Button>
      </div>
      <Button
        className={styles.buttonIcon}
        onClick={onSendMessage}
        disabled={!message.trim()}
      >
        <img src={sendIcon} alt="Send" />
      </Button>
    </div>
  );
};

export default WriteMessage;
