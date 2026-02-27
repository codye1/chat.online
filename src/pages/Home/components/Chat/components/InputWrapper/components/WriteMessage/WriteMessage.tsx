import Input from "@components/Input/Input";
import styles from "./WriteMessage.module.css";
import Button from "@components/Button/Button";
import sendIcon from "@assets/send.svg";
import useWriteMessage from "../../hook/useWriteMessage";

const WriteMessage = () => {
  const { message, handleWriteMessage, onSendMessage, handleEnterKey } =
    useWriteMessage();
  return (
    <>
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
    </>
  );
};

export default WriteMessage;
