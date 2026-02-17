import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface GlobalState {
  conversationId: string | null;
  recipientId: string | null;
  connected: boolean;
}

const initialState: GlobalState = {
  conversationId: null,
  recipientId: null,
  connected: false,
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
      console.log("Change conversation " + action.payload.conversationId);
      state.recipientId = null;
    },
    setRecipient(state, action: PayloadAction<{ recipientId: string | null }>) {
      state.recipientId = action.payload.recipientId;
      state.conversationId = null;
      console.log("Change reciptient " + action.payload.recipientId);
    },
    setConnected(state, action: PayloadAction<{ connected: boolean }>) {
      state.connected = action.payload.connected;
    },
  },
});

export const { setConversation, setRecipient } = globalSlice.actions;
export default globalSlice;
