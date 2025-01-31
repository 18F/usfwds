const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const debounce = require("../../uswds-core/src/js/utils/debounce");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");

const MASKED_CLASS = `${PREFIX}-masked`;
const MASKED = `.${MASKED_CLASS}`;
const MASK = `${PREFIX}-input-mask`;
const MASK_CONTENT = `${MASK}--content`;
const PLACEHOLDER = "placeholder";
const SR_ONLY_CLASS = `${PREFIX}-sr-only`;
const ERROR_MESSAGE_CLASS = `${PREFIX}-error-message`;
const ERROR_MESSAGE_DEFAULT = "You must enter a valid character";
const ERROR_MESSAGE_SR_DEFAULT = "Error: You must enter a valid character";
const ERROR_MESSAGE_FULL_DEFAULT =
  "You have reached the maximum number of characters allowed";
const ERROR_MESSAGE_FULL_SR_DEFAULT =
  "Error: You have reached the maximum number of characters allowed.";
const ERROR_MESSAGE_PASTE_DEFAULT = "Some pasted characters were not accepted.";
const ERROR_MESSAGE_PASTE_SR_DEFAULT =
  "Error: Some pasted characters were not accepted.";
const ERROR_MESSAGE_ALPHA_DEFAULT = "You must enter a letter";
const ERROR_MESSAGE_ALPHA_SR_DEFAULT = "Error: You must enter a letter";
const ERROR_MESSAGE_NUMERIC_DEFAULT = "You must enter a number";
const ERROR_MESSAGE_NUMERIC_SR_DEFAULT = "Error: You must enter a number";

let errorMessageSrOnlyEl;
let lastValueLength;
let keyPressed;
let shiftComboPressed;
let inputAddedByPaste;
let clipboardData = "";
let backspacePressed;
let errorTextContent;
let errorMessageSrOnly;
let hiddenStatus = false;
let errorId;

const navigationKeys = [
  "Home",
  "End",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Tab",
];

// User-defined values:
// maskedNumber = "_#dDmMyY9"; represents the following:
// _ can match any character (placeholder)
// # can match any digit (0-9)
// d, D, m, M, y, Y can be placeholders for digits or ranges
// 9 can be a digit (0-9)
const maskedNumber = "_#dDmMyY9";
// maskedLetter = "A"; represents a mask that matches any letter (uppercase, lowercase).
const maskedLetter = "A";

const getMaskInputContext = (el) => {
  const inputEl = el;

  if (!inputEl) {
    throw new Error(`Element is missing outer ${inputEl}`);
  }

  const errorMsgDefault = inputEl.dataset.errorMessage || ERROR_MESSAGE_DEFAULT;
  const errorMsgAlpha =
    inputEl.dataset.errorMessageAlphabetical || ERROR_MESSAGE_ALPHA_DEFAULT;
  const errorMsgNum =
    inputEl.dataset.errorMessageNumerical || ERROR_MESSAGE_NUMERIC_DEFAULT;
  const errorMsgFull =
    inputEl.dataset.errorMessageInputFull || ERROR_MESSAGE_FULL_DEFAULT;
  const errorMsgPaste =
    inputEl.dataset.errorMessagePaste || ERROR_MESSAGE_PASTE_DEFAULT;
  const errorMsgDefaultSrOnly =
    inputEl.dataset.errorMessageSrOnly || ERROR_MESSAGE_SR_DEFAULT;
  const errorMsgAlphaSrOnly =
    inputEl.dataset.errorMessageAlphabeticalSrOnly ||
    ERROR_MESSAGE_ALPHA_SR_DEFAULT;
  const errorMsgNumSrOnly =
    inputEl.dataset.errorMessageNumericalSrOnly ||
    ERROR_MESSAGE_NUMERIC_SR_DEFAULT;
  const errorMsgFullSrOnly =
    inputEl.dataset.errorMessageInputFullSrOnly ||
    ERROR_MESSAGE_FULL_SR_DEFAULT;
  const errorMsgPasteSrOnly =
    inputEl.dataset.errorMessagePasteSrOnly || ERROR_MESSAGE_PASTE_SR_DEFAULT;

  return {
    errorMsgDefault,
    errorMsgAlpha,
    errorMsgNum,
    errorMsgFull,
    errorMsgPaste,
    errorMsgDefaultSrOnly,
    errorMsgAlphaSrOnly,
    errorMsgNumSrOnly,
    errorMsgFullSrOnly,
    errorMsgPasteSrOnly,
  };
};

/**
 * Replaces each masked input with a shell containing the input and its mask.
 *
 * @param {HTMLElement} input - The input element
 */
const createMaskedInputShell = (input) => {
  const placeholder = input.getAttribute(`${PLACEHOLDER}`);

  if (placeholder) {
    input.setAttribute("maxlength", placeholder.length);
    input.setAttribute("data-placeholder", placeholder);
    input.removeAttribute(`${PLACEHOLDER}`);
    input.addEventListener("paste", async () => {
      inputAddedByPaste = true;

      // Use Clipboard API for security
      clipboardData = await navigator.clipboard.readText();
    });
  } else {
    return;
  }

  const shell = document.createElement("span");
  shell.classList.add(MASK);
  shell.setAttribute("data-mask", placeholder);

  const content = document.createElement("span");
  content.classList.add(MASK_CONTENT);
  content.setAttribute("aria-hidden", "true");
  content.id = `${input.id}Mask`;
  content.textContent = placeholder;

  shell.appendChild(content);
  input.parentNode.insertBefore(shell, input);
  shell.appendChild(input);
};

/**
 * Creates visual and SR-only error messages and adds them to the DOM.
 *
 * @param {string} errorId - The ID of the error message element
 * @param {string} inputEl - The input element
 */
const createErrorMessageEl = (inputEl) => {
  const { errorMsgDefault, errorMsgDefaultSrOnly } =
    getMaskInputContext(inputEl);

  // Visual error message
  const errorMsgElement = document.createElement("div");
  errorMsgElement.setAttribute("id", errorId);
  errorMsgElement.setAttribute("class", ERROR_MESSAGE_CLASS);
  errorMsgElement.setAttribute("aria-hidden", "true");
  errorMsgElement.hidden = true;
  inputEl.parentNode.appendChild(errorMsgElement);

  // SR-only error message
  const errorMsgElementSrOnly = document.createElement("span");
  errorMsgElementSrOnly.setAttribute("id", `${errorId}SrOnly`);
  errorMsgElementSrOnly.setAttribute("class", SR_ONLY_CLASS);
  errorMsgElementSrOnly.setAttribute("role", "alert");
  inputEl.parentNode.appendChild(errorMsgElementSrOnly);
  errorMessageSrOnlyEl = document.getElementById(`${errorId}SrOnly`);

  // Set default messages
  errorTextContent = errorMsgDefault;
  errorMessageSrOnly = errorMsgDefaultSrOnly;
};

/**
 * Returns a combination of the input value and the remaining placeholder inside the new element.
 *
 * @param {HTMLElement} inputEl - The input element
 */
const setValueOfMask = (el) => {
  const { value } = el;
  const placeholderVal = `${el.dataset.placeholder.substr(value.length)}`;
  const inputValueLength = placeholderVal.length + value.length;

  const theIEl = document.createElement("i");
  theIEl.textContent = value;

  return [theIEl, placeholderVal, inputValueLength];
};

const strippedValue = (isCharsetPresent, value) =>
  isCharsetPresent ? value.replace(/\W/g, "") : value.replace(/\D/g, "");

const isInteger = (value) => !Number.isNaN(parseInt(value, 10));

const isLetter = (value) => (value ? value.match(/[A-Z]/i) : false);

/**
 * Creates an array of the required character types for each position in the input value.
 * Checks the current index and returns the expected character type for that position.
 *
 * @param {string} placeholder - Defines the expected character types (letters or numbers) for the mask.
 * @param {string} value - The most recent input attempt, even if it will be rejected.
 * @returns {string} matchType - The required character type (e.g., 'letter' or 'number') for the current position in the mask.
 */
const checkMaskType = (placeholder, value) => {
  const valueLength = value.length;
  let array = [];

  array = [...placeholder].map((char) => {
    const matchesNumber = maskedNumber.includes(char);
    const matchesLetter = maskedLetter.includes(char);

    if (matchesNumber) {
      return "number";
    }
    if (matchesLetter) {
      return "letter";
    }
    // If not a number or letter, it's a format character
    return "format character";
  });

  let matchType = array[valueLength - 1];

  // If the index lands on a "format character", move to the next matchType in the array
  if (matchType === "format character") {
    matchType = array[valueLength];
  }

  return { matchType };
};

/**
 * Compares the new input value to the clipboard text data and returns the longest common prefix between them.
 *
 * @param {string} str1 - The new input value
 * @param {string} str2 - The clipboard text data
 * @returns {string} The longest common prefix between str1 and str2.
 *
 */
function stripPasteValue(str1, str2) {
  let value = "";
  const stringOne = strippedValue(true, str1);
  const stringTwo = strippedValue(true, str2);
  const minLength = Math.min(stringOne.length, stringTwo.length);

  // Find the index of the first mismatch between the two strings
  const firstMismatchIndex = [...Array(minLength).keys()].find(
    (i) => stringOne[i] !== stringTwo[i],
  );

  // If there is a mismatch, return the part of str1 up to the mismatch
  if (firstMismatchIndex !== undefined) {
    value = str1.slice(0, firstMismatchIndex);

    // Else, there is no mismatch, return the whole common part of both strings
  } else {
    value = str1.slice(0, minLength);
  }

  return value;
}

/**
 * Checks if the new input character meets the mask's requirement.
 * Returns the new input value with the new character added if accepted.
 *
 * @param {HTMLElement} el - The input element
 * @return {string} newValue - The full input value after the most recent character is added or rejected.
 * @return {string} matchType - The required character type (e.g., 'letter' or 'number') for the current position in the mask.
 */
const handleCurrentValue = (el) => {
  const isCharsetPresent = el.dataset.charset;
  const placeholder = isCharsetPresent || el.dataset.placeholder;
  const { value } = el;
  const len = placeholder.length;
  const { matchType } = checkMaskType(placeholder, value);
  let newValue = "";
  let i;
  let charIndex;

  const strippedVal = strippedValue(isCharsetPresent, value);

  for (i = 0, charIndex = 0; i < len; i += 1) {
    const isInt = isInteger(strippedVal[charIndex]);
    const isLet = isLetter(strippedVal[charIndex]);
    const matchesNumber = maskedNumber.indexOf(placeholder[i]) >= 0;
    const matchesLetter = maskedLetter.indexOf(placeholder[i]) >= 0;

    if (
      (matchesNumber && isInt) ||
      (isCharsetPresent && matchesLetter && isLet)
    ) {
      newValue += strippedVal[charIndex];
      charIndex += 1;
    } else if (
      (!isCharsetPresent && !isInt && matchesNumber) ||
      (isCharsetPresent &&
        ((matchesLetter && !isLet) || (matchesNumber && !isInt)))
    ) {
      return { newValue, matchType };
    } else {
      newValue += placeholder[i];
    }
    // Break if no characters are left and the pattern is non-special character
    if (strippedVal[charIndex] === undefined) {
      break;
    }
  }

  // If a pasted input is invalid, strip it
  if (newValue.length !== len && inputAddedByPaste) {
    newValue = stripPasteValue(newValue, clipboardData);
  }

  return { newValue, matchType };
};

/**
 * Updates the error message text content for screen readers after a 1000ms delay.
 *
 * @param {HTMLElement} msgEl - The screen reader error message element
 * @param {string} errorMsg - Error message text content
 * @param {boolean} status - Error message active status
 */
const srUpdateErrorMsg = debounce((errorMsg, msgEl, status) => {
  const errorMessageEl = msgEl;
  errorMessageEl.textContent = errorMsg;
  errorMessageEl.hidden = status;
}, 1000);

/**
 * Sets the error message text content and hidden status.
 *
 * @param {string} valueAttempt - The input value before the new character is accepted or rejected
 * @param {string} newValue - The input value after the new character is accepted or rejected
 * @param {string} matchType - The character type that the input should be to be accepted
 * @param {HTMLElement} inputEl - The input element
 * @param {boolean} maxLengthReached - Returns true when the input mask has reached the max length
 */
const handleErrorState = (
  valueAttempt,
  newValue,
  matchType,
  inputEl,
  maxLengthReached,
) => {
  const {
    errorMsgNum,
    errorMsgAlpha,
    errorMsgFull,
    errorMsgPaste,
    errorMsgNumSrOnly,
    errorMsgAlphaSrOnly,
    errorMsgFullSrOnly,
    errorMsgPasteSrOnly,
  } = getMaskInputContext(inputEl);

  // Check if value attempt was accepted or rejected
  const strippedValueAttempt = strippedValue(true, valueAttempt);
  const strippedNewValue = strippedValue(true, newValue);
  const strippedClipboard = strippedValue(true, clipboardData);
  const valueAccepted = strippedValueAttempt === strippedNewValue;

  // Check if the new character was a format character added by the mask
  const lastChar = newValue.charAt(newValue.length - 1);
  const formatCharAdded = lastChar !== keyPressed;

  // Set error message content
  if (matchType === "letter") {
    errorTextContent = errorMsgAlpha;
    errorMessageSrOnly = errorMsgAlphaSrOnly;
  } else if (matchType === "number") {
    errorTextContent = errorMsgNum;
    errorMessageSrOnly = errorMsgNumSrOnly;
  }

  // Update error message hidden status
  // Backspacing clears error
  if (backspacePressed) {
    hiddenStatus = true;

    // Max length reached
  } else if (maxLengthReached) {
    hiddenStatus = false;
    // Set error message content
    errorTextContent = errorMsgFull;
    errorMessageSrOnly = errorMsgFullSrOnly;

    // Hides error when input should be a letter and key combo is a letter
  } else if (matchType === "letter" && shiftComboPressed) {
    hiddenStatus = true;

    // Input accepted when added with copy/paste
  } else if (inputAddedByPaste && strippedNewValue === strippedClipboard) {
    hiddenStatus = true;
    // Reset inputAddedByPaste
    inputAddedByPaste = false;

    // Only part or none of the input was added with copy/paste
  } else if (
    (inputAddedByPaste && strippedNewValue !== strippedClipboard) ||
    (!valueAccepted && inputAddedByPaste)
  ) {
    hiddenStatus = false;
    // Set error message content
    errorTextContent = errorMsgPaste;
    errorMessageSrOnly = errorMsgPasteSrOnly;
    // Reset inputAddedByPaste
    inputAddedByPaste = false;

    // New character rejected
  } else if (!valueAccepted) {
    hiddenStatus = false;

    // ValueAccepted returned true because a format character was added,
    // but the last character attempt was rejected
  } else if (valueAccepted && formatCharAdded) {
    hiddenStatus = false;

    // New character accepted, hide error
  } else if (valueAccepted) {
    hiddenStatus = true;
  }

  // Update visual error message content and status
  const errorMessageEl = document.getElementById(errorId);
  errorMessageEl.hidden = hiddenStatus;
  errorMessageEl.textContent = errorTextContent;

  // Update SR-only error message content and status
  srUpdateErrorMsg(errorMessageSrOnly, errorMessageSrOnlyEl, hiddenStatus);
};

/**
 * Gets the processed input value and places it inside the mask element.
 * Triggers error handling.
 *
 * @param {HTMLElement} e - The input element
 */
const handleValueChange = (e) => {
  keyPressed = e.key;
  let maxLengthReached;
  const inputEl = e.srcElement;

  // Record potential new value before new character is accepted or rejected
  const valueAttempt = inputEl.value;

  // Check if max character count has been reached
  if (!backspacePressed) {
    maxLengthReached = lastValueLength === inputEl.maxLength;
  } else {
    maxLengthReached = false;
  }

  // Get processed new value and expected character type
  const { newValue, matchType } = handleCurrentValue(inputEl);
  inputEl.value = newValue;

  // Save new value length as lastValueLength for next input check
  lastValueLength = newValue.length;

  const maskVal = setValueOfMask(inputEl);
  const maskEl = document.getElementById(`${inputEl.id}Mask`);
  maskEl.textContent = "";
  maskEl.replaceChildren(maskVal[0], maskVal[1]);

  if (!navigationKeys.includes(keyPressed)) {
    handleErrorState(
      valueAttempt,
      newValue,
      matchType,
      inputEl,
      maxLengthReached,
    );
  }
};

const keyUpCheck = (e) => {
  // Run handleValueChange() only when backspacing, clearing input, or pressing a non-CapsLock key
  // at a standard location, to avoid errors from CapsLock or Shift key combos triggering the function twice
  if (backspacePressed) {
    handleValueChange(e);
  } else if (e.key !== "CapsLock" && e.location === 0) {
    handleValueChange(e);
  }
};

const keyDownCheck = (e) => {
  if (e.shiftKey && /^[a-zA-Z]$/.test(e.key)) {
    shiftComboPressed = true;
  } else {
    shiftComboPressed = false;
  }

  if (e.key === "Backspace" || (e.metaKey && e.key === "Backspace")) {
    backspacePressed = true;
  } else {
    backspacePressed = false;
  }
};

const inputMaskEvents = {
  keyup: {
    [MASKED](e) {
      keyUpCheck(e);
    },
  },
  keydown: {
    [MASKED](e) {
      keyDownCheck(e);
    },
  },
};

const inputMask = behavior(inputMaskEvents, {
  init(root) {
    selectOrMatches(MASKED, root).forEach((maskedInput) => {
      createMaskedInputShell(maskedInput);

      errorId = `${maskedInput.id}Error`;
      createErrorMessageEl(maskedInput);
    });
  },
});

module.exports = inputMask;
