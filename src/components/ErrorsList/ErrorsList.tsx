import "./ErrorsList.css";
import errorIcon from "@assets/error.svg";
interface IErrorsList {
  errors: string[];
}

const ErrorsList = ({ errors }: IErrorsList) => {
  return (
    <ul className="errors-list">
      {errors.map((error, index) => (
        <li key={index + error}>
          <img src={errorIcon} alt="Error icon" className="error-icon" />
          {error}
        </li>
      ))}
    </ul>
  );
};

export default ErrorsList;
