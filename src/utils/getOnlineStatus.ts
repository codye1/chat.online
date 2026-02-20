const getOnlineStatus = (lastSeenAt: string | null): string => {
  if (!lastSeenAt) return "last seen a long time ago";

  const lastSeenDate = new Date(lastSeenAt);
  const now = new Date();
  const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

  return diffInMinutes < 1 ? "online" : "last seen recently";
};

export default getOnlineStatus;
