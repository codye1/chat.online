import ErrorsList from "@components/ErrorsList/ErrorsList";
import styles from "./Input.module.css";
import type { ChangeEvent } from "react";
import clsx from "clsx";
import { type KeyboardEvent } from "react";

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
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
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
  onKeyDown,
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
        onKeyDown={onKeyDown}
      />
      {errors && <ErrorsList errors={errors} />}
    </>
  );
};

export default Input;
