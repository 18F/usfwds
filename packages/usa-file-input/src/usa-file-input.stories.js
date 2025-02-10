import Component from "./usa-file-input.twig";
import TestComponent from "./test/test-patterns/test-usa-file-input.twig";
import {
  DefaultContent,
  ErrorContent,
  MultipleContent,
  SpecificContent,
  WildcardContent,
} from "./content";

export default {
  title: "Components/Form Inputs/File Input",
  argTypes: {
    disabled_state: {
      name: "Disabled state",
      control: { type: "radio" },
      options: ["none", "disabled", "aria-disabled"],
    },
    error_hint_text: {
      name: "Error message - hint",
      control: { type: "text" },
      defaultValue: "",
    },
    invalid_file_text: {
      name: "Error text - Invalid file type (data-errorMessage)",
      control: { type: "text" },
      defaultValue: "",
    },
  },
};

const Template = (args) => Component(args);
const TestTemplate = (args) => TestComponent(args);

export const Default = Template.bind({});
Default.args = DefaultContent;

export const Error = Template.bind({});
Error.args = ErrorContent;
Error.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];

export const Multiple = Template.bind({});
Multiple.args = MultipleContent;

export const Specific = Template.bind({});
Specific.args = SpecificContent;
Specific.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];

export const Wildcard = Template.bind({});
Wildcard.args = WildcardContent;

export const Disabled = Template.bind({});
Disabled.args = {
  ...DefaultContent,
  disabled_state: "disabled",
};

export const AriaDisabled = Template.bind({});
AriaDisabled.args = {
  ...DefaultContent,
  disabled_state: "aria-disabled",
};

export const TestMultipleInputs = TestTemplate.bind({});
TestMultipleInputs.args = {
  DefaultContent,
  SpecificContent,
};
