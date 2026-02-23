import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import type { ReactNode } from "react";

interface IModal {
  children: ReactNode;
  onClickOutside: () => void;
}

const Modal = ({ children, onClickOutside }: IModal) => {
  return createPortal(
    <div className={styles.modal} onClick={onClickOutside}>
      <div
        className={styles.modalContent}
        onClick={(ev) => ev.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
