import styles from "./Home.module.css";
import Chat from "./components/Chat/Chat";
import ChatsList from "./components/ChatsList/ChatsList";
import Sidebar from "./components/Sidebar/Sidebar";

const Home = () => {
  return (
    <main className={styles.home}>
      <Sidebar />
      <ChatsList />
      <Chat />
    </main>
  );
};

export default Home;
