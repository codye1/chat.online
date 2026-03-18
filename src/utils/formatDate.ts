const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);

  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${month} ${day} at ${hours}:${minutes}`;
};

export default formatDate;
