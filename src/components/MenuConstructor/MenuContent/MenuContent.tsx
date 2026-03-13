import React from "react";
import styles from "./MenuContent.module.css";
import clsx from "clsx";

interface IMenuContent {
  children: React.ReactNode;
  className?: string;
}

const MenuContent = ({ children, className }: IMenuContent) => {
  return <ul className={clsx(styles.content, className)}>{children}</ul>;
};

export default MenuContent;
