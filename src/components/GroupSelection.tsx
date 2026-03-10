import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Users, Loader2, Check } from 'lucide-react';

export function GroupSelection() {
  const { setSelectedGroupId } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    const supabase = getSupabase();
    if (!supabase) {
      // Mock groups
      setGroups([
        { id: 'g1', name: 'Youth Bible Study' },
        { id: 'g2', name: 'Men\'s Fellowship' },
        { id: 'g3', name: 'Women\'s Prayer Group' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bible_study_groups')
        .select('id, name');
      if (error) throw error;
      setGroups(data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleConfirm = () => {
    if (selectedId) {
      setSelectedGroupId(selectedId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-8 text-center bg-emerald-600 text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Users size={32} />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-emerald-100 mt-2 font-medium">Please select your Bible study group to continue.</p>
        </div>

        <div className="p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
              <p className="text-sm text-slate-500 font-medium">Loading groups...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Your Group</label>
                <div className="space-y-3">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedId(group.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                        selectedId === group.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="font-bold">{group.name}</span>
                      {selectedId === group.id && <Check size={20} className="text-emerald-600" />}
                    </button>
                  ))}
                  {groups.length === 0 && (
                    <p className="text-center text-slate-500 py-4 italic">No groups found. Please contact your admin.</p>
                  )}
                </div>
              </div>

              <button
                disabled={!selectedId}
                onClick={handleConfirm}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
              >
                Enter Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
