import {
  type MouseEvent,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./MenuItem.module.css";
import clsx from "clsx";

interface IMenuItem {
  onClick?: (el: MouseEvent<HTMLButtonElement>) => void;
  icon?: string;
  label: string;
  subContent?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const MenuItem = ({
  onClick,
  icon,
  label,
  subContent,
  className,
  children,
}: IMenuItem) => {
  const [isSubOpen, setIsSubOpen] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isSubOpen || !itemRef.current || !subRef.current) return;

    const itemRect = itemRef.current.getBoundingClientRect();
    const subRect = subRef.current.getBoundingClientRect();

    if (itemRect.right + subRect.width > window.innerWidth) {
      subRef.current.style.right = "100%";
    } else {
      subRef.current.style.left = "100%";
    }
  }, [isSubOpen]);

  return (
    <li
      ref={itemRef}
      onMouseEnter={() => subContent && setIsSubOpen(true)}
      onMouseLeave={() => subContent && setIsSubOpen(false)}
      style={{ position: "relative" }}
      className={clsx(styles.item, className)}
    >
      <button onClick={onClick}>
        {icon && <img src={icon} alt={label} />}
        <h3>{label}</h3>

        {children}
      </button>

      {isSubOpen && subContent && (
        <div ref={subRef} style={{ top: 0, position: "absolute" }}>
          {subContent}
        </div>
      )}
    </li>
  );
};

export default MenuItem;
