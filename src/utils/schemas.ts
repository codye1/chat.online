import { z } from "zod";

export type LoginFormState =
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
  email: z.email({ message: "Please enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { message: "Must contain at least 8 characters." })
    .regex(/[a-zA-Z]/, { message: "Must contain at least one letter." })
    .regex(/[0-9]/, { message: "Must contain at least one digit." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Must contain at least one special character.",
    })
    .trim(),
});

export type RegisterFormState =
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
      .min(3, { message: "Must contain at least 3 characters." })
      .max(10, { message: "Must contain no more than 10 characters." })
      .trim(),
    email: z.email({ message: "Please enter a valid email address." }).trim(),
    password: z
      .string()
      .min(8, { message: "Must contain at least 8 characters." })
      .regex(/[a-zA-Z]/, { message: "Must contain at least one letter." })
      .regex(/[0-9]/, { message: "Must contain at least one digit." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Must contain at least one special character.",
      })
      .trim(),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type EditUserFormState =
  | {
      properties?: {
        email?: { errors: string[] };
        password?: { errors: string[] };
        lastName?: { errors: string[] };
        firstName?: { errors: string[] };
        nickname?: { errors: string[] };
        biography?: { errors: string[] };
        api?: { errors: string[] };
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const editUserFormSchema = z.object({
  email: z.union([
    z.email({ message: "Please enter a valid email address." }),
    z.null(),
  ]),
  password: z.union([
    z
      .string()
      .trim()
      .min(8, { message: "Must contain at least 8 characters." })
      .regex(/[a-zA-Z]/, { message: "Must contain at least one letter." })
      .regex(/[0-9]/, { message: "Must contain at least one digit." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Must contain at least one special character.",
      }),
    z.null(),
  ]),
  firstName: z.union([
    z
      .string()
      .trim()
      .min(2, { message: "Must contain at least 2 characters." })
      .max(20, { message: "Must contain no more than 20 characters." }),
    z.null(),
  ]),
  lastName: z.union([
    z
      .string()
      .trim()
      .max(20, { message: "Must contain no more than 20 characters." }),
    z.null(),
  ]),
  nickname: z.union([
    z
      .string()
      .trim()
      .min(3, { message: "Must contain at least 3 characters." })
      .max(10, { message: "Must contain no more than 10 characters." }),
    z.null(),
  ]),
  biography: z.union([
    z
      .string()
      .trim()
      .max(70, { message: "Must contain no more than 70 characters." }),
    z.null(),
  ]),
});
