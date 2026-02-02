interface User {
  id: string;
  email: string;
  nickname: string;
}

interface Message {
  id: string;
  text: string;
  conversationId: string;
  senderId: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  avatarUrl: string | null;
  title: string;
  type: "DIRECT" | "GROUP";
  participants: User[];
  lastMessage: { text: string; createdAt: string } | null;
  unreadMessages: number;
}

interface Global {
  //  chat,channel for fututre
  type: "user" | "chat" | "channel";
}

interface UserPreview extends Global {
  type: "user";
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

type globalSearchItem = UserPreview; // | ChatPreview | ChannelPreview

interface SearchResponse {
  conversations: Conversation[];
  global: globalSearchItem[];
}

export type {
  User,
  Conversation,
  Message,
  Global,
  UserPreview,
  globalSearchItem,
  SearchResponse,
};
