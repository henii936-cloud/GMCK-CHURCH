import React, { useState, useEffect, useRef } from 'react';
import { EtDatetime } from 'abushakir';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EtDatePicker({ value, onChange, label, required, className = "", name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('date'); // 'date' | 'month' | 'year'
  
  const [etYear, setEtYear] = useState('');
  const [etMonth, setEtMonth] = useState('');
  const [etDay, setEtDay] = useState('');

  // These dictate what's currently being viewed in the calendar popup
  const [viewYear, setViewYear] = useState('');
  const [viewMonth, setViewMonth] = useState('');
  
  const [yearPage, setYearPage] = useState(0);

  const containerRef = useRef(null);

  const months = [
    "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", 
    "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"
  ];

  const currentYear = new EtDatetime(Date.now()).year;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      try {
        const dt = new Date(value);
        if (!isNaN(dt.getTime())) {
          const et = new EtDatetime(dt.getTime());
          setEtYear(et.year);
          setEtMonth(et.month);
          setEtDay(et.day);
          setViewYear(et.year);
          setViewMonth(et.month);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setEtYear('');
      setEtMonth('');
      setEtDay('');
      setViewYear(currentYear);
      setViewMonth(1);
    }
  }, [value, currentYear]);

  const commitChange = (y, m, d) => {
    setEtYear(y);
    setEtMonth(m);
    setEtDay(d);
    
    if (y && m && d) {
      try {
        const dummyEt = new EtDatetime();
        const ms = dummyEt.dateToEpoch(Number(y), Number(m), Number(d), 0, 0, 0, 0);
        const gcDate = new Date(ms);
        if (!isNaN(gcDate.getTime())) {
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

  const handleDaySelect = (d) => {
    commitChange(viewYear, viewMonth, d);
    setIsOpen(false);
  };

  const handleMonthSelect = (m) => {
    setViewMonth(m);
    setView('date');
  };

  const handleYearSelect = (y) => {
    setViewYear(y);
    setView('month');
  };

  // Determine number of days in the currently viewed month
  let daysInViewMonth = 30;
  if (viewMonth === 13) {
    const isLeap = viewYear ? (Number(viewYear) % 4 === 3) : false;
    daysInViewMonth = isLeap ? 6 : 5;
  }
  const viewDays = Array.from({ length: daysInViewMonth }, (_, i) => i + 1);

  const displayText = etYear && etMonth && etDay 
    ? `${months[etMonth - 1]} ${etDay}, ${etYear}`
    : "Select Date";

  const renderDateView = () => (
    <div className="p-3">
      <div className="flex justify-between items-center mb-3">
        <button type="button" onClick={() => setView('month')} className="font-semibold text-on-surface hover:text-primary transition-colors">
          {months[viewMonth - 1]}
        </button>
        <button type="button" onClick={() => setView('year')} className="font-semibold text-on-surface hover:text-primary transition-colors">
          {viewYear}
        </button>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {viewDays.map(d => {
          const isSelected = d === etDay && viewMonth === etMonth && viewYear === etYear;
          return (
            <button
              key={d}
              type="button"
              onClick={() => handleDaySelect(d)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all
                ${isSelected ? 'bg-primary text-white font-bold shadow-md' : 'text-on-surface hover:bg-primary/10 hover:text-primary'}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="p-3">
      <div className="text-center font-semibold mb-3 text-on-surface">Select Month</div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((m, i) => {
          const monthNum = i + 1;
          const isSelected = monthNum === etMonth && viewYear === etYear;
          return (
            <button
              key={monthNum}
              type="button"
              onClick={() => handleMonthSelect(monthNum)}
              className={`py-2 px-1 text-xs rounded-lg transition-all
                ${isSelected ? 'bg-primary text-white font-bold shadow-md' : 'bg-surface text-on-surface border border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5'}`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderYearView = () => {
    const startYear = currentYear - 80 + (yearPage * 16);
    const endYear = startYear + 15;
    const pageYears = Array.from({ length: 16 }, (_, i) => startYear + i);
    
    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <button type="button" onClick={() => setYearPage(p => p - 1)} className="p-1 hover:bg-primary/10 rounded-full transition-colors text-on-surface">
            <ChevronLeft size={18} />
          </button>
          <div className="font-semibold text-sm text-on-surface">{startYear} - {endYear}</div>
          <button type="button" onClick={() => setYearPage(p => p + 1)} className="p-1 hover:bg-primary/10 rounded-full transition-colors text-on-surface">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {pageYears.map(y => {
            const isSelected = y === etYear;
            return (
              <button
                key={y}
                type="button"
                onClick={() => handleYearSelect(y)}
                className={`py-2 text-sm rounded-lg transition-all
                  ${isSelected ? 'bg-primary text-white font-bold shadow-md' : 'bg-surface text-on-surface border border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5'}`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && <label className="text-sm font-semibold text-on-surface">{label} {required && <span className="text-error">*</span>}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setView('date');
          }}
          className={`w-full h-10 px-3 rounded-lg border flex items-center justify-between transition-all bg-surface
            ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/30 hover:border-outline'}`}
        >
          <span className={`text-sm ${etYear ? 'text-on-surface' : 'text-on-surface-variant'}`}>
            {displayText}
          </span>
          <Calendar size={16} className="text-on-surface-variant" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-surface rounded-xl shadow-xl border border-outline-variant/20 w-[240px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {view === 'date' && renderDateView()}
            {view === 'month' && renderMonthView()}
            {view === 'year' && renderYearView()}
          </div>
        )}
      </div>
    </div>
  );
}
