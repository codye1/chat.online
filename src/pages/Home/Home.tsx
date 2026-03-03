import { useSocketConnection } from "@hooks/useSocketConnection";
import styles from "./Home.module.css";
import Chat from "./components/Chat/Chat";
import ConversationsList from "./components/ConversationsList/ConversationsList";
import Sidebar from "./components/Sidebar/Sidebar";
import ModalManager from "@components/ModalManager/ModalManager";

const Home = () => {
  useSocketConnection();

  return (
    <main className={styles.home}>
      <Sidebar />
      <ConversationsList />
      <Chat />
      <ModalManager />
    </main>
  );
};

export default Home;
