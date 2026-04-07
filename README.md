# chat.online (frontend)

Frontend real-time chat application built with React + TypeScript.

## Contents

- [Description](#description)
- [Key Features](#key-features)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Flows](#data-flows)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [NPM Scripts](#npm-scripts)
- [API & Socket Core](#api--socket-core)
- [Form Validation](#form-validation)
- [Code Quality](#code-quality)
- [Notes & Limitations](#notes--limitations)

## Description

This project implements a messenger interface with the following scenarios:

- Authentication (email/password, Google OAuth)
- Chat list with search, archive, folders, and pin/unpin
- Private and group dialogs
- Sending, editing, deleting messages
- Reply, reactions, marking messages as read
- Uploading photos/videos via Cloudinary
- User profile and group management
- Realtime updates via Socket.IO

## Key Features

1. Auth flow
   - Login/Register via RTK Query endpoints
   - Google authentication via `@react-oauth/google`
   - Auto-refresh access token on 401 UNAUTHORIZED

2. Realtime chat
   - Socket subscriptions for new/edited/deleted messages
   - User activity events (`typing`, `editing`)
   - Update last seen / read status

3. Dialog management
   - Archive, mute/unmute, pin/unpin
   - Dialog folders (create, rename, delete, add/remove chats)
   - Global chat and user search

4. Messages
   - Optimistic update on send
   - Reply to message
   - Edit text and replace/add media
   - Message reactions, view reactors

5. Profile and groups
   - Edit profile, bio, name, nickname, avatar
   - Create group with avatar and participants
   - Add/remove participants, leave or delete group

## Technologies

- React 19
- TypeScript 5
- Vite 7
- Redux Toolkit + RTK Query
- React Router DOM 7
- Socket.IO Client 4
- Zod 4
- Cloudinary Upload API
- TanStack React Virtual
- react-intersection-observer
- ESLint 9 + Prettier
- Husky + lint-staged

## Architecture

### 1. UI layer

- Pages: `Auth`, `Home`
- Main parts of `Home`: chat list, chat, modals, toasts
- Modular components, styles via CSS Modules

### 2. State layer

- `auth` slice: user state, isAuth
- `global` slice: active chat/recipient, reply/edit state, modals, toasts, sidebar state
- RTK Query API:
  - base API (`src/api/api.ts`)
  - chat endpoints
  - auth endpoints
  - user endpoints
  - separate media API (Cloudinary)

### 3. Realtime layer

- Single socket client (`src/utils/socket/socket.ts`)
- Listener initialization in `useSocketConnection`
- Socket events update RTK Query cache via helpers, without full refetch

### 4. Data consistency

- Optimistic updates for messages/reactions/some dialog actions
- Cache sync via `updateQueryData`/`upsertQueryData`
- Listener middleware reacts to auth/user mutations (login, logout, refresh, update profile)

## Project Structure

Below is a simplified map of important directories.

```text
src/
  actions/                  # action wrappers for useActionState (login/register/editUser)
  api/
    api.ts                  # baseQuery + reauth
    listenerMiddleware.ts   # RTK listeners
    listeners/              # auth/user listeners
    slices/
      authSlice.ts
      userSlice.ts
      mediaSlice.ts
      Chat/
        chatSlice.ts
        endpoints/          # conversations/messages/reactions/folders
        handlers/           # socket event handlers
      helpers/              # cache helpers (ConversationsManage/MessagesManage/UserManage)
  components/
    ModalManager/           # centralized modal rendering
    Toasts/                 # toasts (including newMessage)
    ...                     # UI primitives (Button, Input, Popover, Drawer ...)
  hooks/
    useSocketConnection.ts
    useFolderConversations.ts
    useGetConversationActions.ts
    ...
  pages/
    Auth/
    Home/
      components/
        ConversationsList/
        Chat/
        Sidebar/
  redux/
    store.ts
    auth.ts
    global.ts
  router/
    routing.tsx             # route protection + redirect logic
  utils/
    schemas.ts              # zod form schemas
    types.ts                # domain types
    socket/                 # socket actions (message/reaction/conversation)
    helpers/                # utilities
```

## Data Flows

### Auth

1. User calls login/register/google endpoint
2. Listener saves access token to localStorage
3. Updates auth slice (`authUser`)
4. Socket authorizes with token and connects

### 401 Request

1. `baseQueryWithReauth` catches `UNAUTHORIZED` + 401
2. Calls `refresh` endpoint
3. Original request is retried automatically

### Messages

1. Sending triggers optimistic message in cache
2. `message:sent` event replaces temporary id with real one
3. `message:new|edited|deleted|read` events update chat and message cache

### Chat list

1. `getConversations` keeps normalized state (`byId`, active/archived ids, folders)
2. Lazy loading of missing items via `useLazyGetConversationsQuery`
3. Support for separate views: main list, search, archive

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_CLOUD_NAME=your_cloudinary_cloud_name
VITE_UPLOAD_PRESET=your_cloudinary_upload_preset
```

Explanation:

- `VITE_API_BASE_URL`: base URL for backend API + Socket server
- `VITE_GOOGLE_CLIENT_ID`: OAuth client id for Google Login button
- `VITE_CLOUD_NAME`: Cloudinary cloud name
- `VITE_UPLOAD_PRESET`: Cloudinary upload preset

## Local Setup

### Requirements

- Node.js 18+ (latest LTS recommended)
- npm 10+
- Running backend API and Socket server

### Steps

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure `.env` (see section above)

3. Start dev server:

   ```bash
   npm run dev
   ```

4. Open the app:

   ```text
   http://localhost:5173
   ```

## NPM Scripts

- `npm run dev` - local Vite dev server
- `npm run build` - TypeScript build + production bundle
- `npm run preview` - local preview of production build
- `npm run lint` - ESLint check for `src`
- `npm run format` - Prettier formatting for the whole repo

## API & Socket Core

### HTTP endpoints (frontend contracts)

- Auth:
  - `POST auth/login`
  - `POST auth/register`
  - `POST auth/google`
  - `POST auth/logout`
  - `POST auth/refresh`

- User:
  - `PATCH user`
  - `GET user/:id`

- Chat/conversations/messages/reactions/folders:
  - `GET chat/conversations/init`
  - `GET chat/conversations`
  - `GET chat/conversation`
  - `GET chat/search`
  - `POST/PATCH/DELETE` endpoints for managing dialogs, participants, folders
  - `GET chat/conversations/:conversationId/messages`
  - `GET chat/conversations/:conversationId/messages/:messageId/reactors`

### Socket events

- Outgoing:
  - `conversation:join`
  - `conversation:leave`
  - `message:send`
  - `message:edit`
  - `message:delete`
  - `message:read`
  - `reaction:add`
  - `reaction:remove`
  - `activity:start`
  - `activity:stop`
  - `lastSeenAt:update`

- Incoming:
  - `message:new`
  - `message:sent`
  - `message:edited`
  - `message:deleted`
  - `message:read`
  - `reaction:new`
  - `reaction:removed`
  - `conversation:new`
  - `conversation:deleted`
  - `conversation:update`
  - `conversation:participantsAdded`
  - `conversation:userRemoved`
  - `activity:start`
  - `activity:stop`
  - `lastSeenAt:update`

## Form Validation

Validation is done with Zod (`src/utils/schemas.ts`):

- Login:
  - valid email
  - password at least 8 characters
  - password must contain a letter, number, and special character

- Register:
  - nickname 3-10 characters
  - same requirements for email/password
  - `confirmPassword` must match `password`

- Edit profile:
  - validation for email/password/firstName/lastName/nickname/biography
  - partial update only for non-empty fields

## Code Quality

- ESLint with TypeScript rules + react-hooks
- Automatic removal of unused imports via `eslint-plugin-unused-imports`
- Prettier for formatting
- Husky pre-commit hook runs `lint-staged`

## Notes & Limitations

- No frontend tests (unit/e2e) at the moment
- Theme has CSS variables for dark/light, but theme switcher is not implemented as a separate UI control
- For correct operation, a compatible backend contract for events and endpoints is required
