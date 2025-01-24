import Component from "./usa-skipnav.twig";
import { DefaultContent, FocusContent } from "./content";

export default {
  title: "Components/Skipnav",
};

const Template = (args) => Component(args);

export const Default = Template.bind({});
Default.args = DefaultContent;

export const Focus = Template.bind({});
Focus.args = FocusContent;
