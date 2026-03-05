import Input from "@components/Input/Input";
import styles from "./WriteMessage.module.css";
import Button from "@components/Button/Button";
import sendIcon from "@assets/send.svg";
import useWriteMessage from "../../hook/useWriteMessage";
import InputHeader from "../InputHeader/InputHeader";
import replyIcon from "@assets/reply.svg";
import { useAppDispatch } from "@hooks/hooks";
import { setReplyMessage } from "@redux/global";

const WriteMessage = () => {
  const {
    message,
    handleWriteMessage,
    onSendMessage,
    handleEnterKey,
    replyMessage,
  } = useWriteMessage();
  const dispatch = useAppDispatch();

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
      <Input
        name="message"
        type="text"
        placeholder="Type a message..."
        trackValue={{
          value: message,
          onChange: handleWriteMessage,
        }}
        onKeyDown={handleEnterKey}
      />
      <Button onClick={onSendMessage} disabled={!message.trim()}>
        <img className={styles.sendIcon} src={sendIcon} alt="Send" />
      </Button>
    </div>
  );
};

export default WriteMessage;
