import React, { useState, useEffect } from 'react';
import { EtDatetime } from 'abushakir';
import { ChevronDown } from 'lucide-react';

export default function EtDatePicker({ value, onChange, label, required, className = "", name }) {
  const [etYear, setEtYear] = useState('');
  const [etMonth, setEtMonth] = useState('');
  const [etDay, setEtDay] = useState('');

  const months = [
    "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", 
    "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"
  ];

  useEffect(() => {
    if (value) {
      try {
        const dt = new Date(value);
        if (!isNaN(dt.getTime())) {
          const et = new EtDatetime(dt.getTime());
          setEtYear(et.year);
          setEtMonth(et.month);
          setEtDay(et.day);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setEtYear('');
      setEtMonth('');
      setEtDay('');
    }
  }, [value]);

  const handleChange = (y, m, d) => {
    setEtYear(y);
    setEtMonth(m);
    setEtDay(d);
    
    if (y && m && d) {
      try {
        const dummyEt = new EtDatetime();
        const ms = dummyEt.dateToEpoch(Number(y), Number(m), Number(d), 0, 0, 0, 0);
        const gcDate = new Date(ms);
        if (!isNaN(gcDate.getTime())) {
          // Format as YYYY-MM-DD
          const iso = gcDate.toISOString().split('T')[0];
          onChange({ target: { value: iso, name } });
        }
      } catch (e) {
        console.error("Invalid EtDate conversion", e);
      }
    } else {
      onChange({ target: { value: '', name } });
    }
  };

  const currentYear = new EtDatetime(Date.now()).year;
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 80 + i);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-semibold text-on-surface">{label} {required && <span className="text-error">*</span>}</label>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            className="w-full h-12 pl-4 pr-8 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            value={etMonth}
            onChange={(e) => handleChange(etYear, e.target.value, etDay)}
            required={required}
          >
            <option value="">Month</option>
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
        </div>
        <div className="relative flex-[0.7]">
          <select
            className="w-full h-12 pl-4 pr-8 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            value={etDay}
            onChange={(e) => handleChange(etYear, etMonth, e.target.value)}
            required={required}
          >
            <option value="">Day</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
        </div>
        <div className="relative flex-[0.9]">
          <select
            className="w-full h-12 pl-4 pr-8 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
            value={etYear}
            onChange={(e) => handleChange(e.target.value, etMonth, etDay)}
            required={required}
          >
            <option value="">Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
        </div>
      </div>
    </div>
  );
}
