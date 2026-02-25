import userSlice from "@api/slices/userSlice";
import store from "@redux/store";
import { editUserFormSchema, type EditUserFormState } from "@utils/schemas";
import z from "zod";

type apiError = {
  data: {
    error: {
      message: string;
    };
  };
};

const editUser = async (
  _state: EditUserFormState,
  formData: FormData,
): Promise<EditUserFormState> => {
  const validatedFields = editUserFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    nickname: formData.get("nickname"),
    biography: formData.get("biography"),
  });

  if (!validatedFields.success) {
    console.log(
      z.treeifyError(validatedFields.error).properties?.firstName?.errors,
    );
    return {
      properties: {
        ...z.treeifyError(validatedFields.error).properties,
      },
    };
  }

  try {
    const dataToUpdate = Object.fromEntries(
      Object.entries(validatedFields.data).filter(
        ([, value]) => value !== null,
      ),
    );
    await store
      .dispatch(userSlice.endpoints.updateUser.initiate(dataToUpdate))
      .unwrap();
    return { success: true };
  } catch (error) {
    if (typeof error === "object" && error !== null && "data" in error) {
      const err = error as apiError;

      console.error("Помилка редагування користувача:", err);
      return {
        properties: {
          api: { errors: [err.data.error.message] },
        },
      };
    } else {
      console.error("Невідома помилка редагування користувача:", error);
      return {
        properties: {
          api: { errors: ["An unknown error occurred"] },
        },
      };
    }
  }
};

export default editUser;
