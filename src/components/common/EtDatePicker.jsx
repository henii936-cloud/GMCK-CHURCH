import React, { useState, useEffect, useMemo } from "react";
import { EtDatetime } from "abushakir";
import { ChevronDown } from "lucide-react";

export default function EtDatePicker({
  value,
  onChange,
  label,
  required,
  className = "",
  name,
}) {
  const [etYear, setEtYear] = useState("");
  const [etMonth, setEtMonth] = useState("");
  const [etDay, setEtDay] = useState("");

  const months = [
    "መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት",
    "መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜን"
  ];

  // Convert GC → ET
  useEffect(() => {
    if (!value) {
      setEtYear("");
      setEtMonth("");
      setEtDay("");
      return;
    }

    try {
      const dt = new Date(value);
      if (isNaN(dt.getTime())) return;

      const et = new EtDatetime(dt.getTime());

      setEtYear(String(et.year));
      setEtMonth(String(et.month));
      setEtDay(String(et.day));
    } catch (e) {
      console.error(e);
    }
  }, [value]);

  // Dynamic days (fixes Pagumen bug)
  const days = useMemo(() => {
    if (!etMonth) return [];

    if (Number(etMonth) === 13) {
      const isLeap = (Number(etYear) + 1) % 4 === 0;
      return Array.from({ length: isLeap ? 6 : 5 }, (_, i) => String(i + 1));
    }

    return Array.from({ length: 30 }, (_, i) => String(i + 1));
  }, [etMonth, etYear]);

  // Reset invalid day when month changes
  useEffect(() => {
    if (etDay && !days.includes(etDay)) {
      setEtDay("");
    }
  }, [etMonth, etYear, etDay, days]);

  const years = useMemo(() => {
    const currentYear = new EtDatetime(Date.now()).year;
    return Array.from({ length: 100 }, (_, i) =>
      String(currentYear - 80 + i)
    );
  }, []);

  const handleChange = (y, m, d) => {
    setEtYear(y);
    setEtMonth(m);
    setEtDay(d);

    if (y && m && d) {
      try {
        const et = new EtDatetime();
        const ms = et.dateToEpoch(
          Number(y),
          Number(m),
          Number(d),
          0, 0, 0, 0
        );

        const gcDate = new Date(ms);

        if (!isNaN(gcDate.getTime())) {
          // FIX: avoid UTC shift bug
          const iso = gcDate.toLocaleDateString("en-CA");
          onChange({ target: { value: iso, name } });
        }
      } catch (e) {
        console.error("Invalid Ethiopian date conversion", e);
      }
    } else {
      onChange({ target: { value: "", name } });
    }
  };

  const SelectBox = ({ value, onChange, options, placeholder }) => (
    <div className="relative w-full min-w-0">
      <select
        value={value}
        onChange={onChange}
        className="w-full h-10 px-3 pr-7 text-sm rounded-lg border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
      />
    </div>
  );

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-on-surface">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      {/* Compact 3-column grid UI */}
      <div className="grid grid-cols-3 gap-2 items-center w-full">
        <SelectBox
          value={etDay}
          placeholder="Day"
          options={days}
          onChange={(e) =>
            handleChange(etYear, etMonth, e.target.value)
          }
        />
        
        <SelectBox
          value={etMonth}
          placeholder="Month"
          options={months.map((m, i) => String(i + 1))}
          onChange={(e) =>
            handleChange(etYear, e.target.value, etDay)
          }
        />

        <SelectBox
          value={etYear}
          placeholder="Year"
          options={years}
          onChange={(e) =>
            handleChange(e.target.value, etMonth, etDay)
          }
        />
      </div>
    </div>
  );
}
