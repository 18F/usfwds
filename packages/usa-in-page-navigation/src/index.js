const once = require("receptor/once");
const keymap = require("receptor/keymap");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");
const { CLICK } = require("../../uswds-core/src/js/events");
const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");

const CURRENT_CLASS = `${PREFIX}-current`;
const IN_PAGE_NAV_HEADINGS = "h2 h3";
const IN_PAGE_NAV_VALID_HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"];
const IN_PAGE_NAV_TITLE_TEXT = "On this page";
const IN_PAGE_NAV_TITLE_HEADING_LEVEL = "h4";
const IN_PAGE_NAV_SCROLL_OFFSET = 0;
const IN_PAGE_NAV_ROOT_MARGIN = "0px 0px 0px 0px";
const IN_PAGE_NAV_THRESHOLD = "1";
const IN_PAGE_NAV_MINIMUM_HEADING_COUNT = 2;
const IN_PAGE_NAV_CLASS = `${PREFIX}-in-page-nav`;
const IN_PAGE_NAV_ANCHOR_CLASS = `${PREFIX}-anchor`;
const IN_PAGE_NAV_NAV_CLASS = `${IN_PAGE_NAV_CLASS}__nav`;
const IN_PAGE_NAV_LIST_CLASS = `${IN_PAGE_NAV_CLASS}__list`;
const IN_PAGE_NAV_ITEM_CLASS = `${IN_PAGE_NAV_CLASS}__item`;
const IN_PAGE_NAV_PRIMARY_ITEM_CLASS = `${IN_PAGE_NAV_ITEM_CLASS}--primary`;
const IN_PAGE_NAV_LINK_CLASS = `${IN_PAGE_NAV_CLASS}__link`;
const IN_PAGE_NAV_TITLE_CLASS = `${IN_PAGE_NAV_CLASS}__heading`;
const MAIN_ELEMENT = "main";

/**
 * Set the active link state for the currently observed section
 *
 * @param {HTMLElement} el An element within the in-page nav component
 */
const setActive = (el) => {
  const allLinks = document.querySelectorAll(`.${IN_PAGE_NAV_LINK_CLASS}`);
  el.map((i) => {
    if (i.isIntersecting === true && i.intersectionRatio >= 1) {
      allLinks.forEach((link) => link.classList.remove(CURRENT_CLASS));
      document
        .querySelector(`a[href="#${i.target.id}"]`)
        .classList.add(CURRENT_CLASS);
      return true;
    }
    return false;
  });
};

/**
 * Return an array of the designated heading types found in the designated content region.
 * Throw an error if an invalid header element is designated.
 *
 * @param {HTMLElement} selectedContentRegion The content region the component should pull headers from
 * @param {String} selectedHeadingTypes The list of heading types that should be included in the nav list
 *
 * @return {Array} - An array of designated heading types from the designated content region
 */
const createSectionHeadingsArray = (
  selectedContentRegion,
  selectedHeadingTypes,
) => {
  // Convert designated headings list to an array
  const selectedHeadingTypesArray = selectedHeadingTypes.indexOf(" ")
    ? selectedHeadingTypes.split(" ")
    : selectedHeadingTypes;
  const contentRegion = document.querySelector(selectedContentRegion);

  selectedHeadingTypesArray.forEach((headingType) => {
    if (!IN_PAGE_NAV_VALID_HEADINGS.includes(headingType)) {
      throw new Error(
        `In-page navigation: data-heading-elements attribute defined with an invalid heading type: "${headingType}".
        Define the attribute with one or more of the following: "${IN_PAGE_NAV_VALID_HEADINGS}".
        Do not use commas or other punctuation in the attribute definition.`,
      );
    }
  });

  const sectionHeadingsArray = Array.from(
    contentRegion.querySelectorAll(selectedHeadingTypesArray),
  );

  return sectionHeadingsArray;
};

/**
 * Return an array of the visible headings from sectionHeadingsArray.
 * This function removes headings that are hidden with display:none or visibility:none style rules.
 * These items will be added to the component nav list.
 *
 * @param {HTMLElement} selectedContentRegion The content region the component should pull headers from
 * @param {String} selectedHeadingTypes The list of heading types that should be included in the nav list
 *
 * @return {Array} - An array of visible headings from the designated content region
 */
const getVisibleSectionHeadings = (
  selectedContentRegion,
  selectedHeadingTypes,
) => {
  const sectionHeadings = createSectionHeadingsArray(
    selectedContentRegion,
    selectedHeadingTypes,
  );

  // Find all headings with hidden styling and remove them from the array
  const visibleSectionHeadings = sectionHeadings.filter((heading) => {
    const headingStyle = window.getComputedStyle(heading);
    const visibleHeading =
      headingStyle.getPropertyValue("display") !== "none" &&
      headingStyle.getPropertyValue("visibility") !== "hidden";

    return visibleHeading;
  });

  return visibleSectionHeadings;
};

/**
 * Return the highest-level header tag included in the link list
 *
 * @param {HTMLElement} sectionHeadings The array of headings selected for inclusion in the link list
 *
 * @return {tagName} - The tag name for the highest level of header in the link list
 */

const getTopLevelHeading = (sectionHeadings) => {
  const topHeading = sectionHeadings[0].tagName.toLowerCase();
  return topHeading;
};

/**
 * Return a node list of section anchor tags
 *
 * @return {HTMLElement[]} - An array of DOM nodes
 */
const getSectionAnchors = () => {
  const sectionAnchors = document.querySelectorAll(
    `.${IN_PAGE_NAV_ANCHOR_CLASS}`,
  );
  return sectionAnchors;
};

/**
 * Generates a unique ID for the given heading element.
 *
 * @param {HTMLHeadingElement} heading
 *
 * @return {string} - Unique ID
 */
const getHeadingId = (heading) => {
  const baseId = heading.textContent
    .toLowerCase()
    // Replace non-alphanumeric characters with dashes
    .replace(/[^a-z\d]/g, "-")
    // Replace a sequence of two or more dashes with a single dash
    .replace(/-{2,}/g, "-")
    // Trim leading or trailing dash (there should only ever be one)
    .replace(/^-|-$/g, "");

  let id;
  let suffix = 0;
  do {
    id = baseId;

    // To avoid conflicts with existing IDs on the page, loop and append an
    // incremented suffix until a unique ID is found.
    suffix += 1;
    if (suffix > 1) {
      id += `-${suffix}`;
    }
  } while (document.getElementById(id));

  return id;
};

/**
 * Return a section id/anchor hash without the number sign
 *
 * @return {String} - Id value with the number sign removed
 */
const getSectionId = (value) => {
  let id;

  // Check if value is an event or element and get the cleaned up id
  if (value && value.nodeType === 1) {
    id = value.getAttribute("href").replace("#", "");
  } else {
    id = value.target.hash.replace("#", "");
  }

  return id;
};

/**
 * Scroll smoothly to a section based on the passed in element
 *
 * @param {HTMLElement} el A heading element
 */
const handleScrollToSection = (el) => {
  const inPageNavEl = document.querySelector(`.${IN_PAGE_NAV_CLASS}`);
  const inPageNavScrollOffset =
    inPageNavEl.dataset.scrollOffset || IN_PAGE_NAV_SCROLL_OFFSET;
  const offsetTop = el.getBoundingClientRect().top + window.scrollY;

  window.scroll({
    behavior: "smooth",
    top: offsetTop - inPageNavScrollOffset,
  });

  if (window.location.hash.slice(1) !== el.id) {
    window.history.pushState(null, "", `#${el.id}`);
  }
};

/**
 * Scrolls the page to the section corresponding to the current hash fragment, if one exists.
 */
const scrollToCurrentSection = () => {
  const hashFragment = window.location.hash.slice(1);
  if (hashFragment) {
    const anchorTag = document.getElementById(hashFragment);
    if (anchorTag) {
      handleScrollToSection(anchorTag);
    }
  }
};

/**
 * Check if the number of specified headings meets the minimum required count.
 *
 * @param {Array} sectionHeadings - Array of all visible section headings.
 * @param {Number} minimumHeadingCount - The minimum number of specified headings required.
 * @param {Array} acceptedHeadingLevels - Array of headings considered as valid for the count.
 * @returns {Boolean} - Returns true if the count of specified headings meets the minimum, otherwise false.
 */
const shouldRenderInPageNav = (
  sectionHeadings,
  minimumHeadingCount,
  acceptedHeadingLevels,
) => {
  // Filter headings that are included in the acceptedHeadingLevels
  const validHeadings = sectionHeadings.filter((heading) =>
    acceptedHeadingLevels.includes(heading.tagName.toLowerCase()),
  );
  return validHeadings.length >= minimumHeadingCount;
};

/**
 * Create the in-page navigation component
 *
 * @param {HTMLElement} inPageNavEl The in-page nav element
 */
const createInPageNav = (inPageNavEl) => {
  const inPageNavTitleText = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.titleText || IN_PAGE_NAV_TITLE_TEXT
  }`;
  const inPageNavTitleHeadingLevel = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.titleHeadingLevel || IN_PAGE_NAV_TITLE_HEADING_LEVEL
  }`;
  const inPageNavRootMargin = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.rootMargin || IN_PAGE_NAV_ROOT_MARGIN
  }`;
  const inPageNavThreshold = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.threshold || IN_PAGE_NAV_THRESHOLD
  }`;
  const inPageNavContentSelector = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.mainContentSelector || MAIN_ELEMENT
  }`;
  const inPageNavHeadingSelector = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.headingElements || IN_PAGE_NAV_HEADINGS
  }`;

  const inPageNavMinimumHeadingCount = Sanitizer.escapeHTML`${
    inPageNavEl.dataset.minimumHeadingCount || IN_PAGE_NAV_MINIMUM_HEADING_COUNT
  }`;

  const acceptedHeadingLevels = inPageNavHeadingSelector
    .split(" ")
    .map((h) => h.toLowerCase());

  const sectionHeadings = getVisibleSectionHeadings(
    inPageNavContentSelector,
    inPageNavHeadingSelector,
  );

  if (
    !shouldRenderInPageNav(
      sectionHeadings,
      inPageNavMinimumHeadingCount,
      acceptedHeadingLevels,
    )
  ) {
    return;
  }

  const options = {
    root: null,
    rootMargin: inPageNavRootMargin,
    threshold: [inPageNavThreshold],
  };

  const inPageNav = document.createElement("nav");
  inPageNav.setAttribute("aria-label", inPageNavTitleText);
  inPageNav.classList.add(IN_PAGE_NAV_NAV_CLASS);

  const inPageNavTitle = document.createElement(inPageNavTitleHeadingLevel);
  inPageNavTitle.classList.add(IN_PAGE_NAV_TITLE_CLASS);
  inPageNavTitle.setAttribute("tabindex", "0");
  inPageNavTitle.textContent = inPageNavTitleText;
  inPageNav.appendChild(inPageNavTitle);

  const inPageNavList = document.createElement("ul");
  inPageNavList.classList.add(IN_PAGE_NAV_LIST_CLASS);
  inPageNav.appendChild(inPageNavList);

  sectionHeadings.forEach((el) => {
    const listItem = document.createElement("li");
    const navLinks = document.createElement("a");
    const anchorTag = document.createElement("a");
    const textContentOfLink = el.textContent;
    const tag = el.tagName.toLowerCase();
    const topHeadingLevel = getTopLevelHeading(sectionHeadings);
    const headingId = getHeadingId(el);

    listItem.classList.add(IN_PAGE_NAV_ITEM_CLASS);

    if (tag === topHeadingLevel) {
      listItem.classList.add(IN_PAGE_NAV_PRIMARY_ITEM_CLASS);
    }

    navLinks.setAttribute("href", `#${headingId}`);
    navLinks.setAttribute("class", IN_PAGE_NAV_LINK_CLASS);
    navLinks.textContent = textContentOfLink;

    anchorTag.setAttribute("id", headingId);
    anchorTag.setAttribute("class", IN_PAGE_NAV_ANCHOR_CLASS);
    el.insertAdjacentElement("afterbegin", anchorTag);

    inPageNavList.appendChild(listItem);
    listItem.appendChild(navLinks);
  });

  inPageNavEl.appendChild(inPageNav);

  const anchorTags = getSectionAnchors();
  const observeSections = new window.IntersectionObserver(setActive, options);

  anchorTags.forEach((tag) => {
    observeSections.observe(tag);
  });
};

/**
 * Handle click from link
 *
 * @param {HTMLElement} el An element within the in-page nav component
 */
const handleClickFromLink = (el) => {
  const elementToScrollTo = document.getElementById(el.hash.slice(1));
  handleScrollToSection(elementToScrollTo);
};

/**
 * Handle the enter event from a link within the in-page nav component
 *
 * @param {KeyboardEvent} event An event within the in-page nav component
 */
const handleEnterFromLink = (event) => {
  const id = getSectionId(event);
  const targetAnchor = document.getElementById(id);
  const target = targetAnchor.parentElement;

  if (target) {
    target.setAttribute("tabindex", 0);
    target.focus();
    target.addEventListener(
      "blur",
      once(() => {
        target.setAttribute("tabindex", -1);
      }),
    );
  } else {
    // throw an error?
  }
  handleScrollToSection(targetAnchor);
};

const inPageNavigation = behavior(
  {
    [CLICK]: {
      [`.${IN_PAGE_NAV_LINK_CLASS}`](event) {
        event.preventDefault();
        if (this.disabled) return;
        handleClickFromLink(this);
      },
    },
    keydown: {
      [`.${IN_PAGE_NAV_LINK_CLASS}`]: keymap({
        Enter: handleEnterFromLink,
      }),
    },
  },
  {
    init(root) {
      selectOrMatches(`.${IN_PAGE_NAV_CLASS}`, root).forEach((inPageNavEl) => {
        createInPageNav(inPageNavEl);
        scrollToCurrentSection();
      });
    },
  },
);

module.exports = inPageNavigation;
