import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal, popModal } from "@redux/global";
import styles from "./WarningModal.module.css";
import Button from "@components/Button/Button";

interface IWarningModal {
  title: string;
  message: string;
  onContinue: () => void;
  canGoBack?: boolean;
}

const WarningModal = ({
  title,
  message,
  onContinue,
  canGoBack,
}: IWarningModal) => {
  const dispatch = useAppDispatch();

  return (
    <Modal
      onClickOutside={() => {
        dispatch(closeModal());
      }}
      closeButton
      backButton={canGoBack}
    >
      <MenuContent className={styles.content}>
        <h2 style={{ color: "orange" }}>{title}</h2>
        <p>{message}</p>
        <div className={styles.buttons}>
          <Button
            onClick={() => {
              dispatch(popModal());
            }}
          >
            Cancel
          </Button>
          <Button onClick={onContinue}>Continue</Button>
        </div>
      </MenuContent>
    </Modal>
  );
};

export default WarningModal;
export type { IWarningModal };
