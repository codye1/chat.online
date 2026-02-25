import { useAppSelector } from "@hooks/hooks";
import styles from "./Sidebar.module.css";
import burgerIcon from "@assets/burger.svg";
import messagesIcon from "@assets/messages.svg";
import { useState } from "react";
import NavigationDrawer from "./components/NavigationDrawer/NavigationDrawer";
import ViewProfileModal from "./components/ViewProfileModal/ViewProfileModal";
import EditProfileModal from "./components/EditProfileModal/EditProfileModal";

type ActiveView = null | "drawer" | "viewProfile" | "editProfile";

const Sidebar = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [activeView, setActiveView] = useState<ActiveView>(null);

  return (
    <section className={styles.sidebar}>
      <button
        className={styles.sidebarItem}
        onClick={() => setActiveView("drawer")}
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

      {activeView === "drawer" && (
        <NavigationDrawer
          onClickOutside={() => setActiveView(null)}
          onClickNavigationItem={(item) => {
            if (item === "profile") {
              setActiveView("viewProfile");
            }
          }}
          user={user}
        />
      )}
      {activeView === "viewProfile" && (
        <ViewProfileModal
          user={user}
          onClickOutside={() => setActiveView(null)}
          onClickEdit={() => {
            setActiveView("editProfile");
          }}
          onClickClose={() => setActiveView(null)}
        />
      )}
      {activeView === "editProfile" && (
        <EditProfileModal
          user={user}
          onClickOutside={() => setActiveView(null)}
          onClickClose={() => setActiveView(null)}
          onClickBack={() => {
            setActiveView("viewProfile");
          }}
        />
      )}
    </section>
  );
};

export default Sidebar;
