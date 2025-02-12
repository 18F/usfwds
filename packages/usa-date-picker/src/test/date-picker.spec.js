const fs = require("fs");
const path = require("path");
const assert = require("assert");
const DatePicker = require("../index");
const EVENTS = require("./events");
const sinon = require("sinon");

const TEMPLATE = fs.readFileSync(
  path.join(__dirname, "/date-picker.template.html"),
);

const VALIDATION_MESSAGE = "Please enter a valid date";

const datePickerSelector = () => document.querySelector(".usa-date-picker");
const tests = [
  { name: "document.body", selector: () => document.body },
  { name: "date picker", selector: datePickerSelector },
];

// --- Global override to track "resize" event listeners ---

let resizeListeners = [];

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

// Override addEventListener before each test to capture all "resize" listeners
beforeEach(() => {
  resizeListeners = [];
  window.addEventListener = function (type, listener, options) {
    if (type === "resize") {
      resizeListeners.push(listener);
    }
    return originalAddEventListener.call(window, type, listener, options);
  };
});

// Remove captured listeners
afterEach(() => {
  resizeListeners.forEach((listener) => {
    originalRemoveEventListener.call(window, "resize", listener);
  });
  resizeListeners = [];
  window.addEventListener = originalAddEventListener;
  window.removeEventListener = originalRemoveEventListener;
});

// --- End Global override ---

tests.forEach(({ name, selector: containerSelector }) => {
  describe(`date picker component initialized at ${name}`, () => {
    const { body } = document;

    let root;
    let input;
    let button;
    let inputChangeSpy;

    const getCalendarEl = () =>
      root.querySelector(".usa-date-picker__calendar");

    beforeEach(() => {
      body.innerHTML = TEMPLATE;
      DatePicker.on(containerSelector());
      root = datePickerSelector();
      input = root.querySelector(".usa-date-picker__external-input");
      button = root.querySelector(".usa-date-picker__button");
      inputChangeSpy = sinon.stub();
      input.addEventListener("change", inputChangeSpy);
    });

    afterEach(() => {
      input.removeEventListener("change", inputChangeSpy);
      body.textContent = "";
      DatePicker.off(body);
    });

    it("should enhance the date input with a date picker button", () => {
      assert.ok(input, "has an input element");
      assert.ok(button, "has a button element");
    });

    // mouse interactions
    it("should display a calendar for the current date when the date picker button is clicked", () => {
      EVENTS.click(button);

      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );
      assert.ok(
        getCalendarEl().contains(document.activeElement),
        "The focus is within the component",
      );
    });

    it("should hide the calendar when the date picker button is clicked and the calendar is already open", () => {
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        true,
        "The calendar is hidden",
      );
    });

    it("should close the calendar you click outside of an active calendar", () => {
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.focusout();

      assert.strictEqual(
        getCalendarEl().hidden,
        true,
        "The calendar is hidden",
      );
    });

    it("should close the calendar you press escape from the input", () => {
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownEscape(input);

      assert.strictEqual(
        getCalendarEl().hidden,
        true,
        "The calendar is hidden",
      );
    });

    it("should display a calendar for the inputted date when the date picker button is clicked with a date entered", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);

      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should allow for the selection of a date within the calendar", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.click(
        getCalendarEl().querySelector(
          '.usa-date-picker__calendar__date[data-day="10"]',
        ),
      );

      assert.strictEqual(
        input.value,
        "01/10/2020",
        "The value has been filled in",
      );
      assert.strictEqual(
        input,
        document.activeElement,
        "The focus is on the input",
      );
      assert.strictEqual(
        getCalendarEl().hidden,
        true,
        "The calendar is hidden",
      );
      assert.ok(
        inputChangeSpy.called,
        "should have dispatched a change event from the input",
      );
    });

    it("should allow for navigation to the preceding month by clicking the left single arrow button within the calendar", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__previous-month",
        ),
      );

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "December",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2019",
        "shows correct year",
      );
    });

    it("should allow for navigation to the succeeding month by clicking the right single arrow button within the calendar", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.click(
        getCalendarEl().querySelector(".usa-date-picker__calendar__next-month"),
      );

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "February",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should allow for navigation to the preceding year by clicking the left double arrow button within the calendar", () => {
      input.value = "1/1/2016";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__previous-year",
        ),
      );

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2015",
        "shows correct year",
      );
    });

    it("should allow for navigation to the succeeding year by clicking the right double arrow button within the calendar", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.click(
        getCalendarEl().querySelector(".usa-date-picker__calendar__next-year"),
      );

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2021",
        "shows correct year",
      );
    });

    it("should display a month selection screen by clicking the month display within the calendar", () => {
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ),
      );

      const focusedMonth = document.activeElement;

      assert.strictEqual(
        focusedMonth.classList.contains(
          "usa-date-picker__calendar__month--focused",
        ),
        true,
        "calendar month is focused",
      );
      assert.ok(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-picker",
        ),
        "calendar is showing the month picker",
      );
    });

    it("should allow for the selection of a month within month selection screen", () => {
      input.value = "2/1/2020";
      EVENTS.click(button);
      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ),
      );

      EVENTS.click(
        getCalendarEl().querySelector(".usa-date-picker__calendar__month"),
      );

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
    });

    it("should display a year selection screen by clicking the year display within the calendar", () => {
      EVENTS.click(button);

      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ),
      );

      const focusedYear = document.activeElement;
      assert.ok(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-picker",
        ),
        "calendar is showing the year picker",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(".usa-date-picker__calendar__year")
          .textContent,
        "2016",
        "shows correct first year of chunk",
      );
      assert.strictEqual(
        focusedYear.classList.contains(
          "usa-date-picker__calendar__year--focused",
        ),
        true,
        "calendar year is focused",
      );
    });

    it("should allow for navigation to the preceding dozen years by clicking the left single arrow button within the year selection screen", () => {
      EVENTS.click(button);
      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ),
      );

      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__previous-year-chunk",
        ),
      );

      assert.strictEqual(
        getCalendarEl().querySelector(".usa-date-picker__calendar__year")
          .textContent,
        "2004",
        "shows correct first year of chunk",
      );
    });

    it("should allow for navigation to the succeeding dozen year by clicking the right single arrow button within the year selection screen", () => {
      EVENTS.click(button);
      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ),
      );

      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__next-year-chunk",
        ),
      );

      assert.strictEqual(
        getCalendarEl().querySelector(".usa-date-picker__calendar__year")
          .textContent,
        "2028",
        "shows correct first year of chunk",
      );
    });

    it("should allow for the selection of a year within year selection screen", () => {
      input.value = "2/1/2020";
      EVENTS.click(button);
      EVENTS.click(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ),
      );

      EVENTS.click(
        getCalendarEl().querySelector(".usa-date-picker__calendar__year"),
      );

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2016",
        "shows correct year",
      );
    });

    // keyboard interactions

    it("should close the calendar when escape is pressed within the calendar", () => {
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownEscape();

      assert.strictEqual(
        getCalendarEl().hidden,
        true,
        "The calendar is hidden",
      );
    });

    it("should move focus to the same day of week of the previous week when up is pressed from the currently focused day", () => {
      input.value = "1/10/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownArrowUp();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "3",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should move focus to the same day of week of the next week when down is pressed from the currently focused day", () => {
      input.value = "1/10/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownArrowDown();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "17",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should move focus to the previous day when left is pressed from the currently focused day", () => {
      input.value = "1/10/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownArrowLeft();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "9",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should move focus to the next day when right is pressed from the currently focused day", () => {
      input.value = "1/10/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownArrowRight();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "11",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should move focus to the first day (e.g. Sunday) of the current week when home is pressed from the currently focused day", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownHome();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "29",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "December",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2019",
        "shows correct year",
      );
    });

    it("should move focus to the last day (e.g. Saturday) of the current week when end is pressed from the currently focused day", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownEnd();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "4",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should move focus to the same day of the previous month when page up is pressed from the currently focused day", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownPageUp();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "December",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2019",
        "shows correct year",
      );
    });

    it("should move focus to the last day of the previous month when page up is pressed from the the last day of a longer month", () => {
      input.value = "12/31/2019";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownPageUp();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "30",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "November",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2019",
        "shows correct year",
      );
    });

    it("should move focus to the same day of the next month when page down is pressed from the currently focused day", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownPageDown();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "February",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should move focus to the last day of the next month when page down is pressed from the the last day of a longer month", () => {
      input.value = "1/31/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownPageDown();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "29",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "February",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should move focus to the same day of the month January when page down is pressed from the currently focused day in December", () => {
      input.value = "12/31/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownPageDown();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "31",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2021",
        "shows correct year",
      );
    });

    it("should move focus to the same day/month of the previous year when shift + page up is pressed from the currently focused day", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownShiftPageUp();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2019",
        "shows correct year",
      );
    });

    it("should move focus to February 28th of the previous year when shift + page up is pressed from a focused February 29th date of a leap year", () => {
      input.value = "2/29/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownShiftPageUp();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "28",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "February",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2019",
        "shows correct year",
      );
    });

    it("should move focus to the same day/month of the next year when shift + page down is pressed from the currently focused day", () => {
      input.value = "1/1/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownShiftPageDown();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "1",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "January",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2021",
        "shows correct year",
      );
    });

    it("should move focus to February 28th of the next year when shift + page down is pressed from a focused February 29th date of a leap year", () => {
      input.value = "2/29/2020";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.keydownShiftPageDown();

      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "28",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "February",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2021",
        "shows correct year",
      );
    });

    it("should accept a parse-able date with a two digit year and display the calendar of that year in the current century", () => {
      input.value = "2/29/20";
      EVENTS.click(button);

      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__date--focused",
        ).textContent,
        "29",
        "focuses correct date",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__month-selection",
        ).textContent,
        "February",
        "shows correct month",
      );
      assert.strictEqual(
        getCalendarEl().querySelector(
          ".usa-date-picker__calendar__year-selection",
        ).textContent,
        "2020",
        "shows correct year",
      );
    });

    it("should show an improper date as invalid as the user leaves the input", () => {
      input.value = "abcdefg... That means the convo is done";
      EVENTS.focusout(input);

      assert.strictEqual(input.validationMessage, VALIDATION_MESSAGE);
    });

    it("should validate input on the static validate function being emitted", () => {
      input.value = "ab/cd/efg";
      DatePicker.validateDateInput(input);

      assert.strictEqual(input.validationMessage, VALIDATION_MESSAGE);
    });

    it("should update the calendar when a valid date is entered in the input while the date picker is open", () => {
      input.value = "6/1/2020";
      EVENTS.click(button);
      const firstFocus = getCalendarEl().querySelector(
        ".usa-date-picker__calendar__date--focused",
      );

      input.value = "6/20/2020";
      EVENTS.input(input);

      const secondFocus = getCalendarEl().querySelector(
        ".usa-date-picker__calendar__date--focused",
      );

      assert.strictEqual(firstFocus !== secondFocus, true);
    });

    it("should validate the input when a date is selected", () => {
      input.value = "2/31/2019";
      EVENTS.focusout(input);
      assert.strictEqual(input.validationMessage, VALIDATION_MESSAGE);
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );

      EVENTS.click(
        getCalendarEl().querySelector(
          '.usa-date-picker__calendar__date[data-day="10"]',
        ),
      );

      assert.strictEqual(input.validationMessage, "");
    });

    it("should show an improper date as invalid if the user presses enter from the input", () => {
      input.value = "2/31/2019";

      EVENTS.keydownEnter(input);

      assert.strictEqual(input.validationMessage, VALIDATION_MESSAGE);
    });

    it("should show an empty input as valid", () => {
      input.value = "";

      EVENTS.keydownEnter(input);

      assert.strictEqual(input.validationMessage, "");
    });

    it("should prevent action from button when event didn't originate from date", () => {
      input.value = "2/31/2019";
      EVENTS.click(button);
      assert.strictEqual(
        getCalendarEl().hidden,
        false,
        "The calendar is shown",
      );
      const { preventDefaultSpy } = EVENTS.keyupEnter();
      assert.ok(
        preventDefaultSpy.called,
        "should not have allowed enter to perform default action",
      );
    });
  });
});
