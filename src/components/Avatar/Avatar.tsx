import type { ReactNode } from "react";
import styles from "./Avatar.module.css";
import userIcon from "@assets/user.svg";
import clsx from "clsx";
import check from "@assets/check.svg";

interface IAvatar {
  avatarUrl: string | null;
  width?: string | number;
  height?: string | number;
  children?: ReactNode;
  className?: string;
  selected?: boolean;
}

const Avatar = ({
  avatarUrl,
  width,
  height,
  children,
  className,
  selected,
}: IAvatar) => {
  return avatarUrl ? (
    <div
      className={clsx(styles.avatar, className, {
        [styles.selected]: selected,
      })}
      style={{ width, height }}
    >
      <img src={avatarUrl} alt="User avatar" className={styles.avatarImg} />
      {children}
      {selected && (
        <img src={check} alt="Selected" className={styles.selectedIcon} />
      )}
    </div>
  ) : (
    <div
      className={clsx(styles.placeholderIcon, styles.avatar, className, {
        [styles.selected]: selected,
      })}
      style={{ width, height }}
    >
      <img src={userIcon} alt="User icon" className={styles.avatarImg} />
      {selected && (
        <img src={check} alt="Selected" className={styles.selectedIcon} />
      )}
      {children}
    </div>
  );
};

export default Avatar;
