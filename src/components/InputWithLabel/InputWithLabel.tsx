import { useState } from "react";
import styles from "./InputWithLabel.module.css";
import clsx from "clsx";
import ErrorsList from "@components/ErrorsList/ErrorsList";

interface InputWithLabelProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  defaultValue?: string;
  errors?: string[];
}

const InputWithLabel = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  errors,
}: InputWithLabelProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  return (
    <div className={styles.inputWithLabel}>
      <label
        className={clsx(
          styles.label,
          isFocused || hasValue ? styles.labelFloat : "",
        )}
        htmlFor={name}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused || hasValue ? placeholder : ""}
      />
      {errors && <ErrorsList errors={errors} />}
    </div>
  );
};

export default InputWithLabel;
