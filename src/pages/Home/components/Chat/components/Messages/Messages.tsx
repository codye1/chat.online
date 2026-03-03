import { useAppSelector } from "@hooks/hooks";
import { useState } from "react";
import Message from "../Message/Message";
import { useGetMessagesQuery } from "@api/slices/chatSlice";
import type { Conversation } from "@utils/types";
import useHandleUnreadMessages from "./hook/useHandleUnreadMessages";
import VList from "../VList/VList";
import resetUnreadMessagesCount from "@utils/resetUnreadMessagesCount";
import styles from "./Messages.module.css";
import MessageSkeleton from "../Message/MessageSkeleton";
import { addReaction } from "@utils/socket";

const skeletonItems = Array.from({ length: 20 }, () => ({
  alignRight: Math.random() > 0.5,
  height: Math.random() * 30 + 30,
  width: Math.random() * 150 + 40,
}));

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
  const { data, isFetching, isError, isLoading } = useGetMessagesQuery({
    conversationId: conversation.id,
    ...currentQueryParams,
  });

  const { trackUnreadMessageRef } = useHandleUnreadMessages({
    conversation,
  });

  if (isError) {
    return <div>Error loading messages.</div>;
  }
  return (
    <div className={styles.container}>
      {data && (
        <VList
          items={data.items}
          itemsFetching={isFetching}
          listId={conversation.id}
          hasMoreUp={!!data?.hasMoreUp}
          hasMoreDown={!!data?.hasMoreDown}
          attachToBottom={!!data?.fromUser}
          anchor={data?.anchor}
          unseenItemsCount={conversation.unreadMessages}
          listStyles={styles.messages}
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
                conversationId={conversation.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${item.start}px)`,
                }}
                reactions={message.reactions}
                read={
                  conversation.lastReadIdByParticipants
                    ? message.id <= conversation.lastReadIdByParticipants
                    : false
                }
                isSentByCurrentUser={message.senderId === user.id}
                createdAt={message.createdAt}
                ref={(el) => {
                  trackUnreadMessageRef(el, message);
                  virtualizer.measureElement(el);
                }}
                onDoubleClick={() => {
                  if (window.getSelection()) {
                    console.log(window.getSelection());

                    return;
                  }
                  addReaction({ messageId: message.id, content: "👍" });
                }}
              />
            );
          }}
        />
      )}
      {(isLoading || (isFetching && !queryParams[conversation.id])) && (
        <div className={styles.overlay}>
          {skeletonItems.map((item, index) => (
            <MessageSkeleton
              key={index}
              alignRight={item.alignRight}
              height={item.height}
              width={item.width}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
