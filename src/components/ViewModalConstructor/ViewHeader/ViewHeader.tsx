import styles from "./ViewHeader.module.css";

interface IViewHeader {
  children: React.ReactNode;
}

const ViewHeader = ({ children }: IViewHeader) => {
  return <div className={styles.header}>{children}</div>;
};

export default ViewHeader;
