const keymap = require("receptor/keymap");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const select = require("../../uswds-core/src/js/utils/select");
const toggle = require("../../uswds-core/src/js/utils/toggle");
const FocusTrap = require("../../uswds-core/src/js/utils/focus-trap");
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

/**
 * Compares current location and clicked link to determine if the link is to a subsection of current page.
 *
 * @param {HTMLAnchorElement} targetLink - The clicked link in header.
 * @returns {boolean} Return `true` if target is same page || Return `false` if target is on a different page.
 */
const isChildSection = (targetLink) => {
  const currentPage = window.location;
  const linkDestination = new URL(targetLink.href);
  const currentURLPath = currentPage.origin + currentPage.pathname;
  const linkURLPath = linkDestination.origin + linkDestination.pathname;

  return currentURLPath === linkURLPath;
};

/**
 * Sets activeNav to clicked accordion, closes any other open navs.
 *
 * @param {HTMLButtonElement} clickedAccordion - Clicked NAV_CONTROL
 */
const updateActiveNav = (clickedAccordion) => {
  // If another nav is open, close it.
  if (navActive !== clickedAccordion) {
    hideActiveNavDropdown();
  }

  // If no active nav, set navActive to clicked nav.
  if (!navActive) {
    navActive = clickedAccordion;
    toggle(navActive, true);
  }
};

/**
 * Check if nav link is on the current page, if so close the mobile nav menu.
 *
 * @param {HTMLAnchorElement} navLink - Nav link clicked in header.
 */
const handleMobileNav = (navLink) => {
  if (isChildSection(navLink)) {
    navigation.toggleNav.call(navigation, false);
  }
};

/**
 * Collapse nav accordions when focus leaves primary nav
 */
const closeOnFocusOut = (event) => {
  const nav = event.target.closest(NAV_PRIMARY);

  if (!nav.contains(event.relatedTarget)) {
    hideActiveNavDropdown();
  }
};

navigation = behavior(
  {
    [CLICK]: {
      [NAV_CONTROL]() {
        updateActiveNav(this);

        // Do this so the event handler on the body doesn't fire
        return false;
      },
      [NAV_LINKS]() {
        handleMobileNav(this);
      },
      [BODY]: hideActiveNavDropdown,
      [OPENERS]: toggleNav,
      [CLOSERS]: toggleNav,
    },
    keydown: {
      [NAV_PRIMARY]: keymap({ Escape: handleEscape }),
    },
    focusout: {
      [NAV_PRIMARY]: closeOnFocusOut,
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
