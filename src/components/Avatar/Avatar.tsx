import type { ReactNode } from "react";
import styles from "./Avatar.module.css";
import userIcon from "@assets/user.svg";
import clsx from "clsx";

interface IAvatar {
  avatarUrl: string | null;
  width?: string | number;
  height?: string | number;
  children?: ReactNode;
}

const Avatar = ({ avatarUrl, width, height, children }: IAvatar) => {
  return avatarUrl ? (
    <div className={styles.avatar} style={{ width, height }}>
      <img src={avatarUrl} alt="User avatar" />
      {children}
    </div>
  ) : (
    <div
      className={clsx(styles.placeholderIcon, styles.avatar)}
      style={{ width, height }}
    >
      <img src={userIcon} alt="User icon" />
      {children}
    </div>
  );
};

export default Avatar;
