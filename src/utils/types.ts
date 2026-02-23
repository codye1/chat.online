interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
}

interface Message {
  id: string;
  text: string;
  conversationId: string;
  senderId: string;
  read: boolean;
  createdAt: string;
}

type ConversationTypes = "DIRECT" | "GROUP";

interface BaseConversation {
  id: string;
  avatarUrl: string | null;
  title: string;
  type: ConversationTypes;
  lastMessage: { text: string; createdAt: string } | null;
  unreadMessages: number;
  lastReadId: string | null;
  lastReadIdByParticipants: string;
  typingUsers?: string[];
}

interface DirectConversation extends BaseConversation {
  type: "DIRECT";
  lastSeenAt: string | null;
  otherParticipant: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
  };
}

interface GroupConversation extends BaseConversation {
  type: "GROUP";
}

type Conversation = DirectConversation | GroupConversation;

interface Global {
  //  chat,channel for future
  type: "user" | "chat" | "channel";
}

interface UserPreview extends Global {
  type: "user";
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

type GlobalSearchItem = UserPreview; // | ChatPreview | ChannelPreview

interface SearchResponse {
  conversations: Conversation[];
  global: GlobalSearchItem[];
}

export type {
  User,
  Conversation,
  DirectConversation,
  ConversationTypes,
  Message,
  Global,
  UserPreview,
  GlobalSearchItem,
  SearchResponse,
};
