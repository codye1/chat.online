import type { LiHTMLAttributes } from "react";
import { forwardRef } from "react";
import styles from "./ListItem.module.css";
import clsx from "clsx";

const ListItem = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <li ref={ref} {...props} className={clsx(styles.item, className)}>
        {children}
      </li>
    );
  },
);

export default ListItem;
