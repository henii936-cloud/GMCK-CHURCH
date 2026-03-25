import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

export default function AttendanceHistory({ history }) {
  const [expandedDates, setExpandedDates] = useState({});

  const toggleDate = (key) => {
    setExpandedDates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group by date AND group_id
  const groupedHistory = history.reduce((acc, record) => {
    const key = `${record.date}_${record.group_id}`;
    if (!acc[key]) {
      acc[key] = {
        date: record.date,
        groupName: record.bible_study_groups?.group_name || 'Unknown Group',
        records: []
      };
    }
    acc[key].records.push(record);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groupedHistory).sort((a, b) => {
    const dateA = new Date(groupedHistory[a].date);
    const dateB = new Date(groupedHistory[b].date);
    return dateB - dateA;
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      {sortedKeys.length === 0 ? (
        <div className="p-8 sm:p-10 text-center text-on-surface-variant font-medium text-sm">
          No attendance history found.
        </div>
      ) : (
        sortedKeys.map(key => {
          const groupData = groupedHistory[key];
          const records = groupData.records;
          const presentCount = records.filter(r => r.status === 'Present').length;
          const absentCount = records.filter(r => r.status === 'Absent').length;
          const excusedCount = records.filter(r => r.status === 'Excused').length;
          
          const [year, month, day] = groupData.date.split('-');
          const displayDate = new Date(year, month - 1, day).toLocaleDateString(undefined, { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          const displayDateLong = new Date(year, month - 1, day).toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });

          const isExpanded = expandedDates[key];

          return (
            <div key={key} className="bg-surface-container-lowest rounded-xl sm:rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm">
              <div 
                className="bg-surface-container-low p-3 sm:p-5 border-b border-outline-variant/20 flex flex-col gap-3 cursor-pointer hover:bg-surface-container-low/80 transition-colors"
                onClick={() => toggleDate(key)}
              >
                {/* Top row: date + expand icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Calendar size={18} className="sm:hidden" />
                      <Calendar size={24} className="hidden sm:block" />
                    </div>
                    <div className="min-w-0">
                      {/* Short date on mobile, long on desktop */}
                      <h3 className="text-sm sm:hidden font-bold text-on-surface truncate">{displayDate}</h3>
                      <h3 className="text-xl hidden sm:block font-bold text-on-surface">{displayDateLong}</h3>
                      <p className="text-[10px] sm:text-sm text-on-surface-variant font-medium mt-0.5 truncate">
                        {groupData.groupName} • {records.length} Members
                      </p>
                    </div>
                  </div>
                  <div className="text-on-surface-variant flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container shrink-0 ml-2">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Stats badges */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] sm:text-xs font-bold tracking-wide uppercase">
                    {presentCount} Present
                  </span>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-[9px] sm:text-xs font-bold tracking-wide uppercase">
                    {absentCount} Absent
                  </span>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[9px] sm:text-xs font-bold tracking-wide uppercase">
                    {excusedCount} Excused
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="divide-y divide-outline-variant/10">
                  {records.map(record => (
                    <div key={record.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm shrink-0">
                          {record.members?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-on-surface text-sm sm:text-base truncate">{record.members?.full_name || 'Unknown'}</span>
                      </div>
                      <span className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold tracking-wide uppercase shrink-0 ${
                        record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600' : 
                        record.status === 'Absent' ? 'bg-red-500/10 text-red-600' : 
                        'bg-amber-500/10 text-amber-600'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
