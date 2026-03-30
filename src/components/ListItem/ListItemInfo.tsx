import styles from "./ListItem.module.css";

interface IListItemInfo {
  title: string;
  subtitle: string;
}

const ListItemInfo = ({ title, subtitle }: IListItemInfo) => {
  return (
    <div className={styles.info}>
      <h3>{title}</h3>
      <h4>{subtitle}</h4>
    </div>
  );
};

export default ListItemInfo;
