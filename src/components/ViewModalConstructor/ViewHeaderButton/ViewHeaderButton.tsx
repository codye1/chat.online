import Button from "@components/Button/Button";
import styles from "./ViewHeaderButton.module.css";

interface IViewHeaderButton {
  title: string;
  icon: string;
  onClick: () => void;
}
const ViewHeaderButton = ({ title, icon, onClick }: IViewHeaderButton) => {
  return (
    <Button className={styles.headerButton} onClick={onClick}>
      <img src={icon} alt={title} className={styles.icon} />
      {title}
    </Button>
  );
};

export default ViewHeaderButton;
