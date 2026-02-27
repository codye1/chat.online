import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface GlobalState {
  conversationId: string | null;
  recipientId: string | null;
  editingMessage: { id: string; text: string } | null;
}

const initialState: GlobalState = {
  conversationId: null,
  recipientId: null,
  editingMessage: null,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setConversation(
      state,
      action: PayloadAction<{ conversationId: string | null }>,
    ) {
      state.conversationId = action.payload.conversationId;
      state.recipientId = null;
      state.editingMessage = null;
    },
    setRecipient(state, action: PayloadAction<{ recipientId: string | null }>) {
      state.recipientId = action.payload.recipientId;
      state.conversationId = null;
      state.editingMessage = null;
    },
    setEditingMessage(
      state,
      action: PayloadAction<{ id: string; text: string } | null>,
    ) {
      state.editingMessage = action.payload;
    },
  },
});

export const { setConversation, setRecipient, setEditingMessage } =
  globalSlice.actions;
export default globalSlice;
