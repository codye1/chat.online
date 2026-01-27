import type { ReactNode } from "react";
import styles from "./Button.module.css";
import Spinner from "@components/Spinner/Spinner";
import clsx from "clsx";

interface IButton {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
}

const Button = ({
  children,
  onClick,
  type = "button",
  isLoading = false,
}: IButton) => {
  return (
    <button
      className={clsx(styles.btn, isLoading && styles.loading)}
      onClick={onClick}
      type={type}
      disabled={isLoading}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
