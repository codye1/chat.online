import { createPortal } from "react-dom";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./ContextMenu.module.css";
import clsx from "clsx";

interface IContextMenu {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  className?: string;
  children?: ReactNode;
}

const OFFSET = 4;

const ContextMenu = ({
  isOpen,
  onClose,
  position,
  className,
  children,
}: IContextMenu) => {
  const menuRef = useRef<HTMLUListElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current.getBoundingClientRect();
    let top = position.y + OFFSET;
    let left = position.x + OFFSET;

    top = Math.max(
      OFFSET,
      Math.min(top, window.innerHeight - menu.height - OFFSET),
    );
    left = Math.max(
      OFFSET,
      Math.min(left, window.innerWidth - menu.width - OFFSET),
    );

    setCoords({ top, left });
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onClose]);

  const handleKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <menu
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      className={clsx(styles.contextMenu, className)}
      style={{ top: coords.top, left: coords.left }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </menu>,
    document.body,
  );
};

export default ContextMenu;
