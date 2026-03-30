import Modal from "@components/Modal/Modal";
import type { User } from "@utils/types";
import styles from "./ProfileViewModal.module.css";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal, pushModal } from "@redux/global";
import getDisplayName from "@utils/helpers/getDisplayName";
import ViewHeader from "@components/ViewModalConstructor/ViewHeader/ViewHeader";
import ViewControls from "@components/ViewModalConstructor/ViewControls/ViewControls";
import ViewBody from "@components/ViewModalConstructor/ViewBody/ViewBody";
import ViewDetail from "@components/ViewModalConstructor/ViewDetail/ViewDetail";
import Avatar from "@components/Avatar/Avatar";

interface IProfileViewModal {
  user: User;
}

const ProfileViewModal = ({ user }: IProfileViewModal) => {
  const dispatch = useAppDispatch();

  return (
    <Modal onClickOutside={() => dispatch(closeModal())}>
      <ViewHeader>
        <ViewControls
          onClose={() => dispatch(closeModal())}
          onEdit={() => dispatch(pushModal({ type: "editProfile" }))}
        />
        <Avatar avatarUrl={user.avatarUrl} width={"100px"} height={"100px"} />
        <h2>{getDisplayName(user)}</h2>
      </ViewHeader>
      <ViewBody className={styles.profileModalBody}>
        {user.biography && (
          <ViewDetail label="biography" value={user.biography} />
        )}
        <ViewDetail label="email" value={user.email} link />
        <ViewDetail label="nickname" value={user.nickname} link />
      </ViewBody>
    </Modal>
  );
};

export default ProfileViewModal;
export type { IProfileViewModal };
