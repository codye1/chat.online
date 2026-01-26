import register from "@actions/register";
import Button from "@components/Button/Button";
import ErrorsList from "@components/ErrorsList/ErrorsList";
import Input from "@components/Input/Input";
import { startTransition, useActionState, type FormEvent } from "react";
import GoogleButton from "./GoogleButton";

interface IRegister {
  onHaveAccount: () => void;
}

const Register = ({ onHaveAccount }: IRegister) => {
  const [state, action, isPending] = useActionState(register, undefined);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      Register
      {isPending && <p>Loading...</p>}
      <Input
        type="text"
        placeholder="nickname"
        name="nickname"
        errors={state?.errors?.nickname}
        isLoading={isPending}
      />
      <Input
        type="email"
        placeholder="example@example.com"
        name="email"
        errors={state?.errors?.email}
        isLoading={isPending}
      />
      <Input
        type="password"
        placeholder="password"
        name="password"
        errors={state?.errors?.password}
        isLoading={isPending}
      />
      <Input
        type="password"
        placeholder="confirm password"
        name="confirmPassword"
        errors={state?.errors?.confirmPassword}
        isLoading={isPending}
      />
      {state?.errors?.auth && <ErrorsList errors={state.errors.auth} />}
      <Button type="submit" isLoading={isPending}>
        Register
      </Button>
      <p className={"mt-[30px] mb-[30px] font-light text-xl"}>
        Do you have an account?{" "}
        <strong
          className={"cursor-pointer text-shadow-m"}
          onClick={onHaveAccount}
        >
          Login
        </strong>
      </p>
      <GoogleButton />
    </form>
  );
};

export default Register;
