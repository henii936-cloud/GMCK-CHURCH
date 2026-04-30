/**
 * Church Quarterly Report Generator
 * Meserete Kristos Church – Addis Ababa Regional Office
 *
 * This module fetches data from the church ERP system's various roles/modules
 * and formats it into the official quarterly report structure.
 *
 * USAGE:
 *   const generator = new ChurchReportGenerator(dataFetcher, options);
 *   const report = await generator.generate(quarter, year);
 */

// ─────────────────────────────────────────────────────────────
// QUARTER CALENDAR HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Ethiopian Calendar offset: Ethiopian year starts ~Sep 11 (Gregorian).
 * Ethiopian month = 30 days (12 months) + Pagume (5–6 days).
 * We store quarter definitions in Gregorian and derive Ethiopian labels.
 */
const QUARTERS = {
  1: {
    label: "1st Quarter",
    gregorian: { start: "July 08", end: "Oct 10" },
    ethiopian: { start: "Hamle 01", end: "Tikimt 01" },
  },
  2: {
    label: "2nd Quarter",
    gregorian: { start: "Oct 11", end: "Jan 10" },
    ethiopian: { start: "Tikimt 02", end: "Tir 02" },
  },
  3: {
    label: "3rd Quarter",
    gregorian: { start: "Jan 11", end: "Apr 10" },
    ethiopian: { start: "Tir 03", end: "Miazia 03" },
  },
  4: {
    label: "4th Quarter",
    gregorian: { start: "Apr 11", end: "Jul 07" },
    ethiopian: { start: "Miazia 04", end: "Sene 30" },
  },
};

function getQuarterDates(quarter, gregorianYear) {
  const q = QUARTERS[quarter];
  if (!q) throw new Error(`Invalid quarter: ${quarter}. Must be 1–4.`);

  // Ethiopian year is ~7–8 years behind Gregorian; year boundary shifts in Sep
  const ethYear = quarter === 1 ? gregorianYear - 8 : gregorianYear - 7;

  return {
    label: q.label,
    gregorian: {
      start: `${q.gregorian.start}, ${gregorianYear}`,
      end:
        quarter === 2
          ? `${q.gregorian.end}, ${gregorianYear + 1}`
          : `${q.gregorian.end}, ${gregorianYear}`,
    },
    ethiopian: {
      start: `${q.ethiopian.start}, ${ethYear} E.C.`,
      end: `${q.ethiopian.end}, ${ethYear} E.C.`,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// GENDER BREAKDOWN HELPER
// ─────────────────────────────────────────────────────────────

/**
 * Normalizes a {men, women, total} record.
 * If total is missing, it is computed from men + women.
 */
function genderBreakdown(men = 0, women = 0, total = null) {
  return {
    men: Number(men) || 0,
    women: Number(women) || 0,
    total: total !== null ? Number(total) : (Number(men) || 0) + (Number(women) || 0),
  };
}

// ─────────────────────────────────────────────────────────────
// SECTION BUILDERS
// Each section maps to a numbered section in the official report.
// ─────────────────────────────────────────────────────────────

/**
 * Section 1 – Evangelism Ministry
 * Data source: Evangelism module (outreach records, member records)
 *
 * @param {object} evangelismData  Raw data from Evangelism role
 * @param {object} lastQuarterData Raw data from previous quarter's Evangelism role
 * @returns {object} Formatted section 1 data
 */
function buildEvangelismSection(evangelismData = {}, lastQuarterData = {}) {
  const {
    witnessed = { men: 0, women: 0 },
    saved = { men: 0, women: 0 },
    baptized = { men: 0, women: 0 },
    repentance = { men: 0, women: 0 },
    totalMembers = 0,
    previousTotalMembers = 0, // within this quarter's starting baseline
    outreachStations = [],
    outreachPlan = "",
  } = evangelismData;

  const { totalMembers: lastQuarterTotalMembers = 0 } = lastQuarterData;

  // 1.5 – Membership growth percentage within this quarter
  const membershipGrowthPct =
    previousTotalMembers > 0
      ? (((totalMembers - previousTotalMembers) / previousTotalMembers) * 100).toFixed(2)
      : "N/A";

  // 1.5 – Percentage increase compared to last quarter report
  const vsLastQuarterPct =
    lastQuarterTotalMembers > 0
      ? (((totalMembers - lastQuarterTotalMembers) / lastQuarterTotalMembers) * 100).toFixed(2)
      : "N/A";

  return {
    section: "1",
    title: "Evangelism Ministry",
    items: {
      "1.1": {
        label: "People witnessed to this quarter",
        ...genderBreakdown(witnessed.men, witnessed.women),
      },
      "1.2": {
        label: "People saved",
        ...genderBreakdown(saved.men, saved.women),
      },
      "1.3": {
        label: "People baptized",
        ...genderBreakdown(baptized.men, baptized.women),
      },
      "1.4": {
        label: "Returned in repentance",
        ...genderBreakdown(repentance.men, repentance.women),
      },
      "1.5": {
        label: "Membership growth percentage",
        withinQuarter: `${membershipGrowthPct}%`,
        vsLastQuarter: `${vsLastQuarterPct}%`,
      },
      "1.6": {
        label: "Outreach stations",
        count: outreachStations.length,
        names: outreachStations,
        plan: outreachStations.length === 0 ? outreachPlan : null,
      },
    },
  };
}

/**
 * Section 2 – Teaching the Word of God (Small Groups)
 * Data source: Bible Study Groups module
 *
 * @param {object} bibleStudyData  Raw data from Bible Study Groups role
 */
function buildTeachingSection(bibleStudyData = {}) {
  const {
    newMembersAddedToGroups = { men: 0, women: 0 },
    totalActiveGroups = 0,
    groupsAddedThisQuarter = 0,
  } = bibleStudyData;

  return {
    section: "2",
    title: "Teaching the Word of God in an Organized Way",
    items: {
      "2.1": {
        label: "People without small groups added to a group this quarter",
        ...genderBreakdown(newMembersAddedToGroups.men, newMembersAddedToGroups.women),
      },
      "2.2": {
        label: "Total active small groups",
        count: totalActiveGroups,
      },
      "2.3": {
        label: "Small groups added this quarter",
        count: groupsAddedThisQuarter,
      },
      "2.4": {
        label: "Total number of small groups (quarter end)",
        count: totalActiveGroups,
      },
    },
  };
}

/**
 * Section 3 – Discipleship / Raising Leaders
 * Data source: Study Progress module
 *
 * @param {object} studyProgressData  Raw data from Study Progress role
 */
function buildDiscipleshipSection(studyProgressData = {}) {
  const {
    raisingLeadersRegistered = 0,
    raisingLeadersTrainingSessions = 0,
    churchServantTrainingSessions = 0,
    churchServantsTrained = 0,
  } = studyProgressData;

  return {
    section: "3",
    title: "Discipleship / Raising Leaders",
    items: {
      "3.1": {
        label: "People registered and learning 'Raising Leaders' this quarter",
        count: raisingLeadersRegistered,
        sessions: raisingLeadersTrainingSessions,
      },
      "3.2": {
        label: "Training sessions given to equip church servants",
        sessions: churchServantTrainingSessions,
        participants: churchServantsTrained,
      },
    },
  };
}

/**
 * Section 4 – Encouraging Ministry Departments
 * Data source: Ministries module
 *
 * @param {object} ministriesData  Raw data from Ministries role
 */
function buildMinistriesSection(ministriesData = {}) {
  const MINISTRY_LIST = [
    "Evangelism Ministry",
    "Disciple Sheep Ministry",
    "Teaching Ministry",
    "Development Ministry",
    "Deacon Ministry",
    "Stage Ministry",
    "Youth Ministry",
    "Marriage and Counseling Ministry",
  ];

  const visits = ministriesData.visits || {};

  const ministryRows = MINISTRY_LIST.map((name) => ({
    ministry: name,
    timesEncouraged: visits[name] || 0,
  }));

  return {
    section: "4",
    title: "Encouraging Ministry Departments",
    items: {
      ministryVisits: ministryRows,
    },
  };
}

/**
 * Section 5 – Communication
 * Data source: Dashboard / admin records
 *
 * @param {object} communicationData
 */
function buildCommunicationSection(communicationData = {}) {
  const {
    reportsToEldersCommittee = 0,
    reportsSentToRegionalOffice = 0,
    reportsSentToMainOffice = 0,
    notSentReason = "",
  } = communicationData;

  return {
    section: "5",
    title: "Communication",
    items: {
      "5.1": { label: "Monthly reports given to elders committee", count: reportsToEldersCommittee },
      "5.2": {
        label: "Reports sent to offices",
        regional: reportsSentToRegionalOffice,
        main: reportsSentToMainOffice,
      },
      "5.3": {
        label: "Reason if not sent",
        reason: notSentReason || null,
      },
    },
  };
}

/**
 * Section 6 – Holistic Church Ministry
 * Data source: Evangelism + Finance modules
 *
 * @param {object} holisticData
 */
function buildHolisticSection(holisticData = {}) {
  const {
    needyPeopleSupported = 0,
    financialGivingTeachings = 0,
  } = holisticData;

  return {
    section: "6",
    title: "Holistic Church Ministry",
    items: {
      "6.1": { label: "Needy people who received support", count: needyPeopleSupported },
      "6.2": { label: "Teachings encouraging financial giving", count: financialGivingTeachings },
    },
  };
}

/**
 * Section 7 – Prayer and Fasting Programs
 * Data source: Events module
 *
 * @param {object} eventsData
 */
function buildPrayerSection(eventsData = {}) {
  const { prayerFastingPrograms = 0 } = eventsData;

  return {
    section: "7",
    title: "Prayer and Fasting Programs",
    items: {
      "7.1": { label: "Prayer and fasting programs conducted this quarter", count: prayerFastingPrograms },
    },
  };
}

/**
 * Section 8 – Women's Ministry Activity
 * Data source: Ministries > Women's role
 *
 * @param {object} womenData
 */
function buildWomensSection(womenData = {}) {
  const RATING_OPTIONS = ["Excellent", "Very Good", "Good", "Weak", "No Activity"];
  const { rating = "Good", noActivityReason = "" } = womenData;

  if (!RATING_OPTIONS.includes(rating)) {
    throw new Error(`Invalid Women's Ministry rating: "${rating}". Must be one of: ${RATING_OPTIONS.join(", ")}`);
  }

  return {
    section: "8",
    title: "Women's Ministry Activity",
    items: {
      rating,
      noActivityReason: rating === "No Activity" ? noActivityReason : null,
    },
  };
}

/**
 * Section 9 – Youth Ministry Activity
 * Data source: Ministries > Youth role
 *
 * @param {object} youthData
 */
function buildYouthSection(youthData = {}) {
  const RATING_OPTIONS = ["Excellent", "Very Good", "Good", "Weak", "No Activity"];
  const { rating = "Good", noActivityReason = "" } = youthData;

  if (!RATING_OPTIONS.includes(rating)) {
    throw new Error(`Invalid Youth Ministry rating: "${rating}". Must be one of: ${RATING_OPTIONS.join(", ")}`);
  }

  return {
    section: "9",
    title: "Youth Ministry Activity",
    items: {
      rating,
      noActivityReason: rating === "No Activity" ? noActivityReason : null,
    },
  };
}

/**
 * Section 10 – Children's Sunday School Ministry
 * Data source: Ministries > Children's role
 *
 * @param {object} childrenData
 */
function buildChildrenSection(childrenData = {}) {
  const RATING_OPTIONS = ["Excellent", "Very Good", "Good", "Weak", "No Activity"];
  const { rating = "Good", noActivityReason = "" } = childrenData;

  if (!RATING_OPTIONS.includes(rating)) {
    throw new Error(`Invalid Children's Ministry rating: "${rating}". Must be one of: ${RATING_OPTIONS.join(", ")}`);
  }

  return {
    section: "10",
    title: "Children's Sunday School Ministry",
    items: {
      rating,
      noActivityReason: rating === "No Activity" ? noActivityReason : null,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN REPORT ASSEMBLER
// ─────────────────────────────────────────────────────────────

/**
 * ChurchReportGenerator
 *
 * @param {object} dataFetcher  Object with async methods that fetch data
 *   from each ERP module. Expected shape:
 *   {
 *     fetchEvangelism(quarter, year),
 *     fetchLastQuarterEvangelism(quarter, year),
 *     fetchBibleStudyGroups(quarter, year),
 *     fetchStudyProgress(quarter, year),
 *     fetchMinistries(quarter, year),
 *     fetchCommunication(quarter, year),
 *     fetchHolistic(quarter, year),
 *     fetchEvents(quarter, year),
 *     fetchWomensMinistry(quarter, year),
 *     fetchYouthMinistry(quarter, year),
 *     fetchChildrensMinistry(quarter, year),
 *     fetchChurchMeta(),            // returns { name, region, chairman, systemName }
 *   }
 *
 * @param {object} options
 *   {
 *     gregorianYear: number   // e.g. 2025
 *   }
 */
class ChurchReportGenerator {
  constructor(dataFetcher, options = {}) {
    this.fetcher = dataFetcher;
    this.options = options;
  }

  async generate(quarter) {
    const year = this.options.gregorianYear || new Date().getFullYear();
    const quarterDates = getQuarterDates(quarter, year);

    // Fetch all data in parallel for performance
    const [
      evangelismData,
      lastQuarterEvangelismData,
      bibleStudyData,
      studyProgressData,
      ministriesData,
      communicationData,
      holisticData,
      eventsData,
      womenData,
      youthData,
      childrenData,
      meta,
    ] = await Promise.all([
      this.fetcher.fetchEvangelism(quarter, year),
      this.fetcher.fetchLastQuarterEvangelism(quarter, year),
      this.fetcher.fetchBibleStudyGroups(quarter, year),
      this.fetcher.fetchStudyProgress(quarter, year),
      this.fetcher.fetchMinistries(quarter, year),
      this.fetcher.fetchCommunication(quarter, year),
      this.fetcher.fetchHolistic(quarter, year),
      this.fetcher.fetchEvents(quarter, year),
      this.fetcher.fetchWomensMinistry(quarter, year),
      this.fetcher.fetchYouthMinistry(quarter, year),
      this.fetcher.fetchChildrensMinistry(quarter, year),
      this.fetcher.fetchChurchMeta(),
    ]);

    return {
      // ── Report Header ──────────────────────────────────────
      header: {
        organization: "Meserete Kristos Church – Addis Ababa Regional Office",
        churchName: meta.name,
        region: meta.region,
        quarter: quarterDates.label,
        reportingPeriod: {
          gregorian: `${quarterDates.gregorian.start} – ${quarterDates.gregorian.end}`,
          ethiopian: `${quarterDates.ethiopian.start} – ${quarterDates.ethiopian.end}`,
        },
      },

      // ── Report Sections ────────────────────────────────────
      sections: [
        buildEvangelismSection(evangelismData, lastQuarterEvangelismData),
        buildTeachingSection(bibleStudyData),
        buildDiscipleshipSection(studyProgressData),
        buildMinistriesSection(ministriesData),
        buildCommunicationSection(communicationData),
        buildHolisticSection(holisticData),
        buildPrayerSection(eventsData),
        buildWomensSection(womenData),
        buildYouthSection(youthData),
        buildChildrenSection(childrenData),
      ],

      // ── Report Footer ──────────────────────────────────────
      footer: {
        filledBy: meta.systemName || "Church ERP System",
        signature: null,
        date: new Date().toISOString().split("T")[0],
        chairman: meta.chairman || "",
        chairmanSignature: null,
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────
// DATA SOURCE → ERP MODULE MAPPING
// ─────────────────────────────────────────────────────────────
//
// Section   | Admin Sidebar Module      | fetcher method
// ──────────┼───────────────────────────┼──────────────────────────────────────
// 1         | Evangelism                | fetchEvangelism, fetchLastQuarterEvangelism
// 2         | Bible Study Groups        | fetchBibleStudyGroups
// 3         | Study Progress            | fetchStudyProgress
// 4         | Ministries                | fetchMinistries
// 5         | Dashboard / Members       | fetchCommunication
// 6         | Evangelism + Finance      | fetchHolistic
// 7         | Events                    | fetchEvents
// 8         | Ministries (Women)        | fetchWomensMinistry
// 9         | Ministries (Youth)        | fetchYouthMinistry
// 10        | Ministries (Children)     | fetchChildrensMinistry

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  ChurchReportGenerator,
  getQuarterDates,
  genderBreakdown,
  // Individual section builders (for unit testing or partial generation)
  buildEvangelismSection,
  buildTeachingSection,
  buildDiscipleshipSection,
  buildMinistriesSection,
  buildCommunicationSection,
  buildHolisticSection,
  buildPrayerSection,
  buildWomensSection,
  buildYouthSection,
  buildChildrenSection,
};
