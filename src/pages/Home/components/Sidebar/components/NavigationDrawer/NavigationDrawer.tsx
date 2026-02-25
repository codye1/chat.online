import Avatar from "@components/Avatar/Avatar";
import Drawer from "@components/Drawer/Drawer";
import styles from "./NavigationDrawer.module.css";
import type { User } from "@utils/types";
import userCircle from "@assets/userCircle.svg";
import clsx from "clsx";
import logoutIcon from "@assets/logout.svg";
import { useLogoutMutation } from "@api/slices/authSlice";

type NavigationItem = "profile" | "settings" | "logout";

interface INavigationDrawer {
  onClickOutside: () => void;
  onClickNavigationItem: (item: NavigationItem) => void;
  user: User;
}

const NavigationDrawer = ({
  onClickOutside,
  onClickNavigationItem,
  user,
}: INavigationDrawer) => {
  const [logout] = useLogoutMutation();

  return (
    <Drawer onClickOutside={onClickOutside} contentClass={styles.drawerContent}>
      <section className={styles.drawerHeader}>
        <Avatar avatarUrl={user.avatarUrl} />
        <h1>{user.nickname}</h1>
      </section>
      <section className={styles.drawerSection}>
        <button
          onClick={() => {
            onClickNavigationItem("profile");
          }}
        >
          <img src={userCircle} alt="user circle icon" />
          View profile
        </button>
      </section>
      <section className={clsx(styles.drawerSection, styles.logout)}>
        <button
          onClick={() => {
            logout();
          }}
        >
          <img src={logoutIcon} alt="logout icon" />
          Logout
        </button>
      </section>
    </Drawer>
  );
};

export default NavigationDrawer;
