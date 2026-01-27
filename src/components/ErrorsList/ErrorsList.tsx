import styles from "./ErrorsList.module.css";
import errorIcon from "@assets/error.svg";
interface IErrorsList {
  errors: string[];
}

const ErrorsList = ({ errors }: IErrorsList) => {
  return (
    <ul className={styles.errorsList}>
      {errors.map((error, index) => (
        <li key={index + error}>
          <img src={errorIcon} alt="Error icon" className={styles.errorIcon} />
          {error}
        </li>
      ))}
    </ul>
  );
};

export default ErrorsList;
