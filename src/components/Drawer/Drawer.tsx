import { createPortal } from "react-dom";
import styles from "./Drawer.module.css";
import type { ReactNode } from "react";
import clsx from "clsx";

interface IDrawer {
  onClickOutside?: () => void;
  children?: ReactNode;
  contentClass?: string;
}
const Drawer = ({ onClickOutside, children, contentClass }: IDrawer) => {
  return createPortal(
    <div className={styles.drawer} onClick={onClickOutside}>
      <div
        className={clsx(styles.drawerContent, contentClass)}
        onClick={(ev) => ev.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Drawer;
