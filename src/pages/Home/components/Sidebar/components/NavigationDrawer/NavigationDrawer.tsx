import Avatar from "@components/Avatar/Avatar";
import Drawer from "@components/Drawer/Drawer";
import styles from "./NavigationDrawer.module.css";
import userCircle from "@assets/userCircle.svg";
import clsx from "clsx";
import logoutIcon from "@assets/logout.svg";
import { useLogoutMutation } from "@api/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { openModal } from "@redux/global";
import addGroupIcon from "@assets/group.svg";

interface INavigationDrawer {
  onClickOutside: () => void;
}

const NavigationDrawer = ({ onClickOutside }: INavigationDrawer) => {
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

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
                props: {
                  user,
                },
              }),
            );
            onClickOutside();
          }}
        >
          <img src={userCircle} alt="user circle icon" />
          View profile
        </button>
      </section>
      <section className={styles.drawerSection}>
        <button
          onClick={() => {
            dispatch(
              openModal({
                type: "createGroup",
              }),
            );
            onClickOutside();
          }}
        >
          <img src={addGroupIcon} alt="add group icon" />
          New group
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
