import ErrorsList from "@components/ErrorsList/ErrorsList";
import styles from "./Input.module.css";
import type { ChangeEvent } from "react";

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
}

const Input = ({
  label,
  type,
  trackValue,
  name,
  placeholder,
  errors,
  isLoading,
}: IInput) => {
  return (
    <label htmlFor={name} className={styles.input}>
      {label}
      <input
        className={styles.inputField}
        type={type}
        value={trackValue?.value}
        onChange={trackValue?.onChange}
        name={name}
        id={name}
        placeholder={placeholder}
        disabled={isLoading}
      />
      {errors && <ErrorsList errors={errors} />}
    </label>
  );
};

export default Input;
