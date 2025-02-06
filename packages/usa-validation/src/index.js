const behavior = require("../../uswds-core/src/js/utils/behavior");
const validate = require("../../uswds-core/src/js/utils/validate-input");
const debounce = require("../../uswds-core/src/js/utils/debounce");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");

const VALIDATE_INPUT =
  "input[data-validation-element],textarea[data-validation-element]";
const CHECKLIST_ITEM = `.${PREFIX}-checklist__item`;

// Trigger validation on input change, after a delay
const handleChange = debounce((el) => {
  validate(el);
}, 1000);

// Create container to hold aria readout
const createStatusElement = (input) => {
  const validationContainer = input.parentNode;
  const inputID = input.getAttribute("id");
  const statusSummaryID = `${inputID}-sr-summary`;
  input.setAttribute("aria-describedby", statusSummaryID);

  const statusSummaryContainer = document.createElement("span");

  statusSummaryContainer.setAttribute("data-validation-status", "");
  statusSummaryContainer.classList.add("usa-sr-only");
  statusSummaryContainer.setAttribute("aria-live", "polite");
  statusSummaryContainer.setAttribute("aria-atomic", true);
  statusSummaryContainer.setAttribute("id", statusSummaryID);
  validationContainer.append(statusSummaryContainer);
};

// Set up checklist items with initial aria-label (incomplete) values
const createInitialStatus = (input) => {
  const validationContainer = input.parentNode;
  const checklistItems = validationContainer.querySelectorAll(CHECKLIST_ITEM);
  const validationElement = input.getAttribute("data-validation-element");

  input.setAttribute("aria-controls", validationElement);

  checklistItems.forEach((listItem) => {
    let currentStatus = "status incomplete";
    if (input.hasAttribute("data-validation-incomplete")) {
      currentStatus = input.getAttribute("data-validation-incomplete");
    }
    const itemStatus = `${listItem.textContent} ${currentStatus} `;
    listItem.setAttribute("aria-label", itemStatus);
  });
};

const enhanceValidation = (input) => {
  createStatusElement(input);
  createInitialStatus(input);
  validate(input);
};

const validator = behavior(
  {
    "input change": {
      [VALIDATE_INPUT](event) {
        handleChange(event.target);
      },
    },
  },
  {
    init(root) {
      selectOrMatches(VALIDATE_INPUT, root).forEach((input) =>
        enhanceValidation(input),
      );
    },
  },
);

module.exports = validator;
