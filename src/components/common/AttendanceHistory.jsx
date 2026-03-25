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
    <div className="space-y-4">
      {sortedKeys.length === 0 ? (
        <div className="p-10 text-center text-on-surface-variant font-medium">
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
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });

          const isExpanded = expandedDates[key];

          return (
            <div key={key} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm">
              <div 
                className="bg-surface-container-low p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-low/80 transition-colors"
                onClick={() => toggleDate(key)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{displayDate}</h3>
                    <p className="text-sm text-on-surface-variant font-medium mt-0.5">
                      {groupData.groupName} • {records.length} Members
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
                      {presentCount} Present
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold tracking-wide uppercase">
                      {absentCount} Absent
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide uppercase">
                      {excusedCount} Excused
                    </span>
                  </div>
                  <div className="text-on-surface-variant flex items-center justify-center w-8 h-8 rounded-full bg-surface-container">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="divide-y divide-outline-variant/10 animate-in slide-in-from-top-2 duration-200">
                  {records.map(record => (
                    <div key={record.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {record.members?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-semibold text-on-surface">{record.members?.full_name || 'Unknown'}</span>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                        record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                        record.status === 'Absent' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
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
