import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import styles from "./ErrorModal.module.css";

interface IErrorModal {
  title: string;
  message: string;
}

const ErrorModal = ({ title, message }: IErrorModal) => {
  const dispatch = useAppDispatch();

  return (
    <Modal onClickOutside={() => dispatch(closeModal())} closeButton>
      <MenuContent className={styles.content}>
        <h2 style={{ color: "red" }}>{title}</h2>
        <p>{message}</p>
      </MenuContent>
    </Modal>
  );
};

export default ErrorModal;
export type { IErrorModal };
