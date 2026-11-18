// Temporary roster until Laravel supplies staff and schedules.
export const GROOMERS = [
  { id: "groomer-1", name: "Groomer 1", roomId: "grooming-1", weekdays: [1, 2, 3, 4, 5, 6], hours: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"] },
  { id: "groomer-2", name: "Groomer 2", roomId: "grooming-2", weekdays: [1, 2, 3, 4, 5], hours: ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"] },
];

export const getGroomer = (id) => GROOMERS.find((groomer) => groomer.id === id);

export function availableGroomers(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const weekday = new Date(`${date}T12:00:00+07:00`).getUTCDay();
  return GROOMERS.filter((groomer) => groomer.weekdays.includes(weekday) && (!time || groomer.hours.includes(time)));
}
