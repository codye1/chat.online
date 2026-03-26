import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import type { ReactNode, KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import closeIcon from "@assets/close.svg";
import { popModal } from "@redux/global";
import backIcon from "@assets/back.svg";
import { useAppDispatch } from "@hooks/hooks";

interface IModal {
  children: ReactNode;
  onClickOutside: () => void;
  className?: string;
  closeButton?: boolean;
  backButton?: boolean;
}

const Modal = ({
  children,
  onClickOutside,
  className,
  closeButton,
  backButton,
}: IModal) => {
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

  const dispatch = useAppDispatch();

  return createPortal(
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      onMouseDown={onClickOutside}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={clsx(styles.content, className)}
        style={{ outline: "none" }}
        onMouseDown={(ev) => ev.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {closeButton && (
          <button className={styles.closeButton} onClick={onClickOutside}>
            <img src={closeIcon} alt="Close icon" />
          </button>
        )}
        {backButton && (
          <button
            className={styles.backButton}
            onClick={() => dispatch(popModal())}
          >
            <img src={backIcon} alt="Back icon" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
