import Component from "./usa-character-count.twig";
import TestNoLabelComponent from "./test/test-patterns/test-usa-character-count--no-label.twig";
import TestNoFormGroupComponent from "./test/test-patterns/test-usa-character-count--no-form-group.twig";

export default {
  title: "Components/Form Inputs/Character Count",
  argTypes: {
    disabled_state: {
      name: "Disabled state",
      control: { type: "radio" },
      options: ["none", "disabled", "aria-disabled"],
    },
  },
};

const Template = (args) => Component(args);
const TestNoLabelTemplate = (args) => TestNoLabelComponent(args);
const TestNoFromGroupTemplate = (args) => TestNoFormGroupComponent(args);

export const CharacterCount = Template.bind({});
CharacterCount.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];

export const Disabled = Template.bind({});
Disabled.args = {
  disabled_state: "disabled",
};
export const AriaDisabled = Template.bind({});
AriaDisabled.args = {
  disabled_state: "aria-disabled",
};

// Disabling a11y tests from `npm run test:a11y` because we're demo'ing the failure intentionally.
export const TestNoLabel = TestNoLabelTemplate.bind({});
TestNoLabel.parameters = {
  axe: {
    mode: "off",
  },
};

TestNoLabel.argTypes = {
  disabled_state: {
    table: { disable: true },
  },
};

TestNoLabel.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];

export const TestNoFormGroup = TestNoFromGroupTemplate.bind({});
TestNoFormGroup.parameters = {
  axe: {
    mode: "off",
  },
};
TestNoFormGroup.argTypes = {
  disabled_state: {
    table: { disable: true },
  },
};
TestNoFormGroup.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];
