import { createPortal } from "react-dom";
import styles from "./Drawer.module.css";
import type { ReactNode } from "react";

interface IDrawer {
  onClickOutside?: () => void;
  children?: ReactNode;
}
const Drawer = ({ onClickOutside, children }: IDrawer) => {
  return createPortal(
    <div className={styles.drawer} onClick={onClickOutside}>
      <div
        className={styles.drawerContent}
        onClick={(ev) => ev.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Drawer;
