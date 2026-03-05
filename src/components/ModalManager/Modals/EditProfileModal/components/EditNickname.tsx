import InputWithLabel from "@components/InputWithLabel/InputWithLabel";
import { EditModal } from "./EditFormModal/EditFormModal";
import type { User } from "@utils/types";
import type { EditUserFormState } from "@utils/schemas";
import { useState, type FormEvent } from "react";

interface IEditNameModal {
  user: User;
  state: EditUserFormState;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}

const EditNicknameModal = ({
  user,
  state,
  onClose,
  onSubmit,
  isPending,
}: IEditNameModal) => {
  const [nickname, setNickname] = useState("");

  return (
    <EditModal
      title="Edit nickname"
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      apiErrors={state?.properties?.api?.errors}
      forbidden={user.nickname === nickname}
    >
      <InputWithLabel
        label="@nickname"
        name="nickname"
        onChange={(e) => setNickname(e.target.value)}
        value={nickname}
        errors={state?.properties?.nickname?.errors}
      />
    </EditModal>
  );
};

export default EditNicknameModal;
