const assert = require("assert");
const fs = require("fs");
const path = require("path");
const sinon = require("sinon");
const navigation = require("../../../usa-header/src/index");
const accordion = require("../../../usa-accordion/src/index");

const TEMPLATE = fs.readFileSync(path.join(__dirname, "template.html"));

const EVENTS = {
  escape(el) {
    const escapeKeyEvent = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
    });

    el.dispatchEvent(escapeKeyEvent);
  },
  focusOut(el) {
    const focusOutEvent = new Event("focusout", {
      bubbles: true,
      cancelable: true,
    });

    el.dispatchEvent(focusOutEvent);
  },
};

describe("navigation toggle", () => {
  const { body } = document;

  let sandbox;
  let header;
  let nav;
  let navControl;
  let navPrimary;
  let overlay;
  let closeButton;
  let menuButton;
  let accordionButton;
  let navLink;
  let sectionLink;

  const isVisible = (el) => el.classList.contains("is-visible");

  beforeEach(() => {
    body.innerHTML = TEMPLATE;
    accordion.on();
    navigation.on();
    header = body.querySelector(".usa-header");
    nav = body.querySelector(".usa-nav");
    navControl = body.querySelector(".usa-nav__link");
    navPrimary = body.querySelector(".usa-nav__primary");
    overlay = body.querySelector(".usa-overlay");
    closeButton = body.querySelector(".usa-nav__close");
    menuButton = body.querySelector(".usa-menu-btn");
    accordionButton = nav.querySelector(".usa-accordion__button");
    navLink = nav.querySelector("a");
    sectionLink = nav.querySelector("#section-link");
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    body.innerHTML = "";
    body.className = "";
    navigation.off();
    accordion.off();
    sandbox.restore();
  });

  it("hides a visible nav menu when the body is clicked", () => {
    const navMenu = body.querySelector("#basic-nav-section-one");

    navControl.click();
    assert.strictEqual(navMenu.getAttribute("hidden"), null);
    body.click();
    assert.strictEqual(navMenu.hasAttribute("hidden"), true);
  });

  it("shows the nav when the menu button is clicked", () => {
    menuButton.click();
    assert.strictEqual(isVisible(nav), true);
    assert.strictEqual(isVisible(overlay), true);
  });

  it("hides the nav when the close button is clicked", () => {
    menuButton.click();
    closeButton.click();
    assert.strictEqual(isVisible(nav), false);
    assert.strictEqual(isVisible(overlay), false);
  });

  it("hides the nav when the overlay is clicked", () => {
    menuButton.click();
    overlay.click();
    assert.strictEqual(isVisible(nav), false);
    assert.strictEqual(isVisible(overlay), false);
  });

  it("in mobile: hides the nav when a hash link is clicked", () => {
    menuButton.click();
    sectionLink.click();
    assert.strictEqual(isVisible(nav), false);
  });

  it("focuses the close button when the menu button is clicked", () => {
    menuButton.click();
    assert.strictEqual(document.activeElement, closeButton);
  });

  it("focuses the menu button when the close button is clicked", () => {
    menuButton.click();
    closeButton.click();
    assert.strictEqual(document.activeElement, menuButton);
  });

  it("makes all other page content invisible to screen readers", () => {
    menuButton.click();

    const activeContent = document.querySelectorAll(
      "body > :not([aria-hidden])",
    );

    assert.strictEqual(activeContent.length, 1);
    assert.strictEqual(activeContent[0], header);
  });

  it("collapses nav if needed on window resize", () => {
    menuButton.click();
    sandbox.stub(closeButton, "getBoundingClientRect").returns({ width: 0 });
    window.dispatchEvent(new CustomEvent("resize"));
    assert.strictEqual(isVisible(nav), false);
  });

  it("does not collapse nav if not needed on window resize", () => {
    menuButton.click();
    sandbox.stub(closeButton, "getBoundingClientRect").returns({ width: 100 });
    window.dispatchEvent(new CustomEvent("resize"));
    assert.strictEqual(isVisible(nav), true);
  });

  it("does not show the nav when a nav link is clicked", () => {
    navLink.click();
    assert.strictEqual(isVisible(nav), false);
  });

  it("collapses accordions when a nav link is clicked", () => {
    accordionButton.click();
    navLink.click();
    assert.strictEqual(accordionButton.getAttribute("aria-expanded"), "false");
  });

  it("in desktop: collapses accordions when a section link is clicked", () => {
    accordionButton.click();
    sectionLink.click();
    assert.strictEqual(accordionButton.getAttribute("aria-expanded"), "false");
  });

  it("in mobile: keeps nav open when nav link is clicked", () => {
    menuButton.click();
    assert.strictEqual(isVisible(nav), true);
    navLink.click();
    assert.strictEqual(isVisible(nav), true);
  });

  it("collapses dropdowns when the Escape key is hit", () => {
    accordionButton.click();
    EVENTS.escape(accordionButton);
    assert.strictEqual(accordionButton.getAttribute("aria-expanded"), "false");
  });

  it("hides the nav when the Escape key is hit", () => {
    menuButton.click();
    navControl.focus();
    EVENTS.escape(navControl);
    assert.strictEqual(isVisible(nav), false);
    assert.strictEqual(isVisible(overlay), false);
    assert.strictEqual(document.activeElement, menuButton);
  });

  it("collapses dropdowns when focus leaves nav", () => {
    menuButton.click();
    accordionButton.click();
    assert.strictEqual(accordionButton.getAttribute("aria-expanded"), "true");
    EVENTS.focusOut(navPrimary);
    assert.strictEqual(accordionButton.getAttribute("aria-expanded"), "false");
  });

  describe("off()", () => {
    it("removes event listeners", () => {
      assert.strictEqual(isVisible(nav), false);
      assert.strictEqual(isVisible(overlay), false);

      // remove event listeners, then click the button,
      // and confirm that the nav is still hidden
      navigation.off();
      menuButton.click();
      assert.strictEqual(isVisible(nav), false);
      assert.strictEqual(isVisible(overlay), false);

      // next, re-enable the event listeners, click the button,
      // and confirm that the nav is visible again
      navigation.on();
      menuButton.click();
      assert.strictEqual(isVisible(nav), true);
      assert.strictEqual(isVisible(overlay), true);

      // again, remove the event listeners, click the close button,
      // and confirm that everything is still visible
      navigation.off();
      closeButton.click();
      assert.strictEqual(isVisible(nav), true);
      assert.strictEqual(isVisible(overlay), true);
    });
  });
});
