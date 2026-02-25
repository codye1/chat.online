import { useRef, type ChangeEvent } from "react";
import styles from "./TextArea.module.css";

interface ITextArea {
  trackValue?: {
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  };
  maxLength?: number;
  placeholder: string;
}

const TextArea = ({ trackValue, placeholder, maxLength }: ITextArea) => {
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
      onChange={handleChange}
      className={styles.textarea}
      maxLength={maxLength}
      rows={1}
      placeholder={placeholder}
    />
  );
};

export default TextArea;
