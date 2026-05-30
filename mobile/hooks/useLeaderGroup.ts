import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

export interface LeaderGroup {
  id: string;
  group_name: string;
  location?: string;
  description?: string;
}

export const useLeaderGroup = () => {
  const { user } = useAuth();
  const [group, setGroup] = useState<LeaderGroup | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGroup = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("group_leaders")
        .select(`group_id, bible_study_groups:group_id (*)`)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      const g = (data as any)?.bible_study_groups ?? null;
      setGroup(g);
      setGroupId(data?.group_id ?? null);
    } catch (err) {
      console.error("useLeaderGroup error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [user?.id]);

  return { group, groupId, loading, refetch: fetchGroup };
};
