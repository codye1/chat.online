import { useAppSelector } from "@hooks/hooks";
import { useState } from "react";
import Message from "../Message/Message";
import { useGetMessagesQuery } from "@api/slices/chatSclice";
import type { Conversation } from "@utils/types";
import useHandleUnreadMessages from "./hook/useHandleUnreadMessages";
import VList from "../VList.tsx/VList";
import resetUnreadMessagesCount from "@utils/resetUnreadMessagesCount";
import styles from "./Messages.module.css";

const Messages = ({ conversation }: { conversation: Conversation }) => {
  const user = useAppSelector((state) => state.auth.user);
  const [queryParams, setQueryParams] = useState<
    Record<
      string,
      {
        cursor?: string;
        direction?: "UP" | "DOWN";
        jumpToLatest?: boolean;
      }
    >
  >({});
  const currentQueryParams = queryParams[conversation.id] || {};
  const { data, isFetching } = useGetMessagesQuery({
    conversationId: conversation.id,
    ...currentQueryParams,
  });

  const { trackUnreadMessageRef } = useHandleUnreadMessages({
    conversation,
    user,
  });

  if (!data) {
    return <div>Loading messages...</div>;
  }

  return (
    <VList
      items={data.items}
      itemsFetching={isFetching}
      listId={conversation.id}
      hasMoreUp={!!data?.hasMoreUp}
      hasMoreDown={!!data?.hasMoreDown}
      attachToBottom={!!data?.fromUser}
      anchor={data?.anchor}
      unseenItemsCount={conversation.unreadMessages}
      litstStyles={styles.messages}
      onTopReached={() => {
        setQueryParams((prev) => ({
          ...prev,
          [conversation.id]: {
            cursor: data?.items?.length ? data.items[0].id : undefined,
            direction: "UP",
          },
        }));
      }}
      onBottomReached={() => {
        if (!currentQueryParams.jumpToLatest) {
          setQueryParams((prev) => ({
            ...prev,
            [conversation.id]: {
              cursor: data?.items?.length
                ? data.items[data.items.length - 1].id
                : undefined,
              direction: "DOWN",
            },
          }));
        }
      }}
      onJumpToLatest={() => {
        resetUnreadMessagesCount(conversation.id);
        setQueryParams((prev) => ({
          ...prev,
          [conversation.id]: {
            jumpToLatest: true,
            cursor: undefined,
            direction: undefined,
          },
        }));
      }}
      renderItem={(item, itemsBuffer, virtualizer) => {
        const message = itemsBuffer[item.index];
        return (
          <Message
            data-index={item.index}
            key={message.id}
            id={message.id}
            text={message.text}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${item.start}px)`,
            }}
            read={message.id <= conversation.lastReadIdByParticipants}
            isSentByCurrentUser={message.senderId === user.id}
            createdAt={message.createdAt}
            ref={(el) => {
              trackUnreadMessageRef(el, message);
              virtualizer.measureElement(el);
            }}
          />
        );
      }}
    />
  );
};

export default Messages;
