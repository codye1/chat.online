import { useRef, type ChangeEvent } from "react";
import styles from "./TextArea.module.css";
import clsx from "clsx";

interface ITextArea {
  trackValue?: {
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  };
  maxLength?: number;
  placeholder: string;
  name: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

const TextArea = ({
  trackValue,
  placeholder,
  maxLength,
  onKeyDown,
  className,
  name,
}: ITextArea) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (trackValue) {
      trackValue.onChange(e);
    }
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  return (
    <textarea
      ref={ref}
      value={trackValue?.value}
      name={name}
      onChange={handleChange}
      className={clsx(styles.textArea, className)}
      maxLength={maxLength}
      rows={1}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
    />
  );
};

export default TextArea;
