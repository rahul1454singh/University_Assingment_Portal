export const formatDateTime = (dateStr) => {
  if (!dateStr) return { date: "-", time: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: dateStr, time: "" };

  const day = d.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours.toString().padStart(2, "0");

  return {
    date: `${day} ${month} ${year}`,
    time: `${formattedHours}:${minutes} ${ampm}`
  };
};
