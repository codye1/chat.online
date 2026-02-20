import { useAppSelector } from "@hooks/hooks";
import socket, { sendMessage } from "@utils/socket";
import { useEffect, useRef, useState } from "react";

const useWriteMessage = () => {
  const [message, setMessage] = useState("");
  const { nickname } = useAppSelector((state) => state.auth.user);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  const { conversationId, recipientId } = useAppSelector(
    (state) => state.global,
  );

  useEffect(() => {
    if (!conversationId && !recipientId) return;

    const stopTyping = () => {
      socket.emit("typing:stop", { conversationId, nickname });
      isTypingRef.current = false;
    };

    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && message.trim()) {
        sendMessage({ conversationId, recipientId, text: message });
        setMessage("");
        clearTimeout(typingTimeoutRef.current!);
        stopTyping();
      }
    };
    window.addEventListener("keydown", handleEnterKey);
    return () => {
      window.removeEventListener("keydown", handleEnterKey);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping();
      }
    };
  }, [conversationId, recipientId, message, nickname]);

  const handleWriteMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!conversationId && !recipientId) return;

    if (!isTypingRef.current) {
      socket.emit("typing:start", { conversationId, nickname });
      isTypingRef.current = true;
    }
    setMessage(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("typing:stop", { conversationId, nickname });
      isTypingRef.current = false;
    }, 1000);
  };

  const onSendMessage = () => {
    if (!conversationId && !recipientId) return;

    if (message.trim()) {
      sendMessage({ conversationId, recipientId, text: message });
      setMessage("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit("typing:stop", { conversationId, nickname });
        isTypingRef.current = false;
      }
    }
  };

  return { message, handleWriteMessage, onSendMessage };
};

export default useWriteMessage;
