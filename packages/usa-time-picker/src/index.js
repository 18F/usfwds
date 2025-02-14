const behavior = require("../../uswds-core/src/js/utils/behavior");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");
const {
  COMBO_BOX_CLASS,
  enhanceComboBox,
} = require("../../usa-combo-box/src/index");

const TIME_PICKER_CLASS = `${PREFIX}-time-picker`;
const TIME_PICKER = `.${TIME_PICKER_CLASS}`;
const MAX_TIME = 60 * 24 - 1;
const MIN_TIME = 0;
const DEFAULT_STEP = 30;
const MIN_STEP = 1;

const FILTER_DATASET = {
  filter:
    "0?{{ hourQueryFilter }}:{{minuteQueryFilter}}.*{{ apQueryFilter }}m?",
  apQueryFilter: "([ap])",
  hourQueryFilter: "([1-9][0-2]?)",
  minuteQueryFilter: "[\\d]+:([0-9]{0,2})",
};

/**
 * Parse a string of hh:mm into minutes
 *
 * @param {string} timeStr the time string to parse
 * @returns {number} the number of minutes
 */
const parseTimeString = (timeStr) => {
  let minutes;

  if (timeStr) {
    const [hours, mins] = timeStr.split(":").map((str) => {
      let value;
      const parsed = parseInt(str, 10);
      if (!Number.isNaN(parsed)) value = parsed;
      return value;
    });

    if (hours != null && mins != null) {
      minutes = hours * 60 + mins;
    }
  }

  return minutes;
};

/**
 * Enhance an input with the date picker elements
 *
 * @param {HTMLElement} el The initial wrapping element of the date picker component
 */
const transformTimePicker = (el) => {
  const timePickerEl = el.closest(TIME_PICKER);

  const initialInputEl = timePickerEl.querySelector(`input`);

  if (!initialInputEl) {
    throw new Error(`${TIME_PICKER} is missing inner input`);
  }

  const selectEl = document.createElement("select");

  [
    "id",
    "name",
    "required",
    "aria-label",
    "aria-labelledby",
    "disabled",
    "aria-disabled",
    "aria-describedby",
  ].forEach((name) => {
    if (initialInputEl.hasAttribute(name)) {
      const value = initialInputEl.getAttribute(name);
      selectEl.setAttribute(name, value);
      initialInputEl.removeAttribute(name);
    }
  });

  const padZeros = (value, length) => `0000${value}`.slice(-length);

  const getTimeContext = (minutes) => {
    const minute = minutes % 60;
    const hour24 = Math.floor(minutes / 60);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 < 12 ? "am" : "pm";

    return {
      minute,
      hour24,
      hour12,
      ampm,
    };
  };

  const minTime = Math.max(
    MIN_TIME,
    parseTimeString(timePickerEl.dataset.minTime) || MIN_TIME,
  );
  const maxTime = Math.min(
    MAX_TIME,
    parseTimeString(timePickerEl.dataset.maxTime) || MAX_TIME,
  );
  const step = Math.floor(
    Math.max(MIN_STEP, timePickerEl.dataset.step || DEFAULT_STEP),
  );

  let defaultValue;
  for (let time = minTime; time <= maxTime; time += step) {
    const { minute, hour24, hour12, ampm } = getTimeContext(time);

    const option = document.createElement("option");
    option.value = `${padZeros(hour24, 2)}:${padZeros(minute, 2)}`;
    option.text = `${hour12}:${padZeros(minute, 2)}${ampm}`;
    if (option.text === initialInputEl.value) {
      defaultValue = option.value;
    }
    selectEl.appendChild(option);
  }

  timePickerEl.classList.add(COMBO_BOX_CLASS);

  // combo box properties
  Object.keys(FILTER_DATASET).forEach((key) => {
    timePickerEl.dataset[key] = FILTER_DATASET[key];
  });
  timePickerEl.dataset.disableFiltering = "true";
  timePickerEl.dataset.defaultValue = defaultValue;

  timePickerEl.appendChild(selectEl);
  initialInputEl.remove();
};

const timePicker = behavior(
  {},
  {
    init(root) {
      selectOrMatches(TIME_PICKER, root).forEach((timePickerEl) => {
        transformTimePicker(timePickerEl);
        enhanceComboBox(timePickerEl);
      });
    },
    FILTER_DATASET,
  },
);

module.exports = timePicker;
