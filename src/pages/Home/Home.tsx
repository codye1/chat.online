import styles from "./Home.module.css";
import Chat from "./components/Chat/Chat";
import ConversationsList from "./components/ConversationsList/ConversationsList";
import SocketConnection from "@components/SocketConnection/SocketConnection";

const Home = () => {
  return (
    <main className={styles.home}>
      <ConversationsList />
      <Chat />
      <SocketConnection />
    </main>
  );
};

export default Home;
