import login from "@actions/login";
import Button from "@components/Button/Button";
import Input from "@components/Input/Input";
import { startTransition, useActionState } from "react";
import GoogleButton from "./GoogleButton";

interface ILogin {
  onHaveAccount: () => void;
}

const Login = ({ onHaveAccount }: ILogin) => {
  const [state, action, isPending] = useActionState(login, undefined);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        errors={state?.errors.email}
      />
      <Input
        type="password"
        placeholder="password"
        name="password"
        errors={state?.errors.password}
      />
      {state?.errors?.auth && (
        <p className="input__error">{state.errors.auth.join(", ")}</p>
      )}
      <Button type="submit" isLoading={isPending}>
        Login
      </Button>
      <p className={"mt-[30px] mb-[30px] text-base font-light"}>
        Don't have an account?{" "}
        <strong
          className={"cursor-pointer text-shadow-m"}
          onClick={onHaveAccount}
        >
          Register
        </strong>
      </p>
      <GoogleButton />
    </form>
  );
};

export default Login;
