"use strict";

/**
 * Builds the popup page based on the given options and sets listeners for changing state.
 *
 * @param options
 */
function onDataLoaded(options) {
  const container = document.querySelector(".container");

  // Stores all elements of available options.
  let optionsElements = "";

  // loop over options and create elements for the popup menu
  options.forEach((value, index) => {
    const { name, state, items = null } = { ...value };

    if (items) {
      optionsElements += createGroupElement(value);
    } else {
      optionsElements += createOptionElement(name, state, "");
    }
  });

  //   if () {
  //     let stateElement =
  //       index === 0 ? createCheckmark(state) : createCheckbox(name, state);
  //   }
  //   optionsElements += createOptionElement(name, state, stateElement);
  // });

  container.innerHTML = optionsElements;

  setInputLinters();
}

function createGroupElement(item) {
  const { name, items } = { ...item };
  let elements = "";

  items.forEach((el) => {
    elements += createOptionElement(el.name, el.state, "");
  });

  return `
    <section class="options-group">
        <h5 class="title">${browser.i18n.getMessage(name + "_title")}</h5>
        <section>${elements}</section>
    </section>
  `;
}

/**
 * Composites html elements of option.
 *
 * @param {string} name - option name
 * @param {boolean} state - option state
 * @param {string} stateElement - customized state element for the state column
 */
function createOptionElement(name, state, stateElement) {
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
      <div class="state">${createCheckbox(name, state)}</div>
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
 *
 * @returns {string} A checkbox element
 */
function createCheckbox(name, checked) {
  return `
     <label class="switch">
        <input type="checkbox" ${checked ? "checked" : ""} name="${name}">
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
      // console.log(event.target.checked, event.target.name);
      saveOptions(event.target.name, event.target.checked);
    });
  });
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

    attr ? item.setAttribute(attr, message) : (item.textContent = message);
  });
}

init();
