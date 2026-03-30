import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal, popModal } from "@redux/global";
import styles from "./Confirmation.module.css";
import Button from "@components/Button/Button";

interface IConfirmation {
  title: string;
  message: string;
  onContinue: () => void;
  canGoBack?: boolean;
}

const Confirmation = ({
  title,
  message,
  onContinue,
  canGoBack,
}: IConfirmation) => {
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
        <h2>{title}</h2>
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

export default Confirmation;
export type { IConfirmation };
