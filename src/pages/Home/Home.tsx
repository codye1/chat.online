import { useSocketConnection } from "@hooks/useSocketConnection";
import styles from "./Home.module.css";
import Chat from "./components/Chat/Chat";
import ConversationsList from "./components/ConversationsList/ConversationsList";
import ModalManager from "@components/ModalManager/ModalManager";
import Toasts from "@components/Toasts/Toasts";

const Home = () => {
  useSocketConnection();

  return (
    <main className={styles.home}>
      <ConversationsList />
      <Chat />
      <ModalManager />
      <Toasts />
    </main>
  );
};

export default Home;
