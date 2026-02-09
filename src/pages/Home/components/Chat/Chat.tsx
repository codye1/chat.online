import styles from "./Chat.module.css";
import Messages from "./components/Messages/Messages";
import InputWrapper from "./components/InputWrapper/InputWrapper";
import { useEffect } from "react";
import { useGetConversationQuery } from "@api/slices/chatSclice";
import { useAppSelector } from "@hooks/hooks";
import Header from "./components/Header/Header";

const Chat = () => {
  const { conversationId, recipientId } = useAppSelector(
    (state) => state.global,
  );
  const { data, refetch } = useGetConversationQuery(
    { recipientId, conversationId },
    { skip: !conversationId && !recipientId },
  );

  useEffect(() => {
    if (conversationId || recipientId) {
      refetch();
    }
  }, [conversationId, recipientId, refetch]);

  if (!conversationId && !recipientId) {
    return (
      <div className={styles.noConversation}>No conversation selected.</div>
    );
  }
  return (
    <section className={styles.chat}>
      {data && <Header conversation={data} />}
      {data && <Messages conversation={data} />}
      <InputWrapper />
    </section>
  );
};

export default Chat;
