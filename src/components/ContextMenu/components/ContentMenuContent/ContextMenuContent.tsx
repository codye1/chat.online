import React from "react";
import styles from "./ContextMenuContent.module.css";

interface IContextMenuContent {
  children: React.ReactNode;
}

const ContextMenuContent = ({ children }: IContextMenuContent) => {
  return <ul className={styles.content}>{children}</ul>;
};

export default ContextMenuContent;
