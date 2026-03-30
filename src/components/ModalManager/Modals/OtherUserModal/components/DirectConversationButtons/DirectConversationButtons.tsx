import ViewHeaderButton from "@components/ViewModalConstructor/ViewHeaderButton/ViewHeaderButton";
import type { Conversation } from "@utils/types";
import mutedIcon from "@assets/muted.svg";
import unmutedIcon from "@assets/unmuted.svg";
import useGetConversationActions from "@hooks/useGetConversationActions";
import deleteIcon from "@assets/trash.svg";

interface IDirectConversationButtons {
  conversation: Conversation;
}

const DirectConversationButtons = ({
  conversation,
}: IDirectConversationButtons) => {
  const { toggleMute, handleDeleteConversation } = useGetConversationActions({
    conversation,
  });

  return (
    <>
      <ViewHeaderButton
        title={conversation.isMuted ? "Unmute" : "Mute"}
        icon={conversation.isMuted ? mutedIcon : unmutedIcon}
        onClick={toggleMute}
      />
      <ViewHeaderButton
        title="Delete"
        icon={deleteIcon}
        onClick={handleDeleteConversation}
      />
    </>
  );
};

export default DirectConversationButtons;
