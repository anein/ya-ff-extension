"use strict";

/**
 * Builds the popup page based on the given options and sets listeners for changing state.
 *
 * @param {[Option]} options - a list of options
 */
function onDataLoaded(options) {
  const container = document.querySelector(".container");

  // Stores all elements of available options.
  let optionsElements = "";

  // loop over options and create elements for the popup menu
  options.forEach((value) => {
    const { items = null } = { ...value };

    if (items) {
      optionsElements += createGroupElement(value);
    } else {
      optionsElements += createOptionElement(value);
    }
  });

  container.innerHTML = optionsElements;

  options.forEach((item) => {
    if ("handler" in item && item.handler === "disable-all") {
      disableOrEnableCheckboxes(item.name, item.state);
    }
  });

  setInputLinters();
}

function createGroupElement(item) {
  const { items } = { ...item };
  let elements = "";

  items.forEach((el) => {
    elements += createOptionElement(el);
  });

  return `
    <section class="options-group">
        <section>${elements}</section>
    </section>
  `;
}

/**
 * Composites html elements of option.
 *
 * @param {string} item.name - option name
 * @param {boolean} item.state - option state
 * @param {string} [item.handler] - an optional handler for additional element processing
 */
function createOptionElement(item) {
  const { name, state, element = null, handler = null } = item;
  //
  const title = browser.i18n.getMessage(name + "_title");
  const description = browser.i18n.getMessage(name + "_description");

  return `
  <section class="option-container ${name}  ${state ? "active" : ""}">

    <div class="option-item">
      <div>
          <div class="title">${title}</div>
          ${description ? `<div class="tip">${description}</div>` : ""}
      </div>
      <div class="state">${
        element === "checkmark"
          ? createCheckmark(state)
          : createCheckbox(name, state, handler)
      }</div>
    </div>

  </section>
  `;
}

/**
 * Creates the 'checkmark' icon  if state is true, otherwise the `close` icon.
 *
 * @param {boolean} state
 *
 * @returns {string} An "i" element with the specific icon class.
 *
 */
function createCheckmark(state) {
  return state ? '<i class="checkmark"></i>' : '<i class="checkmark-sad"></i>';
}

/**
 * Creates a checkbox element.
 *
 * @param {string} name - checkbox name
 * @param {boolean} checked - checkbox state
 * @param {string | null} handler - additional handler
 *
 * @returns {string} A checkbox element
 */
function createCheckbox(name, checked, handler) {
  return `
     <label class="switch">
        <input type="checkbox" ${checked ? "checked" : ""}
        name="${name}" ${handler ? `data-handler="${handler}"` : ""}>
        <span class="slider"></span>
    </label>`;
}

/**
 * Sets input listeners on checkboxes, and save it to the storage on a state change.
 */
function setInputLinters() {
  const container = document.querySelector(".container");

  const inputs = container.querySelectorAll("input[type='checkbox']");

  inputs.forEach((element) => {
    element.addEventListener("change", (event) => {
      const name = event.target.name;
      const state = event.target.checked;
      // console.log(event.target.checked, event.target.name);
      if (event.target.dataset && "handler" in event.target.dataset) {
        switch (event.target.dataset.handler) {
          case "disable-all":
            disableOrEnableCheckboxes(name, state);
            break;
          default:
            break;
        }
      }

      saveOptions(name, state);
    });
  });
}

/**
 * Changes the state of checkbox elements.
 *
 * @param {string} name - an element name to avoid disabling.
 * @param {boolean} disable - a disable flag.
 */
function disableOrEnableCheckboxes(name, disable) {
  //
  const container = document.querySelector(".container");
  const inputs = container.querySelectorAll("input[type='checkbox']");

  if (disable) {
    container.classList.add("disable");
    inputs.forEach((item) => {
      if (item.name !== name) {
        item.disabled = true;
      }
    });
  } else {
    container.classList.remove("disable");
    inputs.forEach((item) => {
      item.disabled = false;
    });
  }
}

/**
 * Saves an option to the storage and update a page view.
 *
 * @see {module:background.saveOptions}
 * @see {module:background.registerCSSAndScripts}
 *
 * @param {string} name - option name
 * @param {boolean} value - option state
 */
async function saveOptions(name, value) {
  try {
    const options = await browser.runtime.sendMessage({
      type: "setOptions",
      name,
      value,
    });

    if (typeof options === "object") {
      browser.runtime
        .sendMessage({
          type: "updateOptions",
          options,
        })
        .catch(() => null);
    }
  } catch (error) {
    //
  }
}

/**
 * Initializes the popup page.
 *
 * @see {module:background.getOptions}
 */
async function init() {
  try {
    const data = await browser.runtime.sendMessage({ type: "getOptions" });
    onDataLoaded(data);
  } catch (error) {
    //
  }

  // translate html
  document.querySelectorAll("[data-i18n]").forEach((item) => {
    const [value, attr = null] = item.dataset.i18n.split("|");
    const message = browser.i18n.getMessage(value);

    if (attr) {
      item.setAttribute(attr, message);
    } else {
      item.textContent = message;
    }
  });
}

init();
