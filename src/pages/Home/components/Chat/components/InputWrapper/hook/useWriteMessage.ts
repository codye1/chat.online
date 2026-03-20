import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { setReplyMessage } from "@redux/global";
import sendMessage from "@utils/socket/actions/messageActions/sendMessage";
import socket from "@utils/socket/socket";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

const useWriteMessage = () => {
  const [message, setMessage] = useState("");
  const { nickname } = useAppSelector((state) => state.auth.user);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const conversationId = useAppSelector((state) => state.global.conversationId);
  const recipientId = useAppSelector((state) => state.global.recipientId);
  const replyMessage = useAppSelector((state) => state.global.replyMessage);
  const id = conversationId || `tempId:${recipientId}`;

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

  const stopTyping = useMemo(
    () => () => {
      if (!conversationId) return;
      socket.emit("activity:stop", { conversationId, nickname });
      isTypingRef.current = false;
    },
    [conversationId, nickname],
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current && isTypingRef.current) {
        clearTimeout(typingTimeoutRef.current);
        stopTyping();
      }
    };
  }, [conversationId, nickname, stopTyping]);

  const handleEnterKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!conversationId && !recipientId) return;
    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
      e.preventDefault();
      sendMessage({
        conversationId: id,
        text: message,
        replyToMessageId: replyMessage?.id,
      });
      dispatch(setReplyMessage(null));
      setMessage("");
      clearTimeout(typingTimeoutRef.current!);
      stopTyping();
    }
  };

  const handleWriteMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      sendMessage({
        conversationId: id,
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
    setMessage,
  };
};

export default useWriteMessage;
