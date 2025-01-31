const { keymap } = require("receptor");
const behavior = require("./behavior");
const select = require("./select");
const activeElement = require("./active-element");

const FOCUSABLE =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

const getFocusableElements = (context) =>
  Array.from(select(FOCUSABLE, context));
const firstTabStop = (context) => getFocusableElements(context)[0];
const lastTabStop = (context) => getFocusableElements(context).at(-1);

const tabHandler = (context) => {
  // Special rules for when the user is tabbing forward from the last focusable element,
  // or when tabbing backwards from the first focusable element
  function tabAhead(event) {
    if (activeElement() === lastTabStop(context)) {
      event.preventDefault();
      firstTabStop(context).focus();
    }
  }

  function tabBack(event) {
    if (activeElement() === firstTabStop(context)) {
      event.preventDefault();
      lastTabStop(context).focus();
    }
    // This checks if you want to set the initial focus to a container
    // instead of an element within, and the user tabs back.
    // Then we set the focus to the first
    else if (!getFocusableElements(context).includes(activeElement())) {
      event.preventDefault();
      firstTabStop(context).focus();
    }
  }

  return {
    firstTabStop,
    lastTabStop,
    tabAhead,
    tabBack,
  };
};

module.exports = (context, additionalKeyBindings = {}) => {
  const tabEventHandler = tabHandler(context);
  const bindings = additionalKeyBindings;
  const { Esc, Escape } = bindings;

  if (Escape && !Esc) bindings.Esc = Escape;

  //  TODO: In the future, loop over additional keybindings and pass an array
  // of functions, if necessary, to the map keys. Then people implementing
  // the focus trap could pass callbacks to fire when tabbing
  const keyMappings = keymap({
    Tab: tabEventHandler.tabAhead,
    "Shift+Tab": tabEventHandler.tabBack,
    ...additionalKeyBindings,
  });

  const focusTrap = behavior(
    {
      keydown: keyMappings,
    },
    {
      init() {
        // TODO: is this desirable behavior? Should the trap always do this by default or should
        // the component getting decorated handle this?
        if (tabEventHandler.firstTabStop(context)) {
          tabEventHandler.firstTabStop(context).focus();
        }
      },
      update(isActive) {
        if (isActive) {
          this.on();
        } else {
          this.off();
        }
      },
    },
  );

  return focusTrap;
};
