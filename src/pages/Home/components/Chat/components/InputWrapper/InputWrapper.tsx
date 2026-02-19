import Input from "@components/Input/Input";
import styles from "./InputWrapper.module.css";
import Button from "@components/Button/Button";
import socket, { sendMessage } from "@utils/socket";
import { useEffect, useRef, useState } from "react";
import sendIcon from "@assets/send.svg";
import { useAppSelector } from "@hooks/hooks";

const InputWrapper = () => {
  const [message, setMessage] = useState("");
  const { conversationId, recipientId } = useAppSelector(
    (state) => state.global,
  );
  const { nickname } = useAppSelector((state) => state.auth.user);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && message.trim()) {
        sendMessage({ conversationId, recipientId, text: message });
        setMessage("");
        clearTimeout(typingTimeoutRef.current!);
        socket.emit("typing:stop", { conversationId, nickname });
      }
    };
    window.addEventListener("keydown", handleEnterKey);
    return () => {
      window.removeEventListener("keydown", handleEnterKey);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit("typing:stop", { conversationId, nickname });
      }
    };
  }, [conversationId, recipientId, message]);

  return (
    <span className={styles.inputWrapper}>
      <Input
        name="message"
        type="text"
        placeholder="Type a message..."
        trackValue={{
          value: message,
          onChange: (e) => {
            socket.emit("typing:start", { conversationId, nickname });
            setMessage(e.target.value);
            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = window.setTimeout(() => {
              socket.emit("typing:stop", { conversationId, nickname });
            }, 1000);
          },
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
