import type { Conversation } from "@utils/types";
import styles from "./Header.module.css";
import DirectHeader from "./components/DirectHeader";
import GroupHeader from "./components/GroupHeader";

interface IHeader {
  conversation: Conversation;
}

const Header = ({ conversation }: IHeader) => {
  switch (conversation.type) {
    case "DIRECT":
      return (
        <DirectHeader conversation={conversation} className={styles.header} />
      );
    case "GROUP":
      return (
        <GroupHeader conversation={conversation} className={styles.header} />
      );
  }
};

export default Header;
