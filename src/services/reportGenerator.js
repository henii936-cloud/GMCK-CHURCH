/**
 * Church Quarterly Report Generator
 * Meserete Kristos Church – Addis Ababa Regional Office
 */

export const TRANSLATIONS = {
  en: {
    org: "Meserete Kristos Church – Addis Ababa Regional Office",
    quarters: {
      1: "1st Quarter",
      2: "2nd Quarter",
      3: "3rd Quarter",
      4: "4th Quarter",
    },
    months: {
      "July": "July", "Oct": "Oct", "Jan": "Jan", "Apr": "Apr",
      "Hamle": "Hamle", "Tikimt": "Tikimt", "Tir": "Tir", "Miazia": "Miazia", "Sene": "Sene"
    },
    labels: {
      men: "Men",
      women: "Women",
      total: "Total",
      count: "Count",
      rating: "Rating",
      growth: "Growth this Quarter",
      vsLast: "Vs Last Quarter",
      preparedBy: "Prepared By",
      approvedBy: "Approved By (Chairman)",
      signature: "Signature",
      generatedOn: "Generated on",
      via: "via",
      regional: "Regional",
      main: "Main",
      sessions: "Sessions",
      participants: "Participants",
      reason: "Reason",
      ministryDept: "Ministry Department",
      encVisits: "Encouragement Visits",
      reportingPeriodGreg: "Reporting Period (Gregorian)",
      reportingPeriodEth: "Reporting Period (Ethiopian)",
      reportFormSubtitle: "Quarterly Report Form Submitted by Local Ministry Coordinators to the Regional General Secretary",
      fromChurch: "From",
      reportingPeriodLabel: "Reporting Period",
      officialNotice: "This report is prepared based on the local ministry coordinators' service job descriptions and the Meserete Kristos Church's strategic plan. Therefore, local ministry coordinators are expected to serve by planning their activities in line with these job descriptions and the strategic plan. Consequently, local ministry coordinators must fill out accurate information on this report form and bring it during their joint quarterly meeting with the regional general secretary."
    },
    ministries: {
      "Evangelism Ministry": "Evangelism Ministry",
      "Disciple Sheep Ministry": "Disciple Sheep Ministry",
      "Teaching Ministry": "Teaching Ministry",
      "Development Ministry": "Development Ministry",
      "Deacon Ministry": "Deacon Ministry",
      "Stage Ministry": "Stage Ministry",
      "Youth Ministry": "Youth Ministry",
      "Marriage and Counseling Ministry": "Marriage and Counseling Ministry",
    }
  },
  am: {
    org: "መሠረተ ክርስቶስ ቤተ ክርስቲያን - አዲስ አበባ ቀጣና ጽሕፈት ቤት",
    quarters: {
      1: "1ኛው ሩብ ዓመት",
      2: "2ኛው ሩብ ዓመት",
      3: "3ኛው ሩብ ዓመት",
      4: "4ኛው ሩብ ዓመት",
    },
    months: {
      "July": "ሐምሌ", "Oct": "ጥቅምት", "Jan": "ጥር", "Apr": "ሚያዝያ",
      "Hamle": "ሐምሌ", "Tikimt": "ጥቅምት", "Tir": "ጥር", "Miazia": "ሚያዝያ", "Sene": "ሰኔ"
    },
    labels: {
      men: "ወንድ",
      women: "ሴት",
      total: "ድምር",
      count: "ብዛት",
      rating: "ደረጃ",
      growth: "የሩብ ዓመቱ እድገት",
      vsLast: "ካለፈው ሩብ ዓመት ጋር",
      preparedBy: "ያዘጋጀው",
      approvedBy: "ያጸደቀው (ሊቀመንበር)",
      signature: "ፊርማ",
      generatedOn: "የተዘጋጀበት ቀን",
      via: "በ",
      regional: "ቀጣና",
      main: "ዋና",
      sessions: "ክፍለ-ጊዜ",
      participants: "ተሳታፊዎች",
      reason: "ምክንያት",
      ministryDept: "የአገልግሎት ክፍል",
      encVisits: "የማበረታቻ ጉብኝት",
      reportingPeriodEth: "የሪፖርት ዘመን (ኢትዮጵያ)",
      reportFormSubtitle: "የአጥቢያ አገልግሎት ተጠሪዎች ለክልሉ ዋና ጸሐፊ በየሩብ ዓመቱ ሪፖርት የሚያደርጉበት ቅጽ",
      fromChurch: "ከ፦",
      reportingPeriodLabel: "ሪፖርት የሚሸፍነው ጊዜ ከ",
      officialNotice: "ይህ የሪፖርት የተዘጋጀው የአጥቢያ የአገልግሎት ተጠሪዎችን የአገልግሎት የሥራ መዘርዝርና የመሰረተ ክርስቶስ ቤተክርስቲያንን ስልታዊ ዕቅድ መሰረት ባደረገ መልኩ ነው። ስለዚህ የአጥቢያ የአገልግሎት ተጠሪዎች በአጥቢያው የሚከናወኑትን ተግባር ከዚህ የአገልግሎት የሥራ መዘርዝር እና ከስልታዊ ዕቅዱ አኳያ እቅድ በማውጣት ማገልገል ይጠበቅባቸዋል። ስለዚህ የአጥቢያ አገልግሎት ተጠሪዎች ከክልሉ ዋና ጸሐፊ ጋር በየሶስት ወሩ በሚኖራቸው የጋራ ስብሰባ ወቅት በዚህ የሪፖርት ቅጽ ላይ ትክክለኛውን መረጃ ሞልተው ይዘው መምጣት ይገባቸዋል።"
    },
    ministries: {
      "Evangelism Ministry": "የወንጌላዊነት አገልግሎት",
      "Disciple Sheep Ministry": "የበግ ደቀ መዝሙርነት አገልግሎት",
      "Teaching Ministry": "የትምህርት አገልግሎት",
      "Development Ministry": "የልማት አገልግሎት",
      "Deacon Ministry": "የዲቁና አገልግሎት",
      "Stage Ministry": "የመድረክ አገልግሎት",
      "Youth Ministry": "የወጣቶች አገልግሎት",
      "Marriage and Counseling Ministry": "የጋብቻና የምክር አገልግሎት",
    }
  }
};

export const QUARTERS = {
  1: {
    gregorian: { start: "July 08", end: "Oct 10" },
    ethiopian: { start: "Hamle 01", end: "Tikimt 01" },
  },
  2: {
    gregorian: { start: "Oct 11", end: "Jan 10" },
    ethiopian: { start: "Tikimt 02", end: "Tir 02" },
  },
  3: {
    gregorian: { start: "Jan 11", end: "Apr 10" },
    ethiopian: { start: "Tir 03", end: "Miazia 03" },
  },
  4: {
    gregorian: { start: "Apr 11", end: "Jul 07" },
    ethiopian: { start: "Miazia 04", end: "Sene 30" },
  },
};

export function getQuarterDates(quarter, gregorianYear, lang = 'en') {
  const q = QUARTERS[quarter];
  if (!q) throw new Error(`Invalid quarter: ${quarter}. Must be 1–4.`);

  const ethYear = quarter === 1 ? gregorianYear - 8 : gregorianYear - 7;
  const t = TRANSLATIONS[lang];

  const translateMonth = (dateStr) => {
    const [month, day] = dateStr.split(" ");
    return `${t.months[month] || month} ${day}`;
  };

  return {
    label: t.quarters[quarter],
    gregorian: {
      start: `${translateMonth(q.gregorian.start)}, ${gregorianYear}`,
      end:
        quarter === 2
          ? `${translateMonth(q.gregorian.end)}, ${gregorianYear + 1}`
          : `${translateMonth(q.gregorian.end)}, ${gregorianYear}`,
    },
    ethiopian: {
      start: `${translateMonth(q.ethiopian.start)}, ${ethYear} ዓ.ም`,
      end: `${translateMonth(q.ethiopian.end)}, ${ethYear} ዓ.ም`,
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
function buildEvangelismSection(evangelismData = {}, lastQuarterData = {}, lang = 'en') {
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

  const labels = {
    en: {
      title: "Evangelism Ministry",
      witnessed: "People witnessed to this quarter",
      saved: "People saved",
      baptized: "People baptized",
      repentance: "Returned in repentance",
      growth: "Membership growth percentage",
      outreach: "Outreach stations",
    },
    am: {
      title: "የወንጌላዊነት አገልግሎት",
      witnessed: "በዚህ ሩብ ዓመት ወንጌል የተመሰከረላቸው ሰዎች",
      saved: "የዳኑ ሰዎች",
      baptized: "የተጠመቁ ሰዎች",
      repentance: "በንስሐ የተመለሱ",
      growth: "የአባላት እድገት በመቶኛ",
      outreach: "የወንጌል ጣቢያዎች",
    }
  }[lang];

  return {
    section: "1",
    title: labels.title,
    items: {
      "1.1": { label: labels.witnessed, ...genderBreakdown(witnessed.men, witnessed.women) },
      "1.2": { label: labels.saved, ...genderBreakdown(saved.men, saved.women) },
      "1.3": { label: labels.baptized, ...genderBreakdown(baptized.men, baptized.women) },
      "1.4": { label: labels.repentance, ...genderBreakdown(repentance.men, repentance.women) },
      "1.5": {
        label: labels.growth,
        withinQuarter: `${membershipGrowthPct}%`,
        vsLastQuarter: `${vsLastQuarterPct}%`,
      },
      "1.6": {
        label: labels.outreach,
        count: outreachStations.length,
        names: outreachStations,
        plan: outreachStations.length === 0 ? outreachPlan : null,
      },
    },
  };
}

function buildTeachingSection(bibleStudyData = {}, lang = 'en') {
  const {
    newMembersAddedToGroups = { men: 0, women: 0 },
    totalActiveGroups = 0,
    groupsAddedThisQuarter = 0,
  } = bibleStudyData;

  const labels = {
    en: {
      title: "Teaching the Word of God in an Organized Way",
      added: "People without small groups added to a group this quarter",
      total: "Total active small groups",
      new: "Small groups added this quarter",
    },
    am: {
      title: "የእግዚአብሔርን ቃል በተደራጀ መንገድ ማስተማር",
      added: "በዚህ ሩብ ዓመት በቡድን የታቀፉ ሰዎች",
      total: "አጠቃላይ ንቁ የቤት ለቤት ቡድኖች",
      new: "በዚህ ሩብ ዓመት የተጨመሩ ቡድኖች",
    }
  }[lang];

  return {
    section: "2",
    title: labels.title,
    items: {
      "2.1": { label: labels.added, ...genderBreakdown(newMembersAddedToGroups.men, newMembersAddedToGroups.women) },
      "2.2": { label: labels.total, count: totalActiveGroups },
      "2.3": { label: labels.new, count: groupsAddedThisQuarter },
    },
  };
}

function buildDiscipleshipSection(studyProgressData = {}, lang = 'en') {
  const {
    raisingLeadersRegistered = 0,
    raisingLeadersTrainingSessions = 0,
    churchServantTrainingSessions = 0,
    churchServantsTrained = 0,
  } = studyProgressData;

  const labels = {
    en: {
      title: "Discipleship / Raising Leaders",
      raising: "People registered and learning 'Raising Leaders' this quarter",
      servants: "Training sessions given to equip church servants",
    },
    am: {
      title: "ደቀ መዛሙርት ማፍራት / መሪዎችን ማብቃት",
      raising: "'መሪዎችን ማብቃት' የሚማሩ ሰዎች",
      servants: "ለአገልጋዮች የተሰጡ ስልጠናዎች",
    }
  }[lang];

  return {
    section: "3",
    title: labels.title,
    items: {
      "3.1": { label: labels.raising, count: raisingLeadersRegistered, sessions: raisingLeadersTrainingSessions },
      "3.2": { label: labels.servants, sessions: churchServantTrainingSessions, participants: churchServantsTrained },
    },
  };
}

function buildMinistriesSection(ministriesData = {}, lang = 'en') {
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

  const t = TRANSLATIONS[lang];
  const visits = ministriesData.visits || {};
  const ministryRows = MINISTRY_LIST.map((name) => ({
    ministry: t.ministries[name] || name,
    timesEncouraged: visits[name] || 0,
  }));

  const labels = {
    en: { title: "Encouraging Ministry Departments" },
    am: { title: "የአገልግሎት ክፍሎችን ማበረታታት" }
  }[lang];

  return {
    section: "4",
    title: labels.title,
    items: { ministryVisits: ministryRows },
  };
}

function buildCommunicationSection(communicationData = {}, lang = 'en') {
  const { reportsToEldersCommittee = 0, reportsSentToRegionalOffice = 0, reportsSentToMainOffice = 0, notSentReason = "" } = communicationData;
  
  const labels = {
    en: {
      title: "Communication",
      elders: "Monthly reports given to elders committee",
      offices: "Reports sent to offices",
      reason: "Reason if not sent",
    },
    am: {
      title: "ግንኙነት",
      elders: "ለሽማግሌዎች ኮሚቴ የቀረቡ ወርሃዊ ሪፖርቶች",
      offices: "ለቢሮዎች የተላኩ ሪፖርቶች",
      reason: "ያልተላከበት ምክንያት",
    }
  }[lang];

  return {
    section: "5",
    title: labels.title,
    items: {
      "5.1": { label: labels.elders, count: reportsToEldersCommittee },
      "5.2": { label: labels.offices, regional: reportsSentToRegionalOffice, main: reportsSentToMainOffice },
      "5.3": { label: labels.reason, reason: notSentReason || null },
    },
  };
}

function buildHolisticSection(holisticData = {}, lang = 'en') {
  const { needyPeopleSupported = 0, financialGivingTeachings = 0 } = holisticData;
  
  const labels = {
    en: {
      title: "Holistic Church Ministry",
      needy: "Needy people who received support",
      giving: "Teachings encouraging financial giving",
    },
    am: {
      title: "ሁለንተናዊ የቤተ ክርስቲያን አገልግሎት",
      needy: "ድጋፍ ያገኙ ችግረኞች",
      giving: "የመስጠት ትምህርቶች",
    }
  }[lang];

  return {
    section: "6",
    title: labels.title,
    items: {
      "6.1": { label: labels.needy, count: needyPeopleSupported },
      "6.2": { label: labels.giving, count: financialGivingTeachings },
    },
  };
}

function buildPrayerSection(eventsData = {}, lang = 'en') {
  const { prayerFastingPrograms = 0 } = eventsData;
  
  const labels = {
    en: {
      title: "Prayer and Fasting Programs",
      conducted: "Prayer and fasting programs conducted this quarter",
    },
    am: {
      title: "የጸሎትና የጾም ፕሮግራሞች",
      conducted: "በሩብ ዓመቱ የተከናወኑ የጸሎትና የጾም ፕሮግራሞች",
    }
  }[lang];

  return {
    section: "7",
    title: labels.title,
    items: {
      "7.1": { label: labels.conducted, count: prayerFastingPrograms },
    },
  };
}

function buildWomensSection(womenData = {}, lang = 'en') {
  const { rating = "Good", noActivityReason = "" } = womenData;
  
  const labels = {
    en: { title: "Women's Ministry Activity" },
    am: { title: "የሴቶች አገልግሎት እንቅስቃሴ" }
  }[lang];

  const ratingLabels = {
    en: rating,
    am: { "Good": "ጥሩ", "Very Good": "በጣም ጥሩ", "Excellent": "በጣም ከፍተኛ", "No Activity": "እንቅስቃሴ የለም" }[rating] || rating
  }[lang];

  return { 
    section: "8", 
    title: labels.title, 
    items: { 
      rating: ratingLabels, 
      noActivityReason: rating === "No Activity" ? noActivityReason : null 
    } 
  };
}

function buildYouthSection(youthData = {}, lang = 'en') {
  const { rating = "Good", noActivityReason = "" } = youthData;
  
  const labels = {
    en: { title: "Youth Ministry Activity" },
    am: { title: "የወጣቶች አገልግሎት እንቅስቃሴ" }
  }[lang];

  const ratingLabels = {
    en: rating,
    am: { "Good": "ጥሩ", "Very Good": "በጣም ጥሩ", "Excellent": "በጣም ከፍተኛ", "No Activity": "እንቅስቃሴ የለም" }[rating] || rating
  }[lang];

  return { 
    section: "9", 
    title: labels.title, 
    items: { 
      rating: ratingLabels, 
      noActivityReason: rating === "No Activity" ? noActivityReason : null 
    } 
  };
}

function buildChildrenSection(childrenData = {}, lang = 'en') {
  const { rating = "Good", noActivityReason = "" } = childrenData;
  
  const labels = {
    en: { title: "Children's Sunday School Ministry" },
    am: { title: "የሕፃናት ሰንበት ትምህርት ቤት አገልግሎት" }
  }[lang];

  const ratingLabels = {
    en: rating,
    am: { "Good": "ጥሩ", "Very Good": "በጣም ጥሩ", "Excellent": "በጣም ከፍተኛ", "No Activity": "እንቅስቃሴ የለም" }[rating] || rating
  }[lang];

  return { 
    section: "10", 
    title: labels.title, 
    items: { 
      rating: ratingLabels, 
      noActivityReason: rating === "No Activity" ? noActivityReason : null 
    } 
  };
}

export class ChurchReportGenerator {
  constructor(dataFetcher, options = {}) {
    this.fetcher = dataFetcher;
    this.options = options;
  }

  async generate(quarter, lang = 'en') {
    const year = this.options.gregorianYear || new Date().getFullYear();
    const quarterDates = getQuarterDates(quarter, year, lang);
    const t = TRANSLATIONS[lang];

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
      lang,
      labels: t.labels,
      header: {
        organization: t.org,
        reportFormSubtitle: t.labels.reportFormSubtitle,
        churchName: lang === 'am' ? 'ጉለሌ መሰረተ ክርስቶስ ቤተክርስቲያን' : meta.name,
        region: lang === 'am' ? 'አዲስ አበባ' : meta.region,
        quarter: quarterDates.label,
        fromChurchLabel: t.labels.fromChurch,
        reportingPeriodLabel: t.labels.reportingPeriodLabel,
        officialNotice: t.labels.officialNotice,
        reportingPeriod: {
          gregorian: `${quarterDates.gregorian.start} – ${quarterDates.gregorian.end}`,
          ethiopian: `${quarterDates.ethiopian.start} – ${quarterDates.ethiopian.end}`,
        },
      },
      sections: [
        buildEvangelismSection(evangelismData, lastQuarterEvangelismData, lang),
        buildTeachingSection(bibleStudyData, lang),
        buildDiscipleshipSection(studyProgressData, lang),
        buildMinistriesSection(ministriesData, lang),
        buildCommunicationSection(communicationData, lang),
        buildHolisticSection(holisticData, lang),
        buildPrayerSection(eventsData, lang),
        buildWomensSection(womenData, lang),
        buildYouthSection(youthData, lang),
        buildChildrenSection(childrenData, lang),
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
