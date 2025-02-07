const select = require("../../uswds-core/src/js/utils/select");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const debounce = require("../../uswds-core/src/js/utils/debounce");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");

const CHARACTER_COUNT_CLASS = `${PREFIX}-character-count`;
const CHARACTER_COUNT = `.${CHARACTER_COUNT_CLASS}`;
const FORM_GROUP_CLASS = `${PREFIX}-form-group`;
const FORM_GROUP_ERROR_CLASS = `${FORM_GROUP_CLASS}--error`;
const FORM_GROUP = `.${FORM_GROUP_CLASS}`;
const LABEL_CLASS = `${PREFIX}-label`;
const LABEL_ERROR_CLASS = `${LABEL_CLASS}--error`;
const INPUT = `.${PREFIX}-character-count__field`;
const INPUT_ERROR_CLASS = `${PREFIX}-input--error`;
const MESSAGE = `.${PREFIX}-character-count__message`;
const VALIDATION_MESSAGE = "The content is too long.";
const MESSAGE_INVALID_CLASS = `${PREFIX}-character-count__status--invalid`;
const STATUS_MESSAGE_CLASS = `${CHARACTER_COUNT_CLASS}__status`;
const STATUS_MESSAGE_SR_ONLY_CLASS = `${CHARACTER_COUNT_CLASS}__sr-status`;
const STATUS_MESSAGE = `.${STATUS_MESSAGE_CLASS}`;
const STATUS_MESSAGE_SR_ONLY = `.${STATUS_MESSAGE_SR_ONLY_CLASS}`;
const DEFAULT_STATUS_LABEL = `characters allowed`;

/**
 * Returns the root, form group, label, and message elements for an character count input
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
 * @returns {CharacterCountElements} elements The root form group, input ID, label, and message element.
 */
const getCharacterCountElements = (inputEl) => {
  const characterCountEl = inputEl.closest(CHARACTER_COUNT);

  if (!characterCountEl) {
    throw new Error(`${INPUT} is missing outer ${CHARACTER_COUNT}`);
  }

  const formGroupEl = characterCountEl.querySelector(FORM_GROUP);

  const inputID = inputEl.getAttribute("id");
  const labelEl = document.querySelector(`label[for=${inputID}]`);

  const messageEl = characterCountEl.querySelector(MESSAGE);

  if (!messageEl) {
    throw new Error(`${CHARACTER_COUNT} is missing inner ${MESSAGE}`);
  }

  return { characterCountEl, formGroupEl, inputID, labelEl, messageEl };
};

/**
 * Move maxlength attribute to a data attribute on usa-character-count
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
 */
const setDataLength = (inputEl) => {
  const { characterCountEl } = getCharacterCountElements(inputEl);

  const maxlength = inputEl.getAttribute("maxlength");

  if (!maxlength) return;

  inputEl.removeAttribute("maxlength");
  characterCountEl.setAttribute("data-maxlength", maxlength);
};

/**
 * Create and append status messages for visual and screen readers
 *
 * @param {HTMLDivElement} characterCountEl - Div with `.usa-character-count` class
 * @description  Create two status messages for number of characters left;
 * one visual status and another for screen readers
 */
const createStatusMessages = (characterCountEl) => {
  const statusMessage = document.createElement("div");
  const srStatusMessage = document.createElement("div");
  const maxLength = characterCountEl.dataset.maxlength;
  const defaultMessage = `${maxLength} ${DEFAULT_STATUS_LABEL}`;

  statusMessage.classList.add(`${STATUS_MESSAGE_CLASS}`, "usa-hint");
  srStatusMessage.classList.add(
    `${STATUS_MESSAGE_SR_ONLY_CLASS}`,
    "usa-sr-only",
  );

  statusMessage.setAttribute("aria-hidden", true);
  srStatusMessage.setAttribute("aria-live", "polite");

  statusMessage.textContent = defaultMessage;
  srStatusMessage.textContent = defaultMessage;

  characterCountEl.append(statusMessage, srStatusMessage);
};

/**
 * Teardown to remove status messages that were created on init
 *
 * @param {HTMLDivElement} characterCountEl - Div with `.usa-character-count` class
 * @description  Remove the two status messages that were added during initialization of
 * the character count module
 */
const removeStatusMessages = (characterCountEl) => {
  const status = characterCountEl.getElementsByClassName(
    `${STATUS_MESSAGE_CLASS} usa-hint`,
  );
  const srStatus = characterCountEl.getElementsByClassName(
    `${STATUS_MESSAGE_SR_ONLY_CLASS} usa-sr-only`,
  );

  [...status, ...srStatus].forEach((node) => {
    node.remove();
  });
};

/**
 * Returns message with how many characters are left
 *
 * @param {number} currentLength - The number of characters used
 * @param {number} maxLength - The total number of characters allowed
 * @returns {string} A string description of how many characters are left
 */
const getCountMessage = (currentLength, maxLength) => {
  let newMessage = "";

  if (currentLength === 0) {
    newMessage = `${maxLength} ${DEFAULT_STATUS_LABEL}`;
  } else {
    const difference = Math.abs(maxLength - currentLength);
    const characters = `character${difference === 1 ? "" : "s"}`;
    const guidance = currentLength > maxLength ? "over limit" : "left";

    newMessage = `${difference} ${characters} ${guidance}`;
  }

  return newMessage;
};

/**
 * Updates the character count status for screen readers after a 1000ms delay.
 *
 * @param {HTMLElement} msgEl - The screen reader status message element
 * @param {string} statusMessage - A string of the current character status
 */
const srUpdateStatus = debounce((msgEl, statusMessage) => {
  const srStatusMessage = msgEl;
  srStatusMessage.textContent = statusMessage;
}, 1000);

/**
 * Update the character count component
 *
 * @description On input, it will update visual status, screenreader
 * status and update input validation (if over character length)
 * @param {HTMLInputElement|HTMLTextAreaElement} inputEl The character count input element
 */
const updateCountMessage = (inputEl) => {
  const { characterCountEl, labelEl, formGroupEl } =
    getCharacterCountElements(inputEl);
  const currentLength = inputEl.value.length;
  const maxLength = parseInt(
    characterCountEl.getAttribute("data-maxlength"),
    10,
  );
  const statusMessage = characterCountEl.querySelector(STATUS_MESSAGE);
  const srStatusMessage = characterCountEl.querySelector(
    STATUS_MESSAGE_SR_ONLY,
  );
  const currentStatusMessage = getCountMessage(currentLength, maxLength);

  if (!maxLength) return;

  const isOverLimit = currentLength && currentLength > maxLength;

  statusMessage.textContent = currentStatusMessage;
  srUpdateStatus(srStatusMessage, currentStatusMessage);

  if (isOverLimit && !inputEl.validationMessage) {
    inputEl.setCustomValidity(VALIDATION_MESSAGE);
  }

  if (!isOverLimit && inputEl.validationMessage === VALIDATION_MESSAGE) {
    inputEl.setCustomValidity("");
  }

  if (formGroupEl) {
    formGroupEl.classList.toggle(FORM_GROUP_ERROR_CLASS, isOverLimit);
  }

  if (labelEl) {
    labelEl.classList.toggle(LABEL_ERROR_CLASS, isOverLimit);
  }

  inputEl.classList.toggle(INPUT_ERROR_CLASS, isOverLimit);
  statusMessage.classList.toggle(MESSAGE_INVALID_CLASS, isOverLimit);
};

/**
 * Initialize component
 *
 * @description On init this function will create elements and update any
 * attributes so it can tell the user how many characters are left.
 * @param  {HTMLInputElement|HTMLTextAreaElement} inputEl the components input
 */
const enhanceCharacterCount = (inputEl) => {
  const { characterCountEl, messageEl } = getCharacterCountElements(inputEl);

  // Hide hint and remove aria-live for backwards compatibility
  messageEl.classList.add("usa-sr-only");
  messageEl.removeAttribute("aria-live");

  setDataLength(inputEl);
  createStatusMessages(characterCountEl);
};

const characterCount = behavior(
  {
    input: {
      [INPUT]() {
        updateCountMessage(this);
      },
    },
  },
  {
    init(root) {
      select(INPUT, root).forEach((input) => enhanceCharacterCount(input));
    },
    FORM_GROUP_ERROR_CLASS,
    LABEL_ERROR_CLASS,
    INPUT_ERROR_CLASS,
    MESSAGE_INVALID_CLASS,
    VALIDATION_MESSAGE,
    STATUS_MESSAGE_CLASS,
    STATUS_MESSAGE_SR_ONLY_CLASS,
    DEFAULT_STATUS_LABEL,
    createStatusMessages,
    getCountMessage,
    updateCountMessage,
    teardown(root) {
      selectOrMatches(CHARACTER_COUNT, root).forEach((node) => {
        removeStatusMessages(node);
      });
    },
  },
);

module.exports = characterCount;
