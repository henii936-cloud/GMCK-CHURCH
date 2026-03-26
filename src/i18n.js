import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Members": "Members",
      "Bible Study Groups": "Bible Study Groups",
      "Study Progress": "Study Progress",
      "Events": "Events",
      "Evangelism": "Evangelism",
      "Finance": "Finance",
      "Budgets": "Budgets",
      "My Group Members": "My Group Members",
      "Take Attendance": "Take Attendance",
      "Record Study Progress": "Record Study Progress",
      "Approved Budgets": "Approved Budgets",
      "Record Giving": "Record Giving",
      "Expenses": "Expenses",
      "Reports": "Reports",
      "Sign Out": "Sign Out",
      "Language": "Language",
      "English": "English",
      "Amharic": "አማርኛ",
      // Events specific
      "Create Event": "Create Event",
      "Event Title": "Event Title",
      "Category": "Category",
      "Date": "Date",
      "Description": "Description"
    }
  },
  am: {
    translation: {
      "Dashboard": "ዳሽቦርድ",
      "Members": "አባላት",
      "Bible Study Groups": "የመጽሐፍ ቅዱስ ጥናት ቡድኖች",
      "Study Progress": "የጥናት ሂደት",
      "Events": "ዝግጅቶች",
      "Evangelism": "ወንጌላዊነት",
      "Finance": "ፋይናንስ",
      "Budgets": "በጀቶች",
      "My Group Members": "የእኔ ቡድን አባላት",
      "Take Attendance": "መገኘት ይውሰዱ",
      "Record Study Progress": "የጥናት ሂደት ይመዝግቡ",
      "Approved Budgets": "የጸደቁ በጀቶች",
      "Record Giving": "መስጠት ይመዝግቡ",
      "Expenses": "ወጪዎች",
      "Reports": "ሪፖርቶች",
      "Sign Out": "ውጣ",
      "Language": "ቋንቋ",
      "English": "English",
      "Amharic": "አማርኛ",
      // Events specific
      "Create Event": "ዝግጅት ፍጠር",
      "Event Title": "የዝግጅት ርዕስ",
      "Category": "ምድብ",
      "Date": "ቀን",
      "Description": "መግለጫ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('app_language') || 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
