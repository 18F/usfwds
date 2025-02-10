import prefix from "./usa-input-prefix.twig";
import suffix from "./usa-input-suffix.twig";

export default {
  title: "Components/Form Inputs/Input Prefix or Suffix",
  argTypes: {
    disabled_state: {
      name: "Disabled State",
      control: "radio",
      options: ["none", "disabled", "aria-disabled"],
    },
    utilities: {
      name: "Input group utility classes",
      control: { type: "text" },
    },
  },
  args: {
    disabled_state: "none",
  },
};

const PrefixTemplate = (args) => prefix(args);
const SuffixTemplate = (args) => suffix(args);

export const Prefix = PrefixTemplate.bind({});
Prefix.decorators = [
  (Story) =>
    `<div class="padding-x-205">
      ${Story()}
    </div>`,
];

export const PrefixDisabled = PrefixTemplate.bind({});
PrefixDisabled.args = {
  disabled_state: "disabled",
};
export const PrefixAriaDisabled = PrefixTemplate.bind({});
PrefixAriaDisabled.args = {
  disabled_state: "aria-disabled",
};

export const Suffix = SuffixTemplate.bind({});
export const SuffixDisabled = SuffixTemplate.bind({});
SuffixDisabled.args = {
  disabled_state: "disabled",
};
export const SuffixAriaDisabled = SuffixTemplate.bind({});
SuffixAriaDisabled.args = {
  disabled_state: "aria-disabled",
};
