import styles from "./ErrorsList.module.css";
import errorIcon from "@assets/error.svg";
interface IErrorsList {
  errors: string[] | string;
}

const ErrorsList = ({ errors }: IErrorsList) => {
  const errorList = Array.isArray(errors) ? errors : [errors];
  return (
    <ul className={styles.errorsList}>
      {errorList.map((error, index) => (
        <li key={index + error}>
          <img src={errorIcon} alt="Error icon" className={styles.errorIcon} />
          {error}
        </li>
      ))}
    </ul>
  );
};

export default ErrorsList;
