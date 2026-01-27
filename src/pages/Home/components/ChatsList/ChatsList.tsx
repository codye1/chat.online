import ResizebleSection from "@components/ResizebleSection/ResizebleSection";
import vwToPx from "@utils/vwToPx";
import styles from "./ChatList.module.css";
import { useGetProtectedQuery } from "@api/api";
import Button from "@components/Button/Button";

const ChatsList = () => {
  const { data, refetch } = useGetProtectedQuery();

  console.log(new Date());

  return (
    <ResizebleSection maxWidth={vwToPx(60)} className={styles.chatsList}>
      Chats list
      {data && data.message}
      <Button onClick={() => refetch()}>Refetch</Button>
    </ResizebleSection>
  );
};

export default ChatsList;
