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
  if (!gregorianDate) return { year: 2017, month: 1, day: 1 };
  const d = gregorianDate instanceof Date ? gregorianDate : new Date(gregorianDate);
  if (isNaN(d.getTime())) return { year: 2017, month: 1, day: 1 };

  const jdn = gregorianToJDN(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return jdnToEthiopian(jdn);
}

function getCurrentEthiopianPeriod() {
  const ec = gregorianToEthiopian(new Date());
  let quarter = "1";
  if (ec.month === 11 || ec.month === 12 || ec.month === 13 || ec.month === 1) {
    quarter = "1";
  } else if (ec.month >= 2 && ec.month <= 4) {
    quarter = "2";
  } else if (ec.month >= 5 && ec.month <= 7) {
    quarter = "3";
  } else if (ec.month >= 8 && ec.month <= 10) {
    quarter = "4";
  }
  return { year: ec.year, quarter: quarter, month: ec.month };
}

module.exports = {
  gregorianToEthiopian,
  getCurrentEthiopianPeriod
};
