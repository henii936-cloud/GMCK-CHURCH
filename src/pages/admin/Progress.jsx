import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button } from "../../components/common/UI";
import { BookOpen, Calendar, MapPin, Filter, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Progress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_progress')
        .select(`
          *,
          bible_study_groups(name)
        `)
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = progress.filter(p => 
    p.study_topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bible_study_groups?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Study Progress Feed</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor spiritual growth and study topics across all groups</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Filter topics or groups..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '44px', width: '250px' }}
            />
          </div>
          <Button variant="outline" icon={Filter}>Filter</Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading Progress...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredProgress.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card style={{ padding: '32px' }}>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ textAlign: 'center', minWidth: '80px', borderRight: '1px solid var(--border)', paddingRight: '32px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '4px' }}>
                      {new Date(p.completion_date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0 }}>
                      {new Date(p.completion_date).getDate()}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(p.completion_date).getFullYear()}
                    </p>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ padding: '6px 12px', borderRadius: '100px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={12} />
                        {p.bible_study_groups?.name}
                      </div>
                      <div style={{ padding: '6px 12px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: '800' }}>
                        COMPLETED
                      </div>
                    </div>
                    
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <BookOpen size={24} color="var(--primary)" />
                      {p.study_topic}
                    </h3>
                    
                    {p.notes && (
                      <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', marginTop: '16px' }}>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                          "{p.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {filteredProgress.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No study progress records found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
