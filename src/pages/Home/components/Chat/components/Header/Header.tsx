import type { Conversation } from "@utils/types";
import styles from "./Header.module.css";
import DirectHeader from "./components/DirectHeader";
import GroupHeader from "./components/GroupHeader";
import Button from "@components/Button/Button";
import backIcon from "@assets/back.svg";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import clsx from "clsx";
import { toggleConversationsList } from "@redux/global";

interface IHeader {
  conversation: Conversation;
}

const Header = ({ conversation }: IHeader) => {
  const conversationListOpen = useAppSelector(
    (state) => state.global.conversationsListOpen,
  );
  const dispatch = useAppDispatch();

  const backButton = (
    <Button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleConversationsList());
      }}
      className={clsx(styles.backButton, !conversationListOpen && styles.open)}
    >
      <img src={backIcon} alt="Back" />
    </Button>
  );

  switch (conversation.type) {
    case "DIRECT":
      return (
        <DirectHeader conversation={conversation} className={styles.header}>
          {backButton}
        </DirectHeader>
      );
    case "GROUP":
      return (
        <GroupHeader conversation={conversation} className={styles.header}>
          {backButton}
        </GroupHeader>
      );
  }
};

export default Header;
