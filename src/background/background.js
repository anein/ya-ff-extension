"use strict";

/**
 * @module background
 */

const DEFAULT_OPTIONS = [
  {
    id: 0,
    name: "ya_search",
    state: false,
  },
  {
    id: 1,
    name: "ya_zen",
    state: false,
    disable: "all",
  },
  {
    id: 2,
    name: "ya_group_fonts",
    state: true,
    items: [
      {
        id: 0,
        name: "ya_fonts",
        state: false,
      },
      {
        id: 1,
        name: "ya_font_size",
        state: false,
      },
    ],
  },
  {
    id: 3,
    name: "ya_group_panels",
    state: true,
    items: [
      {
        id: 0,
        name: "ya_side_panel",
        state: false,
      },
    ],
  },
];

const urlMatches = browser.runtime.getManifest().content_scripts[0].matches;

/**
 * Registers CSS and Script files based on options, set on the option base,
 * or using the default options.
 *
 */
async function registerCSSAndScripts() {
  let options = await getOptions();
  let tabIds;

  try {
    tabIds = await browser.tabs.query({
      url: urlMatches,
    });
  } catch (e) {
    return new Error(e);
  }

  let optionsInactiveIds = Object.keys(options).filter(
    (element) => options[element] === false
  );

  let optionsActiveIds = Object.keys(options).filter(
    (element) => options[element] === true
  );

  if (optionsInactiveIds.length > 0) {
    tabIds.forEach(({ id }) => {
      browser.tabs.sendMessage(id, {
        type: "removeStyles",
        options: optionsInactiveIds,
      });
    });
  }

  if (optionsActiveIds.length === 0) {
    return "Nothing to add";
  }

  tabIds.forEach(({ id }) => {
    browser.tabs.sendMessage(id, {
      type: "addStyles",
      options: optionsActiveIds,
    });
  });

  return true;
}

/**
 * Sets basic listeners for communication between scripts.
 */
function setListeners() {
  // listen message from the popup script.
  browser.runtime.onMessage.addListener((message) => {
    switch (message.type) {
      case "updateOptions":
        return registerCSSAndScripts();

      case "getOptions":
        return getOptions();

      case "setOptions":
        return saveOptions(message.name, message.value);

      case "getRegisteredScripts":
        return getOnlyActiveOptions();

      default:
        return null;
    }
  });
}

/**
 * Retrieves options from the storage.
 */
async function getOptions() {
  let data;

  try {
    data = await browser.storage.local.get("options");
  } catch (error) {
    throw new Error("Cannot retrieve options from the storage.");
  }

  const options =
    Object.entries(data).length === 0 ? DEFAULT_OPTIONS : data.options;

  // getting search engine name
  const searchEngineName =
    browser.runtime.getManifest().chrome_settings_overrides.search_provider
      .name;

  // checking if the engine sets as default and then set a search engine flag.
  const results = await browser.search.get();

  options.ya_search = !!results.find(
    (elem) => elem.name === searchEngineName && elem.isDefault
  );

  return options;
}

/**
 * Loads and filters options by active state.
 */
async function getOnlyActiveOptions() {
  const options = await getOptions();
  return Object.keys(options).filter((element) => options[element] === true);
}

/**
 * Saves a key-value pair of options to the storage.
 */
async function saveOptions(key, value) {
  const options = await getOptions();

  if (!(key in options)) {
    throw new Error(`Options  doesn't have the ${key} key.`);
  }

  if (options[key] === value) {
    return "Nothing to save";
  }

  options[key] = value;

  browser.storage.local.set({ options }).catch((error) => {
    throw new Error(error);
  });

  return options;
}

setListeners();
