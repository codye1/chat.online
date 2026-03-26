import type { ReactNode } from "react";
import styles from "./ViewBody.module.css";
import clsx from "clsx";

interface IViewBody {
  className?: string;
  children: ReactNode;
}

const ViewBody = ({ className, children }: IViewBody) => {
  return <div className={clsx(styles.modalBody, className)}>{children}</div>;
};

export default ViewBody;
