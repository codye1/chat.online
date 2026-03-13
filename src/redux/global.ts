import type { ICreateFolderModal } from "@components/ModalManager/Modals/CreateFolderModal/CreateFolderModal";
import type { IProfileViewModal } from "@components/ModalManager/Modals/ProfileViewModal/ProfileViewModal";
import type { IReactorsInfo } from "@components/ModalManager/Modals/ReactorsInfo/ReactorsInfo";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ReplyMessage } from "@utils/types";

type AvailableModals =
  | { type: "profileView"; props: IProfileViewModal }
  | { type: "editProfile" }
  | { type: "reactorsInfo"; props: IReactorsInfo }
  | (ICreateFolderModal & { type: "createFolder" });

interface EditMessage {
  id: string;
  text: string;
}

interface GlobalState {
  conversationId: string | null;
  recipientId: string | null;
  editingMessage: EditMessage | null;
  replyMessage: ReplyMessage | null;
  activeModal: AvailableModals | null;
}

const initialState: GlobalState = {
  conversationId: null,
  recipientId: null,
  editingMessage: null,
  replyMessage: null,
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
    setEditingMessage(state, action: PayloadAction<EditMessage | null>) {
      state.editingMessage = action.payload;
      state.replyMessage = null;
    },
    setReplyMessage(state, action: PayloadAction<ReplyMessage | null>) {
      state.editingMessage = null;
      state.replyMessage = action.payload;
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
  setReplyMessage,
  openModal,
  closeModal,
} = globalSlice.actions;
export default globalSlice;
