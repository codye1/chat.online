import InputWithLabel from "@components/InputWithLabel/InputWithLabel";
import { EditModal } from "./EditFormModal/EditFormModal";
import type { User } from "@utils/types";
import type { EditUserFormState } from "@utils/schemas";
import type { FormEvent } from "react";

interface IEditNameModal {
  user: User;
  state: EditUserFormState;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}

export function EditUsernameModal({
  user,
  state,
  onClose,
  onSubmit,
  isPending,
}: IEditNameModal) {
  return (
    <EditModal
      title="Edit username"
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      apiErrors={state?.properties?.api?.errors}
    >
      <InputWithLabel
        label="@username"
        name="nickname"
        defaultValue={user.nickname || ""}
        errors={state?.properties?.nickname?.errors}
      />
    </EditModal>
  );
}
