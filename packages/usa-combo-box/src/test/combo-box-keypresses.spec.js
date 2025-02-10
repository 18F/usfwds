const fs = require("fs");
const path = require("path");
const assert = require("assert");
const ComboBox = require("../index");
const EVENTS = require("./events");

const TEMPLATE = fs.readFileSync(
  path.join(__dirname, "/combo-box-keypresses.template.html")
);

const comboBoxSelector = () => document.querySelector(".usa-combo-box");

const tests = [
  { name: "document.body", selector: () => document.body },
  { name: "combo box", selector: comboBoxSelector },
];

tests.forEach(({ name, selector: containerSelector }) => {
  describe(`Combo box initialized at ${name}`, () => {
    describe("combo box component - keypresses", () => {
      const { body } = document;

      let root;
      let comboBox;
      let input;
      let select;
      let list;

      const highlightedOption = () =>
        list.querySelector(".usa-combo-box__list-option--focused");

      const assertHighlighted = (text, message) => {
        assert.strictEqual(highlightedOption().textContent, text, message);
      };

      beforeEach(() => {
        body.innerHTML = TEMPLATE;
        root = containerSelector();
        ComboBox.on(root);
        comboBox = comboBoxSelector();
        input = root.querySelector(".usa-combo-box__input");
        select = root.querySelector(".usa-combo-box__select");
        list = root.querySelector(".usa-combo-box__list");

        EVENTS.click(input);
        assert.ok(!list.hidden, "should show the option list");
        assertHighlighted("Blackberry", "should highlight Blackberry");
        EVENTS.keydownArrowDown(input);
        assertHighlighted("Blackberry", "should highlight Blackberry");
      });

      afterEach(() => {
        ComboBox.off(root);
        body.textContent = "";
      });

      it("should highlight the next option when down arrow is pressed", () => {
        EVENTS.keydownArrowDown(highlightedOption());
        assertHighlighted("Blood orange", "should highlight next item");
      });

      it("should highlight the previous option when up arrow is pressed", () => {
        EVENTS.keydownArrowUp(highlightedOption());
        assertHighlighted("Banana", "should highlight previous item");
      });

      it("should highlight the top option when the home key is pressed", () => {
        EVENTS.keydownHome(highlightedOption());
        assertHighlighted("Apple", "should highlight top option");
      });

      it("should highlight the top option when the page up key is pressed", () => {
        EVENTS.keydownPageUp(highlightedOption());
        assertHighlighted("Apple", "should highlight top option");
      });

      it("should highlight the bottom option when the end key is pressed", () => {
        EVENTS.keydownEnd(highlightedOption());
        assertHighlighted("Yuzu", "should highlight bottom option");
      });

      it("should highlight the bottom option when the page down key is pressed", () => {
        EVENTS.keydownPageDown(highlightedOption());
        assertHighlighted("Yuzu", "should highlight bottom option");
      });
    });
  });
});
