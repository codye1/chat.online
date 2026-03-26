import type { ICreateFolderModal } from "@components/ModalManager/Modals/CreateFolderModal/CreateFolderModal";
import type { IProfileViewModal } from "@components/ModalManager/Modals/ProfileViewModal/ProfileViewModal";
import type { IReactorsInfo } from "@components/ModalManager/Modals/ReactorsInfo/ReactorsInfo";
import type { IPreUploadMediaPreview } from "@components/ModalManager/Modals/PreUploadMediaPreview/PreUploadMediaPreview";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message, MessageMedia, ReplyMessage } from "@utils/types";
import type { ILightbox } from "@components/ModalManager/Modals/Lightbox/Lightbox";
import type { IErrorModal } from "@components/ModalManager/Modals/ErrorModal/ErrorModal";
import type { IEditFolder } from "@components/ModalManager/Modals/EditFolder/EditFolder";
import type { IOtherUserModal } from "@components/ModalManager/Modals/OtherUserModal/OtherUserModal";
import type { IGroupInfo } from "@components/ModalManager/Modals/GroupInfo/GroupInfo";
import type { IWarningModal } from "@components/ModalManager/Modals/WarningModal/WarningModal";

type AvailableModals =
  | { type: "profileView"; props: IProfileViewModal }
  | { type: "editProfile" }
  | { type: "reactorsInfo"; props: IReactorsInfo }
  | (ICreateFolderModal & { type: "createFolder" })
  | (IPreUploadMediaPreview & { type: "preUploadMediaPreview" })
  | (ILightbox & { type: "lightbox" })
  | (IErrorModal & { type: "error" })
  | (IEditFolder & { type: "editFolder" })
  | { type: "createGroup" }
  | (IOtherUserModal & { type: "otherUser" })
  | (IGroupInfo & { type: "groupInfo" })
  | (IWarningModal & { type: "warning" });

type MessageToEdit = Message & { mediaToEdit?: MessageMedia };

interface GlobalState {
  conversationId: string | null;
  recipientId: string | null;
  messageToEdit: MessageToEdit | null;
  replyMessage: ReplyMessage | null;
  modalStack: AvailableModals[];
}

const initialState: GlobalState = {
  conversationId: null,
  recipientId: null,
  messageToEdit: null,
  replyMessage: null,
  modalStack: [],
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
      state.modalStack = [action.payload];
    },
    pushModal(state, action: PayloadAction<AvailableModals>) {
      state.modalStack.push(action.payload);
    },
    popModal(state) {
      state.modalStack.pop();
    },
    closeModal(state) {
      state.modalStack = [];
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
  pushModal,
  popModal,
} = globalSlice.actions;

export type { AvailableModals, MessageToEdit, GlobalState };

export default globalSlice;
