import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import type { ReactNode, KeyboardEvent } from "react";
import { useEffect, useRef } from "react";

interface IModal {
  children: ReactNode;
  onClickOutside: () => void;
}

const Modal = ({ children, onClickOutside }: IModal) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.focus();
  }, [children]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      onClickOutside();
    }
  };

  return createPortal(
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      onClick={onClickOutside}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={styles.modalContent}
        style={{ outline: "none" }}
        onClick={(ev) => ev.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
