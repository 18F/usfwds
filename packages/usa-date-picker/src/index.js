const keymap = require("../../uswds-core/src/js/utils/keymap");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const select = require("../../uswds-core/src/js/utils/select");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");
const { CLICK } = require("../../uswds-core/src/js/events");
const activeElement = require("../../uswds-core/src/js/utils/active-element");
const isIosDevice = require("../../uswds-core/src/js/utils/is-ios-device");
const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");

const DATE_PICKER_CLASS = `${PREFIX}-date-picker`;
const DATE_PICKER_WRAPPER_CLASS = `${DATE_PICKER_CLASS}__wrapper`;
const DATE_PICKER_INITIALIZED_CLASS = `${DATE_PICKER_CLASS}--initialized`;
const DATE_PICKER_ACTIVE_CLASS = `${DATE_PICKER_CLASS}--active`;
const DATE_PICKER_INTERNAL_INPUT_CLASS = `${DATE_PICKER_CLASS}__internal-input`;
const DATE_PICKER_EXTERNAL_INPUT_CLASS = `${DATE_PICKER_CLASS}__external-input`;
const DATE_PICKER_BUTTON_CLASS = `${DATE_PICKER_CLASS}__button`;
const DATE_PICKER_CALENDAR_CLASS = `${DATE_PICKER_CLASS}__calendar`;
const DATE_PICKER_STATUS_CLASS = `${DATE_PICKER_CLASS}__status`;
const CALENDAR_DATE_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__date`;

const CALENDAR_DATE_FOCUSED_CLASS = `${CALENDAR_DATE_CLASS}--focused`;
const CALENDAR_DATE_SELECTED_CLASS = `${CALENDAR_DATE_CLASS}--selected`;
const CALENDAR_DATE_PREVIOUS_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--previous-month`;
const CALENDAR_DATE_CURRENT_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--current-month`;
const CALENDAR_DATE_NEXT_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--next-month`;
const CALENDAR_DATE_RANGE_DATE_CLASS = `${CALENDAR_DATE_CLASS}--range-date`;
const CALENDAR_DATE_TODAY_CLASS = `${CALENDAR_DATE_CLASS}--today`;
const CALENDAR_DATE_RANGE_DATE_START_CLASS = `${CALENDAR_DATE_CLASS}--range-date-start`;
const CALENDAR_DATE_RANGE_DATE_END_CLASS = `${CALENDAR_DATE_CLASS}--range-date-end`;
const CALENDAR_DATE_WITHIN_RANGE_CLASS = `${CALENDAR_DATE_CLASS}--within-range`;
const CALENDAR_PREVIOUS_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-year`;
const CALENDAR_PREVIOUS_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-month`;
const CALENDAR_NEXT_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-year`;
const CALENDAR_NEXT_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-month`;
const CALENDAR_MONTH_SELECTION_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-selection`;
const CALENDAR_YEAR_SELECTION_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year-selection`;
const CALENDAR_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month`;
const CALENDAR_MONTH_FOCUSED_CLASS = `${CALENDAR_MONTH_CLASS}--focused`;
const CALENDAR_MONTH_SELECTED_CLASS = `${CALENDAR_MONTH_CLASS}--selected`;
const CALENDAR_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year`;
const CALENDAR_YEAR_FOCUSED_CLASS = `${CALENDAR_YEAR_CLASS}--focused`;
const CALENDAR_YEAR_SELECTED_CLASS = `${CALENDAR_YEAR_CLASS}--selected`;
const CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-year-chunk`;
const CALENDAR_NEXT_YEAR_CHUNK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-year-chunk`;
const CALENDAR_DATE_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__date-picker`;
const CALENDAR_MONTH_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-picker`;
const CALENDAR_YEAR_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year-picker`;
const CALENDAR_TABLE_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__table`;
const CALENDAR_ROW_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__row`;
const CALENDAR_CELL_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__cell`;
const CALENDAR_CELL_CENTER_ITEMS_CLASS = `${CALENDAR_CELL_CLASS}--center-items`;
const CALENDAR_MONTH_LABEL_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-label`;
const CALENDAR_DAY_OF_WEEK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__day-of-week`;

const DATE_PICKER = `.${DATE_PICKER_CLASS}`;
const DATE_PICKER_BUTTON = `.${DATE_PICKER_BUTTON_CLASS}`;
const DATE_PICKER_INTERNAL_INPUT = `.${DATE_PICKER_INTERNAL_INPUT_CLASS}`;
const DATE_PICKER_EXTERNAL_INPUT = `.${DATE_PICKER_EXTERNAL_INPUT_CLASS}`;
const DATE_PICKER_CALENDAR = `.${DATE_PICKER_CALENDAR_CLASS}`;
const DATE_PICKER_STATUS = `.${DATE_PICKER_STATUS_CLASS}`;
const CALENDAR_DATE = `.${CALENDAR_DATE_CLASS}`;
const CALENDAR_DATE_FOCUSED = `.${CALENDAR_DATE_FOCUSED_CLASS}`;
const CALENDAR_DATE_CURRENT_MONTH = `.${CALENDAR_DATE_CURRENT_MONTH_CLASS}`;
const CALENDAR_PREVIOUS_YEAR = `.${CALENDAR_PREVIOUS_YEAR_CLASS}`;
const CALENDAR_PREVIOUS_MONTH = `.${CALENDAR_PREVIOUS_MONTH_CLASS}`;
const CALENDAR_NEXT_YEAR = `.${CALENDAR_NEXT_YEAR_CLASS}`;
const CALENDAR_NEXT_MONTH = `.${CALENDAR_NEXT_MONTH_CLASS}`;
const CALENDAR_YEAR_SELECTION = `.${CALENDAR_YEAR_SELECTION_CLASS}`;
const CALENDAR_MONTH_SELECTION = `.${CALENDAR_MONTH_SELECTION_CLASS}`;
const CALENDAR_MONTH = `.${CALENDAR_MONTH_CLASS}`;
const CALENDAR_YEAR = `.${CALENDAR_YEAR_CLASS}`;
const CALENDAR_PREVIOUS_YEAR_CHUNK = `.${CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS}`;
const CALENDAR_NEXT_YEAR_CHUNK = `.${CALENDAR_NEXT_YEAR_CHUNK_CLASS}`;
const CALENDAR_DATE_PICKER = `.${CALENDAR_DATE_PICKER_CLASS}`;
const CALENDAR_MONTH_PICKER = `.${CALENDAR_MONTH_PICKER_CLASS}`;
const CALENDAR_YEAR_PICKER = `.${CALENDAR_YEAR_PICKER_CLASS}`;
const CALENDAR_MONTH_FOCUSED = `.${CALENDAR_MONTH_FOCUSED_CLASS}`;
const CALENDAR_YEAR_FOCUSED = `.${CALENDAR_YEAR_FOCUSED_CLASS}`;

const VALIDATION_MESSAGE = "Please enter a valid date";

// An array of Dates that represent each month in the year
const MONTH_DATE_SEED = Array.from({ length: 12 }).map(
  (_, i) => new Date(0, i),
);

// An array of Dates that represent each day of the week
const DAY_OF_WEEK_DATE_SEED = Array.from({ length: 7 }).map(
  (_, i) => new Date(0, 0, i),
);

const CALENDAR_LABELS_BY_LANG = new Map();

const ENTER_KEYCODE = 13;

const YEAR_CHUNK = 12;

const DEFAULT_MIN_DATE = "0000-01-01";
const DEFAULT_EXTERNAL_DATE_FORMAT = "MM/DD/YYYY";
const INTERNAL_DATE_FORMAT = "YYYY-MM-DD";

const NOT_DISABLED_SELECTOR = ":not([disabled])";

const processFocusableSelectors = (...selectors) =>
  selectors.map((query) => query + NOT_DISABLED_SELECTOR).join(", ");

const DATE_PICKER_FOCUSABLE = processFocusableSelectors(
  CALENDAR_PREVIOUS_YEAR,
  CALENDAR_PREVIOUS_MONTH,
  CALENDAR_YEAR_SELECTION,
  CALENDAR_MONTH_SELECTION,
  CALENDAR_NEXT_YEAR,
  CALENDAR_NEXT_MONTH,
  CALENDAR_DATE_FOCUSED,
);

const MONTH_PICKER_FOCUSABLE = processFocusableSelectors(
  CALENDAR_MONTH_FOCUSED,
);

const YEAR_PICKER_FOCUSABLE = processFocusableSelectors(
  CALENDAR_PREVIOUS_YEAR_CHUNK,
  CALENDAR_NEXT_YEAR_CHUNK,
  CALENDAR_YEAR_FOCUSED,
);

// #region Date Manipulation Functions

/**
 * Keep date within month. Month would only be over by 1 to 3 days
 *
 * @param {Date} dateToCheck the date object to check
 * @param {number} month the correct month
 * @returns {Date} the date, corrected if needed
 */
const keepDateWithinMonth = (dateToCheck, month) => {
  if (month !== dateToCheck.getMonth()) {
    dateToCheck.setDate(0);
  }

  return dateToCheck;
};

/**
 * Set date from month day year
 *
 * @param {number} year the year to set
 * @param {number} month the month to set (zero-indexed)
 * @param {number} date the date to set
 * @returns {Date} the set date
 */
const setDate = (year, month, date) => {
  const newDate = new Date(0);
  newDate.setFullYear(year, month, date);
  return newDate;
};

/**
 * todays date
 *
 * @returns {Date} todays date
 */
const today = () => {
  const newDate = new Date();
  const day = newDate.getDate();
  const month = newDate.getMonth();
  const year = newDate.getFullYear();
  return setDate(year, month, day);
};

/**
 * Set date to first day of the month
 *
 * @param {number} date the date to adjust
 * @returns {Date} the adjusted date
 */
const startOfMonth = (date) => {
  const newDate = new Date(0);
  newDate.setFullYear(date.getFullYear(), date.getMonth(), 1);
  return newDate;
};

/**
 * Set date to last day of the month
 *
 * @param {number} date the date to adjust
 * @returns {Date} the adjusted date
 */
const lastDayOfMonth = (date) => {
  const newDate = new Date(0);
  newDate.setFullYear(date.getFullYear(), date.getMonth() + 1, 0);
  return newDate;
};

/**
 * Add days to date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numDays the difference in days
 * @returns {Date} the adjusted date
 */
const addDays = (_date, numDays) => {
  const newDate = new Date(_date.getTime());
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
};

/**
 * Subtract days from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numDays the difference in days
 * @returns {Date} the adjusted date
 */
const subDays = (_date, numDays) => addDays(_date, -numDays);

/**
 * Add weeks to date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */
const addWeeks = (_date, numWeeks) => addDays(_date, numWeeks * 7);

/**
 * Subtract weeks from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */
const subWeeks = (_date, numWeeks) => addWeeks(_date, -numWeeks);

/**
 * Set date to the start of the week (Sunday)
 *
 * @param {Date} _date the date to adjust
 * @returns {Date} the adjusted date
 */
const startOfWeek = (_date) => {
  const dayOfWeek = _date.getDay();
  return subDays(_date, dayOfWeek);
};

/**
 * Set date to the end of the week (Saturday)
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */
const endOfWeek = (_date) => {
  const dayOfWeek = _date.getDay();
  return addDays(_date, 6 - dayOfWeek);
};

/**
 * Add months to date and keep date within month
 *
 * @param {Date} _date the date to adjust
 * @param {number} numMonths the difference in months
 * @returns {Date} the adjusted date
 */
const addMonths = (_date, numMonths) => {
  const newDate = new Date(_date.getTime());

  const dateMonth = (newDate.getMonth() + 12 + numMonths) % 12;
  newDate.setMonth(newDate.getMonth() + numMonths);
  keepDateWithinMonth(newDate, dateMonth);

  return newDate;
};

/**
 * Subtract months from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numMonths the difference in months
 * @returns {Date} the adjusted date
 */
const subMonths = (_date, numMonths) => addMonths(_date, -numMonths);

/**
 * Add years to date and keep date within month
 *
 * @param {Date} _date the date to adjust
 * @param {number} numYears the difference in years
 * @returns {Date} the adjusted date
 */
const addYears = (_date, numYears) => addMonths(_date, numYears * 12);

/**
 * Subtract years from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numYears the difference in years
 * @returns {Date} the adjusted date
 */
const subYears = (_date, numYears) => addYears(_date, -numYears);

/**
 * Set months of date
 *
 * @param {Date} _date the date to adjust
 * @param {number} month zero-indexed month to set
 * @returns {Date} the adjusted date
 */
const setMonth = (_date, month) => {
  const newDate = new Date(_date.getTime());

  newDate.setMonth(month);
  keepDateWithinMonth(newDate, month);

  return newDate;
};

/**
 * Set year of date
 *
 * @param {Date} _date the date to adjust
 * @param {number} year the year to set
 * @returns {Date} the adjusted date
 */
const setYear = (_date, year) => {
  const newDate = new Date(_date.getTime());

  const month = newDate.getMonth();
  newDate.setFullYear(year);
  keepDateWithinMonth(newDate, month);

  return newDate;
};

/**
 * Return the earliest date
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {Date} the earliest date
 */
const min = (dateA, dateB) => {
  let newDate = dateA;

  if (dateB < dateA) {
    newDate = dateB;
  }

  return new Date(newDate.getTime());
};

/**
 * Return the latest date
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {Date} the latest date
 */
const max = (dateA, dateB) => {
  let newDate = dateA;

  if (dateB > dateA) {
    newDate = dateB;
  }

  return new Date(newDate.getTime());
};

/**
 * Check if dates are the in the same year
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {boolean} are dates in the same year
 */
const isSameYear = (dateA, dateB) =>
  dateA && dateB && dateA.getFullYear() === dateB.getFullYear();

/**
 * Check if dates are the in the same month
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {boolean} are dates in the same month
 */
const isSameMonth = (dateA, dateB) =>
  isSameYear(dateA, dateB) && dateA.getMonth() === dateB.getMonth();

/**
 * Check if dates are the same date
 *
 * @param {Date} dateA the date to compare
 * @param {Date} dateA the date to compare
 * @returns {boolean} are dates the same date
 */
const isSameDay = (dateA, dateB) =>
  isSameMonth(dateA, dateB) && dateA.getDate() === dateB.getDate();

/**
 * return a new date within minimum and maximum date
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @returns {Date} the date between min and max
 */
const keepDateBetweenMinAndMax = (date, minDate, maxDate) => {
  let newDate = date;

  if (date < minDate) {
    newDate = minDate;
  } else if (maxDate && date > maxDate) {
    newDate = maxDate;
  }

  return new Date(newDate.getTime());
};

/**
 * Check if dates is valid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is there a day within the month within min and max dates
 */
const isDateWithinMinAndMax = (date, minDate, maxDate) =>
  date >= minDate && (!maxDate || date <= maxDate);

/**
 * Check if dates month is invalid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is the month outside min or max dates
 */
const isDatesMonthOutsideMinOrMax = (date, minDate, maxDate) =>
  lastDayOfMonth(date) < minDate || (maxDate && startOfMonth(date) > maxDate);

/**
 * Check if dates year is invalid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is the month outside min or max dates
 */
const isDatesYearOutsideMinOrMax = (date, minDate, maxDate) =>
  lastDayOfMonth(setMonth(date, 11)) < minDate ||
  (maxDate && startOfMonth(setMonth(date, 0)) > maxDate);

/**
 * @typedef {Object} DateRangeContext
 * @property {Date} rangeStartDate
 * @property {Date} rangeEndDate
 * @property {Date} withinRangeStartDate
 * @property {Date} withinRangeEndDate
 */

/**
 * Set the start, end, and within range values for date range variants.

 * @param {Date} date - Date that concludes the date range.
 * @param {Date} rangeDate - Range date data attribute value of the date picker component.
 * @returns {DateRangeContext} - Dates for range selection.
 */
const setRangeDates = (date, rangeDate) => {
  const rangeConclusionDate = date;
  const rangeStartDate = rangeDate && min(rangeConclusionDate, rangeDate);
  const rangeEndDate = rangeDate && max(rangeConclusionDate, rangeDate);

  const withinRangeStartDate = rangeDate && addDays(rangeStartDate, 1);
  const withinRangeEndDate = rangeDate && subDays(rangeEndDate, 1);

  return {
    rangeStartDate,
    rangeEndDate,
    withinRangeStartDate,
    withinRangeEndDate,
  };
};

/**
 * Parse a date with format M-D-YY
 *
 * @param {string} dateString the date string to parse
 * @param {string} dateFormat the format of the date string
 * @param {boolean} adjustDate should the date be adjusted
 * @returns {Date} the parsed date
 */
const parseDateString = (
  dateString,
  dateFormat = INTERNAL_DATE_FORMAT,
  adjustDate = false,
) => {
  let date;
  let month;
  let day;
  let year;
  let parsed;

  if (dateString) {
    let monthStr;
    let dayStr;
    let yearStr;

    if (dateFormat === DEFAULT_EXTERNAL_DATE_FORMAT) {
      [monthStr, dayStr, yearStr] = dateString.split("/");
    } else {
      [yearStr, monthStr, dayStr] = dateString.split("-");
    }

    if (yearStr) {
      parsed = parseInt(yearStr, 10);
      if (!Number.isNaN(parsed)) {
        year = parsed;
        if (adjustDate) {
          year = Math.max(0, year);
          if (yearStr.length < 3) {
            const currentYear = today().getFullYear();
            const currentYearStub =
              currentYear - (currentYear % 10 ** yearStr.length);
            year = currentYearStub + parsed;
          }
        }
      }
    }

    if (monthStr) {
      parsed = parseInt(monthStr, 10);
      if (!Number.isNaN(parsed)) {
        month = parsed;
        if (adjustDate) {
          month = Math.max(1, month);
          month = Math.min(12, month);
        }
      }
    }

    if (month && dayStr && year != null) {
      parsed = parseInt(dayStr, 10);
      if (!Number.isNaN(parsed)) {
        day = parsed;
        if (adjustDate) {
          const lastDayOfTheMonth = setDate(year, month, 0).getDate();
          day = Math.max(1, day);
          day = Math.min(lastDayOfTheMonth, day);
        }
      }
    }

    if (month && day && year != null) {
      date = setDate(year, month - 1, day);
    }
  }

  return date;
};

/**
 * Format a date to format MM-DD-YYYY
 *
 * @param {Date} date the date to format
 * @param {string} dateFormat the format of the date string
 * @returns {string} the formatted date string
 */
const formatDate = (date, dateFormat = INTERNAL_DATE_FORMAT) => {
  const padZeros = (value, length) => `0000${value}`.slice(-length);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  if (dateFormat === DEFAULT_EXTERNAL_DATE_FORMAT) {
    return [padZeros(month, 2), padZeros(day, 2), padZeros(year, 4)].join("/");
  }

  return [padZeros(year, 4), padZeros(month, 2), padZeros(day, 2)].join("-");
};

// #endregion Date Manipulation Functions

/**
 * Create a grid string from an array of html strings
 *
 * @param {string[]} htmlArray the array of html items
 * @param {number} rowSize the length of a row
 * @returns {string} the grid string
 */
const listToGridHtml = (htmlArray, rowSize) => {
  const grid = [];
  let row = [];

  let i = 0;
  while (i < htmlArray.length) {
    row = [];

    const tr = document.createElement("tr");
    while (i < htmlArray.length && row.length < rowSize) {
      const td = document.createElement("td");
      td.insertAdjacentElement("beforeend", htmlArray[i]);
      row.push(td);
      i += 1;
    }

    row.forEach((element) => {
      tr.insertAdjacentElement("beforeend", element);
    });

    grid.push(tr);
  }

  return grid;
};

const createTableBody = (grid) => {
  const tableBody = document.createElement("tbody");
  grid.forEach((element) => {
    tableBody.insertAdjacentElement("beforeend", element);
  });

  return tableBody;
};

/**
 * set the value of the element and dispatch a change event
 *
 * @param {HTMLInputElement} el The element to update
 * @param {string} value The new value of the element
 */
const changeElementValue = (el, value = "") => {
  const elementToChange = el;
  elementToChange.value = value;

  const event = new CustomEvent("change", {
    bubbles: true,
    cancelable: true,
    detail: { value },
  });
  elementToChange.dispatchEvent(event);
};

/**
 * The properties and elements within the date picker.
 * @typedef {Object} DatePickerContext
 * @property {HTMLDivElement} calendarEl
 * @property {HTMLElement} datePickerEl
 * @property {HTMLInputElement} internalInputEl
 * @property {HTMLInputElement} externalInputEl
 * @property {HTMLDivElement} statusEl
 * @property {HTMLDivElement} firstYearChunkEl
 * @property {Date} calendarDate
 * @property {Date} minDate
 * @property {Date} maxDate
 * @property {Date} selectedDate
 * @property {Date} rangeDate
 * @property {Date} defaultDate
 */

/**
 * Get an object of the properties and elements belonging directly to the given
 * date picker component.
 *
 * @param {HTMLElement} el the element within the date picker
 * @returns {DatePickerContext} elements
 */
const getDatePickerContext = (el) => {
  const datePickerEl = el.closest(DATE_PICKER);

  if (!datePickerEl) {
    throw new Error(`Element is missing outer ${DATE_PICKER}`);
  }

  const internalInputEl = datePickerEl.querySelector(
    DATE_PICKER_INTERNAL_INPUT,
  );
  const externalInputEl = datePickerEl.querySelector(
    DATE_PICKER_EXTERNAL_INPUT,
  );
  const calendarEl = datePickerEl.querySelector(DATE_PICKER_CALENDAR);
  const toggleBtnEl = datePickerEl.querySelector(DATE_PICKER_BUTTON);
  const statusEl = datePickerEl.querySelector(DATE_PICKER_STATUS);
  const firstYearChunkEl = datePickerEl.querySelector(CALENDAR_YEAR);

  const inputDate = parseDateString(
    externalInputEl.value,
    DEFAULT_EXTERNAL_DATE_FORMAT,
    true,
  );
  const selectedDate = parseDateString(internalInputEl.value);

  const calendarDate = parseDateString(calendarEl.dataset.value);
  const minDate = parseDateString(datePickerEl.dataset.minDate);
  const maxDate = parseDateString(datePickerEl.dataset.maxDate);
  const rangeDate = parseDateString(datePickerEl.dataset.rangeDate);
  const defaultDate = parseDateString(datePickerEl.dataset.defaultDate);

  if (minDate && maxDate && minDate > maxDate) {
    throw new Error("Minimum date cannot be after maximum date");
  }

  const lang = document.documentElement.lang || "en";

  // if the language is not found generate the list
  if (!CALENDAR_LABELS_BY_LANG.has(lang)) {
    CALENDAR_LABELS_BY_LANG.set(lang, {
      monthLabels: MONTH_DATE_SEED.map((date) =>
        date.toLocaleString(lang, { month: "long" }),
      ),
      dayOfWeeklabels: DAY_OF_WEEK_DATE_SEED.map((date) =>
        date.toLocaleString(lang, {
          weekday: "long",
        }),
      ),
      dayOfWeeksAbv: DAY_OF_WEEK_DATE_SEED.map((date) =>
        date.toLocaleString(lang, {
          weekday: "narrow",
        }),
      ),
    });
  }

  const { monthLabels, dayOfWeeklabels, dayOfWeeksAbv } =
    CALENDAR_LABELS_BY_LANG.get(lang);

  return {
    calendarDate,
    minDate,
    toggleBtnEl,
    selectedDate,
    maxDate,
    firstYearChunkEl,
    datePickerEl,
    inputDate,
    internalInputEl,
    externalInputEl,
    calendarEl,
    rangeDate,
    defaultDate,
    statusEl,
    monthLabels,
    dayOfWeeklabels,
    dayOfWeeksAbv,
  };
};

/**
 * Disable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const disable = (el) => {
  const { externalInputEl, toggleBtnEl } = getDatePickerContext(el);

  toggleBtnEl.disabled = true;
  externalInputEl.disabled = true;
};

/**
 * Add the readonly attribute to input element and the aria-disabled attribute to the toggle calendar button and external input elements.
 *
 * @param {HTMLElement} el - The date picker element
 */
const ariaDisable = (el) => {
  const { externalInputEl, toggleBtnEl } = getDatePickerContext(el);

  toggleBtnEl.setAttribute("aria-disabled", true);
  externalInputEl.setAttribute("aria-disabled", true);
  externalInputEl.setAttribute("readonly", "");
};

/**
 * Enable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const enable = (el) => {
  const { externalInputEl, toggleBtnEl } = getDatePickerContext(el);

  toggleBtnEl.disabled = false;
  toggleBtnEl.removeAttribute("aria-disabled");

  externalInputEl.disabled = false;
  externalInputEl.removeAttribute("aria-disabled");
  externalInputEl.removeAttribute("readonly");
};

// #region Validation

/**
 * Validate the value in the input as a valid date of format M/D/YYYY
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const isDateInputInvalid = (el) => {
  const { externalInputEl, minDate, maxDate } = getDatePickerContext(el);

  const dateString = externalInputEl.value;
  let isInvalid = false;

  if (dateString) {
    isInvalid = true;

    const dateStringParts = dateString.split("/");
    const [month, day, year] = dateStringParts.map((str) => {
      let value;
      const parsed = parseInt(str, 10);
      if (!Number.isNaN(parsed)) value = parsed;
      return value;
    });

    if (month && day && year != null) {
      const checkDate = setDate(year, month - 1, day);

      if (
        checkDate.getMonth() === month - 1 &&
        checkDate.getDate() === day &&
        checkDate.getFullYear() === year &&
        dateStringParts[2].length === 4 &&
        isDateWithinMinAndMax(checkDate, minDate, maxDate)
      ) {
        isInvalid = false;
      }
    }
  }

  return isInvalid;
};

/**
 * Validate the value in the input as a valid date of format M/D/YYYY
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const validateDateInput = (el) => {
  const { externalInputEl } = getDatePickerContext(el);
  const isInvalid = isDateInputInvalid(externalInputEl);

  if (isInvalid && !externalInputEl.validationMessage) {
    externalInputEl.setCustomValidity(VALIDATION_MESSAGE);
  }

  if (!isInvalid && externalInputEl.validationMessage === VALIDATION_MESSAGE) {
    externalInputEl.setCustomValidity("");
  }
};

// #endregion Validation

/**
 * Enable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const reconcileInputValues = (el) => {
  const { internalInputEl, inputDate } = getDatePickerContext(el);
  let newValue = "";

  if (inputDate && !isDateInputInvalid(el)) {
    newValue = formatDate(inputDate);
  }

  if (internalInputEl.value !== newValue) {
    changeElementValue(internalInputEl, newValue);
  }
};

/**
 * Select the value of the date picker inputs.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @param {string} dateString The date string to update in YYYY-MM-DD format
 */
const setCalendarValue = (el, dateString) => {
  const parsedDate = parseDateString(dateString);

  if (parsedDate) {
    const formattedDate = formatDate(parsedDate, DEFAULT_EXTERNAL_DATE_FORMAT);

    const { datePickerEl, internalInputEl, externalInputEl } =
      getDatePickerContext(el);

    changeElementValue(internalInputEl, dateString);
    changeElementValue(externalInputEl, formattedDate);

    validateDateInput(datePickerEl);
  }
};

/**
 * Enhance an input with the date picker elements
 *
 * @param {HTMLElement} el The initial wrapping element of the date picker component
 */
const enhanceDatePicker = (el) => {
  const datePickerEl = el.closest(DATE_PICKER);
  const { defaultValue } = datePickerEl.dataset;

  const internalInputEl = datePickerEl.querySelector(`input`);

  if (!internalInputEl) {
    throw new Error(`${DATE_PICKER} is missing inner input`);
  }

  if (internalInputEl.value) {
    internalInputEl.value = "";
  }

  const minDate = parseDateString(
    datePickerEl.dataset.minDate || internalInputEl.getAttribute("min"),
  );
  datePickerEl.dataset.minDate = minDate
    ? formatDate(minDate)
    : DEFAULT_MIN_DATE;

  const maxDate = parseDateString(
    datePickerEl.dataset.maxDate || internalInputEl.getAttribute("max"),
  );
  if (maxDate) {
    datePickerEl.dataset.maxDate = formatDate(maxDate);
  }

  const calendarWrapper = document.createElement("div");
  calendarWrapper.classList.add(DATE_PICKER_WRAPPER_CLASS);

  const externalInputEl = internalInputEl.cloneNode();
  externalInputEl.classList.add(DATE_PICKER_EXTERNAL_INPUT_CLASS);
  externalInputEl.type = "text";

  calendarWrapper.appendChild(externalInputEl);
  calendarWrapper.insertAdjacentHTML(
    "beforeend",
    Sanitizer.escapeHTML`
    <button type="button" class="${DATE_PICKER_BUTTON_CLASS}" aria-haspopup="true" aria-label="Toggle calendar"></button>
    <div class="${DATE_PICKER_CALENDAR_CLASS}" role="application" hidden></div>
    <div class="usa-sr-only ${DATE_PICKER_STATUS_CLASS}" role="status" aria-live="polite"></div>`,
  );

  internalInputEl.setAttribute("aria-hidden", "true");
  internalInputEl.setAttribute("tabindex", "-1");
  internalInputEl.style.display = "none";
  internalInputEl.classList.add(DATE_PICKER_INTERNAL_INPUT_CLASS);
  internalInputEl.removeAttribute("id");
  internalInputEl.removeAttribute("name");
  internalInputEl.required = false;

  datePickerEl.appendChild(calendarWrapper);
  datePickerEl.classList.add(DATE_PICKER_INITIALIZED_CLASS);

  if (defaultValue) {
    setCalendarValue(datePickerEl, defaultValue);
  }

  if (internalInputEl.disabled) {
    disable(datePickerEl);
    internalInputEl.disabled = false;
  }

  if (internalInputEl.hasAttribute("aria-disabled")) {
    ariaDisable(datePickerEl);
    internalInputEl.removeAttribute("aria-disabled");
  }
};

// #region Calendar - Date Selection View

/**
 * render the calendar.
 *
 * @param {HTMLElement} el An element within the date picker component
 * @param {Date} _dateToDisplay a date to render on the calendar
 * @returns {HTMLElement} a reference to the new calendar element
 */
const renderCalendar = (el, _dateToDisplay) => {
  const {
    datePickerEl,
    calendarEl,
    statusEl,
    selectedDate,
    maxDate,
    minDate,
    rangeDate,
    monthLabels,
    dayOfWeeklabels,
    dayOfWeeksAbv,
  } = getDatePickerContext(el);
  const todaysDate = today();
  let dateToDisplay = _dateToDisplay || todaysDate;

  const calendarWasHidden = calendarEl.hidden;

  const focusedDate = addDays(dateToDisplay, 0);
  const focusedMonth = dateToDisplay.getMonth();
  const focusedYear = dateToDisplay.getFullYear();

  const prevMonth = subMonths(dateToDisplay, 1);
  const nextMonth = addMonths(dateToDisplay, 1);

  const currentFormattedDate = formatDate(dateToDisplay);

  const firstOfMonth = startOfMonth(dateToDisplay);
  const prevButtonsDisabled = isSameMonth(dateToDisplay, minDate);
  const nextButtonsDisabled = isSameMonth(dateToDisplay, maxDate);

  const {
    rangeStartDate,
    rangeEndDate,
    withinRangeStartDate,
    withinRangeEndDate,
  } = setRangeDates(selectedDate || dateToDisplay, rangeDate);

  const monthLabel = monthLabels[focusedMonth];

  const generateDateHtml = (dateToRender) => {
    const classes = [CALENDAR_DATE_CLASS];
    const day = dateToRender.getDate();
    const month = dateToRender.getMonth();
    const year = dateToRender.getFullYear();
    const dayOfWeek = dateToRender.getDay();

    const formattedDate = formatDate(dateToRender);

    let tabindex = "-1";

    const isDisabled = !isDateWithinMinAndMax(dateToRender, minDate, maxDate);
    const isSelected = isSameDay(dateToRender, selectedDate);

    if (isSameMonth(dateToRender, prevMonth)) {
      classes.push(CALENDAR_DATE_PREVIOUS_MONTH_CLASS);
    }

    if (isSameMonth(dateToRender, focusedDate)) {
      classes.push(CALENDAR_DATE_CURRENT_MONTH_CLASS);
    }

    if (isSameMonth(dateToRender, nextMonth)) {
      classes.push(CALENDAR_DATE_NEXT_MONTH_CLASS);
    }

    if (isSelected) {
      classes.push(CALENDAR_DATE_SELECTED_CLASS);
    }

    if (isSameDay(dateToRender, todaysDate)) {
      classes.push(CALENDAR_DATE_TODAY_CLASS);
    }

    if (rangeDate) {
      if (isSameDay(dateToRender, rangeDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_CLASS);
      }

      if (isSameDay(dateToRender, rangeStartDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_START_CLASS);
      }

      if (isSameDay(dateToRender, rangeEndDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_END_CLASS);
      }

      if (
        isDateWithinMinAndMax(
          dateToRender,
          withinRangeStartDate,
          withinRangeEndDate,
        )
      ) {
        classes.push(CALENDAR_DATE_WITHIN_RANGE_CLASS);
      }
    }

    if (isSameDay(dateToRender, focusedDate)) {
      tabindex = "0";
      classes.push(CALENDAR_DATE_FOCUSED_CLASS);
    }

    const monthStr = monthLabels[month];
    const dayStr = dayOfWeeklabels[dayOfWeek];

    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-day", day);
    btn.setAttribute("data-month", month + 1);
    btn.setAttribute("data-year", year);
    btn.setAttribute("data-value", formattedDate);
    btn.setAttribute(
      "aria-label",
      Sanitizer.escapeHTML`${day} ${monthStr} ${year} ${dayStr}`,
    );
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    if (isDisabled === true) {
      btn.disabled = true;
    }
    btn.textContent = day;

    return btn;
  };

  // set date to first rendered day
  dateToDisplay = startOfWeek(firstOfMonth);

  const days = [];

  while (
    days.length < 28 ||
    dateToDisplay.getMonth() === focusedMonth ||
    days.length % 7 !== 0
  ) {
    days.push(generateDateHtml(dateToDisplay));
    dateToDisplay = addDays(dateToDisplay, 1);
  }

  const datesGrid = listToGridHtml(days, 7);

  const newCalendar = calendarEl.cloneNode();
  newCalendar.dataset.value = currentFormattedDate;
  newCalendar.style.top = `${datePickerEl.offsetHeight}px`;
  newCalendar.hidden = false;
  newCalendar.innerHTML = Sanitizer.escapeHTML`
    <div tabindex="-1" class="${CALENDAR_DATE_PICKER_CLASS}">
      <div class="${CALENDAR_ROW_CLASS}">
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_PREVIOUS_YEAR_CLASS}"
            aria-label="Navigate back one year"
            ${prevButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_PREVIOUS_MONTH_CLASS}"
            aria-label="Navigate back one month"
            ${prevButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_MONTH_LABEL_CLASS}">
          <button
            type="button"
            class="${CALENDAR_MONTH_SELECTION_CLASS}" aria-label="${monthLabel}. Select month"
          >${monthLabel}</button>
          <button
            type="button"
            class="${CALENDAR_YEAR_SELECTION_CLASS}" aria-label="${focusedYear}. Select year"
          >${focusedYear}</button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_NEXT_MONTH_CLASS}"
            aria-label="Navigate forward one month"
            ${nextButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_NEXT_YEAR_CLASS}"
            aria-label="Navigate forward one year"
            ${nextButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
      </div>
    </div>
    `;

  const table = document.createElement("table");
  table.setAttribute("class", CALENDAR_TABLE_CLASS);

  const tableHead = document.createElement("thead");
  table.insertAdjacentElement("beforeend", tableHead);
  const tableHeadRow = document.createElement("tr");
  tableHead.insertAdjacentElement("beforeend", tableHeadRow);

  dayOfWeeklabels.forEach((dayOfWeek, i) => {
    const th = document.createElement("th");
    th.setAttribute("class", CALENDAR_DAY_OF_WEEK_CLASS);
    th.setAttribute("scope", "col");
    th.setAttribute("aria-label", dayOfWeek);
    th.textContent = dayOfWeeksAbv[i];
    tableHeadRow.insertAdjacentElement("beforeend", th);
  });

  const tableBody = createTableBody(datesGrid);
  table.insertAdjacentElement("beforeend", tableBody);

  // Container for Years, Months, and Days
  const datePickerCalendarContainer =
    newCalendar.querySelector(CALENDAR_DATE_PICKER);

  datePickerCalendarContainer.insertAdjacentElement("beforeend", table);

  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);

  datePickerEl.classList.add(DATE_PICKER_ACTIVE_CLASS);

  const statuses = [];

  if (isSameDay(selectedDate, focusedDate)) {
    statuses.push("Selected date");
  }

  if (calendarWasHidden) {
    statuses.push(
      "You can navigate by day using left and right arrows",
      "Weeks by using up and down arrows",
      "Months by using page up and page down keys",
      "Years by using shift plus page up and shift plus page down",
      "Home and end keys navigate to the beginning and end of a week",
    );
    statusEl.textContent = "";
  } else {
    statuses.push(`${monthLabel} ${focusedYear}`);
  }
  statusEl.textContent = statuses.join(". ");

  return newCalendar;
};

/**
 * Navigate back one year and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */
const displayPreviousYear = (_buttonEl) => {
  if (_buttonEl.disabled) return;
  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(_buttonEl);
  let date = subYears(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);

  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_YEAR);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Navigate back one month and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */
const displayPreviousMonth = (_buttonEl) => {
  if (_buttonEl.disabled) return;
  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(_buttonEl);
  let date = subMonths(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);

  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_MONTH);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Navigate forward one month and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */
const displayNextMonth = (_buttonEl) => {
  if (_buttonEl.disabled) return;
  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(_buttonEl);
  let date = addMonths(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);

  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_MONTH);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Navigate forward one year and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */
const displayNextYear = (_buttonEl) => {
  if (_buttonEl.disabled) return;
  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(_buttonEl);
  let date = addYears(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);

  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_YEAR);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Hide the calendar of a date picker component.
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const hideCalendar = (el) => {
  const { datePickerEl, calendarEl, statusEl } = getDatePickerContext(el);

  datePickerEl.classList.remove(DATE_PICKER_ACTIVE_CLASS);
  calendarEl.hidden = true;
  statusEl.textContent = "";
};

/**
 * Select a date within the date picker component.
 *
 * @param {HTMLButtonElement} calendarDateEl A date element within the date picker component
 */
const selectDate = (calendarDateEl) => {
  if (calendarDateEl.disabled) return;

  const { datePickerEl, externalInputEl } =
    getDatePickerContext(calendarDateEl);

  setCalendarValue(calendarDateEl, calendarDateEl.dataset.value);
  hideCalendar(datePickerEl);

  externalInputEl.focus();
};

/**
 * Toggle the calendar.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */
const toggleCalendar = (el) => {
  if (el.disabled || el.hasAttribute("aria-disabled")) return;
  const { calendarEl, inputDate, minDate, maxDate, defaultDate } =
    getDatePickerContext(el);

  if (calendarEl.hidden) {
    const dateToDisplay = keepDateBetweenMinAndMax(
      inputDate || defaultDate || today(),
      minDate,
      maxDate,
    );
    const newCalendar = renderCalendar(calendarEl, dateToDisplay);
    newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
  } else {
    hideCalendar(el);
  }
};

/**
 * Update the calendar when visible.
 *
 * @param {HTMLElement} el an element within the date picker
 */
const updateCalendarIfVisible = (el) => {
  const { calendarEl, inputDate, minDate, maxDate } = getDatePickerContext(el);
  const calendarShown = !calendarEl.hidden;

  if (calendarShown && inputDate) {
    const dateToDisplay = keepDateBetweenMinAndMax(inputDate, minDate, maxDate);
    renderCalendar(calendarEl, dateToDisplay);
  }
};

// #endregion Calendar - Date Selection View

// #region Calendar - Month Selection View
/**
 * Display the month selection screen in the date picker.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @returns {HTMLElement} a reference to the new calendar element
 */
const displayMonthSelection = (el, monthToDisplay) => {
  const { calendarEl, statusEl, calendarDate, minDate, maxDate, monthLabels } =
    getDatePickerContext(el);

  const selectedMonth = calendarDate.getMonth();
  const focusedMonth = monthToDisplay == null ? selectedMonth : monthToDisplay;

  const months = monthLabels.map((month, index) => {
    const monthToCheck = setMonth(calendarDate, index);

    const isDisabled = isDatesMonthOutsideMinOrMax(
      monthToCheck,
      minDate,
      maxDate,
    );

    let tabindex = "-1";

    const classes = [CALENDAR_MONTH_CLASS];
    const isSelected = index === selectedMonth;

    if (index === focusedMonth) {
      tabindex = "0";
      classes.push(CALENDAR_MONTH_FOCUSED_CLASS);
    }

    if (isSelected) {
      classes.push(CALENDAR_MONTH_SELECTED_CLASS);
    }

    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-value", index);
    btn.setAttribute("data-label", month);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    if (isDisabled === true) {
      btn.disabled = true;
    }
    btn.textContent = month;

    return btn;
  });

  const monthsHtml = document.createElement("div");
  monthsHtml.setAttribute("tabindex", "-1");
  monthsHtml.setAttribute("class", CALENDAR_MONTH_PICKER_CLASS);

  const table = document.createElement("table");
  table.setAttribute("class", CALENDAR_TABLE_CLASS);
  table.setAttribute("role", "presentation");

  const monthsGrid = listToGridHtml(months, 3);
  const tableBody = createTableBody(monthsGrid);
  table.insertAdjacentElement("beforeend", tableBody);
  monthsHtml.insertAdjacentElement("beforeend", table);

  const newCalendar = calendarEl.cloneNode();
  newCalendar.insertAdjacentElement("beforeend", monthsHtml);
  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);

  statusEl.textContent = "Select a month.";

  return newCalendar;
};

/**
 * Select a month in the date picker component.
 *
 * @param {HTMLButtonElement} monthEl An month element within the date picker component
 */
const selectMonth = (monthEl) => {
  if (monthEl.disabled) return;
  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(monthEl);
  const selectedMonth = parseInt(monthEl.dataset.value, 10);
  let date = setMonth(calendarDate, selectedMonth);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
};

// #endregion Calendar - Month Selection View

// #region Calendar - Year Selection View

/**
 * Display the year selection screen in the date picker.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @param {number} yearToDisplay year to display in year selection
 * @returns {HTMLElement} a reference to the new calendar element
 */
const displayYearSelection = (el, yearToDisplay) => {
  const { calendarEl, statusEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(el);

  const selectedYear = calendarDate.getFullYear();
  const focusedYear = yearToDisplay == null ? selectedYear : yearToDisplay;

  let yearToChunk = focusedYear;
  yearToChunk -= yearToChunk % YEAR_CHUNK;
  yearToChunk = Math.max(0, yearToChunk);

  const prevYearChunkDisabled = isDatesYearOutsideMinOrMax(
    setYear(calendarDate, yearToChunk - 1),
    minDate,
    maxDate,
  );

  const nextYearChunkDisabled = isDatesYearOutsideMinOrMax(
    setYear(calendarDate, yearToChunk + YEAR_CHUNK),
    minDate,
    maxDate,
  );

  const years = [];
  let yearIndex = yearToChunk;
  while (years.length < YEAR_CHUNK) {
    const isDisabled = isDatesYearOutsideMinOrMax(
      setYear(calendarDate, yearIndex),
      minDate,
      maxDate,
    );

    let tabindex = "-1";

    const classes = [CALENDAR_YEAR_CLASS];
    const isSelected = yearIndex === selectedYear;

    if (yearIndex === focusedYear) {
      tabindex = "0";
      classes.push(CALENDAR_YEAR_FOCUSED_CLASS);
    }

    if (isSelected) {
      classes.push(CALENDAR_YEAR_SELECTED_CLASS);
    }

    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-value", yearIndex);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    if (isDisabled === true) {
      btn.disabled = true;
    }
    btn.textContent = yearIndex;

    years.push(btn);
    yearIndex += 1;
  }

  const newCalendar = calendarEl.cloneNode();

  // create the years calendar wrapper
  const yearsCalendarWrapper = document.createElement("div");
  yearsCalendarWrapper.setAttribute("tabindex", "-1");
  yearsCalendarWrapper.setAttribute("class", CALENDAR_YEAR_PICKER_CLASS);

  // create table parent
  const yearsTableParent = document.createElement("table");
  yearsTableParent.setAttribute("class", CALENDAR_TABLE_CLASS);

  // create table body and table row
  const yearsHTMLTableBody = document.createElement("tbody");
  const yearsHTMLTableBodyRow = document.createElement("tr");

  // create previous button
  const previousYearsBtn = document.createElement("button");
  previousYearsBtn.setAttribute("type", "button");
  previousYearsBtn.setAttribute("class", CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS);
  previousYearsBtn.setAttribute(
    "aria-label",
    `Navigate back ${YEAR_CHUNK} years`,
  );
  if (prevYearChunkDisabled === true) {
    previousYearsBtn.disabled = true;
  }
  previousYearsBtn.innerHTML = Sanitizer.escapeHTML`&nbsp`;

  // create next button
  const nextYearsBtn = document.createElement("button");
  nextYearsBtn.setAttribute("type", "button");
  nextYearsBtn.setAttribute("class", CALENDAR_NEXT_YEAR_CHUNK_CLASS);
  nextYearsBtn.setAttribute(
    "aria-label",
    `Navigate forward ${YEAR_CHUNK} years`,
  );
  if (nextYearChunkDisabled === true) {
    nextYearsBtn.disabled = true;
  }
  nextYearsBtn.innerHTML = Sanitizer.escapeHTML`&nbsp`;

  // create the actual years table
  const yearsTable = document.createElement("table");
  yearsTable.setAttribute("class", CALENDAR_TABLE_CLASS);
  yearsTable.setAttribute("role", "presentation");

  // create the years child table
  const yearsGrid = listToGridHtml(years, 3);
  const yearsTableBody = createTableBody(yearsGrid);

  // append the grid to the years child table
  yearsTable.insertAdjacentElement("beforeend", yearsTableBody);

  // create the prev button td and append the prev button
  const yearsHTMLTableBodyDetailPrev = document.createElement("td");
  yearsHTMLTableBodyDetailPrev.insertAdjacentElement(
    "beforeend",
    previousYearsBtn,
  );

  // create the years td and append the years child table
  const yearsHTMLTableBodyYearsDetail = document.createElement("td");
  yearsHTMLTableBodyYearsDetail.setAttribute("colspan", "3");
  yearsHTMLTableBodyYearsDetail.insertAdjacentElement("beforeend", yearsTable);

  // create the next button td and append the next button
  const yearsHTMLTableBodyDetailNext = document.createElement("td");
  yearsHTMLTableBodyDetailNext.insertAdjacentElement("beforeend", nextYearsBtn);

  // append the three td to the years child table row
  yearsHTMLTableBodyRow.insertAdjacentElement(
    "beforeend",
    yearsHTMLTableBodyDetailPrev,
  );
  yearsHTMLTableBodyRow.insertAdjacentElement(
    "beforeend",
    yearsHTMLTableBodyYearsDetail,
  );
  yearsHTMLTableBodyRow.insertAdjacentElement(
    "beforeend",
    yearsHTMLTableBodyDetailNext,
  );

  // append the table row to the years child table body
  yearsHTMLTableBody.insertAdjacentElement("beforeend", yearsHTMLTableBodyRow);

  // append the years table body to the years parent table
  yearsTableParent.insertAdjacentElement("beforeend", yearsHTMLTableBody);

  // append the parent table to the calendar wrapper
  yearsCalendarWrapper.insertAdjacentElement("beforeend", yearsTableParent);

  // append the years calender to the new calendar
  newCalendar.insertAdjacentElement("beforeend", yearsCalendarWrapper);

  // replace calendar
  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);

  statusEl.textContent = Sanitizer.escapeHTML`Showing years ${yearToChunk} to ${
    yearToChunk + YEAR_CHUNK - 1
  }. Select a year.`;

  return newCalendar;
};

/**
 * Navigate back by years and display the year selection screen.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */
const displayPreviousYearChunk = (el) => {
  if (el.disabled) return;

  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(el);
  const yearEl = calendarEl.querySelector(CALENDAR_YEAR_FOCUSED);
  const selectedYear = parseInt(yearEl.textContent, 10);

  let adjustedYear = selectedYear - YEAR_CHUNK;
  adjustedYear = Math.max(0, adjustedYear);

  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = displayYearSelection(
    calendarEl,
    cappedDate.getFullYear(),
  );

  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_YEAR_CHUNK);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_YEAR_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Navigate forward by years and display the year selection screen.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */
const displayNextYearChunk = (el) => {
  if (el.disabled) return;

  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(el);
  const yearEl = calendarEl.querySelector(CALENDAR_YEAR_FOCUSED);
  const selectedYear = parseInt(yearEl.textContent, 10);

  let adjustedYear = selectedYear + YEAR_CHUNK;
  adjustedYear = Math.max(0, adjustedYear);

  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = displayYearSelection(
    calendarEl,
    cappedDate.getFullYear(),
  );

  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_YEAR_CHUNK);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_YEAR_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Select a year in the date picker component.
 *
 * @param {HTMLButtonElement} yearEl A year element within the date picker component
 */
const selectYear = (yearEl) => {
  if (yearEl.disabled) return;
  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(yearEl);
  const selectedYear = parseInt(yearEl.innerHTML, 10);
  let date = setYear(calendarDate, selectedYear);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
};

// #endregion Calendar - Year Selection View

// #region Calendar Event Handling

/**
 * Hide the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleEscapeFromCalendar = (event) => {
  const { datePickerEl, externalInputEl } = getDatePickerContext(event.target);

  hideCalendar(datePickerEl);
  externalInputEl.focus();

  event.preventDefault();
};

// #endregion Calendar Event Handling

// #region Calendar Date Event Handling

/**
 * Adjust the date and display the calendar if needed.
 *
 * @param {function} adjustDateFn function that returns the adjusted date
 */
const adjustCalendar = (adjustDateFn) => (event) => {
  const { calendarEl, calendarDate, minDate, maxDate } = getDatePickerContext(
    event.target,
  );

  const date = adjustDateFn(calendarDate);

  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  if (!isSameDay(calendarDate, cappedDate)) {
    const newCalendar = renderCalendar(calendarEl, cappedDate);
    newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
  }
  event.preventDefault();
};

/**
 * Navigate back one week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleUpFromDate = adjustCalendar((date) => subWeeks(date, 1));

/**
 * Navigate forward one week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleDownFromDate = adjustCalendar((date) => addWeeks(date, 1));

/**
 * Navigate back one day and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleLeftFromDate = adjustCalendar((date) => subDays(date, 1));

/**
 * Navigate forward one day and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleRightFromDate = adjustCalendar((date) => addDays(date, 1));

/**
 * Navigate to the start of the week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleHomeFromDate = adjustCalendar((date) => startOfWeek(date));

/**
 * Navigate to the end of the week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleEndFromDate = adjustCalendar((date) => endOfWeek(date));

/**
 * Navigate forward one month and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageDownFromDate = adjustCalendar((date) => addMonths(date, 1));

/**
 * Navigate back one month and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageUpFromDate = adjustCalendar((date) => subMonths(date, 1));

/**
 * Navigate forward one year and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleShiftPageDownFromDate = adjustCalendar((date) => addYears(date, 1));

/**
 * Navigate back one year and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleShiftPageUpFromDate = adjustCalendar((date) => subYears(date, 1));

/**
 * Set range date classes without re-rendering the calendar. Called when date button is hovered.
 * Returns early if the date hovered is disabled or if there is already a selected date.
 *
 * @param {HTMLElement} dateEl - Calendar date button within the date picker component.
 */

const handleMouseoverFromDate = (dateEl) => {
  if (dateEl.disabled) return;

  const hoverDate = parseDateString(dateEl.dataset.value);
  const { calendarEl, selectedDate, rangeDate } = getDatePickerContext(dateEl);

  if (selectedDate) return;

  const { withinRangeStartDate, withinRangeEndDate } = setRangeDates(
    hoverDate,
    rangeDate,
  );

  const dateButtons = calendarEl.querySelectorAll(
    `.${CALENDAR_DATE_CURRENT_MONTH_CLASS}`,
  );

  dateButtons.forEach((button) => {
    const buttonDate = parseDateString(button.dataset.value);
    if (
      isDateWithinMinAndMax(
        buttonDate,
        withinRangeStartDate,
        withinRangeEndDate,
      )
    ) {
      button.classList.add(CALENDAR_DATE_WITHIN_RANGE_CLASS);
    } else {
      button.classList.remove(CALENDAR_DATE_WITHIN_RANGE_CLASS);
    }
  });
};

// #endregion Calendar Date Event Handling

// #region Calendar Month Event Handling

/**
 * Adjust the month and display the month selection screen if needed.
 *
 * @param {function} adjustMonthFn function that returns the adjusted month
 */
const adjustMonthSelectionScreen = (adjustMonthFn) => (event) => {
  const monthEl = event.target;
  const selectedMonth = parseInt(monthEl.dataset.value, 10);
  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(monthEl);
  const currentDate = setMonth(calendarDate, selectedMonth);

  let adjustedMonth = adjustMonthFn(selectedMonth);
  adjustedMonth = Math.max(0, Math.min(11, adjustedMonth));

  const date = setMonth(calendarDate, adjustedMonth);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  if (!isSameMonth(currentDate, cappedDate)) {
    const newCalendar = displayMonthSelection(
      calendarEl,
      cappedDate.getMonth(),
    );
    newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus();
  }
  event.preventDefault();
};

/**
 * Navigate back three months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleUpFromMonth = adjustMonthSelectionScreen((month) => month - 3);

/**
 * Navigate forward three months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleDownFromMonth = adjustMonthSelectionScreen((month) => month + 3);

/**
 * Navigate back one month and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleLeftFromMonth = adjustMonthSelectionScreen((month) => month - 1);

/**
 * Navigate forward one month and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleRightFromMonth = adjustMonthSelectionScreen((month) => month + 1);

/**
 * Navigate to the start of the row of months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleHomeFromMonth = adjustMonthSelectionScreen(
  (month) => month - (month % 3),
);

/**
 * Navigate to the end of the row of months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleEndFromMonth = adjustMonthSelectionScreen(
  (month) => month + 2 - (month % 3),
);

/**
 * Navigate to the last month (December) and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageDownFromMonth = adjustMonthSelectionScreen(() => 11);

/**
 * Navigate to the first month (January) and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageUpFromMonth = adjustMonthSelectionScreen(() => 0);

// #endregion Calendar Month Event Handling

// #region Calendar Year Event Handling

/**
 * Adjust the year and display the year selection screen if needed.
 *
 * @param {function} adjustYearFn function that returns the adjusted year
 */
const adjustYearSelectionScreen = (adjustYearFn) => (event) => {
  const yearEl = event.target;
  const selectedYear = parseInt(yearEl.dataset.value, 10);
  const { calendarEl, calendarDate, minDate, maxDate } =
    getDatePickerContext(yearEl);
  const currentDate = setYear(calendarDate, selectedYear);

  let adjustedYear = adjustYearFn(selectedYear);
  adjustedYear = Math.max(0, adjustedYear);

  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  if (!isSameYear(currentDate, cappedDate)) {
    const newCalendar = displayYearSelection(
      calendarEl,
      cappedDate.getFullYear(),
    );
    newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus();
  }
  event.preventDefault();
};

/**
 * Navigate back three years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleUpFromYear = adjustYearSelectionScreen((year) => year - 3);

/**
 * Navigate forward three years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleDownFromYear = adjustYearSelectionScreen((year) => year + 3);

/**
 * Navigate back one year and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleLeftFromYear = adjustYearSelectionScreen((year) => year - 1);

/**
 * Navigate forward one year and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleRightFromYear = adjustYearSelectionScreen((year) => year + 1);

/**
 * Navigate to the start of the row of years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleHomeFromYear = adjustYearSelectionScreen(
  (year) => year - (year % 3),
);

/**
 * Navigate to the end of the row of years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleEndFromYear = adjustYearSelectionScreen(
  (year) => year + 2 - (year % 3),
);

/**
 * Navigate to back 12 years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageUpFromYear = adjustYearSelectionScreen(
  (year) => year - YEAR_CHUNK,
);

/**
 * Navigate forward 12 years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageDownFromYear = adjustYearSelectionScreen(
  (year) => year + YEAR_CHUNK,
);

// #endregion Calendar Year Event Handling

// #region Focus Handling Event Handling

const tabHandler = (focusable) => {
  const getFocusableContext = (el) => {
    const { calendarEl } = getDatePickerContext(el);
    const focusableElements = select(focusable, calendarEl);

    const firstTabIndex = 0;
    const lastTabIndex = focusableElements.length - 1;
    const firstTabStop = focusableElements[firstTabIndex];
    const lastTabStop = focusableElements[lastTabIndex];
    const focusIndex = focusableElements.indexOf(activeElement());

    const isLastTab = focusIndex === lastTabIndex;
    const isFirstTab = focusIndex === firstTabIndex;
    const isNotFound = focusIndex === -1;

    return {
      focusableElements,
      isNotFound,
      firstTabStop,
      isFirstTab,
      lastTabStop,
      isLastTab,
    };
  };

  return {
    tabAhead(event) {
      const { firstTabStop, isLastTab, isNotFound } = getFocusableContext(
        event.target,
      );

      if (isLastTab || isNotFound) {
        event.preventDefault();
        firstTabStop.focus();
      }
    },
    tabBack(event) {
      const { lastTabStop, isFirstTab, isNotFound } = getFocusableContext(
        event.target,
      );

      if (isFirstTab || isNotFound) {
        event.preventDefault();
        lastTabStop.focus();
      }
    },
  };
};

const datePickerTabEventHandler = tabHandler(DATE_PICKER_FOCUSABLE);
const monthPickerTabEventHandler = tabHandler(MONTH_PICKER_FOCUSABLE);
const yearPickerTabEventHandler = tabHandler(YEAR_PICKER_FOCUSABLE);

// #endregion Focus Handling Event Handling

// #region Date Picker Event Delegation Registration / Component

const datePickerEvents = {
  [CLICK]: {
    [DATE_PICKER_BUTTON]() {
      toggleCalendar(this);
    },
    [CALENDAR_DATE]() {
      selectDate(this);
    },
    [CALENDAR_MONTH]() {
      selectMonth(this);
    },
    [CALENDAR_YEAR]() {
      selectYear(this);
    },
    [CALENDAR_PREVIOUS_MONTH]() {
      displayPreviousMonth(this);
    },
    [CALENDAR_NEXT_MONTH]() {
      displayNextMonth(this);
    },
    [CALENDAR_PREVIOUS_YEAR]() {
      displayPreviousYear(this);
    },
    [CALENDAR_NEXT_YEAR]() {
      displayNextYear(this);
    },
    [CALENDAR_PREVIOUS_YEAR_CHUNK]() {
      displayPreviousYearChunk(this);
    },
    [CALENDAR_NEXT_YEAR_CHUNK]() {
      displayNextYearChunk(this);
    },
    [CALENDAR_MONTH_SELECTION]() {
      const newCalendar = displayMonthSelection(this);
      newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus();
    },
    [CALENDAR_YEAR_SELECTION]() {
      const newCalendar = displayYearSelection(this);
      newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus();
    },
  },
  keyup: {
    [DATE_PICKER_CALENDAR](event) {
      const keydown = this.dataset.keydownKeyCode;
      if (`${event.keyCode}` !== keydown) {
        event.preventDefault();
      }
    },
  },
  keydown: {
    [DATE_PICKER_EXTERNAL_INPUT](event) {
      if (event.keyCode === ENTER_KEYCODE) {
        validateDateInput(this);
      }
    },
    [CALENDAR_DATE]: keymap({
      Up: handleUpFromDate,
      ArrowUp: handleUpFromDate,
      Down: handleDownFromDate,
      ArrowDown: handleDownFromDate,
      Left: handleLeftFromDate,
      ArrowLeft: handleLeftFromDate,
      Right: handleRightFromDate,
      ArrowRight: handleRightFromDate,
      Home: handleHomeFromDate,
      End: handleEndFromDate,
      PageDown: handlePageDownFromDate,
      PageUp: handlePageUpFromDate,
      "Shift+PageDown": handleShiftPageDownFromDate,
      "Shift+PageUp": handleShiftPageUpFromDate,
      Tab: datePickerTabEventHandler.tabAhead,
    }),
    [CALENDAR_DATE_PICKER]: keymap({
      Tab: datePickerTabEventHandler.tabAhead,
      "Shift+Tab": datePickerTabEventHandler.tabBack,
    }),
    [CALENDAR_MONTH]: keymap({
      Up: handleUpFromMonth,
      ArrowUp: handleUpFromMonth,
      Down: handleDownFromMonth,
      ArrowDown: handleDownFromMonth,
      Left: handleLeftFromMonth,
      ArrowLeft: handleLeftFromMonth,
      Right: handleRightFromMonth,
      ArrowRight: handleRightFromMonth,
      Home: handleHomeFromMonth,
      End: handleEndFromMonth,
      PageDown: handlePageDownFromMonth,
      PageUp: handlePageUpFromMonth,
    }),
    [CALENDAR_MONTH_PICKER]: keymap({
      Tab: monthPickerTabEventHandler.tabAhead,
      "Shift+Tab": monthPickerTabEventHandler.tabBack,
    }),
    [CALENDAR_YEAR]: keymap({
      Up: handleUpFromYear,
      ArrowUp: handleUpFromYear,
      Down: handleDownFromYear,
      ArrowDown: handleDownFromYear,
      Left: handleLeftFromYear,
      ArrowLeft: handleLeftFromYear,
      Right: handleRightFromYear,
      ArrowRight: handleRightFromYear,
      Home: handleHomeFromYear,
      End: handleEndFromYear,
      PageDown: handlePageDownFromYear,
      PageUp: handlePageUpFromYear,
    }),
    [CALENDAR_YEAR_PICKER]: keymap({
      Tab: yearPickerTabEventHandler.tabAhead,
      "Shift+Tab": yearPickerTabEventHandler.tabBack,
    }),
    [DATE_PICKER_CALENDAR](event) {
      this.dataset.keydownKeyCode = event.keyCode;
    },
    [DATE_PICKER](event) {
      const keyMap = keymap({
        Escape: handleEscapeFromCalendar,
      });

      keyMap(event);
    },
  },
  focusout: {
    [DATE_PICKER_EXTERNAL_INPUT]() {
      validateDateInput(this);
    },
    [DATE_PICKER](event) {
      if (!this.contains(event.relatedTarget)) {
        hideCalendar(this);
      }
    },
  },
  input: {
    [DATE_PICKER_EXTERNAL_INPUT]() {
      reconcileInputValues(this);
      updateCalendarIfVisible(this);
    },
  },
};

if (!isIosDevice()) {
  datePickerEvents.mouseover = {
    [CALENDAR_DATE_CURRENT_MONTH]() {
      handleMouseoverFromDate(this);
    },
  };
}

const datePicker = behavior(datePickerEvents, {
  init(root) {
    selectOrMatches(DATE_PICKER, root).forEach((datePickerEl) => {
      enhanceDatePicker(datePickerEl);
    });
  },
  getDatePickerContext,
  disable,
  ariaDisable,
  enable,
  isDateInputInvalid,
  setCalendarValue,
  validateDateInput,
  renderCalendar,
  updateCalendarIfVisible,
});

// #endregion Date Picker Event Delegation Registration / Component

module.exports = datePicker;
