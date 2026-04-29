import { EthDateTime, limits } from 'ethiopian-calendar-date-converter';

const ethMonths = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

export const getEthiopianFiscalQuarters = (gregorianYear) => {
  // Ethiopian fiscal year usually starts July 8 (Hamle 1) of the Gregorian year
  // e.g. FY 2025 starts July 8, 2025.
  // In Ethiopian calendar, July 8 2025 is Hamle 1, 2017 E.C.
  
  // Q1: Hamle 1 - Meskerem 30 (July 8 - Oct 10)
  // Q2: Tikimt 1 - Tahsas 30 (Oct 11 - Jan 8)
  // Q3: Tir 1 - Megabit 30 (Jan 9 - Apr 8)
  // Q4: Miazia 1 - Sene 30 (Apr 9 - July 7)

  // We can calculate this dynamically using the library, but since it's standard, we can return fixed Gregorian dates and convert them to Ethiopian strings.
  
  // To keep it simple and accurate, we'll define the Gregorian dates for the fiscal year starting in `gregorianYear`.
  // Note: Leap years change July 8 to July 9 sometimes, but we'll use exact Eth dates and convert to Greg.
  
  const ethYear = gregorianYear - 8; // Roughly. Hamle 2017 EC is July 2025 GC. (2025 - 8 = 2017)
  
  const quarters = [
    {
      label: "1st Quarter (Hamle - Meskerem)",
      ethStart: { year: ethYear, month: 11, date: 1 }, // Hamle 1
      ethEnd: { year: ethYear + 1, month: 1, date: 30 }, // Meskerem 30
    },
    {
      label: "2nd Quarter (Tikimt - Tahsas)",
      ethStart: { year: ethYear + 1, month: 2, date: 1 }, // Tikimt 1
      ethEnd: { year: ethYear + 1, month: 4, date: 30 }, // Tahsas 30
    },
    {
      label: "3rd Quarter (Tir - Megabit)",
      ethStart: { year: ethYear + 1, month: 5, date: 1 }, // Tir 1
      ethEnd: { year: ethYear + 1, month: 7, date: 30 }, // Megabit 30
    },
    {
      label: "4th Quarter (Miazia - Sene)",
      ethStart: { year: ethYear + 1, month: 8, date: 1 }, // Miazia 1
      ethEnd: { year: ethYear + 1, month: 10, date: 30 }, // Sene 30
    }
  ];

  return quarters.map((q, index) => {
    try {
      const startG = new EthDateTime(q.ethStart.year, q.ethStart.month, q.ethStart.date);
      const endG = new EthDateTime(q.ethEnd.year, q.ethEnd.month, q.ethEnd.date);

      const formatGregorian = (date) => {
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      };

      const formatEthiopian = (ethDate) => {
        return `${ethDate.date} ${ethMonths[ethDate.month - 1]} ${ethDate.year}`;
      };

      return {
        id: `Q${index + 1}-${gregorianYear}`,
        quarter: `Q${index + 1}`,
        year: gregorianYear.toString(),
        label: q.label,
        ethiopian_start: formatEthiopian(q.ethStart),
        ethiopian_end: formatEthiopian(q.ethEnd),
        gregorian_start: formatGregorian(new Date(startG.toEuropeanDate())),
        gregorian_end: formatGregorian(new Date(endG.toEuropeanDate())),
        gregorian_start_iso: startG.toEuropeanDate(),
        gregorian_end_iso: endG.toEuropeanDate()
      };
    } catch (error) {
      console.error("Error converting dates:", error);
      return null;
    }
  }).filter(Boolean);
};

export const getCurrentAndPreviousQuarters = () => {
  const currentYear = new Date().getFullYear();
  return [
    ...getEthiopianFiscalQuarters(currentYear - 1),
    ...getEthiopianFiscalQuarters(currentYear),
    ...getEthiopianFiscalQuarters(currentYear + 1)
  ];
};
