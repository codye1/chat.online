import { useAppSelector } from "@hooks/hooks";
import socket, { sendMessage } from "@utils/socket";
import { useRef, useState, type KeyboardEvent } from "react";

const useWriteMessage = () => {
  const [message, setMessage] = useState("");
  const { nickname } = useAppSelector((state) => state.auth.user);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  const { conversationId, recipientId } = useAppSelector(
    (state) => state.global,
  );

  const startTyping = () => {
    if (!conversationId) return;
    socket.emit("activity:start", {
      conversationId,
      nickname,
      reason: "typing",
    });
    isTypingRef.current = true;
  };

  const stopTyping = () => {
    if (!conversationId) return;
    socket.emit("activity:stop", { conversationId, nickname });
    isTypingRef.current = false;
  };

  const handleEnterKey = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!conversationId && !recipientId) return;
    if (e.key === "Enter" && message.trim()) {
      sendMessage({ conversationId, recipientId, text: message });
      setMessage("");
      clearTimeout(typingTimeoutRef.current!);
      stopTyping();
    }
  };

  const handleWriteMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!conversationId && !recipientId) return;

    if (!isTypingRef.current) {
      startTyping();
    }
    setMessage(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = window.setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const onSendMessage = () => {
    if (!conversationId && !recipientId) return;

    if (message.trim()) {
      sendMessage({ conversationId, recipientId, text: message });
      setMessage("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping();
      }
    }
  };

  return { message, handleWriteMessage, onSendMessage, handleEnterKey };
};

export default useWriteMessage;
