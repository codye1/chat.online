import styles from "./Chat.module.css";
import Messages from "./components/Messages/Messages";
import InputWrapper from "./components/InputWrapper/InputWrapper";
import { useEffect } from "react";
import { useGetConversationQuery } from "@api/slices/chatSclice";
import { useAppSelector } from "@hooks/hooks";

const Chat = () => {
  const { conversationId, recipientId } = useAppSelector(
    (state) => state.global,
  );
  const { data, refetch } = useGetConversationQuery(
    { recipientId, conversationId },
    { skip: !conversationId && !recipientId },
  );
  console.log(conversationId, recipientId);

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
      {data && <Messages conversationId={data.id} messages={data.messages} />}
      <InputWrapper />
    </section>
  );
};

export default Chat;
