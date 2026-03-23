import { useAppSelector } from "@hooks/hooks";
import EditProfileModal from "./Modals/EditProfileModal/EditProfileModal";
import ProfileViewModal from "./Modals/ProfileViewModal/ProfileViewModal";
import ReactorsInfo from "./Modals/ReactorsInfo/ReactorsInfo";
import CreateFolderModal from "./Modals/CreateFolderModal/CreateFolderModal";
import PreUploadMediaPreview from "./Modals/PreUploadMediaPreview/PreUploadMediaPreview";
import Lightbox from "./Modals/Lightbox/Lightbox";
import ErrorModal from "./Modals/ErrorModal/ErrorModal";
import EditFolder from "./Modals/EditFolder/EditFolder";

const ModalManager = () => {
  const modal = useAppSelector((state) => state.global.activeModal);

  if (!modal) return null;

  switch (modal.type) {
    case "profileView":
      return <ProfileViewModal user={modal.props.user} />;
    case "editProfile":
      return <EditProfileModal />;
    case "reactorsInfo":
      return (
        <ReactorsInfo
          messageId={modal.props.messageId}
          conversationId={modal.props.conversationId}
          groupedReactions={modal.props.groupedReactions}
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
      return <ErrorModal title={modal.title} message={modal.message} />;
    case "editFolder":
      return <EditFolder folder={modal.folder} />;
    default:
      return null;
  }
};

export default ModalManager;
