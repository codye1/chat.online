import type { Conversation } from "@utils/types";
import styles from "./Header.module.css";
import DirectHeader from "./components/DirectHeader";

interface IHeader {
  conversation: Conversation;
}

const Header = ({ conversation }: IHeader) => {
  return (
    <header className={styles.header}>
      {conversation.type === "DIRECT" ? (
        <DirectHeader conversation={conversation} />
      ) : (
        <h1>{conversation.title}</h1>
      )}
    </header>
  );
};

export default Header;
