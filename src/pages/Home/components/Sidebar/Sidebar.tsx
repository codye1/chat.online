import { useAppSelector } from "@hooks/hooks";
import styles from "./Sidebar.module.css";
import burderIcon from "@assets/burger.svg";
import messagesIcon from "@assets/messages.svg";
import Drawer from "../../../../components/Drawer/Drawer";
import { useState } from "react";
import Avatar from "@components/Avatar/Avatar";
import Modal from "@components/Modal/Modal";
import userCircle from "@assets/userCircle.svg";
import closeIcon from "@assets/close.svg";
import edit from "@assets/edit.svg";
import photoCamera from "@assets/photoCamera.svg";
import AvatarUploader from "./components/AvatarUploader/AvatarUploader";

const Sidebar = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <section className={styles.sidebar}>
      <span
        className={styles.sidebarItem}
        onClick={() => setIsDrawerOpen(true)}
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

      {isDrawerOpen && (
        <Drawer
          onClickOutside={() => {
            setIsDrawerOpen(false);
          }}
        >
          <div className={styles.drawerContent}>
            <section className={styles.drawerHeader}>
              <Avatar avatarUrl={user.avatarUrl} />
              <h1>{user.nickname}</h1>
            </section>
            <section className={styles.drawerSection}>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsDrawerOpen(false);
                }}
              >
                <img src={userCircle} alt="user circle icon" />
                View profile
              </button>
            </section>
          </div>
        </Drawer>
      )}
      {isModalOpen && (
        <Modal onClickOutside={() => setIsModalOpen(false)}>
          <div className={styles.closeIcon}>
            <img
              src={edit}
              alt="edit icon"
              onClick={() => {
                setEditModalOpen(true);
                setIsModalOpen(false);
              }}
            />
            <img
              src={closeIcon}
              alt="close icon"
              onClick={() => setIsModalOpen(false)}
            />
          </div>
          <div className={styles.modalHeader}>
            <Avatar
              avatarUrl={user.avatarUrl}
              width={"100px"}
              height={"100px"}
            />
            <h2>{user.nickname}</h2>
          </div>
          <div className={styles.modalBody}>
            <h3>{user.email}</h3>
            <label>email</label>
          </div>
        </Modal>
      )}
      {editModalOpen && (
        <Modal onClickOutside={() => setEditModalOpen(false)}>
          <div className={styles.closeIcon}>
            <img
              src={closeIcon}
              alt="close icon"
              onClick={() => setEditModalOpen(false)}
            />
          </div>
          <div className={styles.modalHeader}>
            <Avatar avatarUrl={user.avatarUrl} width={"100px"} height={"100px"}>
              <div className={styles.avatarButton}>
                <img src={photoCamera} alt="photo camera icon" />
                <AvatarUploader />
              </div>
            </Avatar>
            <h2>{user.nickname}</h2>
          </div>
          <div className={styles.modalBody}>
            <h3>{user.email}</h3>
            <label>email</label>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Sidebar;
