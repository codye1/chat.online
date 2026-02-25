import Button from "@components/Button/Button";
import Modal from "@components/Modal/Modal";
import styles from "./EditFormModal.module.css";
import ErrorsList from "@components/ErrorsList/ErrorsList";
import Spinner from "@components/Spinner/Spinner";
import type { FormEvent } from "react";

interface EditModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  apiErrors?: string[];
  children: React.ReactNode;
  forbidden?: boolean;
}

export function EditModal({
  title,
  onClose,
  onSubmit,
  isPending,
  apiErrors,
  children,
  forbidden,
}: EditModalProps) {
  return (
    <Modal onClickOutside={onClose}>
      <form className={styles.editModal} onSubmit={onSubmit}>
        <h3>{title}</h3>
        {children}
        <span className={styles.editModalButtons}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending || forbidden}>
            {isPending ? <Spinner /> : "Save"}
          </Button>
        </span>
        {apiErrors && <ErrorsList errors={apiErrors} />}
      </form>
    </Modal>
  );
}
