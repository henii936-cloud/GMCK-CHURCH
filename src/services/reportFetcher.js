import { supabase } from './supabaseClient';

export const reportFetcher = {
  async fetchEvangelism(quarter, year) {
    // In a real app, you'd query a 'quarterly_metrics' table or aggregate from 'members'
    // For now, we'll try to get some real stats from members table where possible
    const { data: members } = await supabase
      .from('members')
      .select('gender, join_date');

    const totalMembers = members?.length || 0;
    
    // We'll return mock data for the specific KPIs if not found in DB
    return {
      witnessed: { men: 45, women: 52 },
      saved: { men: 12, women: 15 },
      baptized: { men: 8, women: 10 },
      repentance: { men: 2, women: 3 },
      totalMembers: totalMembers,
      previousTotalMembers: totalMembers > 5 ? totalMembers - 5 : 0,
      outreachStations: ["Kotebe", "Akaki"],
      outreachPlan: ""
    };
  },

  async fetchLastQuarterEvangelism(quarter, year) {
    return { totalMembers: 140 };
  },

  async fetchBibleStudyGroups(quarter, year) {
    const { count: totalActiveGroups } = await supabase
      .from('bible_study_groups')
      .select('*', { count: 'exact', head: true });

    return {
      newMembersAddedToGroups: { men: 10, women: 12 },
      totalActiveGroups: totalActiveGroups || 0,
      groupsAddedThisQuarter: 2
    };
  },

  async fetchStudyProgress(quarter, year) {
    const { count: sessions } = await supabase
      .from('study_progress')
      .select('*', { count: 'exact', head: true });

    return {
      raisingLeadersRegistered: 15,
      raisingLeadersTrainingSessions: 2,
      churchServantTrainingSessions: sessions || 0,
      churchServantsTrained: 25
    };
  },

  async fetchMinistries(quarter, year) {
    return {
      visits: {
        "Evangelism Ministry": 3,
        "Disciple Sheep Ministry": 4,
        "Teaching Ministry": 2,
        "Development Ministry": 1,
        "Deacon Ministry": 2,
        "Stage Ministry": 1,
        "Youth Ministry": 4,
        "Marriage and Counseling Ministry": 2
      }
    };
  },

  async fetchCommunication(quarter, year) {
    return {
      reportsToEldersCommittee: 3,
      reportsSentToRegionalOffice: 1,
      reportsSentToMainOffice: 1,
      notSentReason: ""
    };
  },

  async fetchHolistic(quarter, year) {
    return {
      needyPeopleSupported: 5,
      financialGivingTeachings: 2
    };
  },

  async fetchEvents(quarter, year) {
    const { count: prayerPrograms } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .ilike('title', '%prayer%');

    return { prayerFastingPrograms: prayerPrograms || 0 };
  },

  async fetchWomensMinistry(quarter, year) {
    return { rating: "Good", noActivityReason: "" };
  },

  async fetchYouthMinistry(quarter, year) {
    return { rating: "Very Good", noActivityReason: "" };
  },

  async fetchChildrensMinistry(quarter, year) {
    return { rating: "Good", noActivityReason: "" };
  },

  async fetchChurchMeta() {
    return {
      name: "Meserete Kristos Church",
      region: "Addis Ababa",
      chairman: "Elder Tadesse",
      systemName: "GMCK-CHURCH ERP"
    };
  }
};
