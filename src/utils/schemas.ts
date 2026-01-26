import { z } from "zod";

export type loginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        auth?: string[];
      };
      message?: string;
    }
  | undefined;

export const loginFormSchema = z.object({
  email: z
    .email({ message: "Будь ласка, введіть дійсну електронну адресу." })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Має містити щонайменше 8 символів." })
    .regex(/[a-zA-Z]/, { message: "Має містити щонайменше одну літеру." })
    .regex(/[0-9]/, { message: "Має містити щонайменше одну цифру." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Має містити щонайменше один спеціальний символ.",
    })
    .trim(),
});

export type registerFormState =
  | {
      errors?: {
        nickname?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;

export const registerFormSchema = z
  .object({
    nickname: z
      .string()
      .min(3, { message: "Має містити щонайменше 3 символи." })
      .max(10, { message: "Має містити не більше 10 символів." })
      .trim(),
    email: z
      .email({ message: "Будь ласка, введіть дійсну електронну адресу." })
      .trim(),
    password: z
      .string()
      .min(8, { message: "Має містити щонайменше 8 символів." })
      .regex(/[a-zA-Z]/, { message: "Має містити щонайменше одну літеру." })
      .regex(/[0-9]/, { message: "Має містити щонайменше одну цифру." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Має містити щонайменше один спеціальний символ.",
      })
      .trim(),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не збігаються.",
    path: ["confirmPassword"],
  });
