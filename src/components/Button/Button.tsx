import type { ReactNode } from "react";
import styles from "./Button.module.css";
import Spinner from "@components/Spinner/Spinner";
import clsx from "clsx";

interface IButton {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  onClick,
  type = "button",
  isLoading = false,
  disabled = false,
  className,
}: IButton) => {
  return (
    <button
      className={clsx(styles.btn, className, {
        [styles.disabled]: disabled,
        [styles.loading]: isLoading,
      })}
      onClick={onClick}
      type={type}
      disabled={isLoading || disabled}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
