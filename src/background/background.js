"use strict";

/**
 * @module background
 */

/**
 * @typedef {Object} Option
 * @property {number} id - Object id or ordinal number.
 * @property {string} name - Option name.
 * @property {boolean} state - Indicates whether the option is enabled.
 * @property {string} [element] - Indicates a special html element for drawing the option.
 * @property {string} [handler] - Indicates a special handler on the click listener.
 * @property {[Option]} [items] - Nested options.
 */

/**
 * Registers CSS and Script files based on options, set on the option base,
 * or using the default options.
 *
 */
async function registerCSSAndScripts() {
  const urlMatches = browser.runtime.getManifest().content_scripts[0].matches;

  let options = await getOptions();
  let tabIds;

  try {
    tabIds = await browser.tabs.query({
      url: urlMatches,
    });
  } catch (e) {
    return new Error(e);
  }

  let optionsInactiveIds = filterOptionsByState(options, false);

  let optionsActiveIds = filterOptionsByState(options, true);

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
  if (typeof browser === "undefined") {
    return;
  }
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
 * Default options.
 *
 * @returns {[Option]} a list of default options
 */
function getDefaultOptions() {
  return [
    {
      id: 0,
      name: "ya_search",
      state: false,
      element: "checkmark",
    },
    {
      id: 1,
      name: "ya_zen",
      state: false,
      handler: "disable-all",
    },
    {
      id: 2,
      name: "ya_group_fonts",
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
      items: [
        {
          id: 0,
          name: "ya_side_panel",
          state: false,
        },
      ],
    },
  ];
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

  let options = getDefaultOptions();

  if (data && "options" in data) {
    options = data.options;
  }

  // getting search engine name
  const searchEngineName =
    browser.runtime.getManifest().chrome_settings_overrides.search_provider
      .name;

  // checking if the engine sets as default and then set a search engine flag.
  const results = await browser.search.get();

  const isYaSearchDefault = !!results.find(
    (elem) => elem.name === searchEngineName && elem.isDefault
  );

  options.forEach((item) => {
    // @todo Replace static key name with something else.
    if (item.name === "ya_search") {
      item.state = isYaSearchDefault;
    }
  });

  return options;
}

/**
 * Loads and filters options by active state.
 */
async function getOnlyActiveOptions() {
  const options = await getOptions();
  return filterOptionsByState(options, true);
}

/**
 * Saves a name-state pair of options to the storage.
 */
async function saveOptions(name, state) {
  let options = await getOptions();

  if (isNameInOptions(options, name) === false) {
    throw new Error(`Options  doesn't have the ${name} option.`);
  }

  try {
    options = changeOptionState(options, name, state);
  } catch (e) {
    throw new Error(e);
  }

  browser.storage.local.set({ options }).catch((error) => {
    throw new Error(error);
  });

  return options;
}

/**
 * Filters given options by state and returns a list of relevant option names.
 *
 * @param {[Option]} options - a list of options.
 * @param {boolean} state - an option state.
 */
function filterOptionsByState(options, state) {
  let names = [];

  const filteredNames = options.filter((item) => {
    if ("items" in item) {
      names.push(...filterOptionsByState(item.items, state));
    }
    return "state" in item && item.state === state;
  });

  if (filteredNames.length > 0) {
    names.push(...filteredNames.map((item) => item.name));
  }
  return names;
}

/**
 * Finds a name in the list of options.
 *
 * @param {[Option]} options - a list of  options.
 * @param {string} name - a desired name.
 * @returns {boolean} True if the name was found, otherwise returns False.
 */
function isNameInOptions(options, name) {
  if (!name) {
    return false;
  }

  return options.some((item) => {
    if ("items" in item) {
      return isNameInOptions(item.items, name);
    }

    return item.name === name;
  });
}

/**
 * Changes a state of the option.
 *
 * @param {[Option]} options - a list of options.
 * @param {string } name  - a desired option name.
 * @param {boolean} state - an option state.
 * @returns {[Option]} changed list of options, otherwise given list.
 */
function changeOptionState(options, name, state) {
  if (!name) {
    return options;
  }

  const newOptions = [...options];

  newOptions.forEach((item) => {
    if (item.name === name) {
      item.state = state;
      return;
    }
    if ("items" in item) {
      item.items = changeOptionState(item.items, name, state);
    }
  });
  return newOptions;
}

/**
 * Converts the old object-like options to the list.
 *
 * @param {{}} options  - an option object
 *
 * @returns {[Option]} converted list
 */
function convertOptions(options) {
  let convertedOptions = getDefaultOptions();

  if (Array.isArray(options)) {
    return options;
  }

  if (!options || Object.keys(options).length === 0) {
    return convertedOptions;
  }

  Object.keys(options).forEach((key) => {
    if (Object.hasOwnProperty.call(options, key)) {
      convertedOptions = changeOptionState(convertedOptions, key, options[key]);
    }
  });

  return convertedOptions;
}

/**
 * Checks the old object-like options and converts them to the list format.
 *
 * @returns {Promise<null|[Option]>}
 */
async function checkOldStyleOptionsAndRewrite() {
  let data;

  try {
    data = await browser.storage.local.get("options");
  } catch (error) {
    throw new Error("Cannot retrieve options from the storage.");
  }

  if (!("options" in data)) {
    return getDefaultOptions();
  }

  if ("options" in data && !Array.isArray(data.options)) {
    return convertOptions(data.options);
  }

  return null;
}

/**
 * Compares the manifest version and stored version, then
 */
async function checkExtVersion() {
  /**
   *
   * @type {{[version: string]}| string}
   */
  let storedVersion = await browser.storage.local.get("version");
  const currentVersion = browser.runtime.getManifest().version;

  if ("version" in storedVersion) {
    storedVersion = storedVersion.version;
  } else {
    storedVersion = "";
  }

  if (
    !storedVersion ||
    storedVersion.toString().localeCompare(currentVersion, undefined, {
      numeric: true,
    }) === -1
  ) {
    const data = await checkOldStyleOptionsAndRewrite();
    // saves new version
    await browser.storage.local.set({ version: currentVersion });
    // saves the options if they exist
    if (data) {
      await browser.storage.local.set({
        options: data,
      });
    }
  }
}

/**
 * Initializes basic behavior.
 */
async function init() {
  await checkExtVersion();
  setListeners();
}

(function () {
  init();
})();
