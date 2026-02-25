import { useAppSelector } from "@hooks/hooks";
import styles from "./Sidebar.module.css";
import burderIcon from "@assets/burger.svg";
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
      <span
        className={styles.sidebarItem}
        onClick={() => setActiveView("drawer")}
      >
        <img src={burderIcon} alt="burger menu icon" />
      </span>
      <span className={styles.sidebarItem}>
        <img src={messagesIcon} alt="messages icon" />
        <h3>All chats</h3>
      </span>
      <span className={styles.sidebarItem}>
        <h2>{user.nickname}</h2>
      </span>

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
