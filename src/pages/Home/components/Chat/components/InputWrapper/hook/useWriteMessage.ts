import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { setReplyMessage } from "@redux/global";
import socket, { sendMessage } from "@utils/socket";
import { useRef, useState, type KeyboardEvent } from "react";

const useWriteMessage = () => {
  const [message, setMessage] = useState("");
  const { nickname } = useAppSelector((state) => state.auth.user);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const { conversationId, replyMessage } = useAppSelector(
    (state) => state.global,
  );

  const dispatch = useAppDispatch();

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
    if (!conversationId) return;
    if (e.key === "Enter" && message.trim()) {
      sendMessage({
        conversationId,
        text: message,
        replyToMessageId: replyMessage?.id,
      });
      dispatch(setReplyMessage(null));
      setMessage("");
      clearTimeout(typingTimeoutRef.current!);
      stopTyping();
    }
  };

  const handleWriteMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!conversationId) return;

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
    if (!conversationId) return;

    if (message.trim()) {
      sendMessage({
        conversationId,
        text: message,
        replyToMessageId: replyMessage?.id,
      });
      dispatch(setReplyMessage(null));
      setMessage("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping();
      }
    }
  };

  return {
    message,
    handleWriteMessage,
    onSendMessage,
    handleEnterKey,
    replyMessage,
  };
};

export default useWriteMessage;
