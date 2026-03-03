import { useAppSelector } from "@hooks/hooks";
import styles from "./Sidebar.module.css";
import burgerIcon from "@assets/burger.svg";
import messagesIcon from "@assets/messages.svg";
import { useState } from "react";
import NavigationDrawer from "./components/NavigationDrawer/NavigationDrawer";

const Sidebar = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <section className={styles.sidebar}>
      <button
        className={styles.sidebarItem}
        onClick={() => setIsDrawerOpen(true)}
      >
        <img src={burgerIcon} alt="burger menu icon" />
      </button>
      <button className={styles.sidebarItem}>
        <img src={messagesIcon} alt="messages icon" />
        <h3>All chats</h3>
      </button>
      <button className={styles.sidebarItem}>
        <h2>{user.nickname}</h2>
      </button>

      {isDrawerOpen && (
        <NavigationDrawer
          onClickOutside={() => setIsDrawerOpen(false)}
          user={user}
        />
      )}
    </section>
  );
};

export default Sidebar;
