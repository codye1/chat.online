import type { ReactNode } from "react";
import "./Button.css";
import Spiner from "@components/Spinner/Spinner";

interface IButton {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
}

const Button = ({
  children,
  onClick,
  type = "button",
  isLoading = false,
}: IButton) => {
  return (
    <button className="btn" onClick={onClick} type={type}>
      {isLoading ? <Spiner /> : children}
    </button>
  );
};

export default Button;
