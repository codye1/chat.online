import { createPortal } from "react-dom";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import styles from "./Popover.module.css";
import clsx from "clsx";

export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "mouse";

interface IPopover {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  placement?: PopoverPlacement;
  className?: string;
  mousePosition: { x: number; y: number };
}

const OFFSET = 8;

const Popover = ({
  anchorRef,
  isOpen,
  onClose,
  children,
  placement = "bottom",
  className,
  mousePosition,
}: IPopover) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !anchorRef.current || !popoverRef.current) return;

    const anchor = anchorRef.current.getBoundingClientRect();
    const popover = popoverRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case "bottom":
        top = anchor.bottom + OFFSET;
        left = anchor.left + anchor.width / 2 - popover.width / 2;
        break;
      case "top":
        top = anchor.top - popover.height - OFFSET;
        left = anchor.left + anchor.width / 2 - popover.width / 2;
        break;
      case "left":
        top = anchor.top + anchor.height / 2 - popover.height / 2;
        left = anchor.left - popover.width - OFFSET;
        break;
      case "right":
        top = anchor.top + anchor.height / 2 - popover.height / 2;
        left = anchor.right + OFFSET;
        break;
      case "mouse":
        top = mousePosition.y + OFFSET;
        left = mousePosition.x + OFFSET;
        break;
    }

    top = Math.max(
      OFFSET,
      Math.min(top, window.innerHeight - popover.height - OFFSET),
    );
    left = Math.max(
      OFFSET,
      Math.min(left, window.innerWidth - popover.width - OFFSET),
    );

    setCoords({ top, left });
  }, [isOpen, placement, anchorRef, mousePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      className={clsx(styles.popover, styles[placement], className)}
      style={{ top: coords.top, left: coords.left }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>,
    document.body,
  );
};

export default Popover;
