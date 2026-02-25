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

export function EditNameModal({
  user,
  state,
  onClose,
  onSubmit,
  isPending,
}: IEditNameModal) {
  return (
    <EditModal
      title="Edit name"
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
    >
      <InputWithLabel
        label="First name"
        name="firstName"
        defaultValue={user.firstName || user.nickname}
        errors={state?.properties?.firstName?.errors}
      />
      <InputWithLabel
        label="Last name"
        name="lastName"
        defaultValue={user.lastName || ""}
        errors={state?.properties?.lastName?.errors}
      />
    </EditModal>
  );
}
