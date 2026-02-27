import { useAppDispatch } from "@hooks/hooks";
import { setEditingMessage } from "@redux/global";
import socket, { editMessage } from "@utils/socket";
import { useRef, useState, type KeyboardEvent } from "react";

const useEditMessage = ({
  editingMessage,
  nickname,
  conversationId,
}: {
  editingMessage: { id: string; text: string };
  nickname: string;
  conversationId: string;
}) => {
  const [editingValue, setEditingValue] = useState(editingMessage.text);
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

  const stopEditing = () => {
    if (!conversationId) return;
    socket.emit("activity:stop", { conversationId, nickname });
    isEditingRef.current = false;
  };

  const handleEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && editingValue.trim()) {
      editMessage({
        newText: editingValue,
        messageId: editingMessage.id,
        conversationId,
      });
      dispatch(setEditingMessage(null));
      setEditingValue("");
      clearTimeout(editingTimeoutRef.current!);
      stopEditing();
    }
  };

  const handleEditingValue = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        messageId: editingMessage.id,
        conversationId,
      });
      setEditingValue("");
      dispatch(setEditingMessage(null));
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current);
        stopEditing();
      }
    }
  };

  return { editingValue, handleEditingValue, onConfirmEdit, handleEnterKey };
};

export default useEditMessage;
