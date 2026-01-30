import styles from "./Home.module.css";
import Chat from "./components/Chat/Chat";
import ConversationsList from "./components/ConversationsList/ConversationsList";
import Sidebar from "./components/Sidebar/Sidebar";

const Home = () => {
  return (
    <main className={styles.home}>
      <Sidebar />
      <ConversationsList />
      <Chat />
    </main>
  );
};

export default Home;
