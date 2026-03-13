import { useAppSelector } from "@hooks/hooks";
import EditProfileModal from "./Modals/EditProfileModal/EditProfileModal";
import ProfileViewModal from "./Modals/ProfileViewModal/ProfileViewModal";
import ReactorsInfo from "./Modals/ReactorsInfo/ReactorsInfo";
import CreateFolderModal from "./Modals/CreateFolderModal/CreateFolderModal";

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
    default:
      return null;
  }
};

export default ModalManager;
