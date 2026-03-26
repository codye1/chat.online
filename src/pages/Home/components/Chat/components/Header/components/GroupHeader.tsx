import type { GroupConversation } from "@utils/types";
import headerStyles from "../Header.module.css";
import { useAppDispatch } from "@hooks/hooks";
import { openModal } from "@redux/global";

interface IGroupHeader {
  conversation: GroupConversation;
  className: string;
}

const GroupHeader = ({ conversation, className }: IGroupHeader) => {
  const dispatch = useAppDispatch();

  return (
    <header
      className={className}
      onClick={() => {
        dispatch(
          openModal({ type: "groupInfo", initialConversation: conversation }),
        );
      }}
    >
      <span>
        <h1>{conversation.title}</h1>
        {conversation.activeUsers.length > 0 && (
          <h2 className={headerStyles.typingUsers}>
            {conversation.activeUsers[0].nickname}{" "}
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
export type { IGroupHeader };
