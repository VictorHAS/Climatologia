import { format, parse } from "date-fns";

export const convertTo24HourFormat = (time12HourFormat: string) => {
  const time24HourFormat = parse(time12HourFormat, "hh:mm aa", new Date());
  return format(time24HourFormat, "HH:mm");
};

export const roundedTemp = (temp: number) => Math.round(temp);
