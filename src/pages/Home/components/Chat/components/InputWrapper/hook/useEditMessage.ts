import { useAppDispatch } from "@hooks/hooks";
import { setMessageToEdit } from "@redux/global";
import editMessage from "@utils/socket/actions/messageActions/editMessage";
import socket from "@utils/socket/socket";
import type { Message } from "@utils/types";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

const useEditMessage = ({
  messageToEdit,
  nickname,
  conversationId,
}: {
  messageToEdit: Message;
  nickname: string;
  conversationId: string;
}) => {
  const [editingValue, setEditingValue] = useState(messageToEdit.text);
  const editingTimeoutRef = useRef<number | null>(null);
  const isEditingRef = useRef(false);
  const dispatch = useAppDispatch();

  const startEditing = () => {
    if (!conversationId) return;
    socket.emit("activity:start", {
      conversationId,
      nickname,
      reason: "editing",
    });
    isEditingRef.current = true;
  };

  const stopEditing = useMemo(
    () => () => {
      if (!conversationId) return;
      socket.emit("activity:stop", { conversationId, nickname });
      isEditingRef.current = false;
    },
    [conversationId, nickname],
  );

  const handleEnterKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && editingValue.trim()) {
      e.preventDefault();
      editMessage({
        newText: editingValue,
        messageId: messageToEdit.id,
        conversationId,
      });
      dispatch(setMessageToEdit(null));
      setEditingValue("");
      clearTimeout(editingTimeoutRef.current!);
      stopEditing();
    }
  };

  const handleEditingValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!conversationId) return;

    if (!isEditingRef.current) {
      startEditing();
    }
    setEditingValue(e.target.value);
    if (editingTimeoutRef.current) clearTimeout(editingTimeoutRef.current);

    editingTimeoutRef.current = window.setTimeout(() => {
      stopEditing();
    }, 1000);
  };

  const onConfirmEdit = () => {
    if (!conversationId) return;

    if (editingValue.trim()) {
      editMessage({
        newText: editingValue,
        messageId: messageToEdit.id,
        conversationId,
      });
      setEditingValue("");
      dispatch(setMessageToEdit(null));
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current);
        stopEditing();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (editingTimeoutRef.current && isEditingRef.current) {
        clearTimeout(editingTimeoutRef.current);
        stopEditing();
      }
    };
  }, [conversationId, nickname, stopEditing]);

  return {
    editingValue,
    handleEditingValue,
    onConfirmEdit,
    handleEnterKey,
    setEditingValue,
  };
};

export default useEditMessage;
