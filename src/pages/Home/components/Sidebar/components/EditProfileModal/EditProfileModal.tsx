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
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { User } from "@utils/types";
import { useUpdateUserMutation } from "@api/slices/userSlice";
import styles from "./EditProfileModal.module.css";
import editUser from "@actions/editUser";
import getDisplayName from "@utils/getDisplayName";
import EditNicknameModal from "./components/EditNickname";
import EditNameModal from "./components/EditNameModal";

interface IEditProfileModal {
  user: User;
  onClickOutside: () => void;
  onClickClose: () => void;
  onClickBack: () => void;
}

const EditProfileModal = ({
  user,
  onClickOutside,
  onClickClose,
  onClickBack,
}: IEditProfileModal) => {
  const [updateUser] = useUpdateUserMutation();
  const [bioValue, setBioValue] = useState(user.biography || "");
  const [viewEditModle, setViewEditModle] = useState<
    "name" | "nickname" | null
  >(null);

  const [state, action, isPending] = useActionState(editUser, undefined);
  const bioTimeoutRef = useRef<number | null>(null);
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

    clearTimeout(bioTimeoutRef.current!);
    bioTimeoutRef.current = window.setTimeout(() => {
      updateUser({ biography: newBio });
    }, 1000);
  };
  return (
    <>
      <Modal onClickOutside={onClickOutside}>
        <button className={styles.backIcon} onClick={onClickBack}>
          <img src={backIcon} alt="back icon" />
        </button>
        <button className={styles.closeIcon} onClick={onClickClose}>
          <img src={closeIcon} alt="close icon" />
        </button>
        <div className={styles.modalHeader}>
          <AvatarWithUploader />
          <h2>{getDisplayName(user)}</h2>
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
              setViewEditModle("name");
            }}
          >
            <img src={userCircle} alt="user circle icon" />
            Name
            <span className={styles.link}>{getDisplayName(user)}</span>
          </button>
          <button
            className={styles.editModalButton}
            onClick={() => {
              setViewEditModle("nickname");
            }}
          >
            <img src={at} alt="at icon" />
            Username
            <span className={styles.link}>@{user.nickname}</span>
          </button>
        </div>
      </Modal>

      {viewEditModle === "name" && (
        <EditNameModal
          user={user}
          state={state}
          onClose={() => setViewEditModle(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}
      {viewEditModle === "nickname" && (
        <EditNicknameModal
          user={user}
          state={state}
          onClose={() => setViewEditModle(null)}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}
    </>
  );
};

export default EditProfileModal;
