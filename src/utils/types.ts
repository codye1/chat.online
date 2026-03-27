interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  lastName: string | null;
  firstName: string | null;
  biography: string | null;
  lastSeenAt: string | null;
}

type UserPreview = {
  id: string;
  nickname: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  lastSeenAt: string | null;
};
type Roles = "OWNER" | "PARTICIPANT";
type UserPreviewAtConversation = UserPreview & {
  conversationId: string;
  role: Roles;
};

type Reaction = {
  content: string;
  createdAt: Date;
  messageId: string;
  userId: string;
  id: string;
};

type ReactorListItem = UserPreview & { reaction: Reaction };

type GroupedReactions = Record<
  string,
  { count: number; users: UserPreview[]; isActive: boolean }
>;

interface ReplyMessage {
  id: string;
  text: string;
  sender: UserPreview;
}

interface MessageMedia {
  id: string;
  type: "image" | "video";
  src: string;
  filename: string;
}

interface Message {
  id: string;
  text: string;
  status: "sending" | "sent" | "failed";
  media?: MessageMedia[];
  conversationId: string;
  sender: UserPreviewAtConversation;
  createdAt: string;
  reactions: GroupedReactions;
  replyTo?: ReplyMessage;
}

type ConversationTypes = "DIRECT" | "GROUP";

interface BaseConversationData {
  id: string;
  avatarUrl: string | null;
  title: string;
  type: ConversationTypes;
  unreadMessages: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  lastMessage: { text: string; createdAt: string; id: string } | null;
  activeUsers: { nickname: string; reason: "typing" | "editing" }[];
}

type EditableConversationFields = Partial<
  Pick<BaseConversationData, "isMuted" | "isArchived">
>;

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
  participantsCount: number;
  participants: UserPreviewAtConversation[];
  ownerId: string;
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
  ownerId: string;
}

type ConversationPreview = DirectPreview | GroupPreview;

// previews for search result
interface Global {
  //  chat,channel for future
  type: "user";
}

interface UserSearchPreview extends Global, UserPreview {
  type: "user";
}

type GlobalSearchItem = UserSearchPreview | ConversationPreview;

type Folder = {
  id: string;
  title: string;
  position: number;
  icon?: string;
  pinnedConversationIds: string[];
  unpinnedConversationIds: string[];
};

type ConversationsState = {
  byId: Record<string, ConversationPreview>;
  activeIds: {
    pinned: string[];
    unpinned: string[];
  };
  archivedIds: {
    pinned: string[];
    unpinned: string[];
  };
  folders: Folder[];
};

interface SearchResponse {
  conversations: Conversation[];
  global: GlobalSearchItem[];
}

export type {
  User,
  UserPreview,
  UserPreviewAtConversation,
  Reaction,
  ReactorListItem,
  GroupedReactions,
  Conversation,
  DirectConversation,
  GroupConversation,
  ConversationTypes,
  Message,
  Global,
  UserSearchPreview,
  GlobalSearchItem,
  Folder,
  ConversationsState,
  SearchResponse,
  ConversationPreview,
  ReplyMessage,
  EditableConversationFields,
  MessageMedia,
  Roles,
};
