/**
 * Church Quarterly Report Generator
 * Meserete Kristos Church – Addis Ababa Regional Office
 */

export const QUARTERS = {
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

export function getQuarterDates(quarter, gregorianYear) {
  const q = QUARTERS[quarter];
  if (!q) throw new Error(`Invalid quarter: ${quarter}. Must be 1–4.`);

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

function genderBreakdown(men = 0, women = 0, total = null) {
  return {
    men: Number(men) || 0,
    women: Number(women) || 0,
    total: total !== null ? Number(total) : (Number(men) || 0) + (Number(women) || 0),
  };
}

// Section Builders
function buildEvangelismSection(evangelismData = {}, lastQuarterData = {}) {
  const {
    witnessed = { men: 0, women: 0 },
    saved = { men: 0, women: 0 },
    baptized = { men: 0, women: 0 },
    repentance = { men: 0, women: 0 },
    totalMembers = 0,
    previousTotalMembers = 0,
    outreachStations = [],
    outreachPlan = "",
  } = evangelismData;

  const { totalMembers: lastQuarterTotalMembers = 0 } = lastQuarterData;

  const membershipGrowthPct =
    previousTotalMembers > 0
      ? (((totalMembers - previousTotalMembers) / previousTotalMembers) * 100).toFixed(2)
      : "N/A";

  const vsLastQuarterPct =
    lastQuarterTotalMembers > 0
      ? (((totalMembers - lastQuarterTotalMembers) / lastQuarterTotalMembers) * 100).toFixed(2)
      : "N/A";

  return {
    section: "1",
    title: "Evangelism Ministry",
    items: {
      "1.1": { label: "People witnessed to this quarter", ...genderBreakdown(witnessed.men, witnessed.women) },
      "1.2": { label: "People saved", ...genderBreakdown(saved.men, saved.women) },
      "1.3": { label: "People baptized", ...genderBreakdown(baptized.men, baptized.women) },
      "1.4": { label: "Returned in repentance", ...genderBreakdown(repentance.men, repentance.women) },
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
      "2.1": { label: "People without small groups added to a group this quarter", ...genderBreakdown(newMembersAddedToGroups.men, newMembersAddedToGroups.women) },
      "2.2": { label: "Total active small groups", count: totalActiveGroups },
      "2.3": { label: "Small groups added this quarter", count: groupsAddedThisQuarter },

    },
  };
}

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
      "3.1": { label: "People registered and learning 'Raising Leaders' this quarter", count: raisingLeadersRegistered, sessions: raisingLeadersTrainingSessions },
      "3.2": { label: "Training sessions given to equip church servants", sessions: churchServantTrainingSessions, participants: churchServantsTrained },
    },
  };
}

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
    items: { ministryVisits: ministryRows },
  };
}

function buildCommunicationSection(communicationData = {}) {
  const { reportsToEldersCommittee = 0, reportsSentToRegionalOffice = 0, reportsSentToMainOffice = 0, notSentReason = "" } = communicationData;
  return {
    section: "5",
    title: "Communication",
    items: {
      "5.1": { label: "Monthly reports given to elders committee", count: reportsToEldersCommittee },
      "5.2": { label: "Reports sent to offices", regional: reportsSentToRegionalOffice, main: reportsSentToMainOffice },
      "5.3": { label: "Reason if not sent", reason: notSentReason || null },
    },
  };
}

function buildHolisticSection(holisticData = {}) {
  const { needyPeopleSupported = 0, financialGivingTeachings = 0 } = holisticData;
  return {
    section: "6",
    title: "Holistic Church Ministry",
    items: {
      "6.1": { label: "Needy people who received support", count: needyPeopleSupported },
      "6.2": { label: "Teachings encouraging financial giving", count: financialGivingTeachings },
    },
  };
}

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

function buildWomensSection(womenData = {}) {
  const { rating = "Good", noActivityReason = "" } = womenData;
  return { section: "8", title: "Women's Ministry Activity", items: { rating, noActivityReason: rating === "No Activity" ? noActivityReason : null } };
}

function buildYouthSection(youthData = {}) {
  const { rating = "Good", noActivityReason = "" } = youthData;
  return { section: "9", title: "Youth Ministry Activity", items: { rating, noActivityReason: rating === "No Activity" ? noActivityReason : null } };
}

function buildChildrenSection(childrenData = {}) {
  const { rating = "Good", noActivityReason = "" } = childrenData;
  return { section: "10", title: "Children's Sunday School Ministry", items: { rating, noActivityReason: rating === "No Activity" ? noActivityReason : null } };
}

export class ChurchReportGenerator {
  constructor(dataFetcher, options = {}) {
    this.fetcher = dataFetcher;
    this.options = options;
  }

  async generate(quarter) {
    const year = this.options.gregorianYear || new Date().getFullYear();
    const quarterDates = getQuarterDates(quarter, year);

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
