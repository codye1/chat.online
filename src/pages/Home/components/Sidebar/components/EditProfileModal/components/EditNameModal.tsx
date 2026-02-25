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

const EditNameModal = ({
  user,
  state,
  onClose,
  onSubmit,
  isPending,
}: IEditNameModal) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");

  return (
    <EditModal
      title="Edit name"
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      forbidden={user.firstName === firstName && user.lastName === lastName}
      apiErrors={state?.properties?.api?.errors}
    >
      <InputWithLabel
        label="First name"
        name="firstName"
        onChange={(e) => setFirstName(e.target.value)}
        value={firstName}
        defaultValue={user.firstName || ""}
        errors={state?.properties?.firstName?.errors}
      />
      <InputWithLabel
        label="Last name"
        name="lastName"
        onChange={(e) => setLastName(e.target.value)}
        value={lastName}
        defaultValue={user.lastName || ""}
        errors={state?.properties?.lastName?.errors}
      />
    </EditModal>
  );
};

export default EditNameModal;
