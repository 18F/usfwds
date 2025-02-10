const keymap = require("../../uswds-core/src/js/utils/keymap");
const behavior = require("../../uswds-core/src/js/utils/behavior");

const ANCHOR_BUTTON = `a[class*="usa-button"]`;

const toggleButton = (event) => {
  event.preventDefault();
  event.target.click();
};

const anchorButton = behavior({
  keydown: {
    [ANCHOR_BUTTON]: keymap({
      " ": toggleButton,
    }),
  },
});

module.exports = anchorButton;
