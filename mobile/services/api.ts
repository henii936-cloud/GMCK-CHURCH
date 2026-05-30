import { supabase } from "./supabaseClient";

// ─── Attendance ───────────────────────────────────────────────────────────────

export const attendanceService = {
  saveAttendance: async (records: AttendanceRecord[]) => {
    const { data, error } = await supabase
      .from("study_attendance")
      .insert(records)
      .select();
    if (error) throw error;
    return data;
  },

  getAttendanceHistory: async (groupId: string) => {
    const { data, error } = await supabase
      .from("study_attendance")
      .select(`*, members(full_name, image_url)`)
      .eq("group_id", groupId)
      .order("date", { ascending: false });
    if (error) throw error;
    return data;
  },
};

// ─── Study Progress ───────────────────────────────────────────────────────────

export const studyService = {
  saveStudy: async (study: StudyRecord) => {
    const { data, error } = await supabase
      .from("study_progress")
      .insert([study])
      .select();
    if (error) throw error;
    return data;
  },

  getStudyHistory: async (groupId: string) => {
    const { data, error } = await supabase
      .from("study_progress")
      .select("*")
      .eq("group_id", groupId)
      .order("completion_date", { ascending: false });
    if (error) throw error;
    return data;
  },
};

// ─── Members ──────────────────────────────────────────────────────────────────

export const memberService = {
  getMembers: async () => {
    const { data, error } = await supabase
      .from("members")
      .select(`*, bible_study_groups(group_name)`)
      .order("full_name");
    if (error) throw error;
    return data;
  },
};

// ─── Groups ───────────────────────────────────────────────────────────────────

export const groupService = {
  getGroups: async () => {
    const { data, error } = await supabase
      .from("bible_study_groups")
      .select(`*, group_leaders(profiles(full_name, role)), members(id)`)
      .order("group_name");
    if (error) throw error;
    return (data ?? []).map((g: any) => ({
      ...g,
      leaders: g.group_leaders?.map((gl: any) => gl.profiles) ?? [],
      members_count: g.members?.length ?? 0,
    }));
  },

  assignLeader: async (groupId: string, userId: string) => {
    const { data, error } = await supabase
      .from("group_leaders")
      .insert({ group_id: groupId, user_id: userId })
      .select();
    if (error) throw error;
    return data;
  },
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messageService = {
  fetchMessages: async (channel: string | null, userId: string, targetId?: string) => {
    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(100);

    if (channel) {
      query = query.eq("channel", channel);
    } else if (targetId) {
      query = query
        .is("channel", null)
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${targetId}),and(sender_id.eq.${targetId},recipient_id.eq.${userId})`
        );
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  sendMessage: async (payload: {
    sender_id: string;
    content: string;
    channel?: string;
    recipient_id?: string;
  }) => {
    const { data, error } = await supabase
      .from("messages")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  fetchProfiles: async () => {
    const { data } = await supabase.from("profiles").select("*");
    const map: Record<string, any> = {};
    (data ?? []).forEach((p: any) => (map[p.id] = p));
    return map;
  },

  fetchRecentDMs: async (userId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("sender_id, recipient_id, created_at")
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .is("channel", null)
      .order("created_at", { ascending: false });

    const uniqueIds = new Set<string>();
    (data ?? []).forEach((m: any) => {
      if (m.sender_id !== userId) uniqueIds.add(m.sender_id);
      if (m.recipient_id !== userId) uniqueIds.add(m.recipient_id);
    });
    return Array.from(uniqueIds);
  },

  fetchAllUsers: async (excludeId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", excludeId);
    return data ?? [];
  },

  fetchBibleStudyGroups: async () => {
    const { data } = await supabase.from("bible_study_groups").select("*");
    return data ?? [];
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  member_id: string;
  group_id: string;
  status: "Present" | "Absent" | "Excused";
  date: string;
}

export interface StudyRecord {
  study_topic: string;
  completion_date: string;
  notes: string;
  group_id: string;
  leader_id: string;
}

export interface Member {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  image_url?: string;
  leave_status?: string;
  group_id?: string;
}

export interface Group {
  id: string;
  group_name: string;
  location?: string;
  leaders: any[];
  members_count: number;
}
