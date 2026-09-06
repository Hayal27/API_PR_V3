/**
 * Ethiopian Calendar Utility for Backend Node.js
 */

const ETHIOPIAN_MONTHS = [
  { value: 1,  name: 'መስከረም', nameEn: 'Meskerem', days: 30 },
  { value: 2,  name: 'ጥቅምት',  nameEn: 'Tikimt',   days: 30 },
  { value: 3,  name: 'ኅዳር',   nameEn: 'Hidar',    days: 30 },
  { value: 4,  name: 'ታኅሣሥ', nameEn: 'Tahsas',   days: 30 },
  { value: 5,  name: 'ጥር',    nameEn: 'Tir',      days: 30 },
  { value: 6,  name: 'የካቲት', nameEn: 'Yekatit',  days: 30 },
  { value: 7,  name: 'መጋቢት', nameEn: 'Megabit',  days: 30 },
  { value: 8,  name: 'ሚያዝያ', nameEn: 'Miazia',   days: 30 },
  { value: 9,  name: 'ግንቦት', nameEn: 'Ginbot',   days: 30 },
  { value: 10, name: 'ሰኔ',    nameEn: 'Sene',     days: 30 },
  { value: 11, name: 'ሐምሌ',  nameEn: 'Hamle',    days: 30 },
  { value: 12, name: 'ነሐሴ',  nameEn: 'Nehase',   days: 30 },
  { value: 13, name: 'ጳጉሜን', nameEn: 'Pagume',   days: 5  },
];

const ETHIOPIAN_EPOCH = 1724221;

function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day   = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year  = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function ethiopianToJDN(ethYear, ethMonth, ethDay) {
  return (
    ETHIOPIAN_EPOCH +
    365 * (ethYear - 1) +
    Math.floor(ethYear / 4) +
    30 * (ethMonth - 1) +
    (ethDay - 1)
  );
}

function jdnToEthiopian(jdn) {
  const diff = jdn - ETHIOPIAN_EPOCH;
  const r    = diff % 1461;
  const n    = (r % 365) + 365 * Math.floor(r / 1460);

  const year  = 4 * Math.floor(diff / 1461) + Math.floor(r / 365) - Math.floor(r / 1460) + 1;
  const month = Math.floor(n / 30) + 1;
  const day   = (n % 30) + 1;

  const idx       = Math.max(0, Math.min(12, month - 1));
  const monthData = ETHIOPIAN_MONTHS[idx] || ETHIOPIAN_MONTHS[0];

  return { year, month, day, monthName: monthData.name, monthNameEn: monthData.nameEn };
}

function gregorianToEthiopian(gregorianDate) {
  const fallback = { year: 2017, month: 1, day: 1, monthName: 'መስከረም', monthNameEn: 'Meskerem' };
  if (!gregorianDate) return fallback;

  let gYear, gMonth, gDay;
  if (typeof gregorianDate === 'string') {
    const trimmed = gregorianDate.trim();
    const match = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      gYear  = parseInt(match[1], 10);
      gMonth = parseInt(match[2], 10);
      gDay   = parseInt(match[3], 10);
    } else {
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) return fallback;
      gYear  = d.getFullYear();
      gMonth = d.getMonth() + 1;
      gDay   = d.getDate();
    }
  } else if (gregorianDate instanceof Date) {
    if (isNaN(gregorianDate.getTime())) return fallback;
    gYear  = gregorianDate.getFullYear();
    gMonth = gregorianDate.getMonth() + 1;
    gDay   = gregorianDate.getDate();
  } else if (typeof gregorianDate === 'object' && gregorianDate.year && gregorianDate.month && gregorianDate.day) {
    gYear  = parseInt(gregorianDate.year, 10);
    gMonth = parseInt(gregorianDate.month, 10);
    gDay   = parseInt(gregorianDate.day, 10);
  } else {
    const d = new Date(gregorianDate);
    if (isNaN(d.getTime())) return fallback;
    gYear  = d.getFullYear();
    gMonth = d.getMonth() + 1;
    gDay   = d.getDate();
  }

  const jdn = gregorianToJDN(gYear, gMonth, gDay);
  return jdnToEthiopian(jdn);
}

function ethiopianToGregorian(ethYear, ethMonth, ethDay) {
  const jdn = ethiopianToJDN(parseInt(ethYear, 10), parseInt(ethMonth, 10), parseInt(ethDay, 10));
  const { year, month, day } = jdnToGregorian(jdn);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function ethiopianToGregorianStr(ethYear, ethMonth, ethDay) {
  const jdn = ethiopianToJDN(parseInt(ethYear, 10), parseInt(ethMonth, 10), parseInt(ethDay, 10));
  const { year, month, day } = jdnToGregorian(jdn);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getCurrentEthiopianPeriod() {
  const ec = gregorianToEthiopian(new Date());
  const m = ec.month;
  // Fiscal year: Hamle(11), Nehase(12), Pagume(13) belong to next fiscal year's Q1
  const fiscalYear = m >= 11 ? ec.year + 1 : ec.year;
  let quarter;
  if (m === 11 || m === 12 || m === 13 || m === 1) quarter = "1";
  else if (m <= 4) quarter = "2";
  else if (m <= 7) quarter = "3";
  else quarter = "4";
  return { year: fiscalYear, quarter: quarter, month: m };
}

module.exports = {
  ETHIOPIAN_MONTHS,
  gregorianToEthiopian,
  ethiopianToGregorian,
  ethiopianToGregorianStr,
  getCurrentEthiopianPeriod
};
