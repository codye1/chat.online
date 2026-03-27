import { useAppSelector } from "@hooks/hooks";
import EditProfileModal from "./Modals/EditProfileModal/EditProfileModal";
import ProfileViewModal from "./Modals/ProfileViewModal/ProfileViewModal";
import ReactorsInfo from "./Modals/ReactorsInfo/ReactorsInfo";
import CreateFolderModal from "./Modals/CreateFolderModal/CreateFolderModal";
import PreUploadMediaPreview from "./Modals/PreUploadMediaPreview/PreUploadMediaPreview";
import Lightbox from "./Modals/Lightbox/Lightbox";
import ErrorModal from "./Modals/ErrorModal/ErrorModal";
import EditFolder from "./Modals/EditFolder/EditFolder";
import CreateGroupModal from "./Modals/CreateGroupModal/CreateGroupModal";
import OtherUserModal from "./Modals/OtherUserModal/OtherUserModal";
import GroupInfo from "./Modals/GroupInfo/GroupInfo";
import WarningModal from "./Modals/WarningModal/WarningModal";
import AddParticipants from "./Modals/AddParticipants/AddParticipants";

const ModalManager = () => {
  const modalStack = useAppSelector((state) => state.global.modalStack);
  const modal = modalStack[modalStack.length - 1];

  const canGoBack = modalStack.length > 1;
  if (!modal) return null;

  switch (modal.type) {
    case "profileView":
      return <ProfileViewModal user={modal.props.user} />;
    case "editProfile":
      return <EditProfileModal canGoBack={canGoBack} />;
    case "reactorsInfo":
      return (
        <ReactorsInfo
          messageId={modal.props.messageId}
          conversationId={modal.props.conversationId}
          groupedReactions={modal.props.groupedReactions}
          canGoBack={canGoBack}
        />
      );
    case "createFolder":
      return (
        <CreateFolderModal selectedConversation={modal.selectedConversation} />
      );
    case "preUploadMediaPreview":
      return (
        <PreUploadMediaPreview
          files={modal.files}
          initialCaption={modal.initialCaption}
        />
      );
    case "lightbox":
      return <Lightbox media={modal.media} />;
    case "error":
      return (
        <ErrorModal
          title={modal.title}
          message={modal.message}
          canGoBack={canGoBack}
        />
      );
    case "warning":
      return (
        <WarningModal
          title={modal.title}
          message={modal.message}
          canGoBack={canGoBack}
          onContinue={modal.onContinue}
        />
      );
    case "editFolder":
      return <EditFolder folder={modal.folder} />;
    case "createGroup":
      return <CreateGroupModal />;
    case "otherUser":
      return (
        <OtherUserModal userPreview={modal.userPreview} canGoBack={canGoBack} />
      );
    case "groupInfo":
      return <GroupInfo initialConversation={modal.initialConversation} />;
    case "addParticipants":
      return (
        <AddParticipants
          conversation={modal.conversation}
          canGoBack={canGoBack}
          usersInConversation={modal.usersInConversation}
        />
      );
    default:
      return null;
  }
};

export default ModalManager;
