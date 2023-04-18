import Component from "./usa-input-mask.twig";
import {
  SsnContent,
  PhoneContent,
  ZipContent,
  AlphanumericContent,
} from "./content";

export default {
  title: "Components/Form Inputs/Text Input Mask",
  argTypes: {
    forceCase: {
      name: "Force case",
      control: { type: "radio" },
      options: ["none", "forcelower", "forceupper"],
      table: { disable: true },
    },
  },
};

const Template = (args) => Component(args);

export const SSN = Template.bind({});
SSN.args = SsnContent;

export const Phone = Template.bind({});
Phone.args = PhoneContent;

export const ZIP = Template.bind({});
ZIP.args = ZipContent;

export const Alphanumeric = Template.bind({});
Alphanumeric.args = AlphanumericContent;
Alphanumeric.argTypes = {
  forceCase: {
    table: { disable: false },
  },
};

export const Test = Template.bind({});
Test.args = {
  ...AlphanumericContent,
  test: true,
}
