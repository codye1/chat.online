import type { GroupConversation } from "@utils/types";
import headerStyles from "../Header.module.css";

interface IGroupHeader {
  conversation: GroupConversation;
  className: string;
}

const GroupHeader = ({ conversation, className }: IGroupHeader) => {
  return (
    <header className={className}>
      <span>
        <h1>{conversation.title}</h1>
        {conversation.activeUsers.length > 0 && (
          <h2 className={headerStyles.typingUsers}>
            {conversation.activeUsers[0].reason}
          </h2>
        )}
        {!conversation.activeUsers?.length && (
          <h2>{conversation.participantsCount} participants</h2>
        )}
      </span>
    </header>
  );
};

export default GroupHeader;
