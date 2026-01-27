import Input from "@components/Input/Input";
import styles from "./Chat.module.css";
import Messages from "./components/Messages/Messages";

const Chat = () => {
  return (
    <section className={styles.chat}>
      <Messages />
      <span className={styles.inputWrapper}>
        <Input name="message" type="text" placeholder="Type a message..." />
      </span>
    </section>
  );
};

export default Chat;
