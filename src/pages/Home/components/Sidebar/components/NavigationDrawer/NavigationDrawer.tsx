import Avatar from "@components/Avatar/Avatar";
import Drawer from "@components/Drawer/Drawer";
import styles from "./NavigationDrawer.module.css";
import type { User } from "@utils/types";
import userCircle from "@assets/userCircle.svg";
import clsx from "clsx";
import logoutIcon from "@assets/logout.svg";
import { useLogoutMutation } from "@api/slices/authSlice";
import { useAppDispatch } from "@hooks/hooks";
import { openModal } from "@redux/global";

interface INavigationDrawer {
  onClickOutside: () => void;
  user: User;
}

const NavigationDrawer = ({ onClickOutside, user }: INavigationDrawer) => {
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();

  return (
    <Drawer onClickOutside={onClickOutside} contentClass={styles.drawerContent}>
      <section className={styles.drawerHeader}>
        <Avatar avatarUrl={user.avatarUrl} />
        <h1>{user.nickname}</h1>
      </section>
      <section className={styles.drawerSection}>
        <button
          onClick={() => {
            dispatch(
              openModal({
                type: "profileView",
                user,
              }),
            );
            onClickOutside();
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
