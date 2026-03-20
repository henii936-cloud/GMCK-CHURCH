import { useState } from "react";
import { studyService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input } from "../../components/common/UI";
import { BookOpen, Send, CheckCircle2, History, Loader2 } from "lucide-react";

export default function Study() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    book: "",
    chapter: "",
    verse: "",
    topic: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await studyService.saveStudy({
        ...formData,
        chapter: parseInt(formData.chapter),
        group_id: user.group_id,
        leader_id: user.id
      }, user.group_id, user.id);
      
      setMessage("Study progress logged for Admin review!");
      setFormData({ book: "", chapter: "", verse: "", topic: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error logging progress. Please try again.");
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
              <Input 
                label="Book" 
                placeholder="e.g. Ephesians" 
                value={formData.book}
                onChange={(e) => setFormData({...formData, book: e.target.value})}
                required
              />
              <Input 
                label="Chapter" 
                type="number" 
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
                required
              />
            </div>
            
            <Input 
              label="Topic / Key Theme" 
              placeholder="e.g. Unity in Christ" 
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              required
            />

            {message && <p style={{ fontWeight: '700', color: message.includes('Error') ? '#ef4444' : '#10b981', textAlign: 'center' }}>{message}</p>}

            <Button type="submit" style={{ height: '48px', justifyContent: 'center' }} disabled={loading}>
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

        <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--tertiary)', borderLeftWidth: '6px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <CheckCircle2 color="var(--tertiary)" />
            <div>
              <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>Live Visibility</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Admins can see this topic immediately on their dashboard activity feed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
