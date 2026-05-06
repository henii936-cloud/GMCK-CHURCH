import EtDatePicker from "../../components/common/EtDatePicker";
import { useState, useEffect } from "react";
import { studyService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input } from "../../components/common/UI";
import { BookOpen, Send, CheckCircle2, History, Loader2 } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export default function Study() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [groupId, setGroupId] = useState(null);
  const [formData, setFormData] = useState({
    study_topic: "",
    completion_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    const fetchGroupId = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('group_leaders')
            .select('group_id')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!error && data) {
            setGroupId(data.group_id);
          }
        } catch (err) {
          console.error("Error fetching group ID:", err);
        }
      }
    };
    fetchGroupId();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) {
      setMessage("Error: No group assigned to this leader.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await studyService.saveStudy({
        ...formData,
        group_id: groupId,
        leader_id: user.id
      });
      
      setMessage("Study progress logged for Admin review!");
      setFormData({ study_topic: "", completion_date: new Date().toISOString().split('T')[0], notes: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Save study error:", err);
      setMessage(`Error logging progress: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5 sm:mb-8 pl-10 lg:pl-0">
        <p className="label-sm text-tertiary-fixed-dim mb-1.5 sm:mb-2 tracking-[0.3em] text-[9px] sm:text-[11px]">Spiritual Growth</p>
        <h1 className="display-lg text-primary mb-1 sm:mb-2">Study <span className="text-tertiary-fixed-dim italic">Progress</span></h1>
        <p className="text-on-surface-variant font-medium tracking-wide text-xs sm:text-sm hidden sm:block">Share what your group is learning with the church leadership</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-8">
        {/* Form */}
        <Card className="p-5 sm:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            <Input 
              label="Study Topic / Key Theme" 
              placeholder="e.g. Ephesians 1:1-10 • Unity in Christ" 
              value={formData.study_topic}
              onChange={(e) => setFormData({...formData, study_topic: e.target.value})}
              required
            />
            
            <EtDatePicker 
              label="Completion Date" 
              value={formData.completion_date}
              onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
              required
            />

            <div className="space-y-2 sm:space-y-3">
              <label className="label-sm font-black uppercase tracking-widest text-primary/60 text-[9px] sm:text-[11px]">Notes / Reflections</label>
              <textarea 
                className="w-full bg-surface-container-low rounded-lg sm:rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none border-2 border-transparent focus:border-primary/20 focus:bg-surface transition-all resize-none"
                style={{ minHeight: '100px' }}
                placeholder="Key takeaways or group reflections..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            {message && (
              <p className={`font-bold text-center text-xs sm:text-sm py-2 px-3 rounded-lg ${
                message.includes('Error') 
                  ? 'text-red-600 bg-red-500/10' 
                  : 'text-emerald-600 bg-emerald-500/10'
              }`}>
                {message}
              </p>
            )}

            <Button type="submit" className="w-full py-3 sm:py-4 justify-center rounded-xl text-sm sm:text-base" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Log Study Progress <Send size={16} className="ml-2" /></>}
            </Button>
          </form>
        </Card>

        {/* Sidebar info */}
        <div className="flex flex-col gap-3 sm:gap-6">
          <Card className="p-5 sm:p-8">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-5">
              <History size={18} className="text-primary" />
              <h3 className="text-sm sm:text-lg font-heading font-bold text-primary">Recent Updates</h3>
            </div>
            <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
              Your logs are automatically visible to the Admin through the global activity feed. This helps with tracking spiritual growth across all groups.
            </p>
          </Card>

          <div className="editorial-card p-4 sm:p-6 border-l-4 border-tertiary-fixed-dim">
            <div className="flex gap-2.5 sm:gap-3">
              <CheckCircle2 size={18} className="text-tertiary-fixed-dim shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm sm:text-base text-on-surface mb-0.5 sm:mb-1">Live Visibility</h4>
                <p className="text-on-surface-variant text-[10px] sm:text-xs leading-relaxed">Admins can see this topic immediately on their dashboard activity feed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
