import type { Conversation } from "@utils/types";
import styles from "./Header.module.css";

interface IHeader {
  conversation: Conversation;
}

const Header = ({ conversation }: IHeader) => {
  return (
    <header className={styles.header}>
      <span>
        <h1>{conversation.title}</h1>
        <h2>last seen recently</h2>
      </span>
    </header>
  );
};

export default Header;
