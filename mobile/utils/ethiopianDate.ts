import { EtDatetime } from "abushakir";

export const ET_MONTHS = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን",
];

export const formatToEthiopian = (dateInput: string | Date | null): string => {
  if (!dateInput) return "";
  const dt = new Date(dateInput);
  if (isNaN(dt.getTime())) return String(dateInput);
  try {
    const et = new EtDatetime(dt.getTime());
    return `${(et as any).monthGeez} ${et.day}, ${et.year}`;
  } catch {
    return dt.toLocaleDateString();
  }
};

export const formatToEthiopianShort = (dateInput: string | Date | null): string => {
  if (!dateInput) return "";
  const dt = new Date(dateInput);
  if (isNaN(dt.getTime())) return String(dateInput);
  try {
    const et = new EtDatetime(dt.getTime());
    const monthName: string = (et as any).monthGeez ?? ET_MONTHS[et.month - 1];
    return `${monthName.substring(0, 3)} ${et.day}, ${et.year}`;
  } catch {
    return dt.toLocaleDateString();
  }
};

export const getCurrentEtDate = (): { year: number; month: number; day: number } => {
  const et = new EtDatetime(Date.now());
  return { year: et.year, month: et.month, day: et.day };
};

export const etToGregorian = (year: number, month: number, day: number): string => {
  try {
    const dummy = new EtDatetime();
    const ms = (dummy as any).dateToEpoch(year, month, day, 0, 0, 0, 0);
    return new Date(ms).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};

export const gregorianToEt = (isoDate: string): { year: number; month: number; day: number } | null => {
  try {
    const dt = new Date(isoDate);
    const et = new EtDatetime(dt.getTime());
    return { year: et.year, month: et.month, day: et.day };
  } catch {
    return null;
  }
};
