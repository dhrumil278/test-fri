// Utility functions for date and time manipulation
const { DEFAULT_TIME_ZONE } = require("../../config/constants/constantValues");
const { FIELDS } = require("../../config/constants/fields");
const { DAYS_JS } = require("../../config/constants/packages");

// Get the current timestamp in milliseconds
const getTimestamp = () => new Date().getTime();

// Convert a date string or object to a timestamp in milliseconds
const getTimestampFromDate = (date) => new Date(date).getTime();

// Format a timestamp into a human-readable date string in the specified time zone
const formatDate = (timestamp, timeZone = DEFAULT_TIME_ZONE) => {
  const date = new Date(timestamp);
  return date
    .toLocaleString("en-GB", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
    .replace(",", "");
};

// Format a date string into MM/DD/YYYY or MM/DD/YYYY HH:mm format
const formatDateFromString = (
  fullDate,
  withTime = false,
  defaultValue = FIELDS.NOT_ASSIGNED
) => {
  if (fullDate) {
    const fullDateInString =
      typeof fullDate === "string"
        ? fullDate
        : new Date(fullDate).toISOString();
    const fullDateWithoutTimeZone = fullDateInString
      .replace("T", " ")
      .replace("Z", "");
    // Split the date (format: 'YYYY-MM-DD HH:mm:ss')
    const [date, time] = fullDateWithoutTimeZone.split(" ");

    // Split the date (format: 'YYYY-MM-DD')
    const [year, month, day] = date.split("-");

    const formatted = `${month}/${day}/${year}`;

    if (time && withTime) {
      // Split the date (format: 'HH:mm:ss')
      const [hour, minute, second] = time.split(":");
      return `${formatted} ${hour}:${minute}`;
    }

    return formatted;
  } else {
    return defaultValue;
  }
};

// Get the current date in the specified time zone, optionally with time
const getCurrentDateForTimeZone = (
  withTime = false,
  timeZone = DEFAULT_TIME_ZONE
) => {
  if (withTime) {
    return DAYS_JS().tz(timeZone).format("MM/DD/YYYY HH:mm:ss");
  } else {
    return DAYS_JS().tz(timeZone).format("MM/DD/YYYY");
  }
};

// Get the start and end ISO date strings for the current day in the specified time zone
const getCurrentStartEndISODateForTimeZone = (timeZone = DEFAULT_TIME_ZONE) => {
  return {
    startDate: DAYS_JS()
      .tz(timeZone)
      .startOf("day")
      .format("YYYY-MM-DDTHH:mm:ss.sss[Z]"),
    endDate: DAYS_JS()
      .tz(timeZone)
      .endOf("day")
      .format("YYYY-MM-DDTHH:mm:ss.sss[Z]"),
  };
};
// Get the current ISO date string for the specified time zone
const getCurrentISODateForTimeZone = (timeZone = DEFAULT_TIME_ZONE) =>
  DAYS_JS().tz(timeZone).format("YYYY-MM-DDTHH:mm:ss.sss[Z]");

// Convert a date string in MM/DD/YYYY format to YYYY-MM-DD
const getDateFromString = (date) => {
  // date has format 'MM/DD/YYYY'
  const [month, day, year] = date.split("/");

  if (
    isNaN(month) ||
    isNaN(day) ||
    isNaN(year) ||
    month === "" ||
    day === "" ||
    year === ""
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
};

// Calculate age in years from a date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) {
    return null;
  }

  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return `${age} years`;
};

const convertDateToOtherFormate = (
  date,
  currentFormate,
  responseFormate = "YYYY-MM-DD"
) => {
  if (!date) {
    return {
      isValid: true,
      date: null,
    };
  }
  const cleaned = date
    .replace(/\u200B/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const parsed = DAYS_JS(cleaned, currentFormate, true);

  if (!parsed.isValid()) {
    return {
      isValid: false,
      date: null,
    };
  }

  return {
    isValid: true,
    date: parsed.format(responseFormate) || null,
  };
};

const getDateRange = (filter) => {
  const localDate = DAYS_JS().tz(DEFAULT_TIME_ZONE);

  let startDate, endDate;

  switch (filter.toLowerCase()) {
    case FIELDS.WEEK:
      startDate = localDate.startOf(FIELDS.WEEK);
      endDate = localDate.endOf(FIELDS.WEEK);
      break;
    case FIELDS.MONTH:
      startDate = localDate.startOf(FIELDS.MONTH);
      endDate = localDate.endOf(FIELDS.MONTH);
      break;
    case FIELDS.TODAY:
    default:
      startDate = localDate.startOf(FIELDS.DAY);
      endDate = localDate.endOf(FIELDS.DAY);
      break;
  }

  const result = {
    startDate: startDate.format("YYYY-MM-DDTHH:mm:ss.sss[Z]"),
    endDate: endDate.format("YYYY-MM-DDTHH:mm:ss.sss[Z]"),
  };

  return result;
};

const normalizeDateRange = (start, end) => {
  const startDate = DAYS_JS.utc(start).startOf("day");
  let endDate;

  if (!end || end === start) {
    endDate = startDate.add(1, "day");
  } else {
    endDate = DAYS_JS.utc(end).startOf("day").add(1, "day");
  }

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
};

module.exports = {
  getTimestamp,
  getTimestampFromDate,
  formatDate,
  formatDateFromString,
  getDateFromString,
  getCurrentDateForTimeZone,
  calculateAge,
  getCurrentStartEndISODateForTimeZone,
  convertDateToOtherFormate,
  getDateRange,
  normalizeDateRange,
  getCurrentISODateForTimeZone,
};
