import { EtDatetime } from 'abushakir';

export const formatToEthiopian = (dateInput) => {
  if (!dateInput) return '';
  const dt = new Date(dateInput);
  if (isNaN(dt.getTime())) return dateInput;
  try {
    const et = new EtDatetime(dt.getTime());
    return `${et.monthGeez} ${et.day}, ${et.year}`;
  } catch (e) {
    return dt.toLocaleDateString();
  }
};

export const formatToEthiopianShort = (dateInput) => {
  if (!dateInput) return '';
  const dt = new Date(dateInput);
  if (isNaN(dt.getTime())) return dateInput;
  try {
    const et = new EtDatetime(dt.getTime());
    return `${et.monthGeez.substring(0, 3)} ${et.day}, ${et.year}`;
  } catch (e) {
    return dt.toLocaleDateString();
  }
};
