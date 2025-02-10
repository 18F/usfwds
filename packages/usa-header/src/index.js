const keymap = require("../../uswds-core/src/js/utils/keymap");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const select = require("../../uswds-core/src/js/utils/select");
const toggle = require("../../uswds-core/src/js/utils/toggle");
const FocusTrap = require("../../uswds-core/src/js/utils/focus-trap");
const accordion = require("../../usa-accordion/src/index");
const ScrollBarWidth = require("../../uswds-core/src/js/utils/scrollbar-width");

const { CLICK } = require("../../uswds-core/src/js/events");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");

const BODY = "body";
const HEADER = `.${PREFIX}-header`;
const NAV = `.${PREFIX}-nav`;
const NAV_CONTAINER = `.${PREFIX}-nav-container`;
const NAV_PRIMARY = `.${PREFIX}-nav__primary`;
const NAV_PRIMARY_ITEM = `.${PREFIX}-nav__primary-item`;
const NAV_CONTROL = `button.${PREFIX}-nav__link`;
const NAV_LINKS = `${NAV} a`;
const NON_NAV_HIDDEN_ATTRIBUTE = `data-nav-hidden`;
const OPENERS = `.${PREFIX}-menu-btn`;
const CLOSE_BUTTON = `.${PREFIX}-nav__close`;
const OVERLAY = `.${PREFIX}-overlay`;
const CLOSERS = `${CLOSE_BUTTON}, .${PREFIX}-overlay`;
const TOGGLES = [NAV, OVERLAY].join(", ");
const NON_NAV_ELEMENTS = `body *:not(${HEADER}, ${NAV_CONTAINER}, ${NAV}, ${NAV} *):not([aria-hidden])`;
const NON_NAV_HIDDEN = `[${NON_NAV_HIDDEN_ATTRIBUTE}]`;

const ACTIVE_CLASS = "usa-js-mobile-nav--active";
const VISIBLE_CLASS = "is-visible";

let navigation;
let navActive;
let nonNavElements;

const isActive = () => document.body.classList.contains(ACTIVE_CLASS);
// Detect Safari
// Note: Chrome also reports the Safari userAgent so this specifically excludes Chrome.
const isSafari =
  navigator.userAgent.includes("Safari") &&
  !navigator.userAgent.includes("Chrome");
const SCROLLBAR_WIDTH = ScrollBarWidth();
const INITIAL_PADDING = window
  .getComputedStyle(document.body)
  .getPropertyValue("padding-right");
const TEMPORARY_PADDING = `${
  parseInt(INITIAL_PADDING.replace(/px/, ""), 10) +
  parseInt(SCROLLBAR_WIDTH.replace(/px/, ""), 10)
}px`;

const hideNonNavItems = () => {
  const headerParent = document.querySelector(`${HEADER}`).parentNode;
  nonNavElements = document.querySelectorAll(NON_NAV_ELEMENTS);

  nonNavElements.forEach((nonNavElement) => {
    if (nonNavElement !== headerParent) {
      nonNavElement.setAttribute("aria-hidden", true);
      nonNavElement.setAttribute(NON_NAV_HIDDEN_ATTRIBUTE, "");
    }
  });
};

const showNonNavItems = () => {
  nonNavElements = document.querySelectorAll(NON_NAV_HIDDEN);

  if (!nonNavElements) {
    return;
  }

  // Remove aria-hidden from non-header elements
  nonNavElements.forEach((nonNavElement) => {
    nonNavElement.removeAttribute("aria-hidden");
    nonNavElement.removeAttribute(NON_NAV_HIDDEN_ATTRIBUTE);
  });
};

// Toggle all non-header elements #3527.
const toggleNonNavItems = (active) => {
  if (active) {
    hideNonNavItems();
  } else {
    showNonNavItems();
  }
};

/**
 * Detect Safari and add body class for a Safari-only CSS bug fix.
 * More details in https://github.com/uswds/uswds/pull/5443
 */
const addSafariClass = () => {
  if (isSafari) {
    document.body.classList.add("is-safari");
  }
};

/**
 * Set the value for the --scrolltop CSS var when the mobile menu is open.
 * This allows the CSS to lock the current scroll position in Safari
 * when overflow-y is set to scroll.
 * More details in https://github.com/uswds/uswds/pull/5443
 */
const setSafariScrollPosition = (body) => {
  const currentScrollPosition = `-${window.scrollY}px`;
  if (isSafari) {
    body.style.setProperty("--scrolltop", currentScrollPosition);
  }
};

const toggleNav = (active) => {
  const { body } = document;
  const safeActive = typeof active === "boolean" ? active : !isActive();

  setSafariScrollPosition(body);

  body.classList.toggle(ACTIVE_CLASS, safeActive);

  select(TOGGLES).forEach((el) =>
    el.classList.toggle(VISIBLE_CLASS, safeActive),
  );

  navigation.focusTrap.update(safeActive);

  const closeButton = body.querySelector(CLOSE_BUTTON);
  const menuButton = document.querySelector(OPENERS);

  body.style.paddingRight =
    body.style.paddingRight === TEMPORARY_PADDING
      ? INITIAL_PADDING
      : TEMPORARY_PADDING;

  toggleNonNavItems(safeActive);

  if (safeActive && closeButton) {
    // The mobile nav was just activated. Focus on the close button, which is
    // just before all the nav elements in the tab order.
    closeButton.focus();
  } else if (
    !safeActive &&
    menuButton &&
    getComputedStyle(menuButton).display !== "none"
  ) {
    // The mobile nav was just deactivated. We don't want the focus to
    // disappear into the void, so focus on the menu button if it's
    // visible (this may have been what the user was just focused on,
    // if they triggered the mobile nav by mistake).
    menuButton.focus();
  }

  return safeActive;
};

const resize = () => {
  const closer = document.body.querySelector(CLOSE_BUTTON);

  if (isActive() && closer && closer.getBoundingClientRect().width === 0) {
    // When the mobile nav is active, and the close box isn't visible,
    // we know the user's viewport has been resized to be larger.
    // Let's make the page state consistent by deactivating the mobile nav.
    navigation.toggleNav.call(closer, false);
  }
};

const onMenuClose = () => navigation.toggleNav.call(navigation, false);

const hideActiveNavDropdown = () => {
  if (!navActive) {
    return;
  }

  toggle(navActive, false);
  navActive = null;
};

const focusNavButton = (event) => {
  const parentNavItem = event.target.closest(NAV_PRIMARY_ITEM);

  // Only shift focus if within dropdown
  if (!event.target.matches(NAV_CONTROL)) {
    const navControl = parentNavItem.querySelector(NAV_CONTROL);
    if (navControl) {
      navControl.focus();
    }
  }
};

const handleEscape = (event) => {
  hideActiveNavDropdown();
  focusNavButton(event);
};

navigation = behavior(
  {
    [CLICK]: {
      [NAV_CONTROL]() {
        // If another nav is open, close it
        if (navActive !== this) {
          hideActiveNavDropdown();
        }
        // store a reference to the last clicked nav link element, so we
        // can hide the dropdown if another element on the page is clicked
        if (!navActive) {
          navActive = this;
          toggle(navActive, true);
        }

        // Do this so the event handler on the body doesn't fire
        return false;
      },
      [BODY]: hideActiveNavDropdown,
      [OPENERS]: toggleNav,
      [CLOSERS]: toggleNav,
      [NAV_LINKS]() {
        // A navigation link has been clicked! We want to collapse any
        // hierarchical navigation UI it's a part of, so that the user
        // can focus on whatever they've just selected.

        // Some navigation links are inside accordions; when they're
        // clicked, we want to collapse those accordions.
        const acc = this.closest(accordion.ACCORDION);

        if (acc) {
          accordion.getButtons(acc).forEach((btn) => accordion.hide(btn));
        }

        // If the mobile navigation menu is active, we want to hide it.
        if (isActive()) {
          navigation.toggleNav.call(navigation, false);
        }
      },
    },
    keydown: {
      [NAV_PRIMARY]: keymap({ Escape: handleEscape }),
    },
    focusout: {
      [NAV_PRIMARY](event) {
        const nav = event.target.closest(NAV_PRIMARY);

        if (!nav.contains(event.relatedTarget)) {
          hideActiveNavDropdown();
        }
      },
    },
  },
  {
    init(root) {
      const trapContainer = root.matches(NAV) ? root : root.querySelector(NAV);

      if (trapContainer) {
        navigation.focusTrap = FocusTrap(trapContainer, {
          Escape: onMenuClose,
        });
      }

      addSafariClass();
      resize();
      window.addEventListener("resize", resize, false);
    },
    teardown() {
      window.removeEventListener("resize", resize, false);
      navActive = false;
    },
    focusTrap: null,
    toggleNav,
  },
);

module.exports = navigation;
