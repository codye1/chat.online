import type { User } from "./types";

const getDisplayName = (
  user: Pick<User, "firstName" | "lastName" | "nickname">,
) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  return user.nickname;
};

export default getDisplayName;
