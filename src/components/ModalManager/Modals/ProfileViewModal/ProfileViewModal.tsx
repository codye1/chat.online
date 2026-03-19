import Avatar from "@components/Avatar/Avatar";
import Modal from "@components/Modal/Modal";
import type { User } from "@utils/types";
import clsx from "clsx";
import styles from "./ProfileViewModal.module.css";
import closeIcon from "@assets/close.svg";
import edit from "@assets/edit.svg";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal, openModal } from "@redux/global";
import getDisplayName from "@utils/helpers/getDisplayName";

interface IProfileViewModal {
  user: User;
}

const ProfileViewModal = ({ user }: IProfileViewModal) => {
  const dispatch = useAppDispatch();

  return (
    <Modal onClickOutside={() => dispatch(closeModal())}>
      <div className={styles.closeIcon}>
        <button onClick={() => dispatch(openModal({ type: "editProfile" }))}>
          <img src={edit} alt="edit icon" />
        </button>
        <button onClick={() => dispatch(closeModal())}>
          <img src={closeIcon} alt="close icon" />
        </button>
      </div>
      <div className={styles.modalHeader}>
        <Avatar avatarUrl={user.avatarUrl} width={"100px"} height={"100px"} />
        <h2>{getDisplayName(user)}</h2>
      </div>
      <div className={clsx(styles.modalBody, styles.profileModalBody)}>
        {user.biography && (
          <>
            <h3>{user.biography}</h3>
            <label>bio</label>
          </>
        )}
        <h3 className={styles.link}>{user.email}</h3>
        <label>email</label>
        <h3 className={styles.link}>@{user.nickname}</h3>
        <label>nickname</label>
      </div>
    </Modal>
  );
};

export default ProfileViewModal;
export type { IProfileViewModal };
