import { useAppSelector } from "@hooks/hooks";
import WriteMessage from "./components/WriteMessage/WriteMessage";
import styles from "./InputWrapper.module.css";
import EditMessage from "./components/EditMessage/EditMessage";

const InputWrapper = () => {
  const messageToEdit = useAppSelector((state) => state.global.messageToEdit);
  const conversationId = useAppSelector((state) => state.global.conversationId);
  const nickname = useAppSelector((state) => state.auth.user.nickname);

  return (
    <div className={styles.inputWrapper}>
      {conversationId && messageToEdit ? (
        <EditMessage
          messageToEdit={messageToEdit}
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
