import Input from "@components/Input/Input";
import styles from "./InputWrapper.module.css";
import Button from "@components/Button/Button";
import { sendMessage } from "@utils/socket";
import { useState } from "react";
import sendIcon from "@assets/send.svg";
import { useAppSelector } from "@hooks/hooks";

const InputWrapper = () => {
  const [message, setMessage] = useState("");
  const { conversationId, recipientId } = useAppSelector(
    (state) => state.global,
  );

  return (
    <span className={styles.inputWrapper}>
      <Input
        name="message"
        type="text"
        placeholder="Type a message..."
        trackValue={{
          value: message,
          onChange: (e) => setMessage(e.target.value),
        }}
      />
      <Button
        onClick={() => {
          sendMessage({ conversationId, recipientId, text: message });
          setMessage("");
        }}
        disabled={!message.trim()}
      >
        <img className={styles.sendIcon} src={sendIcon} alt="Send" />
      </Button>
    </span>
  );
};

export default InputWrapper;
