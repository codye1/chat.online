import "./Input.css";

interface IInput {
  label?: string;
  placeholder: string;
  type: "text" | "password" | "email";
  trackValue?: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  isLoading?: boolean;
  errors?: string[];
  name: string;
}

const Input = ({
  label,
  type,
  trackValue,
  name,
  placeholder,
  errors,
  isLoading,
}: IInput) => {
  return (
    <label htmlFor={name} className="input">
      {label}
      <input
        type={type}
        value={trackValue?.value}
        onChange={trackValue?.onChange}
        name={name}
        id={name}
        placeholder={placeholder}
        disabled={isLoading}
      />
      {errors && (
        <ul>
          {errors.map((error) => (
            <li key={error} className="input__error">
              {error}
            </li>
          ))}
        </ul>
      )}
    </label>
  );
};

export default Input;
