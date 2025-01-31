const assert = require("assert");
const fs = require("fs");
const path = require("path");
const toggleFormInput = require("../toggle-form-input");

const { resolveIdRefs } = toggleFormInput;

const TEMPLATE = fs.readFileSync(path.join(__dirname, "/toggle.template.html"));

const CONTROL_SELECTOR = ".usa-show-password";
const PASSWORD_SELECTOR = "#password";
const CONFIRM_SELECTOR = "#confirmPassword";
const HIDE_TEXT = "Hide my typing";
const SHOW_TEXT = "Show my typing";

describe("resolveIdRefs", () => {
  /** @type {HTMLElement} */
  let aElement;

  /** @type {HTMLElement} */
  let bElement;

  beforeEach(() => {
    aElement = document.createElement("span");
    aElement.id = "a";
    document.body.appendChild(aElement);
    bElement = document.createElement("span");
    bElement.id = "b";
    document.body.appendChild(bElement);
  });

  it("returns matched elements ignoring excess whitespace", () => {
    const elements = resolveIdRefs(" a  b ");

    assert.deepStrictEqual(elements, [aElement, bElement]);
  });

  it("silently ignores ids without corresponding element", () => {
    const elements = resolveIdRefs("a c b");

    assert.deepStrictEqual(elements, [aElement, bElement]);
  });
});

describe("toggleFormInput", () => {
  const { body } = document;
  let maskControl;
  let password;
  let confirmPassword;

  beforeEach(() => {
    body.innerHTML = TEMPLATE;

    maskControl = body.querySelector(CONTROL_SELECTOR);
    password = body.querySelector(PASSWORD_SELECTOR);
    confirmPassword = body.querySelector(CONFIRM_SELECTOR);
  });

  afterEach(() => {
    body.textContent = "";
  });

  it("defaults to masked", () => {
    assert.strictEqual(password.type, "password");
    assert.strictEqual(maskControl.textContent, SHOW_TEXT);
  });

  it("switches type of inputs from password to text when true", () => {
    toggleFormInput(maskControl);
    assert.strictEqual(password.type, "text");
    assert.strictEqual(confirmPassword.type, "text");
  });

  it("changes text of mask control element to match show/hide text", () => {
    toggleFormInput(maskControl);
    assert.strictEqual(maskControl.textContent, HIDE_TEXT);

    toggleFormInput(maskControl);
    assert.strictEqual(maskControl.textContent, SHOW_TEXT);
  });
});
