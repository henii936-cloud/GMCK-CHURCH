import { useEffect, useState } from "react";
import { attendanceService, memberService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button } from "../../components/common/UI";
import { ClipboardList, Users, Check, X, Search, Loader2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../../services/supabaseClient";
import AttendanceHistory from "../../components/common/AttendanceHistory";

export default function Attendance() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("take");
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      load();
    }
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('group_leaders')
        .select('group_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      
      const currentGroupId = assignmentData?.group_id;
      setGroupId(currentGroupId);

      if (!currentGroupId) {
        setMembers([]);
        return;
      }

      const data = await memberService.getMembers();
      const filtered = data.filter(m => m.group_id === currentGroupId);
      setMembers(filtered);
      
      const initial = {};
      filtered.forEach(m => initial[m.id] = 'Present');
      setAttendance(initial);

      const historyData = await attendanceService.getAttendanceHistory(currentGroupId);
      setHistory(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (memberId, status) => {
    setAttendance(prev => ({ ...prev, [memberId]: status }));
  };

  const handleSave = async () => {
    if (!groupId) return;
    setSaving(true);
    setMessage("");
    try {
      const records = members.map(m => ({
        member_id: m.id,
        group_id: groupId,
        status: attendance[m.id] || 'Present',
        date: new Date().toISOString().split('T')[0]
      }));

      await attendanceService.saveAttendance(records);
      setMessage("Attendance saved successfully!");
      
      const historyData = await attendanceService.getAttendanceHistory(groupId);
      setHistory(historyData);
      
      setTimeout(() => {
        setMessage("");
        setActiveTab("history");
      }, 1500);
    } catch (err) {
      console.error("Save attendance error:", err);
      
      let errorMsg = err.message || 'Please try again.';
      if (err.details) errorMsg += ` (${err.details})`;
      if (err.hint) errorMsg += ` Hint: ${err.hint}`;
      if (err.code) errorMsg += ` Code: ${err.code}`;
      
      setMessage(`Error saving attendance: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const today = new Date().toISOString().split('T')[0];
  const isAttendanceTakenToday = history.some(record => record.date === today);

  const presentCount = Object.values(attendance).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'Absent').length;
  const excusedCount = Object.values(attendance).filter(s => s === 'Excused').length;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="pl-10 lg:pl-0">
          <p className="label-sm text-tertiary-fixed-dim mb-1 sm:mb-2 tracking-[0.3em] text-[9px] sm:text-[11px]">Record Keeping</p>
          <h1 className="display-lg text-primary mb-1 sm:mb-2">Attendance <span className="text-tertiary-fixed-dim italic">Tracking</span></h1>
          <p className="text-on-surface-variant font-medium text-xs sm:text-sm hidden sm:block">Mark your group members for today's session</p>
        </div>
        <div className="bg-surface-container-low px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-outline-variant/10 self-start sm:self-auto">
          <p className="text-xs sm:text-sm font-bold text-primary">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button 
          onClick={() => setActiveTab('take')}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
            activeTab === 'take' 
              ? 'bg-primary text-on-primary shadow-md' 
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <ClipboardList size={16} />
          <span>Take</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-primary text-on-primary shadow-md' 
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <Calendar size={16} />
          <span>History</span>
        </button>
      </div>

      <Card className="overflow-hidden !p-0">
        {activeTab === 'take' ? (
          isAttendanceTakenToday ? (
            <div className="p-8 sm:p-16 text-center flex flex-col items-center justify-center bg-surface">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 sm:mb-6">
                <Check size={32} className="sm:hidden" />
                <Check size={40} className="hidden sm:block" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-2 sm:mb-3">Attendance Complete</h2>
              <p className="text-on-surface-variant mb-6 sm:mb-8 max-w-md text-sm sm:text-base">You have already recorded attendance for today's session.</p>
              <Button onClick={() => setActiveTab('history')} className="text-sm sm:text-base py-2.5 sm:py-3 px-5 sm:px-6">
                View History
              </Button>
            </div>
          ) : (
          <>
            {/* Search + count */}
            <div className="p-3 sm:p-6 bg-surface-container-low border-b border-outline-variant/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 opacity-40 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-9 sm:pl-12 pr-4 rounded-lg sm:rounded-xl bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none border-2 border-transparent focus:border-primary/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-lowest shrink-0 self-start sm:self-auto">
                <Users size={14} className="text-primary" />
                <span className="text-xs font-bold text-on-surface">{members.length} Total</span>
              </div>
            </div>

            {/* Member cards */}
            <div className="p-3 sm:p-6 bg-surface">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {filteredMembers.map((m) => (
                  <div 
                    key={m.id} 
                    className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-200 flex flex-col gap-3 sm:gap-4 ${
                      attendance[m.id] === 'Present' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm shadow-emerald-500/5' : 
                      attendance[m.id] === 'Absent' ? 'bg-red-500/5 border-red-500/20 shadow-sm shadow-red-500/5' : 
                      'bg-amber-500/5 border-amber-500/20 shadow-sm shadow-amber-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg shrink-0 overflow-hidden ${
                          attendance[m.id] === 'Present' ? 'bg-emerald-500/20 text-emerald-600' : 
                          attendance[m.id] === 'Absent' ? 'bg-red-500/20 text-red-600' : 
                          'bg-amber-500/20 text-amber-600'
                        }`}>
                          {m.image_url ? (
                            <img src={m.image_url} alt={m.full_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            m.full_name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-on-surface text-sm sm:text-lg truncate">{m.full_name}</h3>
                          <span className={`text-[9px] sm:text-xs font-bold uppercase tracking-wider ${
                            attendance[m.id] === 'Present' ? 'text-emerald-600' : 
                            attendance[m.id] === 'Absent' ? 'text-red-600' : 
                            'text-amber-600'
                          }`}>
                            {attendance[m.id]}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      <button 
                        onClick={() => setStatus(m.id, 'Present')}
                        className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                          attendance[m.id] === 'Present' 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'bg-surface-container hover:bg-emerald-500/10 text-on-surface-variant hover:text-emerald-500'
                        }`}
                      >
                        <Check size={16} />
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">Present</span>
                      </button>
                      <button 
                        onClick={() => setStatus(m.id, 'Absent')}
                        className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                          attendance[m.id] === 'Absent' 
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                            : 'bg-surface-container hover:bg-red-500/10 text-on-surface-variant hover:text-red-500'
                        }`}
                      >
                        <X size={16} />
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">Absent</span>
                      </button>
                      <button 
                        onClick={() => setStatus(m.id, 'Excused')}
                        className={`py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer ${
                          attendance[m.id] === 'Excused' 
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                            : 'bg-surface-container hover:bg-amber-500/10 text-on-surface-variant hover:text-amber-500'
                        }`}
                      >
                        <span className="font-black text-sm leading-none h-4 flex items-center">E</span>
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">Excused</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer: stats + actions */}
            <div className="p-3 sm:p-6 bg-surface-container-low border-t border-outline-variant/10">
              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] sm:text-xs font-bold">{presentCount} Present</span>
                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 text-[10px] sm:text-xs font-bold">{absentCount} Absent</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] sm:text-xs font-bold">{excusedCount} Excused</span>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <button 
                  onClick={() => {
                    const newAttendance = {};
                    members.forEach(m => newAttendance[m.id] = 'Present');
                    setAttendance(newAttendance);
                  }}
                  className="px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold bg-surface-container-lowest border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all cursor-pointer"
                >
                  All Present
                </button>
                <button 
                  onClick={() => {
                    const newAttendance = {};
                    members.forEach(m => newAttendance[m.id] = 'Absent');
                    setAttendance(newAttendance);
                  }}
                  className="px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold bg-surface-container-lowest border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all cursor-pointer"
                >
                  All Absent
                </button>
                <button 
                  onClick={() => {
                    const newAttendance = {};
                    members.forEach(m => newAttendance[m.id] = 'Excused');
                    setAttendance(newAttendance);
                  }}
                  className="px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold bg-surface-container-lowest border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all cursor-pointer"
                >
                  All Excused
                </button>
              </div>

              {/* Message */}
              {message && (
                <div className={`mb-3 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm font-bold text-center ${
                  message.includes('Error') 
                    ? 'bg-red-500/10 text-red-600' 
                    : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {message}
                </div>
              )}

              {/* Submit button */}
              <Button 
                onClick={handleSave} 
                disabled={saving || members.length === 0}
                className="w-full py-3 sm:py-4 text-sm sm:text-base justify-center rounded-xl"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <>Finalize Attendance <Check size={16} className="ml-2" /></>}
              </Button>
            </div>
          </>
          )
        ) : (
          <div className="p-3 sm:p-6 bg-surface">
            <AttendanceHistory history={history} />
          </div>
        )}
      </Card>
    </div>
  );
}
