import clsx from "clsx";
import styles from "./InputHeader.module.css";
import cancelIcon from "@assets/close.svg";

interface IInputHeader {
  label: string;
  description: string;
  icon: string;
  onCancel: () => void;
}

const InputHeader = ({ label, description, icon, onCancel }: IInputHeader) => {
  return (
    <span className={styles.header}>
      <button className={styles.icon}>
        <img src={icon} alt={label} />
      </button>
      <div>
        <h2>{label}</h2>
        <h3>{description}</h3>
      </div>
      <button onClick={onCancel} className={clsx(styles.icon, styles.cancel)}>
        <img src={cancelIcon} alt="Cancel" />
      </button>
    </span>
  );
};

export default InputHeader;
