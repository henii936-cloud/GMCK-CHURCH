/**
 * Example: How to use ChurchReportGenerator in your project
 *
 * Replace the mock fetcher methods with real API/DB calls
 * that connect to your ERP's Evangelism, Bible Study Groups,
 * Study Progress, Ministries, Events, and Finance modules.
 */

const { ChurchReportGenerator } = require("./churchReportGenerator");

// ─────────────────────────────────────────────────────────────
// MOCK DATA FETCHER
// Replace each method with a real API or DB query
// ─────────────────────────────────────────────────────────────
const mockFetcher = {
  // Section 1 – from Evangelism module (current quarter)
  async fetchEvangelism(quarter, year) {
    return {
      witnessed:         { men: 120, women: 95 },
      saved:             { men: 34,  women: 41 },
      baptized:          { men: 20,  women: 28 },
      repentance:        { men: 5,   women: 7  },
      totalMembers:      1540,
      previousTotalMembers: 1480,      // members at start of THIS quarter
      outreachStations:  ["Kotebe Station", "Akaki Station"],
      outreachPlan:      "",
    };
  },

  // Section 1 – from Evangelism module (previous quarter, for % comparison)
  async fetchLastQuarterEvangelism(quarter, year) {
    return { totalMembers: 1480 };
  },

  // Section 2 – from Bible Study Groups module
  async fetchBibleStudyGroups(quarter, year) {
    return {
      newMembersAddedToGroups: { men: 18, women: 22 },
      totalActiveGroups:       67,
      groupsAddedThisQuarter:  4,
    };
  },

  // Section 3 – from Study Progress module
  async fetchStudyProgress(quarter, year) {
    return {
      raisingLeadersRegistered:     25,
      raisingLeadersTrainingSessions: 3,
      churchServantTrainingSessions:  5,
      churchServantsTrained:          42,
    };
  },

  // Section 4 – from Ministries module
  async fetchMinistries(quarter, year) {
    return {
      visits: {
        "Evangelism Ministry":           5,
        "Disciple Sheep Ministry":        7,
        "Teaching Ministry":              4,
        "Development Ministry":           2,
        "Deacon Ministry":                3,
        "Stage Ministry":                 2,
        "Youth Ministry":                 6,
        "Marriage and Counseling Ministry": 3,
      },
    };
  },

  // Section 5 – from Dashboard / admin records
  async fetchCommunication(quarter, year) {
    return {
      reportsToEldersCommittee:     3,
      reportsSentToRegionalOffice:  3,
      reportsSentToMainOffice:      3,
      notSentReason:                "",
    };
  },

  // Section 6 – from Evangelism + Finance modules
  async fetchHolistic(quarter, year) {
    return {
      needyPeopleSupported:       12,
      financialGivingTeachings:    4,
    };
  },

  // Section 7 – from Events module
  async fetchEvents(quarter, year) {
    return { prayerFastingPrograms: 6 };
  },

  // Section 8 – from Ministries > Women's role
  async fetchWomensMinistry(quarter, year) {
    return { rating: "Very Good", noActivityReason: "" };
  },

  // Section 9 – from Ministries > Youth role
  async fetchYouthMinistry(quarter, year) {
    return { rating: "Good", noActivityReason: "" };
  },

  // Section 10 – from Ministries > Children's role
  async fetchChildrensMinistry(quarter, year) {
    return { rating: "Excellent", noActivityReason: "" };
  },

  // Church metadata
  async fetchChurchMeta() {
    return {
      name:       "Addis Ketema Local Church",
      region:     "Addis Ababa",
      chairman:   "Ato Bekele Tadesse",
      systemName: "Church ERP System",
    };
  },
};

// ─────────────────────────────────────────────────────────────
// GENERATE REPORT
// ─────────────────────────────────────────────────────────────
async function main() {
  const generator = new ChurchReportGenerator(mockFetcher, {
    gregorianYear: 2025,
  });

  const report = await generator.generate(1); // Quarter 1
  console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error);
