const keymap = require("../../uswds-core/src/js/utils/keymap");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");
const { prefix: PREFIX } = require("../../uswds-core/src/js/config");
const { CLICK } = require("../../uswds-core/src/js/events");

const COMBO_BOX_CLASS = `${PREFIX}-combo-box`;
const COMBO_BOX_PRISTINE_CLASS = `${COMBO_BOX_CLASS}--pristine`;
const SELECT_CLASS = `${COMBO_BOX_CLASS}__select`;
const INPUT_CLASS = `${COMBO_BOX_CLASS}__input`;
const CLEAR_INPUT_BUTTON_CLASS = `${COMBO_BOX_CLASS}__clear-input`;
const CLEAR_INPUT_BUTTON_WRAPPER_CLASS = `${CLEAR_INPUT_BUTTON_CLASS}__wrapper`;
const INPUT_BUTTON_SEPARATOR_CLASS = `${COMBO_BOX_CLASS}__input-button-separator`;
const TOGGLE_LIST_BUTTON_CLASS = `${COMBO_BOX_CLASS}__toggle-list`;
const TOGGLE_LIST_BUTTON_WRAPPER_CLASS = `${TOGGLE_LIST_BUTTON_CLASS}__wrapper`;
const LIST_CLASS = `${COMBO_BOX_CLASS}__list`;
const LIST_OPTION_CLASS = `${COMBO_BOX_CLASS}__list-option`;
const LIST_OPTION_FOCUSED_CLASS = `${LIST_OPTION_CLASS}--focused`;
const LIST_OPTION_SELECTED_CLASS = `${LIST_OPTION_CLASS}--selected`;
const STATUS_CLASS = `${COMBO_BOX_CLASS}__status`;

const COMBO_BOX = `.${COMBO_BOX_CLASS}`;
const SELECT = `.${SELECT_CLASS}`;
const INPUT = `.${INPUT_CLASS}`;
const CLEAR_INPUT_BUTTON = `.${CLEAR_INPUT_BUTTON_CLASS}`;
const TOGGLE_LIST_BUTTON = `.${TOGGLE_LIST_BUTTON_CLASS}`;
const LIST = `.${LIST_CLASS}`;
const LIST_OPTION = `.${LIST_OPTION_CLASS}`;
const LIST_OPTION_FOCUSED = `.${LIST_OPTION_FOCUSED_CLASS}`;
const LIST_OPTION_SELECTED = `.${LIST_OPTION_SELECTED_CLASS}`;
const STATUS = `.${STATUS_CLASS}`;

const DEFAULT_FILTER = ".*{{query}}.*";

const noop = () => {};

/**
 * set the value of the element and dispatch a change event
 *
 * @param {HTMLInputElement|HTMLSelectElement} el The element to update
 * @param {string} value The new value of the element
 */
const changeElementValue = (el, value = "") => {
  const elementToChange = el;
  elementToChange.value = value;

  const event = new CustomEvent("change", {
    bubbles: true,
    cancelable: true,
    detail: { value },
  });
  elementToChange.dispatchEvent(event);
};

/**
 * The elements within the combo box.
 * @typedef {Object} ComboBoxContext
 * @property {HTMLElement} comboBoxEl
 * @property {HTMLSelectElement} selectEl
 * @property {HTMLInputElement} inputEl
 * @property {HTMLUListElement} listEl
 * @property {HTMLDivElement} statusEl
 * @property {HTMLLIElement} focusedOptionEl
 * @property {HTMLLIElement} selectedOptionEl
 * @property {HTMLButtonElement} toggleListBtnEl
 * @property {HTMLButtonElement} clearInputBtnEl
 * @property {boolean} isPristine
 * @property {boolean} disableFiltering
 */

/**
 * Get an object of elements belonging directly to the given
 * combo box component.
 *
 * @param {HTMLElement} el the element within the combo box
 * @returns {ComboBoxContext} elements
 */
const getComboBoxContext = (el) => {
  const comboBoxEl = el.closest(COMBO_BOX);

  if (!comboBoxEl) {
    throw new Error(`Element is missing outer ${COMBO_BOX}`);
  }

  const selectEl = comboBoxEl.querySelector(SELECT);
  const inputEl = comboBoxEl.querySelector(INPUT);
  const listEl = comboBoxEl.querySelector(LIST);
  const statusEl = comboBoxEl.querySelector(STATUS);
  const focusedOptionEl = comboBoxEl.querySelector(LIST_OPTION_FOCUSED);
  const selectedOptionEl = comboBoxEl.querySelector(LIST_OPTION_SELECTED);
  const toggleListBtnEl = comboBoxEl.querySelector(TOGGLE_LIST_BUTTON);
  const clearInputBtnEl = comboBoxEl.querySelector(CLEAR_INPUT_BUTTON);

  const isPristine = comboBoxEl.classList.contains(COMBO_BOX_PRISTINE_CLASS);
  const disableFiltering = comboBoxEl.dataset.disableFiltering === "true";

  return {
    comboBoxEl,
    selectEl,
    inputEl,
    listEl,
    statusEl,
    focusedOptionEl,
    selectedOptionEl,
    toggleListBtnEl,
    clearInputBtnEl,
    isPristine,
    disableFiltering,
  };
};

/**
 * Disable the combo-box component
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */
const disable = (el) => {
  const { inputEl, toggleListBtnEl, clearInputBtnEl } = getComboBoxContext(el);

  clearInputBtnEl.hidden = true;
  clearInputBtnEl.disabled = true;
  toggleListBtnEl.disabled = true;
  inputEl.disabled = true;
};

/**
 * Check for aria-disabled on initialization
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */
const ariaDisable = (el) => {
  const { inputEl, toggleListBtnEl, clearInputBtnEl } = getComboBoxContext(el);

  clearInputBtnEl.hidden = true;
  clearInputBtnEl.setAttribute("aria-disabled", true);
  toggleListBtnEl.setAttribute("aria-disabled", true);
  inputEl.setAttribute("aria-disabled", true);
};

/**
 * Enable the combo-box component
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */
const enable = (el) => {
  const { inputEl, toggleListBtnEl, clearInputBtnEl } = getComboBoxContext(el);

  clearInputBtnEl.hidden = false;
  clearInputBtnEl.disabled = false;
  toggleListBtnEl.disabled = false;
  inputEl.disabled = false;
};

/**
 * Enhance a select element into a combo box component.
 *
 * @param {HTMLElement} _comboBoxEl The initial element of the combo box component
 */
const enhanceComboBox = (_comboBoxEl) => {
  const comboBoxEl = _comboBoxEl.closest(COMBO_BOX);

  if (comboBoxEl.dataset.enhanced) return;

  const selectEl = comboBoxEl.querySelector("select");

  if (!selectEl) {
    throw new Error(`${COMBO_BOX} is missing inner select`);
  }

  const selectId = selectEl.id;
  const selectLabel = document.querySelector(`label[for="${selectId}"]`);
  const listId = `${selectId}--list`;
  const listIdLabel = `${selectId}-label`;
  const additionalAttributes = [];
  const { defaultValue } = comboBoxEl.dataset;
  const { placeholder } = comboBoxEl.dataset;
  let selectedOption;

  if (placeholder) {
    additionalAttributes.push({ placeholder });
  }

  if (defaultValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];

      if (optionEl.value === defaultValue) {
        selectedOption = optionEl;
        break;
      }
    }
  }

  /**
   * Throw error if combobox is missing a label or label is missing
   * `for` attribute. Otherwise, set the ID to match the <ul> aria-labelledby
   */
  if (!selectLabel || !selectLabel.matches(`label[for="${selectId}"]`)) {
    throw new Error(
      `${COMBO_BOX} for ${selectId} is either missing a label or a "for" attribute`,
    );
  } else {
    selectLabel.setAttribute("id", listIdLabel);
  }

  selectLabel.setAttribute("id", listIdLabel);
  selectEl.setAttribute("aria-hidden", "true");
  selectEl.setAttribute("tabindex", "-1");
  selectEl.classList.add("usa-sr-only", SELECT_CLASS);
  selectEl.id = "";
  selectEl.value = "";

  ["required", "aria-label", "aria-labelledby"].forEach((name) => {
    if (selectEl.hasAttribute(name)) {
      const value = selectEl.getAttribute(name);
      additionalAttributes.push({ [name]: value });
      selectEl.removeAttribute(name);
    }
  });

  // sanitize doesn't like functions in template literals
  const input = document.createElement("input");
  input.setAttribute("id", selectId);
  input.setAttribute("aria-owns", listId);
  input.setAttribute("aria-controls", listId);
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("class", INPUT_CLASS);
  input.setAttribute("type", "text");
  input.setAttribute("role", "combobox");
  additionalAttributes.forEach((attr) =>
    Object.keys(attr).forEach((key) => {
      const value = Sanitizer.escapeHTML`${attr[key]}`;
      input.setAttribute(key, value);
    }),
  );

  comboBoxEl.insertAdjacentElement("beforeend", input);

  comboBoxEl.insertAdjacentHTML(
    "beforeend",
    Sanitizer.escapeHTML`
    <span class="${CLEAR_INPUT_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" class="${CLEAR_INPUT_BUTTON_CLASS}" aria-label="Clear the select contents">&nbsp;</button>
      </span>
      <span class="${INPUT_BUTTON_SEPARATOR_CLASS}">&nbsp;</span>
      <span class="${TOGGLE_LIST_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" tabindex="-1" class="${TOGGLE_LIST_BUTTON_CLASS}" aria-label="Toggle the dropdown list">&nbsp;</button>
      </span>
      <ul
        tabindex="-1"
        id="${listId}"
        class="${LIST_CLASS}"
        role="listbox"
        aria-labelledby="${listIdLabel}"
        hidden>
      </ul>
      <div class="${STATUS_CLASS} usa-sr-only" role="status"></div>`,
  );

  if (selectedOption) {
    const { inputEl } = getComboBoxContext(comboBoxEl);
    changeElementValue(selectEl, selectedOption.value);
    changeElementValue(inputEl, selectedOption.text);
    comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
  }

  if (selectEl.disabled) {
    disable(comboBoxEl);
    selectEl.disabled = false;
  }

  if (selectEl.hasAttribute("aria-disabled")) {
    ariaDisable(comboBoxEl);
    selectEl.removeAttribute("aria-disabled");
  }

  comboBoxEl.dataset.enhanced = "true";
};

/**
 * Manage the focused element within the list options when
 * navigating via keyboard.
 *
 * @param {HTMLElement} el An anchor element within the combo box component
 * @param {HTMLElement} nextEl An element within the combo box component
 * @param {Object} options options
 * @param {boolean} options.skipFocus skip focus of highlighted item
 * @param {boolean} options.preventScroll should skip procedure to scroll to element
 */
const highlightOption = (el, nextEl, { skipFocus, preventScroll } = {}) => {
  const { inputEl, listEl, focusedOptionEl } = getComboBoxContext(el);

  if (focusedOptionEl) {
    focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS);
    focusedOptionEl.setAttribute("tabIndex", "-1");
  }

  if (nextEl) {
    inputEl.setAttribute("aria-activedescendant", nextEl.id);
    nextEl.setAttribute("tabIndex", "0");
    nextEl.classList.add(LIST_OPTION_FOCUSED_CLASS);

    if (!preventScroll) {
      const optionBottom = nextEl.offsetTop + nextEl.offsetHeight;
      const currentBottom = listEl.scrollTop + listEl.offsetHeight;

      if (optionBottom > currentBottom) {
        listEl.scrollTop = optionBottom - listEl.offsetHeight;
      }

      if (nextEl.offsetTop < listEl.scrollTop) {
        listEl.scrollTop = nextEl.offsetTop;
      }
    }

    if (!skipFocus) {
      nextEl.focus({ preventScroll });
    }
  } else {
    inputEl.setAttribute("aria-activedescendant", "");
    inputEl.focus();
  }
};

/**
 * Generate a dynamic regular expression based off of a replaceable and possibly filtered value.
 *
 * @param {string} el An element within the combo box component
 * @param {string} query The value to use in the regular expression
 * @param {object} extras An object of regular expressions to replace and filter the query
 */
const generateDynamicRegExp = (filter, query = "", extras = {}) => {
  const escapeRegExp = (text) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  let find = filter.replace(/{{(.*?)}}/g, (m, $1) => {
    const key = $1.trim();
    const queryFilter = extras[key];
    if (key !== "query" && queryFilter) {
      const matcher = new RegExp(queryFilter, "i");
      const matches = query.match(matcher);

      if (matches) {
        return escapeRegExp(matches[1]);
      }

      return "";
    }
    return escapeRegExp(query);
  });

  find = `^(?:${find})$`;

  return new RegExp(find, "i");
};

/**
 * Display the option list of a combo box component.
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const displayList = (el) => {
  const {
    comboBoxEl,
    selectEl,
    inputEl,
    listEl,
    statusEl,
    isPristine,
    disableFiltering,
  } = getComboBoxContext(el);
  let selectedItemId;
  let firstFoundId;

  const listOptionBaseId = `${listEl.id}--option-`;

  const inputValue = (inputEl.value || "").toLowerCase();
  const filter = comboBoxEl.dataset.filter || DEFAULT_FILTER;
  const regex = generateDynamicRegExp(filter, inputValue, comboBoxEl.dataset);

  let options = [];
  const optionsStartsWith = [];
  const optionsContains = [];
  const optionList = [...selectEl.options];

  /**
   * Builds and sorts options array.
   *
   * Option param is passed through regex test before passing into this function.
   * When filtering is enabled, the array will be sorted by options that start with the query, followed by
   * options that contain the query.
   * When filtering is disabled, all options will be included in the array unsorted.
   *
   * These array items will populate the list that is displayed to the user after a search query is entered.
   * Array attributes are also used to set option IDs and aria-setsize attributes.
   *
   * @param {HTMLOptionElement} option - Option element from select array
   */
  const buildOptionsArray = (option) => {
    if (disableFiltering || isPristine) {
      options.push(option);
      return;
    }

    const matchStartsWith = option.text.toLowerCase().startsWith(inputValue);

    if (matchStartsWith) {
      optionsStartsWith.push(option);
    } else {
      optionsContains.push(option);
    }

    options = [...optionsStartsWith, ...optionsContains];
  };

  /**
   * Compares option text to query using generated regex filter.
   *
   * @param {HTMLOptionElement} option
   * @returns {boolean} - True when option text matches user input query.
   */
  const optionMatchesQuery = (option) => regex.test(option.text);

  /**
   * Logic check to determine if options array needs to be updated.
   *
   * @param {HTMLOptionElement} option
   * @returns {boolean} - True when option has value && if filtering is disabled, combo box has an active selection,
   * there is no inputValue, or if option matches user query
   */
  const arrayNeedsUpdate = (option) =>
    option.value &&
    (disableFiltering ||
      isPristine ||
      !inputValue ||
      optionMatchesQuery(option));

  /**
   * Checks if firstFoundId should be assigned, which is then used to set itemToFocus.
   *
   * @param {HTMLOptionElement} option
   * @return {boolean} - Returns true if filtering is disabled, no firstFoundId is assigned, and the option matches the query.
   */
  const isFirstMatch = (option) =>
    disableFiltering && !firstFoundId && optionMatchesQuery(option);

  /**
   * Checks if isCurrentSelection should be assigned, which is then used to set itemToFocus.
   *
   * @param {HTMLOptionElement} option
   * @returns {boolean} - Returns true if option.value matches selectEl.value.
   */
  const isCurrentSelection = (option) =>
    selectEl.value && option.value === selectEl.value;

  /**
   * Update the array of options that should be displayed on the page.
   * Assign an ID to each displayed option.
   * Identify and assign the option that should receive focus.
   */
  optionList.forEach((option) => {
    if (arrayNeedsUpdate(option)) {
      buildOptionsArray(option);

      const optionId = `${listOptionBaseId}${options.indexOf(option)}`;

      if (isFirstMatch(option)) {
        firstFoundId = optionId;
      }

      if (isCurrentSelection(option)) {
        selectedItemId = optionId;
      }
    }
  });

  const numOptions = options.length;
  const optionHtml = options.map((option, index) => {
    const optionId = `${listOptionBaseId}${index}`;
    const classes = [LIST_OPTION_CLASS];
    let tabindex = "-1";
    let ariaSelected = "false";

    if (optionId === selectedItemId) {
      classes.push(LIST_OPTION_SELECTED_CLASS, LIST_OPTION_FOCUSED_CLASS);
      tabindex = "0";
      ariaSelected = "true";
    }

    if (!selectedItemId && index === 0) {
      classes.push(LIST_OPTION_FOCUSED_CLASS);
      tabindex = "0";
    }

    const li = document.createElement("li");

    li.setAttribute("aria-setsize", options.length);
    li.setAttribute("aria-posinset", index + 1);
    li.setAttribute("aria-selected", ariaSelected);
    li.setAttribute("id", optionId);
    li.setAttribute("class", classes.join(" "));
    li.setAttribute("tabindex", tabindex);
    li.setAttribute("role", "option");
    li.setAttribute("data-value", option.value);
    li.textContent = option.text;

    return li;
  });

  const noResults = document.createElement("li");
  noResults.setAttribute("class", `${LIST_OPTION_CLASS}--no-results`);
  noResults.textContent = "No results found";

  listEl.hidden = false;

  if (numOptions) {
    listEl.innerHTML = "";
    optionHtml.forEach((item) =>
      listEl.insertAdjacentElement("beforeend", item),
    );
  } else {
    listEl.innerHTML = "";
    listEl.insertAdjacentElement("beforeend", noResults);
  }

  inputEl.setAttribute("aria-expanded", "true");

  statusEl.textContent = numOptions
    ? `${numOptions} result${numOptions > 1 ? "s" : ""} available.`
    : "No results.";

  let itemToFocus;

  if (isPristine && selectedItemId) {
    itemToFocus = listEl.querySelector(`#${selectedItemId}`);
  } else if (disableFiltering && firstFoundId) {
    itemToFocus = listEl.querySelector(`#${firstFoundId}`);
  }

  if (itemToFocus) {
    highlightOption(listEl, itemToFocus, {
      skipFocus: true,
    });
  }
};

/**
 * Hide the option list of a combo box component.
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const hideList = (el) => {
  const { inputEl, listEl, statusEl, focusedOptionEl } = getComboBoxContext(el);

  statusEl.innerHTML = "";

  inputEl.setAttribute("aria-expanded", "false");
  inputEl.setAttribute("aria-activedescendant", "");

  if (focusedOptionEl) {
    focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS);
  }

  listEl.scrollTop = 0;
  listEl.hidden = true;
};

/**
 * Select an option list of the combo box component.
 *
 * @param {HTMLElement} listOptionEl The list option being selected
 */
const selectItem = (listOptionEl) => {
  const { comboBoxEl, selectEl, inputEl } = getComboBoxContext(listOptionEl);

  changeElementValue(selectEl, listOptionEl.dataset.value);
  changeElementValue(inputEl, listOptionEl.textContent);
  comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
  hideList(comboBoxEl);
  inputEl.focus();
};

/**
 * Clear the input of the combo box
 *
 * @param {HTMLButtonElement} clearButtonEl The clear input button
 */
const clearInput = (clearButtonEl) => {
  const { comboBoxEl, listEl, selectEl, inputEl } =
    getComboBoxContext(clearButtonEl);
  const listShown = !listEl.hidden;

  if (selectEl.value) changeElementValue(selectEl);
  if (inputEl.value) changeElementValue(inputEl);
  comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS);

  if (listShown) displayList(comboBoxEl);
  inputEl.focus();
};

/**
 * Reset the select based off of currently set select value
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const resetSelection = (el) => {
  const { comboBoxEl, selectEl, inputEl } = getComboBoxContext(el);

  const selectValue = selectEl.value;
  const inputValue = (inputEl.value || "").toLowerCase();

  if (selectValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];
      if (optionEl.value === selectValue) {
        if (inputValue !== optionEl.text) {
          changeElementValue(inputEl, optionEl.text);
        }
        comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
        return;
      }
    }
  }

  if (inputValue) {
    changeElementValue(inputEl);
  }
};

/**
 * Select an option list of the combo box component based off of
 * having a current focused list option or
 * having test that completely matches a list option.
 * Otherwise it clears the input and select.
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const completeSelection = (el) => {
  const { comboBoxEl, selectEl, inputEl, statusEl } = getComboBoxContext(el);

  statusEl.textContent = "";

  const inputValue = (inputEl.value || "").toLowerCase();

  if (inputValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];
      if (optionEl.text.toLowerCase() === inputValue) {
        changeElementValue(selectEl, optionEl.value);
        changeElementValue(inputEl, optionEl.text);
        comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
        return;
      }
    }
  }

  resetSelection(comboBoxEl);
};

/**
 * Handle the escape event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleEscape = (event) => {
  const { comboBoxEl, inputEl } = getComboBoxContext(event.target);

  hideList(comboBoxEl);
  resetSelection(comboBoxEl);
  inputEl.focus();
};

/**
 * Handle the down event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleDownFromInput = (event) => {
  const { comboBoxEl, listEl } = getComboBoxContext(event.target);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  }

  const nextOptionEl =
    listEl.querySelector(LIST_OPTION_FOCUSED) ||
    listEl.querySelector(LIST_OPTION);

  if (nextOptionEl) {
    highlightOption(comboBoxEl, nextOptionEl);
  }

  event.preventDefault();
};

/**
 * Handle the enter event from an input element within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleEnterFromInput = (event) => {
  const { comboBoxEl, listEl } = getComboBoxContext(event.target);
  const listShown = !listEl.hidden;

  completeSelection(comboBoxEl);

  if (listShown) {
    hideList(comboBoxEl);
  }

  event.preventDefault();
};

/**
 * Handle the down event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleDownFromListOption = (event) => {
  const focusedOptionEl = event.target;
  const nextOptionEl = focusedOptionEl.nextSibling;

  if (nextOptionEl) {
    highlightOption(focusedOptionEl, nextOptionEl);
  }

  event.preventDefault();
};

/**
 * Handle the space event from an list option element within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleSpaceFromListOption = (event) => {
  selectItem(event.target);
  event.preventDefault();
};

/**
 * Handle the enter event from list option within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleEnterFromListOption = (event) => {
  selectItem(event.target);
  event.preventDefault();
};

/**
 * Handle the up event from list option within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleUpFromListOption = (event) => {
  const { comboBoxEl, listEl, focusedOptionEl } = getComboBoxContext(
    event.target,
  );
  const nextOptionEl = focusedOptionEl && focusedOptionEl.previousSibling;
  const listShown = !listEl.hidden;

  highlightOption(comboBoxEl, nextOptionEl);

  if (listShown) {
    event.preventDefault();
  }

  if (!nextOptionEl) {
    hideList(comboBoxEl);
  }
};

/**
 * Select list option on the mouseover event.
 *
 * @param {MouseEvent} event The mouseover event
 * @param {HTMLLIElement} listOptionEl An element within the combo box component
 */
const handleMouseover = (listOptionEl) => {
  const isCurrentlyFocused = listOptionEl.classList.contains(
    LIST_OPTION_FOCUSED_CLASS,
  );

  if (isCurrentlyFocused) return;

  highlightOption(listOptionEl, listOptionEl, {
    preventScroll: true,
  });
};

/**
 * Toggle the list when the button is clicked
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const toggleList = (el) => {
  const { comboBoxEl, listEl, inputEl } = getComboBoxContext(el);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  } else {
    hideList(comboBoxEl);
  }

  inputEl.focus();
};

/**
 * Handle click from input
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */
const handleClickFromInput = (el) => {
  const { comboBoxEl, listEl } = getComboBoxContext(el);

  if (listEl.hidden) {
    displayList(comboBoxEl);
  }
};

const comboBox = behavior(
  {
    [CLICK]: {
      [INPUT]() {
        if (this.disabled) return;
        handleClickFromInput(this);
      },
      [TOGGLE_LIST_BUTTON]() {
        if (this.disabled) return;
        toggleList(this);
      },
      [LIST_OPTION]() {
        if (this.disabled) return;
        selectItem(this);
      },
      [CLEAR_INPUT_BUTTON]() {
        if (this.disabled) return;
        clearInput(this);
      },
    },
    focusout: {
      [COMBO_BOX](event) {
        if (!this.contains(event.relatedTarget)) {
          resetSelection(this);
          hideList(this);
        }
      },
    },
    keydown: {
      [COMBO_BOX]: keymap({
        Escape: handleEscape,
      }),
      [INPUT]: keymap({
        Enter: handleEnterFromInput,
        ArrowDown: handleDownFromInput,
        Down: handleDownFromInput,
      }),
      [LIST_OPTION]: keymap({
        ArrowUp: handleUpFromListOption,
        Up: handleUpFromListOption,
        ArrowDown: handleDownFromListOption,
        Down: handleDownFromListOption,
        Enter: handleEnterFromListOption,
        " ": handleSpaceFromListOption,
        "Shift+Tab": noop,
      }),
    },
    input: {
      [INPUT]() {
        const comboBoxEl = this.closest(COMBO_BOX);
        comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS);
        displayList(this);
      },
    },
    mouseover: {
      [LIST_OPTION]() {
        handleMouseover(this);
      },
    },
  },
  {
    init(root) {
      selectOrMatches(COMBO_BOX, root).forEach((comboBoxEl) => {
        enhanceComboBox(comboBoxEl);
      });
    },
    getComboBoxContext,
    enhanceComboBox,
    generateDynamicRegExp,
    disable,
    enable,
    displayList,
    hideList,
    COMBO_BOX_CLASS,
  },
);

module.exports = comboBox;
