"use strict";

// key name for storing and retreving data from the local storage
const options_key = 'options';

// default option names and values
let options = {
  ya_search: true,
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

  const container = document.querySelector(".container");
  let content = "";

  for (const [index, [name, state]] of Object.entries(Object.entries(options))) {
    let stateContent = ""

    if (~~index === 0) {
      stateContent = createCheckmark(state)
    } else {
      stateContent = createCheckbox(name, state)
    }

    content += createOptionElement(name, stateContent);
  }

  container.innerHTML = content;
}

/**
 *
 * @param {string} name - option name
 * @param {boolean} state - option state
 */
function createOptionElement(name, state) {
  //
  const title = browser.i18n.getMessage(name + "_title");
  const description = browser.i18n.getMessage(name + "_description");

  return `
  <section class="option-container">
    <div class="option-item">
      <div>
          <div class="title">${title}</div>
          <div class="tip">
          ${description}
        </div>
      </div>
      <div class="state">${state} </div>
    </div>

  </section>
  `

}

function createCheckmark(state) {
  return (state) ? `<i class="checkmark"></i>` : `<i class="checkmark-no"></i>`
}

function createCheckbox(name, state) {
  return `
     <label class="switch">
        <input type="checkbox" ${(state) ? "checked" : ""} name="${name}_checkbox">
        <span class="slider"></span>
    </label>`
}


browser.storage.local.get(options_key).then(onDataLoaded, onError)
