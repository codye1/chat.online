import { type MouseEvent, type ReactNode, useRef, useState } from "react";

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
  const [placement, setPlacement] = useState<"right" | "left">("left");
  const itemRef = useRef<HTMLLIElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (!isSubOpen || !itemRef.current || !subRef.current) return;

    const itemRect = itemRef.current.getBoundingClientRect();
    const subRect = subRef.current.getBoundingClientRect();

    if (itemRect.right + subRect.width > window.innerWidth) {
      setPlacement("right");
    } else {
      setPlacement("left");
    }

    setIsSubOpen(true);
  };

  return (
    <li
      ref={itemRef}
      onMouseEnter={() => subContent && handleOpen()}
      onMouseLeave={() => subContent && setIsSubOpen(false)}
      style={{ position: "relative" }}
      className={className}
    >
      <button onClick={onClick}>
        {icon && <img src={icon} alt={label} />}
        <h3>{label}</h3>

        {children}
      </button>

      {isSubOpen && subContent && (
        <div
          ref={subRef}
          style={{ [placement]: "100%", top: 0, position: "absolute" }}
        >
          {subContent}
        </div>
      )}
    </li>
  );
};

export default MenuItem;
