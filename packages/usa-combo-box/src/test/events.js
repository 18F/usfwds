const sinon = require("sinon");

const EVENTS = {};

/**
 * send a click event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.click = (el) => {
  const evt = new MouseEvent("click", {
    view: el.ownerDocument.defaultView,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(evt);
};

/**
 * send a focusout event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.focusout = (el) => {
  const evt = new Event("focusout", {
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown Enter event
 * @param {HTMLElement} el the element to send the event to
 * @returns {{preventDefaultSpy: sinon.SinonSpy<[], void>}}
 */
EVENTS.keydownEnter = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "Enter",
    keyCode: 13,
  });
  const preventDefaultSpy = sinon.spy(evt, "preventDefault");
  el.dispatchEvent(evt);
  return { preventDefaultSpy };
};

/**
 * send a keydown Escape event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.keydownEscape = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "Escape",
    keyCode: 27,
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown Tab event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.keydownTab = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "Tab",
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown Space event
 * @param {HTMLElement} el the element to sent the event to
 */
EVENTS.keydownSpace = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: " ",
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown ArrowDown event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.keydownArrowDown = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "ArrowDown",
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown ArrowUp event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.keydownArrowUp = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "ArrowUp",
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown Home event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.keydownHome = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "Home",
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown End event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.keydownEnd = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "End",
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown PageUp event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.keydownPageUp = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "PageUp",
  });
  el.dispatchEvent(evt);
};

/**
 * send a keydown PageDown event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.keydownPageDown = (el) => {
  const evt = new KeyboardEvent("keydown", {
    bubbles: true,
    key: "PageDown",
  });
  el.dispatchEvent(evt);
};

/**
 * send an input event
 * @param {HTMLElement} el the element to send the event to
 */
EVENTS.input = (el) => {
  el.dispatchEvent(new KeyboardEvent("input", { bubbles: true }));
};

module.exports = EVENTS;
