const pad = (value: number) => value.toString().padStart(2, '0');

/** Calendar dates are user-facing values and must use the user's local timezone. */
export const localDateKey = (date = new Date()): string => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
);

export const localHour = (date = new Date()): number => date.getHours();

export const dateFromKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};
