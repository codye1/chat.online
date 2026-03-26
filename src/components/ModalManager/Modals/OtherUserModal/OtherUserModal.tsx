import Modal from "@components/Modal/Modal";
import type { UserPreview } from "@utils/types";
import styles from "./OtherUserModal.module.css";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal, popModal } from "@redux/global";
import getDisplayName from "@utils/helpers/getDisplayName";
import ViewHeader from "@components/ViewModalConstructor/ViewHeader/ViewHeader";
import ViewControls from "@components/ViewModalConstructor/ViewControls/ViewControls";
import ViewBody from "@components/ViewModalConstructor/ViewBody/ViewBody";
import ViewDetail from "@components/ViewModalConstructor/ViewDetail/ViewDetail";
import Avatar from "@components/Avatar/Avatar";
import { useGetUserQuery } from "@api/slices/userSlice";
import getOnlineStatus from "@utils/helpers/getOnlineStatus";

interface IOtherUserModal {
  userPreview: UserPreview;
  canGoBack?: boolean;
}

const OtherUserModal = ({ userPreview, canGoBack }: IOtherUserModal) => {
  const dispatch = useAppDispatch();
  const { data } = useGetUserQuery(userPreview.id, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <Modal onClickOutside={() => dispatch(closeModal())}>
      <ViewHeader>
        <ViewControls
          onClose={() => dispatch(closeModal())}
          onBack={
            canGoBack
              ? () => {
                  dispatch(popModal());
                }
              : undefined
          }
        />
        <Avatar
          avatarUrl={userPreview.avatarUrl}
          width={"100px"}
          height={"100px"}
        />
        <div className={styles.headerInfo}>
          <h2>{getDisplayName(userPreview)}</h2>
          <h3>{getOnlineStatus(data?.lastSeenAt)}</h3>
        </div>
      </ViewHeader>
      <ViewBody className={styles.profileModalBody}>
        {data && data.biography && (
          <ViewDetail label="biography" value={data.biography} />
        )}
        <ViewDetail label="nickname" value={userPreview.nickname} link />
        {data && <ViewDetail label="email" value={data.email} link />}
      </ViewBody>
    </Modal>
  );
};

export default OtherUserModal;
export type { IOtherUserModal };
