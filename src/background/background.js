"use strict";

const DEFAULT_OPTIONS = {
  ya_search: false,
  ya_fonts: false,
  ya_font_size: false,
  ya_side_panel: false,
};

// let scriptRegistered = null;

// Write default options on installed.
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({ DEFAULT_OPTIONS });
});

browser.runtime.onStartup.addListener(() => {
  console.log("Extension has started.");
  registerScript(null);
});

// listen message from the popup script.
browser.runtime.onMessage.addListener((message) => {
  if (message.type === "updateOptions") {
    registerScript(message.options);
  }
});

async function registerScript(message) {
  let options = message;

  // if (scriptRegistered) {
  //   scriptRegistered.unregister();
  // }

  if (options === null) {
    // retrieve options from the storage.
    let data = await browser.storage.local.get("options");
    options =
      Object.entries(data).length === 0 ? DEFAULT_OPTIONS : data.options;
  }

  let registeredScripts = await browser.scripting.getRegisteredContentScripts();
  let registeredScriptsIds = registeredScripts.map((script) => script.id);
  let optionsInactiveIds = Object.keys(options).filter(
    (element) => options[element] === false
  );
  let optionsActiveIds = Object.keys(options).filter(
    (element) => options[element] === true
  );

  // get scripts for unload.
  let intersectionActiveInactive = registeredScriptsIds.filter((value) =>
    optionsInactiveIds.includes(value)
  );

  // remove disabled scripts from a list of registered scripts
  registeredScriptsIds = registeredScriptsIds.filter(
    (value) => intersectionActiveInactive.includes(value) === false
  );

  // keep only new scripts for adding
  let optionsActiveList = optionsActiveIds.filter(
    (value) => registeredScriptsIds.includes(value) === false
  );

  if (intersectionActiveInactive.length > 0) {
    // remove inactive scripts if ones are  in the list.
    await browser.scripting.unregisterContentScripts({
      ids: intersectionActiveInactive,
    });
  }

  if (optionsActiveList.length === 0) {
    return "Nothing to add";
  }

  optionsActiveList = optionsActiveList.map((value) => {
    return {
      id: value,
      matches: ["*://yandex.ru/search/*"],
      css: [`content/${value}.css`],
      persistAcrossSessions: false,
    };
  });

  try {
    await browser.scripting.registerContentScripts(optionsActiveList);
  } catch (error) {
    // console.error(error);
  }
  return true;
}
