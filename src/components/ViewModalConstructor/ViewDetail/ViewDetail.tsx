import clsx from "clsx";
import styles from "./ViewDetail.module.css";

interface IViewDetail {
  label: string;
  value: string;
  link?: boolean;
}

const ViewDetail = ({ label, value, link }: IViewDetail) => (
  <div className={styles.wrapper}>
    <h3 className={clsx({ [styles.link]: link })}>{value}</h3>
    <label>{label}</label>
  </div>
);

export default ViewDetail;
