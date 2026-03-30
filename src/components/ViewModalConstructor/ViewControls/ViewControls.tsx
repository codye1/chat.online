import styles from "./ViewControls.module.css";
import backIcon from "@assets/back.svg";
import closeIcon from "@assets/close.svg";
import editIcon from "@assets/edit.svg";

interface IViewControls {
  onClose: () => void;
  onEdit?: () => void;
  onBack?: () => void;
}

const ViewControls = ({ onClose, onEdit, onBack }: IViewControls) => (
  <div className={styles.controls}>
    {onBack && (
      <button onClick={onBack} className={styles.backIcon}>
        <img src={backIcon} alt="back" />
      </button>
    )}
    {onEdit && (
      <button onClick={onEdit}>
        <img src={editIcon} alt="edit" />
      </button>
    )}
    <button onClick={onClose}>
      <img src={closeIcon} alt="close" />
    </button>
  </div>
);

export default ViewControls;
