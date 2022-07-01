'use strict';

// key name for storing and retreving data from the local storage
const OPTIONS_STORAGE_KEY = 'options';

// default option names and values
const DEFAULT_OPTIONS = {
  ya_search: false,
  ya_fonts: false,
  ya_font_size: false,
  ya_side_panel: false
};

/**
 * Shows an error in the console.
 *
 * @param {any} error - an error message.
 */
function onError(error) {
  console.log(error);
}

function onDataLoaded(options) {
  const container = document.querySelector('.container');

  // Stores all elements of available options.
  let optionsElements = '';

  // loop over options and create elements for the popup menu
  Object.entries(options).forEach((value, index) => {
    const [name, state] = [...value];

    let stateElement = (index === 0) ? createCheckmark(state) : createCheckbox(name, state);
    optionsElements += createOptionElement(name, state, stateElement);
  });

  container.innerHTML = optionsElements;
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
  const title = browser.i18n.getMessage(name + '_title');
  const description = browser.i18n.getMessage(name + '_description');

  return `
  <section class="option-container ${state ? 'active' : ''}">
    <div class="option-item">
      <div>
          <div class="title">${title}</div>
          <div class="tip">${description}</div>
      </div>
      <div class="state">${stateElement}</div>
    </div>

  </section>
  `;
}

/**
 * Creates the 'checkmark' icon  if state is true, otherwise the `close` icon.
 *
 * @param {boolean} state
 *
 * @returns {string} A "i" element with the specific icon class.
 *
 */
function createCheckmark(state) {
  return (state) ? '<i class="checkmark"></i>' : '<i class="checkmark-sad"></i>';
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
        <input type="checkbox" ${(checked) ? 'checked' : ''} name="${name}_checkbox">
        <span class="slider"></span>
    </label>`;
}

// load settings from the storage
browser.storage.local.get(OPTIONS_STORAGE_KEY).then((data) => {
  // checking existance of options in the local storage
  const options = Object.entries(data).length === 0 ? DEFAULT_OPTIONS : data.options;

  // getting search engine name
  const searchEngineName = browser.runtime.getManifest()
    .chrome_settings_overrides
    .search_provider
    .name;

  // checking if the engine sets as default, then draw popup.
  browser.search.get().then((results) => {
    let isDefaultEngine = !!(results.find((elem) => {
      return (elem.name === searchEngineName && elem.isDefault);
    }));

    options.ya_search = isDefaultEngine;

    onDataLoaded(options);
  });

  // onDataLoaded(data);
}, onError);
