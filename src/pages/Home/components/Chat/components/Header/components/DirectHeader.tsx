import socket from "@utils/socket";
import type { DirectConversation } from "@utils/types";
import { useEffect, useState } from "react";
import headerStyles from "../Header.module.css";
import getOnlineStatus from "@utils/getOnlineStatus";
import DirectInfoModal from "./DirectInfoModal/DirectInfoModal";

interface IDirectHeader {
  conversation: DirectConversation;
  className: string;
}

const DirectHeader = ({ conversation, className }: IDirectHeader) => {
  useEffect(() => {
    socket.emit("subscribe:lastSeenAt", conversation.otherParticipant.id);
    return () => {
      socket.emit("unsubscribe:lastSeenAt", conversation.otherParticipant.id);
    };
  }, [conversation.otherParticipant.id]);

  const [infoModalOpen, setInfoModalOpen] = useState(false);

  return (
    <header className={className} onClick={() => setInfoModalOpen(true)}>
      <span>
        <h1>{conversation.title}</h1>
        {(conversation.typingUsers?.length ?? 0) > 0 && (
          <h2 className={headerStyles.typingUsers}>typing...</h2>
        )}
        {!conversation.typingUsers?.length && (
          <h2>{getOnlineStatus(conversation.lastSeenAt)}</h2>
        )}
      </span>

      {infoModalOpen && (
        <DirectInfoModal
          conversation={conversation}
          onClickClose={() => setInfoModalOpen(false)}
        />
      )}
    </header>
  );
};

export default DirectHeader;
