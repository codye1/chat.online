import type { Conversation } from "@utils/types";
import styles from "./Header.module.css";
import DirectHeader from "./components/DirectHeader";

interface IHeader {
  conversation: Conversation;
}

const Header = ({ conversation }: IHeader) => {
  switch (conversation.type) {
    case "DIRECT":
      return (
        <DirectHeader conversation={conversation} className={styles.header} />
      );
    default:
      return <h1 className={styles.header}>{conversation.title}</h1>;
  }
};

export default Header;
