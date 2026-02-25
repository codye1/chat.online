import ErrorsList from "@components/ErrorsList/ErrorsList";
import styles from "./Input.module.css";
import type { ChangeEvent } from "react";
import clsx from "clsx";

interface IInput {
  label?: string;
  placeholder: string;
  type: "text" | "password" | "email";
  trackValue?: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
  isLoading?: boolean;
  errors?: string[];
  name: string;
  className?: string;
  onFocusChange?: (isFocused: boolean) => void;
}

const Input = ({
  type,
  trackValue,
  name,
  placeholder,
  errors,
  isLoading,
  className,
  onFocusChange,
}: IInput) => {
  return (
    <>
      <input
        className={clsx(styles.input, className)}
        type={type}
        value={trackValue?.value}
        onChange={trackValue?.onChange}
        name={name}
        id={name}
        placeholder={placeholder}
        disabled={isLoading}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => onFocusChange?.(false)}
      />
      {errors && <ErrorsList errors={errors} />}
    </>
  );
};

export default Input;
