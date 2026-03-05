import { type MouseEvent } from "react";

interface IContextMenuItem {
  onClick: (el: MouseEvent<HTMLButtonElement>) => void;
  icon?: string;
  label: string;
}

const ContextMenuItem = ({ onClick, icon, label }: IContextMenuItem) => {
  return (
    <li>
      <button onClick={onClick}>
        {icon && <img src={icon} alt={label} />}
        <h3>{label}</h3>
      </button>
    </li>
  );
};

export default ContextMenuItem;
