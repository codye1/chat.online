import { useGetConversationsQuery } from "@api/slices/chatSclice";
import { connectToConversation } from "@utils/socket";
import PreviewItem from "../PreviewItem/PreviewItem";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { setConversation } from "@redux/global";
const AllConversations = () => {
  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsErorr,
  } = useGetConversationsQuery();

  const dispatch = useAppDispatch();
  const { conversationId } = useAppSelector((state) => state.global);
  return (
    <>
      {conversationsErorr && <div>Error loading conversations.</div>}
      {conversationsLoading && <div>Loading conversations...</div>}
      {conversations &&
        conversations.map((conversation) => (
          <PreviewItem
            key={conversation.id}
            avatarUrl={conversation.avatarUrl}
            tile={conversation.title}
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
