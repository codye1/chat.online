import authSlice from "@api/slices/authSlice";
import store from "@redux/store";
import { loginFormSchema, type loginFormState } from "@utils/schemas";

type apiError = {
  data: {
    error: {
      message: string;
    };
  };
};

const login = async (_state: loginFormState, formData: FormData) => {
  const validatedFields = loginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        auth: undefined,
      },
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await store
      .dispatch(authSlice.endpoints.login.initiate({ email, password }))
      .unwrap();
  } catch (error) {
    if (typeof error === "object" && error !== null && "data" in error) {
      const err = error as apiError;

      console.error("Помилка входу:", err);
      return {
        errors: {
          auth: [err.data.error.message],
          email: undefined,
          password: undefined,
        },
      };
    } else {
      console.error("Невідома помилка входу:", error);
      return {
        errors: {
          auth: ["An unknown error occurred"],
          email: undefined,
          password: undefined,
        },
      };
    }
  }
};

export default login;
