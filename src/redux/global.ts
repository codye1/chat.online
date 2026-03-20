import type { ICreateFolderModal } from "@components/ModalManager/Modals/CreateFolderModal/CreateFolderModal";
import type { IProfileViewModal } from "@components/ModalManager/Modals/ProfileViewModal/ProfileViewModal";
import type { IReactorsInfo } from "@components/ModalManager/Modals/ReactorsInfo/ReactorsInfo";
import type { IPreUploadMediaPreview } from "@components/ModalManager/Modals/PreUploadMediaPreview/PreUploadMediaPreview";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message, MessageMedia, ReplyMessage } from "@utils/types";
import type { ILightbox } from "@components/ModalManager/Modals/Lightbox/Lightbox";

type AvailableModals =
  | { type: "profileView"; props: IProfileViewModal }
  | { type: "editProfile" }
  | { type: "reactorsInfo"; props: IReactorsInfo }
  | (ICreateFolderModal & { type: "createFolder" })
  | (IPreUploadMediaPreview & { type: "preUploadMediaPreview" })
  | (ILightbox & { type: "lightbox" });

type MessageToEdit = Message & { mediaToEdit?: MessageMedia };

interface GlobalState {
  conversationId: string | null;
  recipientId: string | null;
  messageToEdit: MessageToEdit | null;
  replyMessage: ReplyMessage | null;
  activeModal: AvailableModals | null;
}

const initialState: GlobalState = {
  conversationId: null,
  recipientId: null,
  messageToEdit: null,
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
      console.log("set conversation");
      console.log(action.payload.conversationId);

      state.conversationId = action.payload.conversationId;
      state.recipientId = null;
      state.messageToEdit = null;
    },
    setRecipient(state, action: PayloadAction<{ recipientId: string | null }>) {
      console.log("set recipient");

      state.recipientId = action.payload.recipientId;
      state.conversationId = null;
      state.messageToEdit = null;
    },
    setMessageToEdit(state, action: PayloadAction<MessageToEdit | null>) {
      state.messageToEdit = action.payload;
      state.replyMessage = null;
    },
    setReplyMessage(state, action: PayloadAction<ReplyMessage | null>) {
      state.messageToEdit = null;
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
  setMessageToEdit,
  setReplyMessage,
  openModal,
  closeModal,
} = globalSlice.actions;

export type { AvailableModals, MessageToEdit, GlobalState };

export default globalSlice;
