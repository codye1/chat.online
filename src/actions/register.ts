import authSlice from "@api/slices/authSlice";
import store from "@redux/store";
import { registerFormSchema, type RegisterFormState } from "@utils/schemas";

type apiError = {
  data: {
    error: {
      message: string;
    };
  };
};

const register = async (_state: RegisterFormState, formData: FormData) => {
  const validatedFields = registerFormSchema.safeParse({
    nickname: formData.get("nickname"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        auth: undefined,
      },
    };
  }

  const { nickname, email, password } = validatedFields.data;

  try {
    await store
      .dispatch(
        authSlice.endpoints.register.initiate({ nickname, email, password }),
      )
      .unwrap();
  } catch (error) {
    if (typeof error === "object" && error !== null && "data" in error) {
      const err = error as apiError;

      console.error("Помилка входу:", err);
      return {
        errors: {
          auth: [err.data.error.message],
          nickname: undefined,
          email: undefined,
          password: undefined,
          confirmPassword: undefined,
        },
      };
    } else {
      console.error("Невідома помилка входу:", error);
      return {
        errors: {
          auth: ["An unknown error occurred"],
          nickname: undefined,
          email: undefined,
          password: undefined,
          confirmPassword: undefined,
        },
      };
    }
  }
};

export default register;
