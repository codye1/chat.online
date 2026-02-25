import Modal from "@components/Modal/Modal";
import type { DirectConversation } from "@utils/types";
import styles from "./DirectInfoModal.module.css";
import closeIcon from "@assets/close.svg";
import Avatar from "@components/Avatar/Avatar";
import clsx from "clsx";

interface IDirectInfoModal {
  conversation: DirectConversation;
  onClickClose: () => void;
}

const DirectInfoModal = ({ conversation, onClickClose }: IDirectInfoModal) => {
  return (
    <Modal onClickOutside={onClickClose}>
      <div className={styles.closeIcon}>
        <img src={closeIcon} alt="close icon" onClick={onClickClose} />
      </div>
      <div className={styles.modalHeader}>
        <Avatar
          avatarUrl={conversation.avatarUrl}
          width={"100px"}
          height={"100px"}
        />
        <h2>
          {conversation.otherParticipant.firstName
            ? `${conversation.otherParticipant.firstName} ${conversation.otherParticipant.lastName}`
            : conversation.otherParticipant.nickname}
        </h2>
      </div>
      <div className={clsx(styles.modalBody, styles.profileModalBody)}>
        {conversation.otherParticipant.biography && (
          <>
            <h3>{conversation.otherParticipant.biography}</h3>
            <label>bio</label>
          </>
        )}
        <h3 className={styles.link}>{conversation.otherParticipant.email}</h3>
        <label>email</label>
        <h3 className={styles.link}>
          @{conversation.otherParticipant.nickname}
        </h3>
        <label>nickname</label>
      </div>
    </Modal>
  );
};

export default DirectInfoModal;
