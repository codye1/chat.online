interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  lastName: string | null;
  firstName: string | null;
  biography: string | null;
}

interface Reaction {
  id: string;
  userId: string;
  content: string;
}

interface Message {
  id: string;
  text: string;
  conversationId: string;
  senderId: string;
  read: boolean;
  createdAt: string;
  reactions: Reaction[];
}

type ConversationTypes = "DIRECT" | "GROUP";

interface BaseConversationData {
  id: string;
  avatarUrl: string | null;
  title: string;
  type: ConversationTypes;
  unreadMessages: number;
  lastMessage: { text: string; createdAt: string; id: string } | null;
  activeUsers: { nickname: string; reason: "typing" | "editing" }[];
}

interface BaseConversation extends BaseConversationData {
  lastReadId: string | null;
  lastReadIdByParticipants: string | null;
}

interface DirectConversation extends BaseConversation {
  type: "DIRECT";
  lastSeenAt: string | null;
  otherParticipant: User;
}

interface GroupConversation extends BaseConversation {
  type: "GROUP";
}

type Conversation = DirectConversation | GroupConversation;

interface DirectPreview extends BaseConversationData {
  type: "DIRECT";
  otherParticipant: {
    id: string;
  };
}

interface GroupPreview extends BaseConversationData {
  type: "GROUP";
}

type ConversationPreview = DirectPreview | GroupPreview;

// previews for search result
interface Global {
  //  chat,channel for future
  type: "user";
}

interface UserPreview extends Global {
  type: "user";
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

type GlobalSearchItem = UserPreview | ConversationPreview;

interface SearchResponse {
  conversations: Conversation[];
  global: GlobalSearchItem[];
}

export type {
  User,
  Reaction,
  Conversation,
  DirectConversation,
  ConversationTypes,
  Message,
  Global,
  UserPreview,
  GlobalSearchItem,
  SearchResponse,
  ConversationPreview,
};
