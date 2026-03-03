import Avatar from "@components/Avatar/Avatar";
import Modal from "@components/Modal/Modal";
import type { User } from "@utils/types";
import clsx from "clsx";
import styles from "./ProfileViewModal.module.css";
import closeIcon from "@assets/close.svg";
import edit from "@assets/edit.svg";
import getDisplayName from "@utils/getDisplayName";

interface IProfileViewModal {
  user: User;
  onClickOutside: () => void;
  onClickEdit: () => void;
  onClickClose: () => void;
}

const ProfileViewModal = ({
  user,
  onClickOutside,
  onClickEdit,
  onClickClose,
}: IProfileViewModal) => {
  console.log(user);

  return (
    <Modal onClickOutside={onClickOutside}>
      <div className={styles.closeIcon}>
        <button onClick={onClickEdit}>
          <img src={edit} alt="edit icon" />
        </button>
        <button onClick={onClickClose}>
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
