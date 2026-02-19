import { useGetConversationsQuery } from "@api/slices/chatSclice";
import { connectToConversation } from "@utils/socket";
import PreviewItem from "../PreviewItem/PreviewItem";
import PreviewItemSkeleton from "../PreviewItem/PreviewItemSkeleton";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { setConversation } from "@redux/global";
import type { Conversation } from "@utils/types";

const sortConversations = (conversations: Conversation[]) => {
  return conversations.toSorted((a, b) => {
    const aTime = a.lastMessage
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bTime = b.lastMessage
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return bTime - aTime;
  });
};

const AllConversations = () => {
  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useGetConversationsQuery();

  const dispatch = useAppDispatch();
  const { conversationId } = useAppSelector((state) => state.global);
  return (
    <>
      {conversationsLoading && (
        <>
          {Array.from({ length: 10 }).map((_, index) => (
            <PreviewItemSkeleton key={index} />
          ))}
        </>
      )}
      {conversationsError && <div>Error loading conversations.</div>}
      {conversations &&
        sortConversations(conversations).map((conversation) => (
          <PreviewItem
            key={conversation.id}
            avatarUrl={conversation.avatarUrl}
            title={conversation.title}
            description={conversation.lastMessage?.text ?? ""}
            meta={{
              lastMessageTime:
                conversation.lastMessage?.createdAt.toString() || "",
              unreadMessages: conversation.unreadMessages,
            }}
            isActive={conversationId === conversation.id}
            onClick={() => {
              connectToConversation([conversation.id], conversationId);
              dispatch(setConversation({ conversationId: conversation.id }));
            }}
          />
        ))}
    </>
  );
};

export default AllConversations;
