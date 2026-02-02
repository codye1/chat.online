import { useState, type ReactNode } from "react";
import styles from "./ResizebleSection.module.css";
import vwToPx from "@utils/vwToPx";

interface IResizebleSection {
  children: ReactNode;
  maxWidth?: number;
  minWidth?: number;
  className?: string;
}

const ResizebleSection = ({
  children,
  maxWidth = vwToPx(100),
  minWidth = vwToPx(20),
  className,
}: IResizebleSection) => {
  const [width, setWidth] = useState<number>(vwToPx(50));

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <section
      className={`${styles.resizebleSection} ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}
      <div className={styles.resizer} onMouseDown={handleMouseDown}></div>
    </section>
  );
};

export default ResizebleSection;
