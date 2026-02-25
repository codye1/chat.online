import userCircle from "@assets/userCircle.svg";
import closeIcon from "@assets/close.svg";
import backIcon from "@assets/back.svg";
import TextArea from "@components/TextArea/TextArea";
import at from "@assets/at.svg";
import Modal from "@components/Modal/Modal";
import AvatarWithUploader from "../AvatarWithUploader/AvatarWithUploader";

import {
  startTransition,
  useActionState,
  useState,
  type FormEvent,
} from "react";
import type { User } from "@utils/types";
import { useUpdateUserMutation } from "@api/slices/userSlice";
import styles from "./EditProfileModal.module.css";
import editUser from "@actions/editUser";
import { EditNameModal } from "./components/EditNameModal";
import { EditUsernameModal } from "./components/EditNickname";

interface IEditProfileModal {
  user: User;
  onClickOutside: () => void;
  onClickClose: () => void;
  onClickBack: () => void;
}

let bioTimeout: number;

const EditProfileModal = ({
  user,
  onClickOutside,
  onClickClose,
  onClickBack,
}: IEditProfileModal) => {
  const [updateUser] = useUpdateUserMutation();
  const [bioValue, setBioValue] = useState(user.biography || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [state, action, isPending] = useActionState(editUser, undefined);
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    setBioValue(newBio);

    clearTimeout(bioTimeout);
    bioTimeout = window.setTimeout(() => {
      updateUser({ biography: newBio });
    }, 1000);
  };

  return (
    <>
      <Modal onClickOutside={onClickOutside}>
        <div className={styles.backIcon}>
          <img src={backIcon} alt="back icon" onClick={onClickBack} />
        </div>
        <div className={styles.closeIcon}>
          <img src={closeIcon} alt="close icon" onClick={onClickClose} />
        </div>
        <div className={styles.modalHeader}>
          <AvatarWithUploader />
          <h2>
            {user.firstName
              ? `${user.firstName} ${user.lastName}`
              : user.nickname}
          </h2>
          <div className={styles.bioSection}>
            <TextArea
              placeholder="Bio"
              maxLength={70}
              trackValue={{ value: bioValue, onChange: handleBioChange }}
            />
            <span>{70 - bioValue.length}</span>
          </div>
        </div>
        <div className={styles.modalBody}>
          <button
            className={styles.editModalButton}
            onClick={() => {
              setIsEditingName(true);
            }}
          >
            <img src={userCircle} alt="user circle icon" />
            Name
            <span className={styles.link}>
              {user.firstName
                ? `${user.firstName} ${user.lastName}`
                : user.nickname}
            </span>
          </button>
          <button
            className={styles.editModalButton}
            onClick={() => {
              setIsEditingUsername(true);
            }}
          >
            <img src={at} alt="at icon" />
            Username
            <span className={styles.link}>@{user.nickname}</span>
          </button>
        </div>
      </Modal>

      {isEditingName && !state?.success && (
        <EditNameModal
          user={user}
          state={state}
          onClose={() => setIsEditingName(false)}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}
      {isEditingUsername && !state?.success && (
        <EditUsernameModal
          user={user}
          state={state}
          onClose={() => setIsEditingUsername(false)}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}
    </>
  );
};

export default EditProfileModal;
