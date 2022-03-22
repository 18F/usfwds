const behavior = require("../utils/behavior");
const select = require("../utils/select");
const { CLICK } = require("../events");
const { prefix: PREFIX } = require("../config");

const SCOPE = `.${PREFIX}-footer--big`;
const NAV = `${SCOPE} nav`;
const BUTTON = `${NAV} .${PREFIX}-footer__primary-link`;
const HIDE_MAX_WIDTH = 480;

/**
 * Expands selected footer menu panel, while collapsing others
 */
function showPanel() {
  if (window.innerWidth < HIDE_MAX_WIDTH) {
    const isOpen = this.getAttribute('aria-expanded') === 'true';

    // Close all other menus
    document.querySelectorAll(BUTTON).forEach((button) => {
      button.setAttribute('aria-expanded', false);
    });

    this.setAttribute('aria-expanded', !isOpen);
  }
}

/**
 * Swaps the <h4> element for a <button> element (and vice-versa)
 *
 * @param {Boolean} isMobile - If the footer is in mobile configuration
 */
function toggleHtmlTag(isMobile) {
  const footer = document.querySelector(SCOPE);
  const primaryLinks = footer?.querySelectorAll(BUTTON);
  const newElementType = isMobile ? 'button' : 'h4';

  primaryLinks?.forEach(currentElement => {
    const currentElementClasses = currentElement.getAttribute('class');

    // Create the new element
    const newElement = document.createElement(newElementType);
    newElement.setAttribute('class', currentElementClasses);
    newElement.classList.toggle(`${PREFIX}-footer__primary-link--button`, isMobile);
    newElement.textContent = currentElement.textContent;

    if (isMobile) {
      newElement.setAttribute('aria-expanded', 'false');
    }

    // Insert the new element and delete the old
    currentElement.after(newElement);
    currentElement.remove();
  });
}

const toggleHidden = (isHidden) =>
  select(BUTTON).forEach((button) =>
    button.setAttribute('aria-expanded', !isHidden)
  );

const resize = (event) => {
  toggleHtmlTag(window.innerWidth < HIDE_MAX_WIDTH);
  toggleHidden(event.matches);
}

module.exports = behavior(
  {
    [CLICK]: {
      [BUTTON]: showPanel,
    },
  },
  {
    // export for use elsewhere
    HIDE_MAX_WIDTH,

    init() {
      toggleHtmlTag(window.innerWidth < HIDE_MAX_WIDTH);
      toggleHidden(window.innerWidth < HIDE_MAX_WIDTH);
      this.mediaQueryList = window.matchMedia(
        `(max-width: ${HIDE_MAX_WIDTH - 0.1}px)`
      );
      this.mediaQueryList.addListener(resize);
    },

    teardown() {
      this.mediaQueryList.removeListener(resize);
    },
  }
);