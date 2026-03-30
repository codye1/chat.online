import type { LiHTMLAttributes } from "react";
import styles from "./ListItem.module.css";
import clsx from "clsx";

const ListItem = ({
  children,
  className,
  ...props
}: LiHTMLAttributes<HTMLLIElement>) => {
  return (
    <li {...props} className={clsx(styles.item, className)}>
      {children}
    </li>
  );
};

export default ListItem;
