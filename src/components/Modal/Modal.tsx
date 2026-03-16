import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import type { ReactNode, KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import clsx from "clsx";

interface IModal {
  children: ReactNode;
  onClickOutside: () => void;
  className?: string;
}

const Modal = ({ children, onClickOutside, className }: IModal) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.focus();
  }, []);

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
        className={clsx(styles.content, className)}
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
