// Tooltips
const keymap = require("receptor/keymap");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");
const isElementInViewport = require("../../uswds-core/src/js/utils/is-in-viewport");

const BODY = "body";
const TOOLTIP = `.${PREFIX}-tooltip`;
const TOOLTIP_TRIGGER = `.${PREFIX}-tooltip__trigger`;
const TOOLTIP_TRIGGER_CLASS = `${PREFIX}-tooltip__trigger`;
const TOOLTIP_CLASS = `${PREFIX}-tooltip`;
const TOOLTIP_BODY_CLASS = `${PREFIX}-tooltip__body`;
const SET_CLASS = "is-set";
const VISIBLE_CLASS = "is-visible";
const TRIANGLE_SIZE = 5;
const ADJUST_WIDTH_CLASS = `${PREFIX}-tooltip__body--wrap`;

/**
 *
 * @param {DOMElement} trigger - The tooltip trigger
 * @returns {object} Elements for initialized tooltip; includes trigger, wrapper, and body
 */
const getTooltipElements = (trigger) => {
  const wrapper = trigger.parentNode;
  const body = wrapper.querySelector(`.${TOOLTIP_BODY_CLASS}`);

  return { trigger, wrapper, body };
};

/**
 * Shows the tooltip
 * @param {HTMLElement} tooltipTrigger - the element that initializes the tooltip
 */
const showToolTip = (tooltipBody, tooltipTrigger, position) => {
  tooltipBody.setAttribute("aria-hidden", "false");

  // This sets up the tooltip body. The opacity is 0, but
  // we can begin running the calculations below.
  tooltipBody.classList.add(SET_CLASS);

  /**
   * Position the tooltip body when the trigger is hovered
   * Removes old positioning classnames and reapplies. This allows
   * positioning to change in case the user resizes browser or DOM manipulation
   * causes tooltip to get clipped from viewport
   *
   * @param {string} setPos - can be "top", "bottom", "right", "left"
   */
  const setPositionClass = (setPos) => {
    tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--top`);
    tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--bottom`);
    tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--right`);
    tooltipBody.classList.remove(`${TOOLTIP_BODY_CLASS}--left`);
    tooltipBody.classList.add(`${TOOLTIP_BODY_CLASS}--${setPos}`);
  };

  /**
   * Removes old positioning styles. This allows
   * re-positioning to change without inheriting other
   * dynamic styles
   *
   * @param {HTMLElement} e - this is the tooltip body
   */
  const resetPositionStyles = (e) => {
    // we don't override anything in the stylesheet when finding alt positions
    e.style.top = null;
    e.style.bottom = null;
    e.style.right = null;
    e.style.left = null;
    e.style.margin = null;
  };

  /**
   * get margin offset calculations
   *
   * @param {HTMLElement} target - this is the tooltip body
   * @param {String} propertyValue - this is the tooltip body
   */

  const offsetMargin = (target, propertyValue) =>
    parseInt(
      window.getComputedStyle(target).getPropertyValue(propertyValue),
      10,
    );

  // offsetLeft = the left position, and margin of the element, the left
  // padding, scrollbar and border of the offsetParent element
  // offsetWidth = The offsetWidth property returns the viewable width of an
  // element in pixels, including padding, border and scrollbar, but not
  // the margin.

  /**
   * Calculate margin offset
   * tooltip trigger margin(position) offset + tooltipBody offsetWidth
   * @param {String} marginPosition
   * @param {Number} tooltipBodyOffset
   * @param {HTMLElement} trigger
   */
  const calculateMarginOffset = (
    marginPosition,
    tooltipBodyOffset,
    trigger,
  ) => {
    const offset =
      offsetMargin(trigger, `margin-${marginPosition}`) > 0
        ? tooltipBodyOffset - offsetMargin(trigger, `margin-${marginPosition}`)
        : tooltipBodyOffset;

    return offset;
  };

  /**
   * Positions tooltip at the top
   * @param {HTMLElement} e - this is the tooltip body
   */
  const positionTop = (e) => {
    resetPositionStyles(e); // ensures we start from the same point
    // get details on the elements object with

    const topMargin = calculateMarginOffset(
      "top",
      e.offsetHeight,
      tooltipTrigger,
    );

    const leftMargin = calculateMarginOffset(
      "left",
      e.offsetWidth,
      tooltipTrigger,
    );

    setPositionClass("top");
    e.style.left = `50%`; // center the element
    e.style.top = `-${TRIANGLE_SIZE}px`; // consider the pseudo element
    // apply our margins based on the offset
    e.style.margin = `-${topMargin}px 0 0 -${leftMargin / 2}px`;
  };

  /**
   * Positions tooltip at the bottom
   * @param {HTMLElement} e - this is the tooltip body
   */
  const positionBottom = (e) => {
    resetPositionStyles(e);

    const leftMargin = calculateMarginOffset(
      "left",
      e.offsetWidth,
      tooltipTrigger,
    );

    setPositionClass("bottom");
    e.style.left = `50%`;
    e.style.margin = `${TRIANGLE_SIZE}px 0 0 -${leftMargin / 2}px`;
  };

  /**
   * Positions tooltip at the right
   * @param {HTMLElement} e - this is the tooltip body
   */
  const positionRight = (e) => {
    resetPositionStyles(e);

    const topMargin = calculateMarginOffset(
      "top",
      e.offsetHeight,
      tooltipTrigger,
    );

    setPositionClass("right");
    e.style.top = `50%`;
    e.style.left = `${
      tooltipTrigger.offsetLeft + tooltipTrigger.offsetWidth + TRIANGLE_SIZE
    }px`;
    e.style.margin = `-${topMargin / 2}px 0 0 0`;
  };

  /**
   * Positions tooltip at the right
   * @param {HTMLElement} e - this is the tooltip body
   */
  const positionLeft = (e) => {
    resetPositionStyles(e);

    const topMargin = calculateMarginOffset(
      "top",
      e.offsetHeight,
      tooltipTrigger,
    );

    // we have to check for some utility margins
    const leftMargin = calculateMarginOffset(
      "left",
      tooltipTrigger.offsetLeft > e.offsetWidth
        ? tooltipTrigger.offsetLeft - e.offsetWidth
        : e.offsetWidth,
      tooltipTrigger,
    );

    setPositionClass("left");
    e.style.top = `50%`;
    e.style.left = `-${TRIANGLE_SIZE}px`;
    e.style.margin = `-${topMargin / 2}px 0 0 ${
      tooltipTrigger.offsetLeft > e.offsetWidth ? leftMargin : -leftMargin
    }px`; // adjust the margin
  };

  /**
   * We try to set the position based on the
   * original intention, but make adjustments
   * if the element is clipped out of the viewport
   * we constrain the width only as a last resort
   * @param {HTMLElement} element(alias tooltipBody)
   * @param {Number} attempt (--flag)
   */

  const maxAttempts = 2;

  function findBestPosition(element, attempt = 1) {
    // create array of optional positions
    const positions = [
      positionTop,
      positionBottom,
      positionRight,
      positionLeft,
    ];

    let hasVisiblePosition = false;

    // we take a recursive approach
    function tryPositions(i) {
      if (i < positions.length) {
        const pos = positions[i];
        pos(element);

        if (!isElementInViewport(element)) {
          // eslint-disable-next-line no-param-reassign
          tryPositions((i += 1));
        } else {
          hasVisiblePosition = true;
        }
      }
    }

    tryPositions(0);
    // if we can't find a position we compress it and try again
    if (!hasVisiblePosition) {
      element.classList.add(ADJUST_WIDTH_CLASS);
      if (attempt <= maxAttempts) {
        // eslint-disable-next-line no-param-reassign
        findBestPosition(element, (attempt += 1));
      }
    }
  }

  switch (position) {
    case "top":
      positionTop(tooltipBody);
      if (!isElementInViewport(tooltipBody)) {
        findBestPosition(tooltipBody);
      }
      break;
    case "bottom":
      positionBottom(tooltipBody);
      if (!isElementInViewport(tooltipBody)) {
        findBestPosition(tooltipBody);
      }
      break;
    case "right":
      positionRight(tooltipBody);
      if (!isElementInViewport(tooltipBody)) {
        findBestPosition(tooltipBody);
      }
      break;
    case "left":
      positionLeft(tooltipBody);
      if (!isElementInViewport(tooltipBody)) {
        findBestPosition(tooltipBody);
      }
      break;

    default:
      // skip default case
      break;
  }

  /**
   * Actually show the tooltip. The VISIBLE_CLASS
   * will change the opacity to 1
   */
  setTimeout(() => {
    tooltipBody.classList.add(VISIBLE_CLASS);
  }, 20);
};

/**
 * Removes all the properties to show and position the tooltip,
 * and resets the tooltip position to the original intention
 * in case the window is resized or the element is moved through
 * DOM manipulation.
 * @param {HTMLElement} tooltipBody - The body of the tooltip
 */
const hideToolTip = (tooltipBody) => {
  tooltipBody.classList.remove(VISIBLE_CLASS);
  tooltipBody.classList.remove(SET_CLASS);
  tooltipBody.classList.remove(ADJUST_WIDTH_CLASS);
  tooltipBody.setAttribute("aria-hidden", "true");
};

/**
 * Setup the tooltip component
 * @param {HTMLElement} tooltipTrigger The element that creates the tooltip
 */
const setUpAttributes = (tooltipTrigger) => {
  const tooltipID = `tooltip-${Math.floor(Math.random() * 900000) + 100000}`;
  const tooltipContent = tooltipTrigger.getAttribute("title");
  const wrapper = document.createElement("span");
  const tooltipBody = document.createElement("span");
  const additionalClasses = tooltipTrigger.getAttribute("data-classes");
  let position = tooltipTrigger.getAttribute("data-position");

  // Apply default position if not set as attribute
  if (!position) {
    position = "top";
    tooltipTrigger.setAttribute("data-position", position);
  }

  // Set up tooltip attributes
  tooltipTrigger.setAttribute("aria-describedby", tooltipID);
  tooltipTrigger.setAttribute("tabindex", "0");
  tooltipTrigger.removeAttribute("title");
  tooltipTrigger.classList.remove(TOOLTIP_CLASS);
  tooltipTrigger.classList.add(TOOLTIP_TRIGGER_CLASS);

  // insert wrapper before el in the DOM tree
  tooltipTrigger.parentNode.insertBefore(wrapper, tooltipTrigger);

  // set up the wrapper
  wrapper.appendChild(tooltipTrigger);
  wrapper.classList.add(TOOLTIP_CLASS);
  wrapper.appendChild(tooltipBody);

  // Apply additional class names to wrapper element
  if (additionalClasses) {
    const classesArray = additionalClasses.split(" ");
    classesArray.forEach((classname) => wrapper.classList.add(classname));
  }

  // set up the tooltip body
  tooltipBody.classList.add(TOOLTIP_BODY_CLASS);
  tooltipBody.setAttribute("id", tooltipID);
  tooltipBody.setAttribute("role", "tooltip");
  tooltipBody.setAttribute("aria-hidden", "true");

  // place the text in the tooltip
  tooltipBody.textContent = tooltipContent;

  return { tooltipBody, position, tooltipContent, wrapper };
};

/**
 * Hide all active tooltips when escape key is pressed.
 */

const handleEscape = () => {
  const activeTooltips = selectOrMatches(`.${TOOLTIP_BODY_CLASS}.${SET_CLASS}`);

  if (!activeTooltips) {
    return;
  }

  activeTooltips.forEach((activeTooltip) => hideToolTip(activeTooltip));
};

// Setup our function to run on various events
const tooltip = behavior(
  {
    "mouseover focusin": {
      [TOOLTIP](e) {
        const trigger = e.target;

        // Initialize tooltip if it hasn't already
        if (trigger.hasAttribute("title")) {
          setUpAttributes(trigger);
        }
      },
      [TOOLTIP_TRIGGER](e) {
        const { trigger, body } = getTooltipElements(e.target);

        showToolTip(body, trigger, trigger.dataset.position);
      },
    },
    focusout: {
      [TOOLTIP_TRIGGER](e) {
        const { body } = getTooltipElements(e.target);

        hideToolTip(body);
      },
    },
    keydown: {
      [BODY]: keymap({ Escape: handleEscape }),
    },
  },
  {
    init(root) {
      selectOrMatches(TOOLTIP, root).forEach((tooltipTrigger) => {
        setUpAttributes(tooltipTrigger);

        const { body, wrapper } = getTooltipElements(tooltipTrigger);
        wrapper.addEventListener("mouseleave", () => hideToolTip(body));
      });
    },
    teardown(root) {
      selectOrMatches(TOOLTIP, root).forEach((tooltipWrapper) => {
        tooltipWrapper.removeEventListener("mouseleave", hideToolTip);
      });
    },
    setup: setUpAttributes,
    getTooltipElements,
    show: showToolTip,
    hide: hideToolTip,
  },
);

module.exports = tooltip;
