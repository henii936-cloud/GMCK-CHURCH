import { supabase } from "./supabaseClient";

export const attendanceService = {
  saveAttendance: async (records) => {
    const { data, error } = await supabase
      .from("study_attendance")
      .insert(records)
      .select();

    if (error) throw error;
    return data;
  },

  getAttendanceHistory: async (groupId) => {
    const { data, error } = await supabase
      .from("study_attendance")
      .select(`
        *,
        members(full_name)
      `)
      .eq("group_id", groupId)
      .order("date", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getAllAttendance: async () => {
    const { data, error } = await supabase
      .from("study_attendance")
      .select(`
        *,
        members(full_name),
        bible_study_groups(group_name)
      `)
      .order("date", { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

export const studyService = {
  saveStudy: async (study) => {
    const { data, error } = await supabase
      .from("study_progress")
      .insert([study])
      .select();

    if (error) throw error;
    return data;
  },

  getStudyHistory: async (groupId) => {
    const { data, error } = await supabase
      .from("study_progress")
      .select("*")
      .eq("group_id", groupId)
      .order("completion_date", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getAllStudyProgress: async () => {
    const { data, error } = await supabase
      .from("study_progress")
      .select(`
        *,
        bible_study_groups(group_name)
      `)
      .order("completion_date", { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

export const financeService = {
  createTransaction: async (data) => {
    const { data: transData, error } = await supabase.from("transactions").insert([data]).select();
    if (error) throw error;
    return transData;
  },

  getTransactions: async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        profiles(full_name)
      `)
      .order("date", { ascending: false });
    if (error) throw error;
    return data;
  },

  getBudgets: async () => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  getApprovedBudgets: async () => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("status", "Approved")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  createBudget: async (budget) => {
    const { data, error } = await supabase
      .from("budgets")
      .insert([{ ...budget, status: "Pending" }])
      .select();
    if (error) throw error;
    return data;
  },

  updateBudgetStatus: async (id, status) => {
    const { data, error } = await supabase
      .from("budgets")
      .update({ status })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  }
};

export const memberService = {
  getMembers: async () => {
    const { data, error } = await supabase.from("members").select(`
      *,
      bible_study_groups(group_name)
    `).order("full_name");
    if (error) throw error;
    return data;
  },
  createMember: async (member) => {
    const { data, error } = await supabase.from("members").insert([member]).select();
    if (error) throw error;
    return data;
  },
  updateMember: async (id, member) => {
    const { data, error } = await supabase.from("members").update(member).eq("id", id).select();
    if (error) throw error;
    return data;
  },
  deleteMember: async (id) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
};

export const groupService = {
  getGroups: async () => {
    const { data, error } = await supabase.from("bible_study_groups").select(`
      *,
      group_leaders(
        profiles(full_name, role)
      )
    `).order("group_name");
    
    if (error) throw error;
    
    // Flatten data for easier consumption in frontend
    return data.map(g => ({
      ...g,
      leaders: g.group_leaders?.map(gl => gl.profiles) || []
    }));
  },

  assignLeader: async (groupId, userId) => {
    const { data, error } = await supabase
      .from("group_leaders")
      .insert({ group_id: groupId, user_id: userId })
      .select();
    
    if (error) throw error;
    return data;
  },

  createGroup: async (group) => {
    const { data, error } = await supabase.from("bible_study_groups").insert([group]).select();
    if (error) throw error;
    return data;
  }
};

export const eventService = {
  getEvents: async () => {
    const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
    if (error) throw error;
    return data;
  },
  createEvent: async (event) => {
    const { data, error } = await supabase.from("events").insert([event]).select();
    if (error) throw error;
    return data;
  }
};
