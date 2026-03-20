import { supabase } from "./supabaseClient";

export const attendanceService = {
  saveAttendance: async (records, groupId, leaderId) => {
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .insert(records)
      .select();

    if (attendanceError) throw attendanceError;

    const { error: activityError } = await supabase.from("activities").insert({
      group_id: groupId,
      leader_id: leaderId,
      type: "attendance",
      reference_id: attendanceData[0].id,
    });

    if (activityError) throw activityError;
    return attendanceData;
  },

  getAttendanceHistory: async (groupId) => {
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        members(name)
      `)
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

export const studyService = {
  saveStudy: async (study, groupId, leaderId) => {
    const { data: studyData, error: studyError } = await supabase
      .from("study_progress")
      .insert([study])
      .select();

    if (studyError) throw studyError;

    const { error: activityError } = await supabase.from("activities").insert({
      group_id: groupId,
      leader_id: leaderId,
      type: "study",
      reference_id: studyData[0].id,
    });

    if (activityError) throw activityError;
    return studyData;
  },

  getStudyHistory: async (groupId) => {
    const { data, error } = await supabase
      .from("study_progress")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

export const financeService = {
  createTransaction: async (data) => {
    // 🔥 ZERO-TRIGGER ARCHITECTURE: Manually handle side effects
    const { data: transData, error } = await supabase.from("transactions").insert([data]).select();
    if (error) throw error;

    // If it's an expense and has a budget, update the usage
    if (data.type === 'expense' && data.budget_id) {
      const { error: budgetError } = await supabase.rpc('increment_budget_usage', { 
        b_id: data.budget_id, 
        amount: data.amount 
      });
      
      // If RPC doesn't exist yet, we can fall back to manual update
      if (budgetError) {
        console.warn("RPC increment_budget_usage failed, trying manual update", budgetError);
        const { data: currentBudget } = await supabase.from("budgets").select("used_amount").eq("id", data.budget_id).single();
        await supabase.from("budgets").update({ 
          used_amount: (currentBudget?.used_amount || 0) + data.amount 
        }).eq("id", data.budget_id);
      }
    }

    return transData;
  },

  getApprovedBudgets: async () => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("status", "approved");
    if (error) throw error;
    return data;
  },

  getTransactions: async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        members(name),
        budgets(name),
        profiles(name)
      `)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  getFinanceSummary: async () => {
    const { data, error } = await supabase.rpc("finance_summary");
    if (error) throw error;
    return data[0];
  }
};

export const activityService = {
  getActivities: async () => {
    const { data, error } = await supabase.from("activities").select(`
      *,
      groups(name),
      profiles(name),
      study_progress(*)
    `).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
};

export const memberService = {
  getMembers: async () => {
    const { data, error } = await supabase.from("members").select(`
      *,
      groups(name)
    `).order("name");
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
    const { data, error } = await supabase.from("groups").select(`
      *,
      profiles!groups_leader_id_fkey(name)
    `).order("name");
    if (error) throw error;
    return data;
  },
  createGroup: async (group) => {
    const { data, error } = await supabase.from("groups").insert([group]).select();
    if (error) throw error;
    return data;
  }
};

export const budgetService = {
  getBudgets: async () => {
    const { data, error } = await supabase.from("budgets").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  createBudget: async (budget) => {
    const { data, error } = await supabase.from("budgets").insert([budget]).select();
    if (error) throw error;
    return data;
  },
  updateBudgetStatus: async (id, status, approvedBy) => {
    const { data, error } = await supabase.from("budgets").update({ status, approved_by: approvedBy }).eq("id", id).select();
    if (error) throw error;
    return data;
  }
};
