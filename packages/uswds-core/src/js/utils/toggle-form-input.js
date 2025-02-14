const toggleFieldMask = require("./toggle-field-mask");

const CONTROLS = "aria-controls";
const PRESSED = "aria-pressed";
const SHOW_ATTR = "data-show-text";
const HIDE_ATTR = "data-hide-text";

/**
 * Replace the word "Show" (or "show") with "Hide" (or "hide") in a string.
 * @param {string} showText
 * @return {strong} hideText
 */
const getHideText = (showText) =>
  showText.replace(/\bShow\b/i, (show) => `${show[0] === "S" ? "H" : "h"}ide`);

/**
 * Given a string of space-separated element IDs, returns an array of corresponding elements with
 * those IDs.
 *
 * @param {string} idRefs Space-separated element IDs
 * @return {Element[]} Elements matching given IDs
 */
const resolveIdRefs = (idRefs) =>
  idRefs
    .trim()
    .split(/\s+/)
    .map((id) => document.getElementById(id))
    .filter(Boolean);

/**
 * Component that decorates an HTML element with the ability to toggle the
 * masked state of an input field (like a password) when clicked.
 * The ids of the fields to be masked will be pulled directly from the button's
 * `aria-controls` attribute.
 *
 * @param  {HTMLElement} el    Parent element containing the fields to be masked
 * @return {boolean}
 */
const toggleFormInput = (el) => {
  // this is the *target* state:
  // * if the element has the attr and it's !== "true", pressed is true
  // * otherwise, pressed is false
  const pressed =
    el.hasAttribute(PRESSED) && el.getAttribute(PRESSED) !== "true";

  const fields = resolveIdRefs(el.getAttribute(CONTROLS));
  fields.forEach((field) => toggleFieldMask(field, pressed));

  if (!el.hasAttribute(SHOW_ATTR)) {
    el.setAttribute(SHOW_ATTR, el.textContent);
  }

  const showText = el.getAttribute(SHOW_ATTR);
  const hideText = el.getAttribute(HIDE_ATTR) || getHideText(showText);

  el.textContent = pressed ? showText : hideText; // eslint-disable-line no-param-reassign
  el.setAttribute(PRESSED, pressed);
  return pressed;
};

module.exports = toggleFormInput;
module.exports.resolveIdRefs = resolveIdRefs;
