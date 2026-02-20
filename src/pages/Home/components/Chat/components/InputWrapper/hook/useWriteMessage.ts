import { useAppSelector } from "@hooks/hooks";
import socket, { sendMessage } from "@utils/socket";
import { useEffect, useRef, useState } from "react";

const useWriteMessage = () => {
  const [message, setMessage] = useState("");
  const { nickname } = useAppSelector((state) => state.auth.user);
  const typingTimeoutRef = useRef<number | null>(null);

  const { conversationId, recipientId } = useAppSelector(
    (state) => state.global,
  );

  useEffect(() => {
    if (!conversationId && !recipientId) return;

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
  }, [conversationId, recipientId, message, nickname]);

  const handleWriteMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    socket.emit("typing:start", { conversationId, nickname });
    setMessage(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("typing:stop", { conversationId, nickname });
    }, 1000);
  };

  const onSendMessage = () => {
    if (message.trim()) {
      sendMessage({ conversationId, recipientId, text: message });
      setMessage("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit("typing:stop", { conversationId, nickname });
      }
    }
  };

  return { message, handleWriteMessage, onSendMessage };
};

export default useWriteMessage;
