import login from "@actions/login";
import Button from "@components/Button/Button";
import Input from "@components/Input/Input";
import { startTransition, useActionState, type FormEvent } from "react";
import GoogleButton from "./GoogleButton";

interface ILogin {
  onHaveAccount: () => void;
}

const Login = ({ onHaveAccount }: ILogin) => {
  const [state, action, isPending] = useActionState(login, undefined);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      Login
      {isPending && <p>Loading...</p>}
      <Input
        type="email"
        placeholder="example@example.com"
        name="email"
        errors={state?.errors?.email}
      />
      <Input
        type="password"
        placeholder="password"
        name="password"
        errors={state?.errors?.password}
      />
      {state?.errors?.auth && (
        <p className="input__error">{state.errors.auth.join(", ")}</p>
      )}
      <Button type="submit" isLoading={isPending}>
        Login
      </Button>
      <p>
        Don't have an account? <strong onClick={onHaveAccount}>Register</strong>
      </p>
      <GoogleButton />
    </form>
  );
};

export default Login;
