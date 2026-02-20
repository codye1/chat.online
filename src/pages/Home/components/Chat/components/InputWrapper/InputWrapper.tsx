import Input from "@components/Input/Input";
import styles from "./InputWrapper.module.css";
import Button from "@components/Button/Button";
import sendIcon from "@assets/send.svg";
import useWriteMessage from "./hook/useWriteMessage";

const InputWrapper = () => {
  const { message, handleWriteMessage, onSendMessage } = useWriteMessage();

  return (
    <span className={styles.inputWrapper}>
      <Input
        name="message"
        type="text"
        placeholder="Type a message..."
        trackValue={{
          value: message,
          onChange: handleWriteMessage,
        }}
      />
      <Button onClick={onSendMessage} disabled={!message.trim()}>
        <img className={styles.sendIcon} src={sendIcon} alt="Send" />
      </Button>
    </span>
  );
};

export default InputWrapper;
