# chat.online (frontend)

Фронтенд застосунок чату в реальному часі на React + TypeScript.

## Зміст

- [Опис](#опис)
- [Ключові можливості](#ключові-можливості)
- [Технології](#технології)
- [Архітектура](#архітектура)
- [Структура проєкту](#структура-проєкту)
- [Потоки даних](#потоки-даних)
- [Змінні середовища](#змінні-середовища)
- [Запуск локально](#запуск-локально)
- [NPM скрипти](#npm-скрипти)
- [Ядро API та Socket подій](#ядро-api-та-socket-подій)
- [Валідація форм](#валідація-форм)
- [Якість коду](#якість-коду)
- [Нотатки та обмеження](#нотатки-та-обмеження)

## Опис

Проєкт реалізує інтерфейс месенджера з такими сценаріями:

- авторизація (email/password, Google OAuth);
- список чатів із пошуком, архівом, папками та pin/unpin;
- приватні та групові діалоги;
- надсилання, редагування, видалення повідомлень;
- reply, реакції, маркування прочитаних повідомлень;
- завантаження фото/відео через Cloudinary;
- керування профілем користувача та групами;
- realtime оновлення через Socket.IO.

## Ключові можливості

1. Auth flow
   - Login/Register через RTK Query endpoints.
   - Google авторизація через `@react-oauth/google`.
   - Авто-refresh access token під час 401 UNAUTHORIZED.

2. Realtime chat
   - Socket-підписки на нові/редаговані/видалені повідомлення.
   - Події активності користувача (`typing`, `editing`).
   - Оновлення last seen / read status.

3. Керування діалогами
   - Архівація, mute/unmute, pin/unpin.
   - Папки діалогів (створення, перейменування, видалення, додавання/видалення чатів).
   - Глобальний пошук чатів та користувачів.

4. Повідомлення
   - Optimistic update при відправці.
   - Reply до повідомлення.
   - Редагування тексту і заміна/додавання медіа.
   - Реакції на повідомлення, перегляд reactor-ів.

5. Профіль і групи
   - Редагування профілю, біо, імені, ніка, аватара.
   - Створення групи з аватаром та учасниками.
   - Додавання/видалення учасників, вихід або видалення групи.

## Технології

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

## Архітектура

### 1. UI layer

- Сторінки: `Auth`, `Home`.
- Основні частини `Home`: список діалогів, чат, модалки, тости.
- Компоненти модульні, стилі через CSS Modules.

### 2. State layer

- `auth` slice: стан користувача, isAuth.
- `global` slice: активний чат/одержувач, reply/edit стан, модалки, тости, стан сайдбару.
- RTK Query API:
  - base API (`src/api/api.ts`);
  - chat endpoints;
  - auth endpoints;
  - user endpoints;
  - окремий media API (Cloudinary).

### 3. Realtime layer

- Єдиний socket client (`src/utils/socket/socket.ts`).
- Ініціалізація listener-ів у `useSocketConnection`.
- Події сокета оновлюють RTK Query cache через helper-и, без повного refetch.

### 4. Data consistency

- Optimistic updates для повідомлень/реакцій/частини дій з діалогами.
- Синхронізація кешу через `updateQueryData`/`upsertQueryData`.
- Listener middleware реагує на auth/user мутації (логін, logout, refresh, update profile).

## Структура проєкту

Нижче спрощена мапа важливих директорій.

```text
src/
  actions/                  # action-обгортки для useActionState (login/register/editUser)
  api/
    api.ts                  # baseQuery + реавторизація
    listenerMiddleware.ts   # RTK listeners
    listeners/              # auth/user listener-и
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
    ModalManager/           # централізований рендер модалок
    Toasts/                 # тости (включно з newMessage)
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
    routing.tsx             # захист роутів + redirect логіка
  utils/
    schemas.ts              # zod-схеми форм
    types.ts                # доменні типи
    socket/                 # socket actions (message/reaction/conversation)
    helpers/                # утиліти
```

## Потоки даних

### Auth

1. Користувач викликає login/register/google endpoint.
2. Listener зберігає access token у localStorage.
3. Оновлюється auth slice (`authUser`).
4. Socket авторизується токеном і підключається.

### Запит із 401

1. `baseQueryWithReauth` ловить `UNAUTHORIZED` + 401.
2. Викликається `refresh` endpoint.
3. Оригінальний запит повторюється автоматично.

### Повідомлення

1. Надсилання викликає optimistic message у кеш.
2. Подія `message:sent` замінює тимчасовий id на реальний.
3. Події `message:new|edited|deleted|read` оновлюють кеш чатів і повідомлень.

### Список чатів

1. `getConversations` тримає normalized state (`byId`, active/archived ids, folders).
2. Ліниве дозавантаження відсутніх елементів через `useLazyGetConversationsQuery`.
3. Підтримка окремих view: основний список, пошук, архів.

## Змінні середовища

Створи файл `.env` у корені проєкту.

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_CLOUD_NAME=your_cloudinary_cloud_name
VITE_UPLOAD_PRESET=your_cloudinary_upload_preset
```

Пояснення:

- `VITE_API_BASE_URL`: базова URL адреса backend API + Socket серверу.
- `VITE_GOOGLE_CLIENT_ID`: OAuth client id для кнопки Google Login.
- `VITE_CLOUD_NAME`: Cloudinary cloud name.
- `VITE_UPLOAD_PRESET`: Cloudinary upload preset.

## Запуск локально

### Вимоги

- Node.js 18+ (рекомендовано актуальний LTS).
- npm 10+.
- Працюючий backend API та Socket сервер.

### Кроки

1. Встановити залежності:

   ```bash
   npm install
   ```

2. Налаштувати `.env` (див. секцію вище).

3. Запустити dev сервер:

   ```bash
   npm run dev
   ```

4. Відкрити застосунок:

   ```text
   http://localhost:5173
   ```

## NPM скрипти

- `npm run dev` - локальний Vite dev сервер.
- `npm run build` - TypeScript build + production bundle.
- `npm run preview` - локальний preview production build.
- `npm run lint` - перевірка ESLint для `src`.
- `npm run format` - форматування Prettier по всьому репозиторію.

## Ядро API та Socket подій

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
  - `POST/PATCH/DELETE` endpoints для керування діалогами, учасниками, папками
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

## Валідація форм

Валідація зроблена на Zod (`src/utils/schemas.ts`):

- Login:
  - коректний email;
  - пароль мінімум 8 символів;
  - пароль повинен містити букву, цифру та спецсимвол.

- Register:
  - nickname 3-10 символів;
  - ті ж вимоги до email/password;
  - `confirmPassword` має збігатися з `password`.

- Edit profile:
  - валідація email/password/firstName/lastName/nickname/biography;
  - часткове оновлення тільки непорожніх полів.

## Якість коду

- ESLint з TypeScript rules + react-hooks.
- Автоматичне видалення невикористаних імпортів через `eslint-plugin-unused-imports`.
- Prettier для форматування.
- Husky pre-commit hook запускає `lint-staged`.

## Нотатки та обмеження

- У frontend немає тестів (unit/e2e) на поточний момент.
- Тема має CSS-змінні для dark/light, але перемикач теми не реалізований окремим UI контролом.
- Для коректної роботи потрібен сумісний backend контракт подій та endpoint-ів.
