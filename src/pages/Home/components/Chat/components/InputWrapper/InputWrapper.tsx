import { useAppSelector } from "@hooks/hooks";
import WriteMessage from "./components/WriteMessage/WriteMessage";
import styles from "./InputWrapper.module.css";
import EditMessage from "./components/EditMessage/EditMessage";

const InputWrapper = () => {
  const editingMessage = useAppSelector((state) => state.global.editingMessage);
  const conversationId = useAppSelector((state) => state.global.conversationId);
  const nickname = useAppSelector((state) => state.auth.user.nickname);

  return (
    <div className={styles.inputWrapper}>
      {conversationId && editingMessage ? (
        <EditMessage
          editingMessage={editingMessage}
          nickname={nickname}
          conversationId={conversationId}
        />
      ) : (
        <WriteMessage />
      )}
    </div>
  );
};

export default InputWrapper;
