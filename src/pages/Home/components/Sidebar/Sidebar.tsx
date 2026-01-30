import { useAppSelector } from "@hooks/hooks";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <section className={styles.sidebar}>
      {user && <div>{user.nickname}</div>}
    </section>
  );
};

export default Sidebar;
