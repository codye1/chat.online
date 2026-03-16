import type { ReactNode } from "react";
import styles from "./Button.module.css";
import Spinner from "@components/Spinner/Spinner";
import clsx from "clsx";

interface IButton extends React.ComponentPropsWithRef<"button"> {
  children: ReactNode;
  isLoading?: boolean;
}

const Button = ({
  children,
  onClick,
  type = "button",
  isLoading = false,
  disabled = false,
  className,
  ref,
  ...rest
}: IButton) => {
  return (
    <button
      {...rest}
      className={clsx(styles.btn, className, {
        [styles.disabled]: disabled,
        [styles.loading]: isLoading,
      })}
      onClick={onClick}
      type={type}
      disabled={isLoading || disabled}
      ref={ref}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
