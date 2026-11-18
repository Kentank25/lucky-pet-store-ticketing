// Temporary weekly practice hours until Laravel supplies the schedule.
export const DOCTORS = [
  { id: "doctor-1", name: "Dokter 1", roomId: "dokter-1", weekdays: [1, 2, 3, 4, 5, 6], hours: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"] },
  { id: "doctor-2", name: "Dokter 2", roomId: "dokter-2", weekdays: [1, 2, 3, 4, 5], hours: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
];

export const getDoctor = (id) => DOCTORS.find((doctor) => doctor.id === id);

export function availableDoctors(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const weekday = new Date(`${date}T12:00:00+07:00`).getUTCDay();
  return DOCTORS.filter((doctor) => doctor.weekdays.includes(weekday) && (!time || doctor.hours.includes(time)));
}
