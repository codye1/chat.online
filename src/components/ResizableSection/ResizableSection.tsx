import { useState, useEffect, useRef, type ReactNode } from "react";
import styles from "./ResizableSection.module.css";
import vwToPx from "@utils/vwToPx";
import clsx from "clsx";

interface IResizableSection {
  children: ReactNode;
  maxWidth?: number;
  minWidth?: number;
  className?: string;
}

const ResizableSection = ({
  children,
  maxWidth = vwToPx(100),
  minWidth = vwToPx(20),
  className,
}: IResizableSection) => {
  const [width, setWidth] = useState<number>(vwToPx(50));
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

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
      cleanupRef.current = null;
    };

    cleanupRef.current = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <section
      className={clsx(styles.resizableSection, className)}
      style={{ width: `${width}px` }}
    >
      {children}
      <div className={styles.resizer} onMouseDown={handleMouseDown}></div>
    </section>
  );
};

export default ResizableSection;
