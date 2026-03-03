import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { closeModal, openModal } from "@redux/global";
import EditProfileModal from "./Modals/EditProfileModal/EditProfileModal";
import ProfileViewModal from "./Modals/ProfileViewModal/ProfileViewModal";
import ReactorsList from "./Modals/ReactorsList/ReactorsList";

const ModalManager = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.global.activeModal);

  const onClose = () => dispatch(closeModal());

  if (!modal) return null;

  switch (modal.type) {
    case "profileView":
      return (
        <ProfileViewModal
          user={modal.user}
          onClickClose={onClose}
          onClickOutside={onClose}
          onClickEdit={() => {
            dispatch(openModal({ type: "editProfile", user: modal.user }));
          }}
        />
      );

    case "editProfile":
      return (
        <EditProfileModal
          user={modal.user}
          onClickClose={onClose}
          onClickOutside={onClose}
          onClickBack={onClose}
        />
      );
    case "reactorsList":
      return (
        <ReactorsList
          messageId={modal.props.messageId}
          conversationId={modal.props.conversationId}
          groupedReactions={modal.props.groupedReactions}
        />
      );
    default:
      return null;
  }
};

export default ModalManager;
