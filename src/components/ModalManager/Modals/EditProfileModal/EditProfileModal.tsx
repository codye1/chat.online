import userCircle from "@assets/userCircle.svg";
import at from "@assets/at.svg";
import Modal from "@components/Modal/Modal";

import {
  startTransition,
  useActionState,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useUpdateUserMutation } from "@api/slices/userSlice";
import styles from "./EditProfileModal.module.css";
import editUser from "@actions/editUser";
import EditNicknameModal from "./components/EditNickname";
import EditNameModal from "./components/EditNameModal";
import AvatarWithUploader from "./components/AvatarWithUploader/AvatarWithUploader";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { closeModal, popModal } from "@redux/global";
import Textarea from "@components/Textarea/Textarea";
import getDisplayName from "@utils/helpers/getDisplayName";
import ViewControls from "@components/ViewModalConstructor/ViewControls/ViewControls";
import ViewHeader from "@components/ViewModalConstructor/ViewHeader/ViewHeader";
interface IEditProfileModal {
  canGoBack?: boolean;
}

const EditProfileModal = ({ canGoBack }: IEditProfileModal) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
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
      <Modal onClickOutside={() => dispatch(closeModal())}>
        <ViewHeader>
          <ViewControls
            onClose={() => dispatch(closeModal())}
            onBack={canGoBack ? () => dispatch(popModal()) : undefined}
          />
          <AvatarWithUploader
            onUpload={(result) => {
              updateUser({ avatarUrl: result.secure_url });
            }}
            defaultAvatarUrl={user.avatarUrl}
            width={"100px"}
            height={"100px"}
          />

          <h2>{getDisplayName(user)}</h2>

          <div className={styles.bioSection}>
            <Textarea
              placeholder="Bio"
              maxLength={70}
              name="bioValue"
              trackValue={{ value: bioValue, onChange: handleBioChange }}
            />
            <span>{70 - bioValue.length}</span>
          </div>
        </ViewHeader>
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
