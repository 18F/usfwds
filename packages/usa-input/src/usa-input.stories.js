import Component from "./usa-input.twig";
import Showcase from "./usa-input--showcase.twig";

export default {
  title: "Components/Form Inputs/Text Input",
  argTypes: {
    state: {
      name: "State",
      control: "radio",
      options: [
        "default",
        "focus",
        "error",
        "success",
        "disabled",
        "aria-disabled",
      ],
      defaultValue: "default",
    },
    utilities: {
      name: "Input/textarea utility classes",
      control: { type: "text" },
    },
  },
};

const Template = (args) => Component(args);
const ShowcaseTemplate = (args) => Showcase(args);

export const Input = Template.bind({});
Input.args = {
  state: "default",
};
Input.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];

export const Disabled = Template.bind({});
Disabled.args = {
  state: "disabled",
};

export const AriaDisabled = Template.bind({});
AriaDisabled.args = {
  state: "aria-disabled",
};

export const Error = Template.bind({});
Error.args = {
  state: "error",
};
Error.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];

export const StateShowcase = ShowcaseTemplate.bind({});
StateShowcase.argTypes = {
  state: {
    table: { disable: true },
  },
};
StateShowcase.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];
