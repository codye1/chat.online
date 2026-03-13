import { useLayoutEffect, useRef, type ChangeEvent } from "react";
import styles from "./TextArea.module.css";
import clsx from "clsx";

interface ITextarea {
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

const Textarea = ({
  trackValue,
  placeholder,
  maxLength,
  onKeyDown,
  className,
  name,
}: ITextarea) => {
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

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, []);

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key == "Enter" && !e.shiftKey) {
      e.preventDefault();
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
      onKeyDown={onKeyDownHandler}
    />
  );
};

export default Textarea;
