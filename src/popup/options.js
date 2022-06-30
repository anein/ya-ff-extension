'use strict';

// key name for storing and retreving data from the local storage
const OPTIONS_KEY = 'options';

// default option names and values
let options = {
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

function onDataLoaded(data) {
  if (Object.entries(data).length !== 0) {
    options = data;
  }

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
  return (state) ? '<i class="checkmark"></i>' : '<i class="checkmark-no"></i>';
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

browser.storage.local.get(OPTIONS_KEY).then(onDataLoaded, onError);
