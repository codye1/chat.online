import type { IReactorsList } from "@components/ModalManager/Modals/ReactorsList/ReactorsList";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@utils/types";

type AvailableModals =
  | { type: "profileView"; user: User }
  | { type: "editProfile"; user: User }
  | { type: "reactorsList"; props: IReactorsList };

interface GlobalState {
  conversationId: string | null;
  recipientId: string | null;
  editingMessage: { id: string; text: string } | null;
  activeModal: AvailableModals | null;
}

const initialState: GlobalState = {
  conversationId: null,
  recipientId: null,
  editingMessage: null,
  activeModal: null,
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
    openModal(state, action: PayloadAction<AvailableModals>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const {
  setConversation,
  setRecipient,
  setEditingMessage,
  openModal,
  closeModal,
} = globalSlice.actions;
export default globalSlice;
