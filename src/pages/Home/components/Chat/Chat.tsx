import styles from "./Chat.module.css";
import InputWrapper from "./components/InputWrapper/InputWrapper";
import { useGetConversationQuery } from "@api/slices/chatSlice";
import { useAppSelector } from "@hooks/hooks";
import Header from "./components/Header/Header";
import Messages from "./components/Messages/Messages";

const Chat = () => {
  const { conversationId, recipientId } = useAppSelector(
    (state) => state.global,
  );
  const { data, isLoading, error } = useGetConversationQuery(
    { recipientId, conversationId },
    { skip: !conversationId && !recipientId },
  );

  if (!conversationId && !recipientId) {
    return (
      <div className={styles.noConversation}>No conversation selected.</div>
    );
  }

  if (isLoading) {
    return <div className={styles.noConversation}>Loading conversation...</div>;
  }

  if (error || !data) {
    return (
      <div className={styles.noConversation}>
        Error loading conversation. Please try again.
      </div>
    );
  }

  return (
    <section className={styles.chat}>
      <Header conversation={data} />
      {conversationId && <Messages conversation={data} />}
      <InputWrapper />
    </section>
  );
};

export default Chat;
