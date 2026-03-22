import { useState } from "react";
import { studyService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input } from "../../components/common/UI";
import { BookOpen, Send, CheckCircle2, History, Loader2 } from "lucide-react";

export default function Study() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    book: "",
    chapter: "",
    verse: "",
    topic: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.id) fetchGroupId();
  }, [user]);

  const fetchGroupId = async () => {
    const { data } = await supabase
      .from('bible_study_groups')
      .select('id')
      .eq('leader_id', user.id)
      .maybeSingle();
    
    if (data) setGroupId(data.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) return setMessage("You are not assigned to any group yet.");
    setLoading(true);
    setMessage("");
    try {
      await studyService.saveStudy({
        ...formData,
        group_id: groupId,
        leader_id: user.id
      });
      
      setMessage("Study progress logged successfully!");
      setFormData({ book: "", chapter: "", verse: "", topic: "", date: new Date().toISOString().split('T')[0] });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error logging progress.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: '32px' }}>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Study Progress</h1>
          <p style={{ color: 'var(--text-muted)' }}>Share what your group is learning with the church leadership</p>
        </div>

        <Card style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <Input 
                label="Study Topic" 
                placeholder="e.g. Unity in Christ" 
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                required
              />
            </div>

            <Input 
              label="Bible Book" 
              placeholder="e.g. Ephesians" 
              value={formData.book}
              onChange={(e) => setFormData({...formData, book: e.target.value})}
              required
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <Input 
                label="Chapter" 
                placeholder="1" 
                value={formData.chapter}
                onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                required
              />
              <Input 
                label="Verse(s)" 
                placeholder="1-10" 
                value={formData.verse}
                onChange={(e) => setFormData({...formData, verse: e.target.value})}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <Input 
                label="Completion Date" 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            {message && <p style={{ gridColumn: 'span 2', fontWeight: '700', color: message.includes('Error') ? '#ef4444' : '#10b981', textAlign: 'center' }}>{message}</p>}

            <Button type="submit" style={{ gridColumn: 'span 2', height: '48px', justifyContent: 'center' }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <>Log Study Progress <Send size={18} style={{ marginLeft: '8px' }} /></>}
            </Button>
          </form>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <History size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Updates</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6' }}>
            Your logs are automatically visible to the Admin through the global activity feed. This helps with tracking spiritual growth across all groups.
          </p>
        </Card>
      </div>
    </div>
  );
}
