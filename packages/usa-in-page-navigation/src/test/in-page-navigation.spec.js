const assert = require("assert");
const fs = require("fs");
const path = require("path");
const sinon = require("sinon");
const behavior = require("../index");

const HIDE_MAX_WIDTH = 639;
const OFFSET_PER_SECTION = 100;
const TEMPLATE = fs.readFileSync(path.join(__dirname, "/template.html"));
const STYLES = fs.readFileSync(
  `${__dirname}/../../../../dist/css/uswds.min.css`,
);
const THE_NAV = ".usa-in-page-nav";
const PRIMARY_CONTENT_SELECTOR =
  ".usa-in-page-nav-container .usa-in-page-nav .usa-in-page-nav__list";

/**
 * Resize the window's width, then dispatch a 'resize' event
 *
 * @param {number} width
 */
function resizeTo(width) {
  if (width !== window.innerWidth) {
    window.innerWidth = width;
    window.dispatchEvent(new window.Event("resize"));
  }
}

const assertHidden = (el, hidden) => {
  assert.strictEqual(
    window.getComputedStyle(el).display === "none",
    hidden,
    `not hidden: ${el.nodeName} (${el.className})`,
  );
};

const tests = [
  { name: "document.body", selector: () => document.body },
  {
    name: "in page nav",
    selector: () => document.querySelector(".usa-in-page-nav"),
  },
];

tests.forEach(({ name, selector: containerSelector }) => {
  describe(`in-page navigation initialized at ${name}`, () => {
    const { body } = document;
    document.head.insertAdjacentHTML("beforeend", `<style>${STYLES}</style>`);

    let theNav;
    let theList;
    let originalOffsetTop;

    before(() => {
      originalOffsetTop = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "offsetTop",
      );
      Object.defineProperty(HTMLElement.prototype, "offsetTop", {
        get() {
          // Since JSDOM doesn't emulate positions, create a fake offset using
          // the heading's index to be used to test scrolling behavior.
          const heading = this.closest("h2,h3");

          let index = 0;
          let sibling = heading;
          while (true) {
            sibling = sibling.previousElementSibling;
            if (sibling) {
              index += 1;
            } else {
              break;
            }
          }

          return index * OFFSET_PER_SECTION;
        },
      });
      const observe = sinon.spy();
      const mockIntersectionObserver = sinon.stub().returns({ observe });
      window.IntersectionObserver = mockIntersectionObserver;
      sinon.stub(window, "scroll");
    });

    beforeEach(() => {
      body.innerHTML = TEMPLATE;

      behavior.on(containerSelector());

      theNav = document.querySelector(THE_NAV);
      theList = document.querySelector(PRIMARY_CONTENT_SELECTOR);

      window.innerWidth = 1024;
    });

    afterEach(() => {
      sinon.resetHistory();
      behavior.off(containerSelector());
      body.innerHTML = "";
      window.location.hash = "";
    });

    after(() => {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetTop",
        originalOffsetTop,
      );
      sinon.restore();
    });

    it("defines a max width", () => {
      assert(typeof HIDE_MAX_WIDTH === "number", "no value defined");
    });

    it("hides at small screens", () => {
      resizeTo(400);
      assertHidden(theNav, true);
    });

    it("show on larger screens", () => {
      resizeTo(400);
      resizeTo(1024);
      assertHidden(theList, false);
    });

    it("assigns id to section headings", () => {
      // Tests that new anchor children are created in the fixture template in
      // the expected locations.
      const ok = [
        "h2 > .usa-anchor#section-1",
        "h2 ~ h3 > .usa-anchor#section-1-1",
        "h2 ~ h3 ~ h3 > .usa-anchor#section-1-2-2",
        "h2 ~ h3 ~ h3 ~ h3 > .usa-anchor#section-1-3",
        "h2 ~ h3 ~ h3 ~ h3 ~ h3 > .usa-anchor[id='1-4-section-1-4']",
      ].every((selector) => document.querySelector(selector));

      assert(ok);
    });

    it("scrolls to section", () => {
      const firstLink = theNav.querySelector("a[href='#section-1']");
      firstLink.click();

      assert.equal(window.scroll.called, true);
    });

    it("updates url when scrolling to section", () => {
      // Activate by click
      const firstLink = theNav.querySelector("a[href='#section-1']");
      firstLink.click();

      assert.equal(window.location.hash, "#section-1");

      // Activate by Enter press
      const secondLink = theNav.querySelector("a[href='#section-1-1']");
      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        key: "Enter",
        keyCode: 13,
      });
      secondLink.dispatchEvent(event);

      assert.equal(window.location.hash, "#section-1-1");
    });

    it("does not scroll to section on initialization", () => {
      assert.equal(window.scroll.called, false);
    });

    it("handles headings starting with a number", () => {
      const firstLink = theNav.querySelector("a[href='#1-4-section-1-4']");
      firstLink.click();

      assert.equal(window.scroll.called, true);
    });

    context("with initial hash URL", () => {
      before(() => {
        window.location.hash = "#section-1";
      });

      it("scrolls to section on initialization", () => {
        assert.equal(window.scroll.called, true);
      });
    });
  });
});
